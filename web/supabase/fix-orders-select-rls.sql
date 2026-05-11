-- Consolidated fix for:
-- - "permission denied for table profiles" on /account/orders
-- - older auth.users reference (if orders_user_select still exists)
-- Run once in Supabase → SQL Editor.

-- 1) Baseline privileges (RLS restricts rows; roles still need GRANT)
grant usage on schema public to anon, authenticated, service_role;

grant select, insert, update, delete on all tables in schema public to authenticated;
grant select on all tables in schema public to anon;
grant insert on public.newsletter_subscribers to anon;
grant insert on public.contact_submissions to anon;
grant all on all tables in schema public to service_role;

grant usage, select on all sequences in schema public to anon, authenticated, service_role;
grant all on all sequences in schema public to service_role;

alter default privileges in schema public
  grant select, insert, update, delete on tables to authenticated;
alter default privileges in schema public
  grant select on tables to anon;
alter default privileges in schema public
  grant all on tables to service_role;

-- 2) Split orders SELECT so "my orders" does not evaluate profiles without GRANT fixed
drop policy if exists "orders_user_select" on public.orders;
drop policy if exists "orders_select_own_user" on public.orders;
drop policy if exists "orders_select_guest_by_profile_email" on public.orders;

create policy "orders_select_own_user" on public.orders for select using (user_id = auth.uid());

create policy "orders_select_guest_by_profile_email" on public.orders for select using (
  guest_email is not null
  and exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
      and lower(trim(coalesce(p.email, ''))) = lower(trim(coalesce(guest_email, '')))
    )
);
