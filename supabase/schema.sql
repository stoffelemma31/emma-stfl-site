-- Run this once in your Supabase project: Dashboard → SQL Editor → New query → paste → Run.
--
-- If your `bookings` table already exists from an earlier version (customer_name/
-- email/phone as NOT NULL), `create table if not exists` below will be a no-op —
-- run this ALTER separately in the SQL Editor to relax those columns:
--
--   alter table bookings alter column customer_name drop not null;
--   alter table bookings alter column customer_email drop not null;
--   alter table bookings alter column customer_phone drop not null;
--
-- Everything below is read/written exclusively with the service role key, from
-- server-side code only (API routes, the admin page) — never from the browser.
-- Row Level Security is left ON with no policies, so the public (anon) key —
-- if it were ever leaked — cannot read or write anything here.

create table if not exists bookings (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),

  offer_id text not null,
  date date not null,
  slot_start text not null,           -- "HH:mm", 24h
  duration_minutes integer not null,

  status text not null default 'pending'
    check (status in ('pending', 'deposit_paid', 'payment_failed', 'cancelled', 'expired', 'completed')),

  -- Nullable: the hold is created before identity is known — Stripe Checkout
  -- collects name/email/phone itself, and the webhook backfills these columns
  -- once the deposit is paid (see lib/booking/checkout.ts confirmDeposit).
  customer_name text,
  customer_email text,
  customer_phone text,

  location_type text not null check (location_type in ('included', 'outside')),
  location_detail text,
  message text,

  total_amount integer not null,      -- euros
  deposit_amount integer not null,    -- euros
  balance_amount integer not null,    -- euros

  stripe_checkout_session_id text,
  stripe_payment_intent_id text,
  calendar_event_id text,

  hold_expires_at timestamptz not null
);

-- Prevents two people from ever holding/paying the same slot at once. Only
-- covers rows still "live" (pending or paid) — cancelled/expired/failed rows
-- don't block the slot, so the app must flip expired pending rows to
-- 'expired' before attempting a new insert (see lib/booking/repository.ts).
create unique index if not exists bookings_slot_unique
  on bookings (date, slot_start)
  where status in ('pending', 'deposit_paid');

create index if not exists bookings_date_idx on bookings (date);
create index if not exists bookings_status_idx on bookings (status);

alter table bookings enable row level security;
-- No policies added on purpose: with RLS on and zero policies, every role
-- except the service role (which bypasses RLS entirely) is denied by default.
