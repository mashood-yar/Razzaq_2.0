-- Add columns for Resend webhook-driven email delivery / bounce tracking.
-- Run in Supabase SQL Editor (or migrate) after deploying webhook + tagged sends.

alter table public.orders
  add column if not exists confirmation_email_delivered_at timestamptz,
  add column if not exists shipped_notice_email_delivered_at timestamptz,
  add column if not exists delivered_notice_email_delivered_at timestamptz,
  add column if not exists txn_email_bounce_at timestamptz,
  add column if not exists txn_email_bounce_kind text,
  add column if not exists txn_email_bounce_detail text;

comment on column public.orders.confirmation_email_delivered_at is 'Resend email.delivered for order_confirmation tag';
comment on column public.orders.shipped_notice_email_delivered_at is 'Resend email.delivered for order_shipped tag';
comment on column public.orders.delivered_notice_email_delivered_at is 'Resend email.delivered for order_delivered tag';
comment on column public.orders.txn_email_bounce_at is 'Last transactional bounce/fail/suppress/complaint (Resend webhook)';
comment on column public.orders.txn_email_bounce_kind is 'email_kind tag or event subtype';
comment on column public.orders.txn_email_bounce_detail is 'JSON or short text from Resend';
