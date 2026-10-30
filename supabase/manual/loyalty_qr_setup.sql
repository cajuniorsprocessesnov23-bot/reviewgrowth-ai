-- Branditude: additive loyalty / QR foundation
-- Safe to run in Supabase SQL Editor after reviewing the existing schema.
-- This migration does not alter or delete existing business/customer tables.

create table if not exists public.loyalty_customer_qr (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  customer_id uuid not null references public.customers(id) on delete cascade,
  qr_token uuid not null unique default gen_random_uuid(),
  created_at timestamptz not null default now(),
  created_by uuid references auth.users(id),
  unique (business_id, customer_id)
);

create table if not exists public.loyalty_visits (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  customer_id uuid not null references public.customers(id) on delete cascade,
  qr_id uuid not null references public.loyalty_customer_qr(id) on delete restrict,
  visit_number integer not null check (visit_number > 0),
  staff_user_id uuid not null references auth.users(id),
  visited_at timestamptz not null default now(),
  source text not null default 'staff_qr_scan'
    check (source in ('staff_qr_scan', 'manual_staff_entry')),
  created_at timestamptz not null default now(),
  unique (business_id, customer_id, visit_number)
);

create index if not exists loyalty_visits_business_date_idx
  on public.loyalty_visits (business_id, visited_at desc);
create index if not exists loyalty_visits_customer_idx
  on public.loyalty_visits (customer_id, visited_at desc);

create table if not exists public.loyalty_vouchers (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  customer_id uuid not null references public.customers(id) on delete cascade,
  visit_id uuid references public.loyalty_visits(id) on delete set null,
  voucher_code text not null unique,
  reward_description text not null,
  status text not null default 'issued'
    check (status in ('issued', 'redeemed', 'expired', 'cancelled')),
  issued_at timestamptz not null default now(),
  expires_at timestamptz,
  redeemed_at timestamptz,
  redeemed_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

create index if not exists loyalty_vouchers_business_status_idx
  on public.loyalty_vouchers (business_id, status, issued_at desc);
create index if not exists loyalty_vouchers_customer_idx
  on public.loyalty_vouchers (customer_id, issued_at desc);

alter table public.loyalty_customer_qr enable row level security;
alter table public.loyalty_visits enable row level security;
alter table public.loyalty_vouchers enable row level security;

revoke all on public.loyalty_customer_qr from anon, authenticated;
revoke all on public.loyalty_visits from anon, authenticated;
revoke all on public.loyalty_vouchers from anon, authenticated;

grant select on public.loyalty_customer_qr to authenticated;
grant select on public.loyalty_visits to authenticated;
grant select on public.loyalty_vouchers to authenticated;

drop policy if exists "Business members read loyalty QR records" on public.loyalty_customer_qr;
create policy "Business members read loyalty QR records"
on public.loyalty_customer_qr for select to authenticated
using (exists (
  select 1 from public.business_members bm
  where bm.business_id = loyalty_customer_qr.business_id
    and bm.user_id = (select auth.uid())
));

drop policy if exists "Business members read loyalty visits" on public.loyalty_visits;
create policy "Business members read loyalty visits"
on public.loyalty_visits for select to authenticated
using (exists (
  select 1 from public.business_members bm
  where bm.business_id = loyalty_visits.business_id
    and bm.user_id = (select auth.uid())
));

drop policy if exists "Business members read loyalty vouchers" on public.loyalty_vouchers;
create policy "Business members read loyalty vouchers"
on public.loyalty_vouchers for select to authenticated
using (exists (
  select 1 from public.business_members bm
  where bm.business_id = loyalty_vouchers.business_id
    and bm.user_id = (select auth.uid())
));

-- Writes are intentionally server-side only for now. Do not grant direct client
-- INSERT/UPDATE privileges until authenticated server routes validate QR tokens,
-- business membership, visit sequencing, and voucher redemption atomically.
