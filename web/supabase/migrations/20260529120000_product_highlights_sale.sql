-- Product highlight & sale flags for storefront badges and /highlights page

alter table public.products
  add column if not exists is_trending boolean not null default false,
  add column if not exists is_premium boolean not null default false,
  add column if not exists on_sale boolean not null default false,
  add column if not exists sale_price numeric(10,2),
  add column if not exists discount_percent integer
    check (discount_percent is null or (discount_percent >= 0 and discount_percent <= 100)),
  add column if not exists sale_start_at timestamptz,
  add column if not exists sale_end_at timestamptz;

create index if not exists products_is_trending_idx
  on public.products (is_trending)
  where is_trending = true and status = 'active';

create index if not exists products_is_premium_idx
  on public.products (is_premium)
  where is_premium = true and status = 'active';

create index if not exists products_on_sale_idx
  on public.products (on_sale)
  where on_sale = true and status = 'active';

comment on column public.products.is_trending is 'Most selling / trending badge';
comment on column public.products.is_premium is 'Premium collection badge';
comment on column public.products.on_sale is 'Active sale flag (respect sale_start_at / sale_end_at when set)';
comment on column public.products.sale_price is 'Fixed sale price in PKR; overrides discount_percent when set';
comment on column public.products.discount_percent is 'Percentage off price_pkr when on_sale and sale_price is null';
