-- order_number_seq was added after the baseline "GRANT ... ON ALL SEQUENCES IN SCHEMA public",
-- so authenticated/anon never received USAGE/SELECT. The BEFORE INSERT trigger calls
-- generate_order_number() (not SECURITY DEFINER), so nextval() runs as the inserting role.

grant usage, select on sequence public.order_number_seq to anon, authenticated, service_role;
