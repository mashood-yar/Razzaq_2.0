-- Checkout confirmation codes, tightened order statuses, profile shipping fields.

-- ─── profiles (phone already exists on fresh schema) ───────────────────────
alter table public.profiles
  add column if not exists address_line text,
  add column if not exists city        text,
  add column if not exists province    text;

comment on column public.profiles.address_line is 'Last checkout / preferred address snapshot (optional)';
comment on column public.profiles.city is 'Last checkout city (optional)';
comment on column public.profiles.province is 'Last checkout province (optional)';

-- ─── orders: confirmation + fulfilment extras ─────────────────────────────
alter table public.orders
  add column if not exists confirmation_code text,
  add column if not exists confirmation_code_expires_at timestamptz,
  add column if not exists confirmation_attempts int not null default 0,
  add column if not exists confirmed_at timestamptz,
  add column if not exists courier_name text,
  add column if not exists cancellation_reason text;

comment on column public.orders.confirmation_code is '6-digit code emailed after checkout (plain; short-lived)';
comment on column public.orders.confirmation_attempts is 'Wrong-code attempts before lock (max 5)';
comment on column public.orders.confirmed_at is 'When customer verified email code';

-- Migrate legacy status values before replacing CHECK constraint
update public.orders
   set status = 'pending_confirmation'
 where status = 'pending';

update public.orders
   set status = 'shipped'
 where status = 'out_for_delivery';

update public.orders
   set status = 'cancelled'
 where status = 'refunded';

alter table public.orders drop constraint if exists orders_status_check;

alter table public.orders
  add constraint orders_status_check
  check (status in (
    'pending_confirmation',
    'confirmed',
    'processing',
    'shipped',
    'delivered',
    'cancelled'
  ));

-- ─── Atomic verify (service_role only) ────────────────────────────────────
create or replace function public.verify_order_confirmation(
  p_order_id uuid,
  p_code text,
  p_max_attempts int default 5
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  o record;
  norm text;
begin
  norm := regexp_replace(trim(coalesce(p_code, '')), '\D', '', 'g');

  select *
    into o
    from public.orders
   where id = p_order_id
   for update;

  if not found then
    return jsonb_build_object('ok', false, 'error', 'not_found');
  end if;

  if o.status is distinct from 'pending_confirmation' then
    return jsonb_build_object('ok', false, 'error', 'already_confirmed');
  end if;

  if o.confirmation_code_expires_at is not null
     and o.confirmation_code_expires_at < now() then
    return jsonb_build_object('ok', false, 'error', 'expired');
  end if;

  if o.confirmation_attempts >= p_max_attempts then
    return jsonb_build_object('ok', false, 'error', 'locked');
  end if;

  if length(norm) <> 6 or o.confirmation_code is distinct from norm then
    update public.orders
       set confirmation_attempts = confirmation_attempts + 1,
           updated_at = now()
     where id = p_order_id;
    return jsonb_build_object(
      'ok', false,
      'error', 'invalid_code',
      'attempts_left', greatest(0, p_max_attempts - o.confirmation_attempts - 1)
    );
  end if;

  update public.orders
     set status = 'confirmed',
         confirmed_at = now(),
         confirmation_code = null,
         confirmation_code_expires_at = null,
         updated_at = now()
   where id = p_order_id;

  insert into public.order_status_history (order_id, status, note)
  values (p_order_id, 'confirmed', 'Customer verified order code');

  return jsonb_build_object('ok', true);
end;
$$;

revoke all on function public.verify_order_confirmation(uuid, text, int) from public;
grant execute on function public.verify_order_confirmation(uuid, text, int) to service_role;
