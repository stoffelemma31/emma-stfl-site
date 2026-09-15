import { z } from "zod";

export function minLeadDateISO(daysAhead: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysAhead);
  return d.toISOString().slice(0, 10);
}

export const MIN_LEAD_DAYS = 3;

/**
 * Submitted once a real, available slot has been picked — this creates the
 * hold + Stripe Checkout session.
 *
 * Identity (name/email/phone/message) is optional here: the quick booking
 * modal (offer cards, CTA banner) leaves it out entirely and lets Stripe
 * Checkout collect it natively (email always, phone via
 * phone_number_collection, name via a custom field), while the /contact page
 * collects it upfront as part of its own form, message field included.
 */
export const holdSchema = z
  .object({
    offerId: z.enum(["portrait", "couple", "metiers"], {
      message: "Choisis une formule.",
    }),
    date: z
      .string()
      .min(1, "Choisis une date.")
      .refine((value) => value >= minLeadDateISO(MIN_LEAD_DAYS), {
        message: `La date doit être au moins ${MIN_LEAD_DAYS} jours après aujourd'hui.`,
      }),
    slotStart: z.string().regex(/^\d{2}:\d{2}$/, "Choisis un créneau."),
    location: z.enum(["included", "outside"], { message: "Choisis un lieu." }),
    locationDetail: z.string().trim().max(200).optional(),
    name: z.string().trim().min(2, "Indique ton nom complet.").max(100).optional(),
    email: z.string().trim().email("Adresse e-mail invalide.").optional(),
    phone: z.string().trim().min(6, "Numéro de téléphone invalide.").max(20).optional(),
    message: z.string().trim().max(2000).optional(),
    // Where to send the visitor back if they abandon Stripe Checkout — the
    // page they booked from. Must be a same-site path (checked server-side
    // too) so it can never be used as an open redirect.
    cancelPath: z
      .string()
      .trim()
      .max(200)
      .regex(/^\/(?!\/)/, "Chemin de retour invalide.")
      .optional(),
    // Honeypot: real visitors never see or fill this field. Left unrestricted here on
    // purpose so a filled-in value doesn't fail validation — the route handler checks
    // it and silently no-ops instead, which tips off bots far less than a 400 would.
    company: z.string().optional(),
  })
  .refine((data) => data.location !== "outside" || !!data.locationDetail?.length, {
    message: "Précise le lieu du shooting.",
    path: ["locationDetail"],
  });

export type HoldInput = z.infer<typeof holdSchema>;
