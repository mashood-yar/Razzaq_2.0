-- Security hardening: order numbers, promo RPC hardening, service_role-only EXECUTE,
-- rollback helper for abandoned checkouts after validate_and_lock_discount.
-- Run once in Supabase SQL Editor or via migrations.

CREATE SEQUENCE IF NOT EXISTS order_number_seq START WITH 10000;

CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS text
LANGUAGE sql
AS $$
  SELECT 'ORD-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(nextval('order_number_seq'::regclass)::text, 5, '0');
$$;

CREATE OR REPLACE FUNCTION increment_discount_usage(p_code text)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.discounts
  SET usage_count = usage_count + 1
  WHERE code = upper(p_code)
    AND (usage_limit IS NULL OR usage_count < usage_limit);
$$;

CREATE OR REPLACE FUNCTION rollback_discount_reservation(p_code text)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.discounts
  SET usage_count = greatest(0, usage_count - 1)
  WHERE code = upper(p_code);
$$;

CREATE OR REPLACE FUNCTION validate_and_lock_discount(p_code text, p_order_amount numeric)
RETURNS numeric
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_discount public.discounts%ROWTYPE;
  v_discount_amount numeric := 0;
BEGIN
  SELECT * INTO v_discount
  FROM public.discounts
  WHERE code = upper(trim(p_code))
    AND is_active = true
    AND (expires_at IS NULL OR expires_at > now())
    AND (usage_limit IS NULL OR usage_count < usage_limit)
    AND (min_order_amount IS NULL OR p_order_amount >= min_order_amount)
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN -1;
  END IF;

  UPDATE public.discounts
  SET usage_count = usage_count + 1
  WHERE id = v_discount.id;

  IF v_discount.type = 'percentage' THEN
    v_discount_amount :=
      LEAST(
        ROUND(p_order_amount * (v_discount.value / 100.0), 2),
        p_order_amount
      );
  ELSIF v_discount.type = 'fixed' THEN
    v_discount_amount := LEAST(ROUND(v_discount.value, 2), p_order_amount);
  ELSIF v_discount.type = 'free_shipping' THEN
    v_discount_amount := 0;
  END IF;

  RETURN COALESCE(v_discount_amount, 0);
END;
$$;

REVOKE ALL ON FUNCTION public.increment_discount_usage(text) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.increment_discount_usage(text) FROM anon;
REVOKE EXECUTE ON FUNCTION public.increment_discount_usage(text) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.increment_discount_usage(text) TO service_role;

REVOKE ALL ON FUNCTION public.validate_and_lock_discount(text, numeric) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.validate_and_lock_discount(text, numeric) FROM anon;
REVOKE EXECUTE ON FUNCTION public.validate_and_lock_discount(text, numeric) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.validate_and_lock_discount(text, numeric) TO service_role;

REVOKE ALL ON FUNCTION public.rollback_discount_reservation(text) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.rollback_discount_reservation(text) FROM anon;
REVOKE EXECUTE ON FUNCTION public.rollback_discount_reservation(text) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.rollback_discount_reservation(text) TO service_role;
