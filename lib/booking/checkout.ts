import { getOffer } from "@/data/offers";
import { site } from "@/data/site";
import { getStripeClient } from "@/lib/stripe/client";
import { getResendClient, getFromAddress, getToAddress } from "@/lib/email/resend";
import { depositPaidOwnerEmail, depositPaidClientEmail } from "@/lib/email/templates";
import { createShootingEvent } from "@/lib/google/calendar";
import {
  createHold,
  attachCheckoutSession,
  attachCustomerDetails,
  getBookingById,
  markDepositPaid,
  markStatus,
  SlotUnavailableError,
} from "./repository";
import { isSlotStillAvailable } from "./availability";
import { computePriceBreakdown } from "./pricing";
import type { HoldInput } from "./schema";
import type Stripe from "stripe";

export type CheckoutResult = { ok: true; checkoutUrl: string } | { ok: false; error: string };

const HOLD_MINUTES = 20;
// Stripe Checkout Sessions can't expire in under 30 minutes — our own
// hold_expires_at (used to free the slot for other visitors) is shorter, so
// the slot re-opens well before an abandoned Checkout tab could still be paid.
const STRIPE_SESSION_MINUTES = 30;

/**
 * Books the slot (pending) and opens a Stripe Checkout session for the
 * deposit. Re-validates the slot is still free right before writing, so two
 * people racing for the same slot can't both succeed — the loser gets a
 * clear "already taken" error instead of a corrupted booking.
 */
export async function startCheckout(input: HoldInput): Promise<CheckoutResult> {
  const offer = getOffer(input.offerId);
  if (!offer) return { ok: false, error: "Formule inconnue." };

  const stillFree = await isSlotStillAvailable(input.date, input.offerId, input.slotStart);
  if (!stillFree) {
    return { ok: false, error: "Ce créneau n'est plus disponible. Choisis-en un autre." };
  }

  const { total, deposit, balance } = computePriceBreakdown(input.offerId, input.location);
  const holdExpiresAt = new Date(Date.now() + HOLD_MINUTES * 60_000).toISOString();

  let bookingId: string;
  try {
    const booking = await createHold({
      offerId: input.offerId,
      date: input.date,
      slotStart: input.slotStart,
      durationMinutes: offer.durationMinutes,
      locationType: input.location,
      locationDetail: input.locationDetail,
      customerName: input.name,
      customerEmail: input.email,
      customerPhone: input.phone,
      message: input.message,
      totalAmount: total,
      depositAmount: deposit,
      balanceAmount: balance,
      holdExpiresAt,
    });
    bookingId = booking.id;
  } catch (error) {
    if (error instanceof SlotUnavailableError) {
      return { ok: false, error: error.message };
    }
    console.error("createHold failed", error);
    return { ok: false, error: "Impossible de réserver ce créneau pour le moment." };
  }

  // The quick booking modal never asks for identity, so Stripe Checkout must
  // collect it itself (email always, phone via phone_number_collection, name
  // via a custom field). The /contact form already asked for it — in that
  // case just prefill the email Stripe already knows instead of asking twice.
  const hasContactInfo = Boolean(input.email);
  const cancelPath = input.cancelPath && !input.cancelPath.startsWith("//") ? input.cancelPath : "/";

  try {
    const stripe = getStripeClient();
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      ...(hasContactInfo
        ? { customer_email: input.email }
        : {
            phone_number_collection: { enabled: true },
            custom_fields: [
              {
                key: "full_name",
                label: { type: "custom" as const, custom: "Nom complet" },
                type: "text" as const,
                text: { minimum_length: 2, maximum_length: 100 },
              },
            ],
          }),
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "eur",
            unit_amount: deposit * 100,
            product_data: {
              name: `Acompte — ${offer.name} — ${input.date} ${input.slotStart}`,
              description: `Solde restant le jour J : ${balance} €`,
            },
          },
        },
      ],
      metadata: { bookingId },
      expires_at: Math.floor(Date.now() / 1000) + STRIPE_SESSION_MINUTES * 60,
      success_url: `${site.baseUrl}/merci?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${site.baseUrl}${cancelPath}`,
    });

    if (!session.url) throw new Error("Stripe did not return a Checkout URL.");

    await attachCheckoutSession(bookingId, session.id);
    return { ok: true, checkoutUrl: session.url };
  } catch (error) {
    console.error("Stripe Checkout session creation failed", error);
    await markStatus(bookingId, "cancelled");
    return { ok: false, error: "Impossible de lancer le paiement pour le moment." };
  }
}

/**
 * Called from the Stripe webhook once `checkout.session.completed` is
 * verified. Idempotent — safe to run twice for the same session (Stripe can
 * redeliver webhooks) since it checks the booking isn't already confirmed.
 */
export async function confirmDeposit(session: Stripe.Checkout.Session): Promise<void> {
  const bookingId = session.metadata?.bookingId;
  if (!bookingId) {
    console.error("Stripe session completed without a bookingId in metadata", session.id);
    return;
  }

  const booking = await getBookingById(bookingId);
  if (!booking) {
    console.error("confirmDeposit: booking not found", bookingId);
    return;
  }
  if (booking.status === "deposit_paid") return; // already processed

  const paymentIntentId =
    typeof session.payment_intent === "string" ? session.payment_intent : (session.payment_intent?.id ?? "");

  // The /contact form already collected identity at hold time — only backfill
  // from Stripe when that's missing (the quick booking modal's flow), so a
  // contact-form submission is never silently overwritten with nulls.
  let withDetails = booking;
  if (!booking.customer_email) {
    const fullNameField = session.custom_fields?.find((field) => field.key === "full_name");
    await attachCustomerDetails(bookingId, {
      name: fullNameField?.text?.value ?? session.customer_details?.name ?? null,
      email: session.customer_details?.email ?? null,
      phone: session.customer_details?.phone ?? null,
    });
    withDetails = (await getBookingById(bookingId)) ?? booking;
  }

  let calendarEventId: string | null = null;
  try {
    calendarEventId = await createShootingEvent(withDetails);
  } catch (error) {
    // Payment already succeeded — never lose that. Log loudly so the calendar
    // event can be added by hand; the booking still gets marked paid below.
    console.error("createShootingEvent failed after successful payment", bookingId, error);
  }

  await markDepositPaid(bookingId, { stripePaymentIntentId: paymentIntentId, calendarEventId });

  const confirmed = await getBookingById(bookingId);
  if (!confirmed) return;

  try {
    const resend = getResendClient();
    const from = getFromAddress();
    const toAddress = getToAddress();
    const owner = depositPaidOwnerEmail(confirmed);
    const client = depositPaidClientEmail(confirmed);

    // The Resend SDK resolves with `{ data, error }` on API-level failures —
    // it does NOT throw — so each result must be checked individually or a
    // failed send (e.g. sandbox mode rejecting an unverified recipient)
    // passes silently.
    const [ownerResult, clientResult] = await Promise.all([
      toAddress
        ? resend.emails.send({ from, to: toAddress, subject: owner.subject, html: owner.html, text: owner.text })
        : null,
      confirmed.customer_email
        ? resend.emails.send({
            from,
            to: confirmed.customer_email,
            subject: client.subject,
            html: client.html,
            text: client.text,
          })
        : null,
    ]);

    if (ownerResult?.error) {
      console.error("confirmDeposit: owner email failed", bookingId, ownerResult.error);
    }
    if (clientResult?.error) {
      console.error("confirmDeposit: client email failed", bookingId, clientResult.error);
    }
    if (!confirmed.customer_email) {
      console.error("confirmDeposit: no customer email on booking, client email not sent", bookingId);
    }
  } catch (error) {
    console.error("confirmDeposit: confirmation emails threw", bookingId, error);
  }
}

/** Called on `checkout.session.expired` — frees the slot immediately instead of waiting for lazy expiry. */
export async function expireCheckout(session: Stripe.Checkout.Session): Promise<void> {
  const bookingId = session.metadata?.bookingId;
  if (!bookingId) return;
  const booking = await getBookingById(bookingId);
  if (!booking || booking.status !== "pending") return;
  await markStatus(bookingId, "cancelled");
}
