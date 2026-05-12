-- PayFast Pakistan — hosted checkout (cards & wallets)
alter table public.orders
  drop constraint if exists orders_payment_method_check;

alter table public.orders
  add constraint orders_payment_method_check
  check (payment_method in ('card','cod','safepay','jazzcash','payfast'));

comment on column public.orders.payment_method is 'card | cod | safepay | jazzcash | payfast';
