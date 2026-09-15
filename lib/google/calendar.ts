import { google } from "googleapis";
import type { BookingRow } from "@/lib/booking/repository";
import { getOffer } from "@/data/offers";

const TIME_ZONE = "Indian/Reunion";

function getAuth() {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const rawKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY;
  if (!email || !rawKey) {
    throw new Error("GOOGLE_SERVICE_ACCOUNT_EMAIL / GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY are not set.");
  }
  // .env files can't hold real newlines in a single-line value, so the key is
  // stored with literal "\n" and unescaped here.
  const privateKey = rawKey.includes("\\n") ? rawKey.replace(/\\n/g, "\n") : rawKey;

  return new google.auth.JWT({
    email,
    key: privateKey,
    scopes: ["https://www.googleapis.com/auth/calendar"],
  });
}

/**
 * GOOGLE_CALENDAR_ID can hold several calendar IDs separated by commas —
 * every one of them must be individually shared with the service account
 * (Paramètres et partage → Partager avec des personnes spécifiques). Busy
 * time on ANY of them blocks a slot; new shooting events are always created
 * on the first one (the "primary" booking calendar).
 */
function getCalendarIds(): string[] {
  const raw = process.env.GOOGLE_CALENDAR_ID;
  if (!raw) throw new Error("GOOGLE_CALENDAR_ID is not set.");
  return raw
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);
}

function getCalendarClient() {
  return google.calendar({ version: "v3", auth: getAuth() });
}

export interface BusyInterval {
  start: string; // ISO
  end: string; // ISO
}

/** Busy blocks across every configured calendar for the given local date range (inclusive, 00:00–24:00 Réunion time each day). */
export async function getBusyIntervalsForRange(startDate: string, endDate: string): Promise<BusyInterval[]> {
  const calendar = getCalendarClient();
  const calendarIds = getCalendarIds();

  const timeMin = `${startDate}T00:00:00+04:00`;
  const timeMax = `${endDate}T23:59:59+04:00`;

  const res = await calendar.freebusy.query({
    requestBody: {
      timeMin,
      timeMax,
      timeZone: TIME_ZONE,
      items: calendarIds.map((id) => ({ id })),
    },
  });

  const calendars = res.data.calendars ?? {};
  return calendarIds.flatMap((id) => {
    const busy = calendars[id]?.busy ?? [];
    return busy
      .filter((b): b is { start: string; end: string } => Boolean(b.start && b.end))
      .map((b) => ({ start: b.start, end: b.end }));
  });
}

/** Busy blocks across every configured calendar for a single local day. */
export async function getBusyIntervalsForDate(date: string): Promise<BusyInterval[]> {
  return getBusyIntervalsForRange(date, date);
}

/** Creates the shooting event once the deposit is confirmed, on the primary (first) calendar. Returns the Google event id. */
export async function createShootingEvent(booking: BookingRow): Promise<string> {
  const calendar = getCalendarClient();
  const [calendarId] = getCalendarIds();
  const offer = getOffer(booking.offer_id);

  const start = `${booking.date}T${booking.slot_start}:00+04:00`;
  const startDate = new Date(start);
  const end = new Date(startDate.getTime() + booking.duration_minutes * 60_000).toISOString();

  const location =
    booking.location_type === "included"
      ? "Entre Étang-Salé et Saint-Pierre"
      : (booking.location_detail ?? "Ailleurs sur l'île");

  const description = [
    `Type de séance : ${offer?.name ?? booking.offer_id}`,
    `Téléphone : ${booking.customer_phone ?? "Non renseigné"}`,
    `E-mail : ${booking.customer_email ?? "Non renseigné"}`,
    `Lieu : ${location}`,
    `Acompte payé : ${booking.deposit_amount} €`,
    `Reste à payer : ${booking.balance_amount} €`,
    booking.message ? `Message : ${booking.message}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  const res = await calendar.events.insert({
    calendarId,
    requestBody: {
      summary: `Shooting — ${booking.customer_name ?? "Client"}`,
      description,
      location,
      start: { dateTime: start, timeZone: TIME_ZONE },
      end: { dateTime: end, timeZone: TIME_ZONE },
    },
  });

  if (!res.data.id) throw new Error("Google Calendar did not return an event id.");
  return res.data.id;
}
