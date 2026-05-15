-- App alignment: profiles shipping_* columns (checkout prefill) + order lookup by carrier tracking number.

-- ─── profiles — last checkout shipping snapshot (optional) ─────────────────
alter table public.profiles
  add column if not exists shipping_full_name  text,
  add column if not exists shipping_phone      text,
  add column if not exists shipping_address    text,
  add column if not exists shipping_city       text,
  add column if not exists shipping_province   text;

comment on column public.profiles.shipping_full_name is 'Last order shipping name snapshot for checkout';
comment on column public.profiles.shipping_phone is 'Last order phone for checkout';
comment on column public.profiles.shipping_address is 'Last order line-1 address for checkout';
comment on column public.profiles.shipping_city is 'Last order city for checkout';
comment on column public.profiles.shipping_province is 'Last order province for checkout';

-- ─── orders — carrier webhook matches on tracking_number ──────────────────
create index if not exists orders_tracking_number_lookup_idx
  on public.orders (tracking_number)
  where tracking_number is not null and length(trim(tracking_number)) > 0;
