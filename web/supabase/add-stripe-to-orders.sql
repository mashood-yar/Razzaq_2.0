-- Stripe PaymentIntent id for card checkout (nullable, unique).
-- Run after deploying Stripe checkout routes.

alter table public.orders add column if not exists stripe_payment_intent_id text;

create unique index if not exists orders_stripe_payment_intent_id_uidx
  on public.orders (stripe_payment_intent_id)
  where stripe_payment_intent_id is not null;

comment on column public.orders.stripe_payment_intent_id is 'Stripe PaymentIntent id (pi_xxx) when paying by card';
