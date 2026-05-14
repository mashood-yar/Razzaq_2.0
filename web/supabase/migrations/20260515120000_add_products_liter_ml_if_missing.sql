-- Remote DB may predate rename migration; inserts use `liter_ml`.
alter table public.products add column if not exists liter_ml numeric(12,4);
