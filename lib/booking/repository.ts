import { getSupabaseClient } from "@/lib/supabase/client";
import type { OfferId } from "@/data/offers";
import type { LocationType } from "./pricing";

export type BookingStatus = "pending" | "deposit_paid" | "payment_failed" | "cancelled" | "expired" | "completed";

export interface BookingRow {
  id: string;
  created_at: string;
  offer_id: OfferId;
  date: string; // "YYYY-MM-DD"
  slot_start: string; // "HH:mm"
  duration_minutes: number;
  status: BookingStatus;
  customer_name: string | null;
  customer_email: string | null;
  customer_phone: string | null;
  location_type: LocationType;
  location_detail: string | null;
  message: string | null;
  total_amount: number;
  deposit_amount: number;
  balance_amount: number;
  stripe_checkout_session_id: string | null;
  stripe_payment_intent_id: string | null;
  calendar_event_id: string | null;
  hold_expires_at: string;
}

export interface CreateHoldInput {
  offerId: OfferId;
  date: string;
  slotStart: string;
  durationMinutes: number;
  locationType: LocationType;
  locationDetail?: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  message?: string;
  totalAmount: number;
  depositAmount: number;
  balanceAmount: number;
  holdExpiresAt: string;
}

/** Thrown when the (date, slot) is already held or paid by someone else. */
export class SlotUnavailableError extends Error {
  constructor() {
    super("Ce créneau vient d'être pris. Choisis-en un autre.");
    this.name = "SlotUnavailableError";
  }
}

const LIVE_STATUSES: BookingStatus[] = ["pending", "deposit_paid"];

/** Flips stale pending holds (past their hold_expires_at) to 'expired' so they stop blocking the slot. Call before reading or writing availability for a date range. */
export async function expireStaleHoldsForRange(startDate: string, endDate: string): Promise<void> {
  const supabase = getSupabaseClient();
  await supabase
    .from("bookings")
    .update({ status: "expired" })
    .gte("date", startDate)
    .lte("date", endDate)
    .eq("status", "pending")
    .lt("hold_expires_at", new Date().toISOString());
}

export async function expireStaleHolds(date: string): Promise<void> {
  return expireStaleHoldsForRange(date, date);
}

export async function listLiveBookingsForRange(startDate: string, endDate: string): Promise<BookingRow[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("bookings")
    .select("*")
    .gte("date", startDate)
    .lte("date", endDate)
    .in("status", LIVE_STATUSES);
  if (error) throw error;
  return data ?? [];
}

export async function listLiveBookingsForDate(date: string): Promise<BookingRow[]> {
  return listLiveBookingsForRange(date, date);
}

export async function createHold(input: CreateHoldInput): Promise<BookingRow> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("bookings")
    .insert({
      offer_id: input.offerId,
      date: input.date,
      slot_start: input.slotStart,
      duration_minutes: input.durationMinutes,
      status: "pending",
      customer_name: input.customerName ?? null,
      customer_email: input.customerEmail ?? null,
      customer_phone: input.customerPhone ?? null,
      location_type: input.locationType,
      location_detail: input.locationDetail ?? null,
      message: input.message ?? null,
      total_amount: input.totalAmount,
      deposit_amount: input.depositAmount,
      balance_amount: input.balanceAmount,
      hold_expires_at: input.holdExpiresAt,
    })
    .select("*")
    .single();

  if (error) {
    // Postgres unique_violation
    if (error.code === "23505") throw new SlotUnavailableError();
    throw error;
  }
  return data;
}

export async function attachCheckoutSession(bookingId: string, sessionId: string): Promise<void> {
  const supabase = getSupabaseClient();
  const { error } = await supabase
    .from("bookings")
    .update({ stripe_checkout_session_id: sessionId })
    .eq("id", bookingId);
  if (error) throw error;
}

/** Backfills identity fields once Stripe Checkout has collected them (webhook-driven, before the calendar event / confirmation emails go out). */
export async function attachCustomerDetails(
  id: string,
  fields: { name: string | null; email: string | null; phone: string | null },
): Promise<void> {
  const supabase = getSupabaseClient();
  const { error } = await supabase
    .from("bookings")
    .update({ customer_name: fields.name, customer_email: fields.email, customer_phone: fields.phone })
    .eq("id", id);
  if (error) throw error;
}

export async function getBookingById(id: string): Promise<BookingRow | null> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.from("bookings").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data;
}

export async function getBookingByCheckoutSessionId(sessionId: string): Promise<BookingRow | null> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("bookings")
    .select("*")
    .eq("stripe_checkout_session_id", sessionId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function markDepositPaid(
  id: string,
  fields: { stripePaymentIntentId: string; calendarEventId: string | null },
): Promise<void> {
  const supabase = getSupabaseClient();
  const { error } = await supabase
    .from("bookings")
    .update({
      status: "deposit_paid",
      stripe_payment_intent_id: fields.stripePaymentIntentId,
      calendar_event_id: fields.calendarEventId,
    })
    .eq("id", id);
  if (error) throw error;
}

export async function markStatus(id: string, status: BookingStatus): Promise<void> {
  const supabase = getSupabaseClient();
  const { error } = await supabase.from("bookings").update({ status }).eq("id", id);
  if (error) throw error;
}

/**
 * For the admin dashboard: every booking except stale never-completed holds
 * ('expired' — abandoned before reaching Checkout, low-signal noise).
 */
export async function listBookingsForAdmin(): Promise<BookingRow[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("bookings")
    .select("*")
    .neq("status", "expired")
    .order("date", { ascending: true })
    .order("slot_start", { ascending: true });
  if (error) throw error;
  return data ?? [];
}
