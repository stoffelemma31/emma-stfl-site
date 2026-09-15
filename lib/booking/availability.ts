import { getSlotsForWeekday, MAX_ADVANCE_DAYS } from "@/data/availability";
import { getOffer, type OfferId } from "@/data/offers";
import { minLeadDateISO, MIN_LEAD_DAYS } from "./schema";
import { expireStaleHoldsForRange, listLiveBookingsForRange } from "./repository";
import { getBusyIntervalsForRange } from "@/lib/google/calendar";

export interface AvailableSlot {
  start: string; // "HH:mm"
}

function toInterval(date: string, start: string, durationMinutes: number) {
  const startDate = new Date(`${date}T${start}:00+04:00`);
  const endDate = new Date(startDate.getTime() + durationMinutes * 60_000);
  return { start: startDate, end: endDate };
}

function overlaps(a: { start: Date; end: Date }, b: { start: Date; end: Date }): boolean {
  return a.start < b.end && b.start < a.end;
}

function enumerateDates(startDate: string, endDate: string): string[] {
  const dates: string[] = [];
  const cursor = new Date(`${startDate}T12:00:00+04:00`);
  const end = new Date(`${endDate}T12:00:00+04:00`);
  while (cursor <= end) {
    dates.push(cursor.toISOString().slice(0, 10));
    cursor.setDate(cursor.getDate() + 1);
  }
  return dates;
}

/**
 * The candidate slots for every date in [startDate, endDate] (clamped to the
 * bookable window) minus whatever's already busy — on Google Calendar (the
 * real source of truth for her time) and in Supabase (other pending holds /
 * paid bookings). Fetches the whole range in a single Google + Supabase
 * round trip so a month view never needs one request per day.
 */
export async function getAvailableSlotsForRange(
  startDate: string,
  endDate: string,
  offerId: OfferId,
): Promise<Record<string, AvailableSlot[]>> {
  const offer = getOffer(offerId);
  if (!offer) return {};

  const minDate = minLeadDateISO(MIN_LEAD_DAYS);
  const maxDate = minLeadDateISO(MAX_ADVANCE_DAYS);
  const rangeStart = startDate < minDate ? minDate : startDate;
  const rangeEnd = endDate > maxDate ? maxDate : endDate;
  if (rangeStart > rangeEnd) return {};

  const dates = enumerateDates(rangeStart, rangeEnd);

  await expireStaleHoldsForRange(rangeStart, rangeEnd);

  const [liveBookings, busyIntervals] = await Promise.all([
    listLiveBookingsForRange(rangeStart, rangeEnd),
    getBusyIntervalsForRange(rangeStart, rangeEnd).catch((err) => {
      // If Calendar is momentarily unreachable, fail closed (no slots) rather
      // than risk double-booking against an event we couldn't see.
      console.error("getBusyIntervalsForRange failed", err);
      throw err;
    }),
  ]);

  const busy = busyIntervals.map((b) => ({ start: new Date(b.start), end: new Date(b.end) }));
  const bookedIntervals = liveBookings.map((b) => toInterval(b.date, b.slot_start, b.duration_minutes));

  const result: Record<string, AvailableSlot[]> = {};
  for (const date of dates) {
    const weekday = new Date(`${date}T12:00:00+04:00`).getDay();
    const candidates = getSlotsForWeekday(weekday);
    result[date] = candidates
      .map((slot) => ({ slot, interval: toInterval(date, slot.start, offer.durationMinutes) }))
      .filter(({ interval }) => {
        if (busy.some((b) => overlaps(interval, b))) return false;
        if (bookedIntervals.some((b) => overlaps(interval, b))) return false;
        return true;
      })
      .map(({ slot }) => ({ start: slot.start }));
  }
  return result;
}

export async function getAvailableSlots(date: string, offerId: OfferId): Promise<AvailableSlot[]> {
  const map = await getAvailableSlotsForRange(date, date, offerId);
  return map[date] ?? [];
}

/** Re-validates one specific slot is still free — used right before creating a hold, to close the race between "load availability" and "submit". */
export async function isSlotStillAvailable(date: string, offerId: OfferId, slotStart: string): Promise<boolean> {
  const slots = await getAvailableSlots(date, offerId);
  return slots.some((s) => s.start === slotStart);
}
