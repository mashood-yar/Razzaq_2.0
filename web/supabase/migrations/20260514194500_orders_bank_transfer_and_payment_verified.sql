-- Orders: manual bank transfers + verified payment UX
-- Safe to apply on databases that already use `schema.sql`; uses IF NOT EXISTS where possible.

-- ─── transaction reference from customer receipt ─────────────────────────
alter table public.orders
  add column if not exists transaction_id text;

comment on column public.orders.transaction_id is
  'Customer bank / wallet reference (manual transfer). Nullable for gateways.';

-- ─── payment_method: add bank_transfer, default cod ─────────────────────
alter table public.orders drop constraint if exists orders_payment_method_check;
alter table public.orders
  add constraint orders_payment_method_check
  check (payment_method in (
    'card',
    'cod',
    'safepay',
    'jazzcash',
    'payfast',
    'bank_transfer'
  ));

alter table public.orders alter column payment_method set default 'cod';

-- ─── payment_status: add verified (manual bank confirmation) ────────────
alter table public.orders drop constraint if exists orders_payment_status_check;
alter table public.orders
  add constraint orders_payment_status_check
  check (payment_status in ('pending','paid','failed','refunded','verified'));

-- ─── Ensure OAuth / trigger-created profiles stay storefront customers ─
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url, gender, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', ''),
    new.raw_user_meta_data->>'avatar_url',
    case
      when (new.raw_user_meta_data->>'gender') in ('male', 'female', 'other')
      then new.raw_user_meta_data->>'gender'
      else null
    end,
    'customer'
  )
  on conflict (id) do update
    set email      = excluded.email,
        full_name  = coalesce(excluded.full_name, public.profiles.full_name),
        avatar_url = coalesce(excluded.avatar_url, public.profiles.avatar_url),
        gender     = coalesce(excluded.gender, public.profiles.gender),
        -- Never downgrade privileged roles accidentally on auth sync
        role       = case
          when public.profiles.role in ('admin', 'staff') then public.profiles.role
          else coalesce(public.profiles.role, 'customer')
        end,
        updated_at = now();
  return new;
end;
$$;
