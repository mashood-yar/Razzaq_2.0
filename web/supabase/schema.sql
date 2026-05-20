-- Razzaq Luxe — Full Supabase Schema
-- Run in Supabase SQL Editor → New Query
-- Sections: extensions, profiles, categories, collections, products, variants,
--           images, product_collections, addresses, discounts, orders,
--           order_items, order_status_history, wishlist, newsletter, contact,
--           exchange_rates, RLS policies, RPC functions

-- ─────────────────────────────────────────────────────────────────────────────
-- 0. Extensions
-- ─────────────────────────────────────────────────────────────────────────────
create extension if not exists "uuid-ossp";
create extension if not exists "pg_trgm";
create extension if not exists "unaccent";

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. Profiles
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.profiles (
  id          uuid primary key references auth.users on delete cascade,
  email       text,
  full_name   text,
  phone       text,
  address_line text,
  city          text,
  province      text,
  shipping_full_name  text,
  shipping_phone      text,
  shipping_address    text,
  shipping_city       text,
  shipping_province   text,
  avatar_url  text,
  gender      text check (gender is null or gender in ('male', 'female', 'other')),
  role        text not null default 'customer'
                check (role in ('customer', 'staff', 'admin')),
  is_banned   boolean not null default false,
  scent_profile jsonb,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

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
        role       = case
          when public.profiles.role in ('admin', 'staff') then public.profiles.role
          else coalesce(public.profiles.role, 'customer')
        end,
        updated_at = now();
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. Categories
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.categories (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null,
  slug        text not null unique,
  description text,
  image_url   text,
  sort_order  int default 0,
  created_at  timestamptz not null default now()
);

insert into public.categories (name, slug, sort_order) values
  ('Fragrances', 'fragrances', 1),
  ('Lawn',       'lawn',       2),
  ('Formal',     'formal',     3),
  ('Casual',     'casual',     4),
  ('Accessories','accessories',5)
on conflict (slug) do nothing;

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. Collections
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.collections (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null,
  slug        text not null unique,
  description text,
  banner_url  text,
  is_active   boolean not null default true,
  sort_order  int default 0,
  seo_title   text,
  seo_desc    text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ─────────────────────────────────────────────────────────────────────────────
-- 4. Products
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.products (
  id               uuid primary key default uuid_generate_v4(),
  name             text not null,
  slug             text not null unique,
  description      text,
  category_id      uuid references public.categories(id),
  price_pkr        numeric(10,2) not null,
  compare_at_price numeric(10,2),
  sku              text unique,
  stock_quantity   int not null default 0,
  liter_ml         numeric(12,4),
  status           text not null default 'draft'
                     check (status in ('draft', 'active', 'archived')),
  tags             text[] default '{}',
  seo_title        text,
  seo_desc         text,
  search_vector    tsvector,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index if not exists products_search_idx on public.products using gin(search_vector);
create index if not exists products_category_idx on public.products(category_id);
create index if not exists products_status_idx on public.products(status);

create or replace function products_search_update() returns trigger as $$
begin
  new.search_vector :=
    setweight(to_tsvector('english', coalesce(new.name, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(new.description, '')), 'B') ||
    setweight(to_tsvector('english', array_to_string(new.tags, ' ')), 'C');
  return new;
end;
$$ language plpgsql;

drop trigger if exists products_search_trigger on public.products;
create trigger products_search_trigger
  before insert or update on public.products
  for each row execute function products_search_update();

-- ─────────────────────────────────────────────────────────────────────────────
-- 5. Product Images
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.product_images (
  id          uuid primary key default uuid_generate_v4(),
  product_id  uuid not null references public.products(id) on delete cascade,
  url         text not null,
  alt_text    text,
  sort_order  int default 0,
  is_primary  boolean default false,
  created_at  timestamptz not null default now()
);

create index if not exists product_images_product_idx on public.product_images(product_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- 6. Product Variants
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.product_variants (
  id             uuid primary key default uuid_generate_v4(),
  product_id     uuid not null references public.products(id) on delete cascade,
  color          text,
  size           text,
  sku            text unique,
  price_override numeric(10,2),
  stock_quantity int not null default 0,
  created_at     timestamptz not null default now()
);

create index if not exists variants_product_idx on public.product_variants(product_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- 7. Product ↔ Collection Join
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.product_collections (
  product_id    uuid references public.products(id) on delete cascade,
  collection_id uuid references public.collections(id) on delete cascade,
  primary key (product_id, collection_id)
);

-- ─────────────────────────────────────────────────────────────────────────────
-- 8. Addresses
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.addresses (
  id             uuid primary key default uuid_generate_v4(),
  user_id        uuid not null references auth.users(id) on delete cascade,
  first_name     text not null,
  last_name      text not null,
  address_line1  text not null,
  address_line2  text,
  city           text not null,
  province       text not null,
  postal_code    text,
  country        text not null default 'PK',
  phone          text not null,
  is_default     boolean not null default false,
  created_at     timestamptz not null default now()
);

create index if not exists addresses_user_idx on public.addresses(user_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- 9. Discounts
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.discounts (
  id               uuid primary key default uuid_generate_v4(),
  code             text not null unique,
  type             text not null check (type in ('percentage', 'fixed', 'free_shipping')),
  value            numeric(10,2) not null,
  min_order_amount numeric(10,2),
  usage_limit      int,
  usage_count      int not null default 0,
  expires_at       timestamptz,
  is_active        boolean not null default true,
  applies_to       text default 'all' check (applies_to in ('all','collections','products')),
  created_at       timestamptz not null default now()
);

create or replace function increment_discount_usage(p_code text)
returns void language sql as $$
  update public.discounts
  set usage_count = usage_count + 1
  where code = upper(p_code);
$$;

-- ─────────────────────────────────────────────────────────────────────────────
-- 10. Orders
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.orders (
  id                    uuid primary key default gen_random_uuid(),
  order_number          text not null unique,
  user_id               uuid references auth.users(id),
  guest_email           text,
  customer_email        text not null,
  customer_name         text,
  customer_phone        text,
  status                text not null default 'pending_confirmation'
                          check (status in (
                            'pending_confirmation','confirmed','processing',
                            'shipped','delivered','cancelled'
                          )),
  payment_method        text not null default 'cod'
                          check (payment_method in ('card','cod','safepay','jazzcash','payfast','bank_transfer')),
  payment_status        text not null default 'pending'
                          check (payment_status in ('pending','paid','failed','refunded','verified')),
  transaction_id        text,
  confirmation_code              text,
  confirmation_code_expires_at   timestamptz,
  confirmation_attempts          int not null default 0,
  confirmed_at                   timestamptz,
  lemonsqueezy_order_id text unique,
  safepay_tracker_token text,
  stripe_payment_intent_id text,
  jazzcash_txn_ref_no       text,
  subtotal_pkr          numeric(10,2) not null,
  discount_pkr          numeric(10,2) not null default 0,
  shipping_pkr          numeric(10,2) not null default 0,
  total_pkr             numeric(10,2) not null,
  discount_code         text,
  shipping_method       text,
  tracking_number       text,
  tracking_url          text,
  courier_name          text,
  cancellation_reason   text,
  notes                 text,
  -- Resend transactional email tracking (see add-order-resend-tracking.sql)
  confirmation_email_delivered_at    timestamptz,
  shipped_notice_email_delivered_at  timestamptz,
  delivered_notice_email_delivered_at timestamptz,
  txn_email_bounce_at                timestamptz,
  txn_email_bounce_kind              text,
  txn_email_bounce_detail            text,
  -- Denormalized shipping address snapshot
  ship_first_name       text not null,
  ship_last_name        text not null,
  ship_address1         text not null,
  ship_address2         text,
  ship_city             text not null,
  ship_province         text not null,
  ship_postal_code      text,
  ship_country          text not null default 'PK',
  ship_phone            text not null,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

-- Backfill on existing DBs: `CREATE TABLE IF NOT EXISTS` does not add new columns when the table
-- already exists, but indexes below require these payment columns.
alter table public.orders add column if not exists safepay_tracker_token text;
alter table public.orders add column if not exists stripe_payment_intent_id text;
alter table public.orders add column if not exists jazzcash_txn_ref_no text;

create index if not exists orders_user_id_idx     on public.orders(user_id);
create index if not exists orders_order_number_idx on public.orders(order_number);
create index if not exists orders_status_idx       on public.orders(status);
create index if not exists orders_created_at_idx   on public.orders(created_at desc);
create unique index if not exists orders_safepay_tracker_token_uidx
  on public.orders (safepay_tracker_token)
  where safepay_tracker_token is not null;

create unique index if not exists orders_stripe_payment_intent_id_uidx
  on public.orders (stripe_payment_intent_id)
  where stripe_payment_intent_id is not null;

create unique index if not exists orders_jazzcash_txn_ref_no_uidx
  on public.orders (jazzcash_txn_ref_no)
  where jazzcash_txn_ref_no is not null;

-- Auto-generate order number (sequence; matches migrations — new sequences need explicit GRANTs)
create sequence if not exists public.order_number_seq start with 10000;

create or replace function generate_order_number() returns text as $$
  select 'ORD-' || to_char(now(), 'YYYYMMDD') || '-' || lpad(nextval('public.order_number_seq'::regclass)::text, 5, '0');
$$ language sql;

create or replace function set_order_number() returns trigger as $$
begin
  if new.order_number is null or new.order_number = '' then
    new.order_number := generate_order_number();
  end if;
  return new;
end;
$$ language plpgsql;

drop trigger if exists order_number_trigger on public.orders;
create trigger order_number_trigger
  before insert on public.orders
  for each row execute function set_order_number();

-- ─────────────────────────────────────────────────────────────────────────────
-- 11. Order Items
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.order_items (
  id            uuid primary key default gen_random_uuid(),
  order_id      uuid not null references public.orders(id) on delete cascade,
  product_id    uuid references public.products(id),
  variant_id    uuid references public.product_variants(id),
  product_name  text not null,
  variant_label text,
  image_url     text,
  quantity      int not null check (quantity > 0),
  unit_price    numeric(10,2) not null,
  total_price   numeric(10,2) not null
);

create index if not exists order_items_order_idx on public.order_items(order_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- 12. Order Status History (legacy + new)
-- ─────────────────────────────────────────────────────────────────────────────
drop table if exists public.fulfillments cascade;

create table if not exists public.order_status_history (
  id         uuid primary key default gen_random_uuid(),
  order_id   uuid not null references public.orders(id) on delete cascade,
  status     text not null,
  note       text,
  changed_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

-- ─────────────────────────────────────────────────────────────────────────────
-- 13. Wishlist
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.wishlist (
  user_id    uuid references auth.users(id) on delete cascade,
  product_id uuid references public.products(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, product_id)
);

-- ─────────────────────────────────────────────────────────────────────────────
-- 14. Newsletter
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.newsletter_subscribers (
  id         uuid primary key default uuid_generate_v4(),
  email      text not null unique,
  is_active  boolean not null default true,
  created_at timestamptz not null default now()
);

-- ─────────────────────────────────────────────────────────────────────────────
-- 15. Contact Submissions
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.contact_submissions (
  id         uuid primary key default uuid_generate_v4(),
  name       text not null,
  email      text not null,
  subject    text not null,
  message    text not null,
  is_read    boolean not null default false,
  created_at timestamptz not null default now()
);

-- ─────────────────────────────────────────────────────────────────────────────
-- 16. Exchange Rate Cache
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.exchange_rates (
  id         uuid primary key default uuid_generate_v4(),
  from_curr  text not null,
  to_curr    text not null,
  rate       numeric(12,6) not null,
  fetched_at timestamptz not null default now(),
  unique (from_curr, to_curr)
);

-- ─────────────────────────────────────────────────────────────────────────────
-- 17. Stock RPC helpers (atomic decrement)
-- ─────────────────────────────────────────────────────────────────────────────
create or replace function decrement_variant_stock(p_variant_id uuid, p_qty int)
returns void language sql as $$
  update public.product_variants
  set stock_quantity = greatest(0, stock_quantity - p_qty)
  where id = p_variant_id;
$$;

create or replace function decrement_product_stock(p_product_id uuid, p_qty int)
returns void language sql as $$
  update public.products
  set stock_quantity = greatest(0, stock_quantity - p_qty)
  where id = p_product_id;
$$;

-- ─────────────────────────────────────────────────────────────────────────────
-- 18. Admin helper
-- ─────────────────────────────────────────────────────────────────────────────
create or replace function is_admin()
returns boolean language sql security definer as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('admin','staff')
  );
$$;

-- ─────────────────────────────────────────────────────────────────────────────
-- 19. Row-Level Security
-- ─────────────────────────────────────────────────────────────────────────────

-- Profiles
alter table public.profiles enable row level security;
drop policy if exists "profiles_select_own"     on public.profiles;
drop policy if exists "profiles_update_own"     on public.profiles;
drop policy if exists "profiles_insert_own"     on public.profiles;
drop policy if exists "profiles_admin_all"      on public.profiles;
create policy "profiles_select_own"   on public.profiles for select using (id = auth.uid() or is_admin());
create policy "profiles_update_own"   on public.profiles for update using (id = auth.uid());
create policy "profiles_insert_own"   on public.profiles for insert with check (id = auth.uid());
create policy "profiles_admin_all"    on public.profiles for all using (is_admin());

-- Products: public read active; admin write
alter table public.products enable row level security;
drop policy if exists "products_public_read"  on public.products;
drop policy if exists "products_admin_write"  on public.products;
create policy "products_public_read"  on public.products for select using (status = 'active' or is_admin());
create policy "products_admin_write"  on public.products for all using (is_admin()) with check (is_admin());

-- Product images + variants: public read; admin write
alter table public.product_images enable row level security;
drop policy if exists "product_images_public"  on public.product_images;
drop policy if exists "product_images_admin"   on public.product_images;
create policy "product_images_public" on public.product_images for select using (true);
create policy "product_images_admin"  on public.product_images for all using (is_admin());

alter table public.product_variants enable row level security;
drop policy if exists "variants_public"  on public.product_variants;
drop policy if exists "variants_admin"   on public.product_variants;
create policy "variants_public" on public.product_variants for select using (true);
create policy "variants_admin"  on public.product_variants for all using (is_admin());

-- Categories + collections: public read; admin write
alter table public.categories enable row level security;
drop policy if exists "categories_public" on public.categories;
drop policy if exists "categories_admin"  on public.categories;
create policy "categories_public" on public.categories for select using (true);
create policy "categories_admin"  on public.categories for all using (is_admin());

alter table public.collections enable row level security;
drop policy if exists "collections_public" on public.collections;
drop policy if exists "collections_admin"  on public.collections;
create policy "collections_public" on public.collections for select using (is_active or is_admin());
create policy "collections_admin"  on public.collections for all using (is_admin());

alter table public.product_collections enable row level security;
drop policy if exists "pc_public" on public.product_collections;
drop policy if exists "pc_admin"  on public.product_collections;
create policy "pc_public" on public.product_collections for select using (true);
create policy "pc_admin"  on public.product_collections for all using (is_admin());

-- Orders: user sees own rows without touching profiles; guest match uses profiles.email
alter table public.orders enable row level security;
drop policy if exists "orders_user_select" on public.orders;
drop policy if exists "orders_select_own_user" on public.orders;
drop policy if exists "orders_select_guest_by_profile_email" on public.orders;
drop policy if exists "orders_user_insert"  on public.orders;
drop policy if exists "orders_admin_all"    on public.orders;

-- Own orders (no profiles subquery — avoids privilege issues before GRANT runs)
create policy "orders_select_own_user" on public.orders for select using (user_id = auth.uid());

-- Guest checkout tied to email after signup
create policy "orders_select_guest_by_profile_email" on public.orders for select using (
  guest_email is not null
  and exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
      and lower(trim(coalesce(p.email, ''))) = lower(trim(coalesce(guest_email, '')))
    )
);

create policy "orders_user_insert" on public.orders for insert with check (user_id = auth.uid() or user_id is null);
create policy "orders_admin_all"   on public.orders for all using (is_admin());

-- Order items
alter table public.order_items enable row level security;
drop policy if exists "order_items_read" on public.order_items;
drop policy if exists "order_items_admin" on public.order_items;
create policy "order_items_read"  on public.order_items for select using (exists (select 1 from public.orders o where o.id = order_id and (o.user_id = auth.uid() or is_admin())));
create policy "order_items_admin" on public.order_items for all using (is_admin());

-- Order status history
alter table public.order_status_history enable row level security;
drop policy if exists "osh_read"  on public.order_status_history;
drop policy if exists "osh_admin" on public.order_status_history;
create policy "osh_read"  on public.order_status_history for select using (exists (select 1 from public.orders o where o.id = order_id and (o.user_id = auth.uid() or is_admin())));
create policy "osh_admin" on public.order_status_history for all using (is_admin());

-- Addresses
alter table public.addresses enable row level security;
drop policy if exists "addresses_user" on public.addresses;
drop policy if exists "addresses_admin" on public.addresses;
create policy "addresses_user"  on public.addresses for all using (user_id = auth.uid());
create policy "addresses_admin" on public.addresses for select using (is_admin());

-- Wishlist
alter table public.wishlist enable row level security;
drop policy if exists "wishlist_user" on public.wishlist;
create policy "wishlist_user" on public.wishlist for all using (user_id = auth.uid());

-- Discounts: admin only write; anon can read by code for validation
alter table public.discounts enable row level security;
drop policy if exists "discounts_public_read" on public.discounts;
drop policy if exists "discounts_admin"       on public.discounts;
create policy "discounts_public_read" on public.discounts for select using (is_active);
create policy "discounts_admin"       on public.discounts for all using (is_admin());

-- Newsletter: anyone can subscribe
alter table public.newsletter_subscribers enable row level security;
drop policy if exists "newsletter_insert" on public.newsletter_subscribers;
drop policy if exists "newsletter_admin"  on public.newsletter_subscribers;
create policy "newsletter_insert" on public.newsletter_subscribers for insert with check (true);
create policy "newsletter_admin"  on public.newsletter_subscribers for all using (is_admin());

-- Contact: anyone can submit
alter table public.contact_submissions enable row level security;
drop policy if exists "contact_insert" on public.contact_submissions;
drop policy if exists "contact_admin"  on public.contact_submissions;
create policy "contact_insert" on public.contact_submissions for insert with check (true);
create policy "contact_admin"  on public.contact_submissions for all using (is_admin());

-- Exchange rates: public read
alter table public.exchange_rates enable row level security;
drop policy if exists "rates_public" on public.exchange_rates;
drop policy if exists "rates_admin"  on public.exchange_rates;
create policy "rates_public" on public.exchange_rates for select using (true);
create policy "rates_admin"  on public.exchange_rates for all using (is_admin());

-- 20. Table privileges ------------------------------------------------------------
-- RLS decides *which rows* apply; Postgres still requires ROLE-level GRANT on tables.
grant usage on schema public to anon, authenticated, service_role;

grant select, insert, update, delete on all tables in schema public to authenticated;
grant select on all tables in schema public to anon;
grant insert on public.newsletter_subscribers to anon;
grant insert on public.contact_submissions to anon;
grant all on all tables in schema public to service_role;

grant usage, select on all sequences in schema public to anon, authenticated, service_role;
grant all on all sequences in schema public to service_role;

-- Sequences created after the "ALL SEQUENCES" grant (e.g. order_number_seq) need explicit grants.
grant usage, select on sequence public.order_number_seq to anon, authenticated, service_role;

alter default privileges in schema public
  grant select, insert, update, delete on tables to authenticated;
alter default privileges in schema public
  grant select on tables to anon;
alter default privileges in schema public
  grant all on tables to service_role;
