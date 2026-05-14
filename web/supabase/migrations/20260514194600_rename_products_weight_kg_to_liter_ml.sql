-- Rename legacy column storing bottle volume (ml) from weight_kg to liter_ml.
-- Safe when column already renamed or never existed (greenfield).

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'products'
      AND column_name = 'weight_kg'
  )
   AND NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'products'
      AND column_name = 'liter_ml'
  ) THEN
    ALTER TABLE public.products RENAME COLUMN weight_kg TO liter_ml;
  END IF;
END $$;
