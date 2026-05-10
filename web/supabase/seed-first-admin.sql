-- Razzaq Luxe — first admin promotion (Strategy B: seed / SQL Editor).
-- Replace email, run in Supabase → SQL Editor after `profiles` + `role` exist.
--
-- Strategy A (manual): Dashboard → Authentication → Users → copy UUID → Table Editor →
--   `profiles` → set `role` = `admin` for that user.

UPDATE public.profiles
SET role = 'admin'
WHERE id = (
  SELECT id
  FROM auth.users
  WHERE lower(email) = lower('your-email@example.com')
  LIMIT 1
);

-- If `UPDATE 0 rows`: sign up once in your app so auth.users + profiles exist, or insert profile per your migration rules, then re-run.
