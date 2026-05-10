-- Razzaq Luxe — Supabase (free tier). Run in SQL Editor after creating a project.
-- https://supabase.com/dashboard

-- Orders written from static checkout when enableSupabase + keys are set in js/config.js
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_ref text not null unique,
  email text not null,
  customer_name text,
  phone text,
  ship_address text,
  ship_city text,
  subtotal_pkr integer not null default 0,
  shipping_pkr integer not null default 0,
  total_pkr integer not null default 0,
  status text not null default 'processing',
  carrier_tracking text,
  items jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.orders enable row level security;

-- Anonymous checkout: allow inserting new orders (tighten with validation or Edge Functions for production)
create policy "Allow anon insert orders"
  on public.orders for insert
  to anon
  with check (true);

-- CMS: legal/policy HTML managed in dashboard or seeded here
create table if not exists public.policy_pages (
  slug text primary key,
  title text not null,
  body_html text not null,
  updated_at timestamptz not null default now()
);

alter table public.policy_pages enable row level security;

create policy "Allow public read policies"
  on public.policy_pages for select
  to anon, authenticated
  using (true);

-- Optional seed (edit HTML before production)
insert into public.policy_pages (slug, title, body_html)
values
  ('privacy', 'Privacy policy', '<p>Replace with counsel-approved copy from Supabase dashboard.</p>')
on conflict (slug) do nothing;

-- Secure order lookup for track-order page (no open table scan)
create or replace function public.lookup_order(p_ref text, p_email text)
returns table (
  order_ref text,
  email text,
  status text,
  carrier_tracking text,
  total_pkr integer,
  created_at timestamptz,
  items jsonb
)
language sql
security definer
set search_path = public
as $$
  select o.order_ref, o.email, o.status, o.carrier_tracking, o.total_pkr, o.created_at, o.items
  from public.orders o
  where lower(o.order_ref) = lower(trim(p_ref))
    and lower(o.email) = lower(trim(p_email))
  limit 1;
$$;

grant execute on function public.lookup_order(text, text) to anon, authenticated;

-- Auth: enable Email provider in Authentication → Providers (built-in, free tier)
