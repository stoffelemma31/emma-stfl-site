import type { BookingRow } from "@/lib/booking/repository";
import { getOffer } from "@/data/offers";
import { site } from "@/data/site";

interface EmailContent {
  subject: string;
  html: string;
  text: string;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatDateFr(isoDate: string): string {
  try {
    return new Intl.DateTimeFormat("fr-FR", { dateStyle: "full" }).format(new Date(`${isoDate}T12:00:00`));
  } catch {
    return isoDate;
  }
}

function wrapper(title: string, rows: [string, string][], footer?: string): string {
  const rowsHtml = rows
    .map(
      ([label, value]) =>
        `<tr><td style="padding:6px 12px 6px 0;color:#2e7885;font-weight:600;white-space:nowrap;vertical-align:top;">${escapeHtml(
          label,
        )}</td><td style="padding:6px 0;color:#1e4c51;">${value}</td></tr>`,
    )
    .join("");

  return `<div style="font-family:Helvetica,Arial,sans-serif;background:#f7eee7;padding:32px;color:#1e4c51;">
    <div style="max-width:520px;margin:0 auto;background:#ffffff;padding:32px;border-radius:4px;">
      <h1 style="font-size:20px;margin:0 0 20px;color:#1e4c51;">${escapeHtml(title)}</h1>
      <table role="presentation" style="width:100%;border-collapse:collapse;font-size:14px;">${rowsHtml}</table>
      ${footer ? `<p style="margin-top:24px;font-size:13px;color:#2e7885;">${footer}</p>` : ""}
    </div>
  </div>`;
}

/** Sent to the photographer once a deposit is confirmed (webhook-driven, never on the client's say-so). */
export function depositPaidOwnerEmail(booking: BookingRow): EmailContent {
  const offer = getOffer(booking.offer_id);
  const location =
    booking.location_type === "included"
      ? "Entre Étang-Salé et Saint-Pierre (inclus)"
      : `Ailleurs sur l'île — ${escapeHtml(booking.location_detail ?? "")}`;

  const rows: [string, string][] = [
    ["Formule", escapeHtml(offer?.name ?? booking.offer_id)],
    ["Date", formatDateFr(booking.date)],
    ["Heure", booking.slot_start],
    ["Lieu", location],
    ["Nom", escapeHtml(booking.customer_name ?? "Non renseigné")],
    ["E-mail", escapeHtml(booking.customer_email ?? "Non renseigné")],
    ["Téléphone", escapeHtml(booking.customer_phone ?? "Non renseigné")],
    ["Acompte payé", `${booking.deposit_amount} €`],
    ["Reste à payer", `${booking.balance_amount} €`],
  ];

  if (booking.message?.length) {
    rows.push(["Message", escapeHtml(booking.message).replace(/\n/g, "<br/>")]);
  }

  return {
    subject: `Acompte payé — ${offer?.name ?? booking.offer_id} le ${booking.date}`,
    html: wrapper(
      "Acompte payé, séance confirmée",
      rows,
      "L'événement a été ajouté automatiquement à ton Google Agenda.",
    ),
    text: rows.map(([label, value]) => `${label}: ${value.replace(/<br\/>/g, " / ")}`).join("\n"),
  };
}

/** Sent to the client once their deposit is confirmed. */
export function depositPaidClientEmail(booking: BookingRow): EmailContent {
  const offer = getOffer(booking.offer_id);

  const rows: [string, string][] = [
    ["Formule", escapeHtml(offer?.name ?? booking.offer_id)],
    ["Date", formatDateFr(booking.date)],
    ["Heure", booking.slot_start],
    ["Acompte payé", `${booking.deposit_amount} €`],
    ["Reste à payer le jour J", `${booking.balance_amount} €`],
  ];

  const footer = "Ta séance est confirmée. À très vite !";

  const firstName = booking.customer_name ?? "";

  return {
    subject: `Séance confirmée — ${site.brandName} ${site.brandScript}`,
    html: wrapper(`C'est confirmé${firstName ? `, ${escapeHtml(firstName)}` : ""} !`, rows, footer),
    text: `C'est confirmé${firstName ? `, ${firstName}` : ""} !\n\n${rows
      .map(([label, value]) => `${label}: ${value}`)
      .join("\n")}\n\n${footer}`,
  };
}
