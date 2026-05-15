-- Pre-launch: idempotent guards (safe if columns/indexes from prior migrations already exist).
-- Apply after 20260517120000_profiles_shipping_snapshot_tracking_index.sql

alter table public.profiles
  add column if not exists shipping_full_name  text,
  add column if not exists shipping_phone      text,
  add column if not exists shipping_address    text,
  add column if not exists shipping_city       text,
  add column if not exists shipping_province   text;

create index if not exists orders_tracking_number_lookup_idx
  on public.orders (tracking_number)
  where tracking_number is not null and length(trim(tracking_number)) > 0;
