// ─── Razzaq Luxe — App-level types ────────────────────────────────────────

import type { ScentProfile } from "@/lib/quiz/scent-profile";

export type ProductStatus = "draft" | "active" | "archived";
export type OrderStatus =
  | "pending_confirmation"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";
export type PaymentMethod =
  | "card"
  | "cod"
  | "safepay"
  | "jazzcash"
  | "payfast"
  | "bank_transfer";
export type PaymentStatus =
  | "pending"
  | "pending_verification"
  | "paid"
  | "failed"
  | "refunded"
  | "verified";
export type DiscountType = "percentage" | "fixed" | "free_shipping";
export type UserRole = "customer" | "staff" | "admin";

export type ProfileGender = "male" | "female" | "other";

export interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  phone: string | null;
  scent_profile?: ScentProfile | null;
  /** Last-used address fields from checkout when logged in */
  address_line: string | null;
  city: string | null;
  province: string | null;
  avatar_url: string | null;
  gender: ProfileGender | null;
  role: UserRole;
  is_banned: boolean;
  created_at: string;
  updated_at: string;
  shipping_full_name?: string | null;
  shipping_phone?: string | null;
  shipping_address?: string | null;
  shipping_city?: string | null;
  shipping_province?: string | null;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  sort_order: number;
  created_at: string;
}

export interface Collection {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  banner_url: string | null;
  is_active: boolean;
  sort_order: number;
  seo_title: string | null;
  seo_desc: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProductImage {
  id: string;
  product_id: string;
  url: string;
  alt_text: string | null;
  sort_order: number;
  is_primary: boolean;
  created_at: string;
}

export interface ProductVariant {
  id: string;
  product_id: string;
  color: string | null;
  size: string | null;
  sku: string | null;
  price_override: number | null;
  stock_quantity: number;
  created_at: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  category_id: string | null;
  price_pkr: number;
  compare_at_price: number | null;
  sku: string | null;
  stock_quantity: number;
  /** Optional migration column — not used by admin inserts for all environments */
  liter_ml?: number | null;
  status: ProductStatus;
  tags: string[];
  seo_title: string | null;
  seo_desc: string | null;
  is_trending?: boolean;
  is_premium?: boolean;
  on_sale?: boolean;
  sale_price?: number | null;
  discount_percent?: number | null;
  sale_start_at?: string | null;
  sale_end_at?: string | null;
  created_at: string;
  updated_at: string;
  // joins
  product_images?: ProductImage[];
  product_variants?: ProductVariant[];
  categories?: Pick<Category, "name" | "slug"> | null;
}

export interface Address {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  address_line1: string;
  address_line2: string | null;
  city: string;
  province: string;
  postal_code: string | null;
  country: string;
  phone: string;
  is_default: boolean;
  created_at: string;
}

export interface Discount {
  id: string;
  code: string;
  type: DiscountType;
  value: number;
  min_order_amount: number | null;
  usage_limit: number | null;
  usage_count: number;
  expires_at: string | null;
  is_active: boolean;
  applies_to: string;
  created_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  variant_id: string | null;
  product_name: string;
  variant_label: string | null;
  image_url: string | null;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export interface OrderStatusHistory {
  id: string;
  order_id: string;
  status: string;
  note: string | null;
  changed_by: string | null;
  created_at: string;
}

export interface Order {
  id: string;
  order_number: string;
  user_id: string | null;
  guest_email: string | null;
  customer_email: string;
  customer_name: string | null;
  customer_phone: string | null;
  status: OrderStatus;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  confirmation_code?: string | null;
  confirmation_code_expires_at?: string | null;
  confirmation_attempts?: number;
  confirmed_at?: string | null;
  transaction_id?: string | null;
  lemonsqueezy_order_id: string | null;
  safepay_tracker_token?: string | null;
  stripe_payment_intent_id?: string | null;
  jazzcash_txn_ref_no?: string | null;
  courier_name?: string | null;
  cancellation_reason?: string | null;
  subtotal_pkr: number;
  discount_pkr: number;
  shipping_pkr: number;
  total_pkr: number;
  discount_code: string | null;
  shipping_method: string | null;
  tracking_number: string | null;
  tracking_url: string | null;
  confirmation_locked?: boolean | null;
  notes: string | null;
  confirmation_email_delivered_at?: string | null;
  shipped_notice_email_delivered_at?: string | null;
  delivered_notice_email_delivered_at?: string | null;
  txn_email_bounce_at?: string | null;
  txn_email_bounce_kind?: string | null;
  txn_email_bounce_detail?: string | null;
  ship_first_name: string;
  ship_last_name: string;
  ship_address1: string;
  ship_address2: string | null;
  ship_city: string;
  ship_province: string;
  ship_postal_code: string | null;
  ship_country: string;
  ship_phone: string;
  created_at: string;
  updated_at: string;
  // joins
  order_items?: OrderItem[];
  order_status_history?: OrderStatusHistory[];
}

// Cart item (Zustand store)
export interface CartItem {
  id: string;
  productId: string;
  variantId?: string;
  name: string;
  variantLabel?: string;
  imageUrl: string;
  price: number;
  quantity: number;
}

// Checkout form data
export interface CheckoutAddress {
  fullName: string;
  email: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  province: string;
  postalCode?: string;
  country: string;
}

// Legacy fragrance types kept for backward compat
export type Gender = "men" | "women" | "unisex";
export type ProductBadge = "bestseller" | "new" | "limited";
export type MainNoteCategory =
  | "Woody" | "Citrus" | "Floral" | "Oriental"
  | "Fresh" | "Spicy" | "Gourmand" | "Amber";
export type SizeVariant = { label: string; ml: number; price: number };

export type CartLineItem = {
  lineId: string;
  productId: string;
  slug: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  sizeLabel: string;
  ml: number;
};

export type Article = {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  readTime: string;
  image: string;
  category: string;
  author: string;
  body: string[];
  pullQuotes?: string[];
};
