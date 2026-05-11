-- Safepay payment gateway – tracker token + extended payment_method.
-- Apply in Supabase SQL Editor after deploying API routes.

alter table public.orders
  add column if not exists safepay_tracker_token text;

create unique index if not exists orders_safepay_tracker_token_uidx
  on public.orders (safepay_tracker_token)
  where safepay_tracker_token is not null;

alter table public.orders drop constraint if exists orders_payment_method_check;

alter table public.orders
  add constraint orders_payment_method_check
  check (payment_method in ('card', 'cod', 'safepay'));

comment on column public.orders.safepay_tracker_token is 'Safepay tracker token (track_xxx) from POST /order/v1/init';
