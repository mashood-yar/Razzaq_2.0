-- Pre-launch documentation-only migration (safe / idempotent).
-- Stores operational notes on core storefront tables for whoever audits Supabase.
-- Schema columns should already exist from earlier migrations + `schema.sql`.

comment on table public.orders is
  'Storefront orders. RLS: orders_select_own_user (user_id = auth.uid()); '
  'orders_select_guest_by_profile_email (guest checkout email match); '
  'orders_user_insert (authenticated insert own uid or guest); orders_admin_all (is_admin()). '
  'Server-side admin flows must use the Supabase service role client to bypass RLS.';

comment on table public.order_items is
  'Line items. RLS order_items_read: selectable when parent order is visible to the user or admin.';

comment on table public.order_status_history is
  'Audit trail for status changes. RLS osh_read: readable when parent order is visible to the user or admin.';

comment on table public.profiles is
  'Customer profiles keyed by auth user id. Typical pattern: users read/update own row; '
  'admin policies per schema (is_admin).';

comment on table public.contact_submissions is
  'Contact form rows. RLS: contact_insert (anon/authenticated insert with check true); '
  'contact_admin (is_admin all). Ensure grant insert on public.contact_submissions to anon remains for public form.';
