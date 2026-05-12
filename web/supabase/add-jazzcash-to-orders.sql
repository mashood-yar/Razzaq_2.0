-- JazzCash Mobile Wallet (MWALLET) — txn reference for callbacks
alter table public.orders
  drop constraint if exists orders_payment_method_check;

alter table public.orders
  add constraint orders_payment_method_check
  check (payment_method in ('card','cod','safepay','jazzcash'));

alter table public.orders
  add column if not exists jazzcash_txn_ref_no text;

create unique index if not exists orders_jazzcash_txn_ref_no_uidx
  on public.orders (jazzcash_txn_ref_no)
  where jazzcash_txn_ref_no is not null;

comment on column public.orders.jazzcash_txn_ref_no is 'JazzCash pp_TxnRefNo for MWALLET initiate + return URL matching';
