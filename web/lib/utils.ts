import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type {
  PaymentMethod as OrderPaymentMethod,
  PaymentStatus,
} from "@/lib/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPKR(amount: number): string {
  return new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    minimumFractionDigits: 0,
  }).format(amount);
}

export function formatUSD(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(amount);
}

export function pkrToUsd(pkr: number, rate: number): number {
  return parseFloat((pkr / rate).toFixed(2));
}

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat("en-PK", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(dateStr));
}

export const ORDER_STATUSES = [
  "pending_confirmation",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const STATUS_LABELS: Record<OrderStatus, string> = {
  pending_confirmation: "Pending Confirmation",
  confirmed:           "Confirmed",
  processing:          "Processing",
  shipped:             "Shipped",
  delivered:           "Delivered",
  cancelled:           "Cancelled",
};

export const STATUS_COLORS: Record<OrderStatus, string> = {
  pending_confirmation:
    "bg-amber-900/30 text-amber-300 border-amber-700/30",
  confirmed:           "bg-blue-900/30 text-blue-400 border-blue-700/30",
  processing:          "bg-purple-900/30 text-purple-400 border-purple-700/30",
  shipped:             "bg-indigo-900/30 text-indigo-400 border-indigo-700/30",
  delivered:           "bg-green-900/30 text-green-400 border-green-700/30",
  cancelled:           "bg-red-900/30 text-red-400 border-red-700/30",
};

export const PAYMENT_METHOD_LABELS: Record<OrderPaymentMethod, string> = {
  card: "Card (Stripe / hosted)",
  cod: "Cash on Delivery",
  safepay: "Safepay",
  jazzcash: "JazzCash",
  payfast: "PayFast (disabled)",
  bank_transfer: "Bank / Upaisa transfer",
};

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  pending: "Pending",
  pending_verification: "Pending Verification",
  paid: "Paid",
  verified: "Verified",
  failed: "Failed",
  refunded: "Refunded",
};

export const PAYMENT_STATUS_COLORS: Record<PaymentStatus, string> = {
  pending: "bg-yellow-900/30 text-yellow-400 border-yellow-700/30",
  pending_verification:
    "bg-orange-900/30 text-orange-300 border-orange-700/30",
  paid: "bg-green-900/30 text-green-400 border-green-700/30",
  verified: "bg-emerald-900/30 text-emerald-300 border-emerald-700/30",
  failed: "bg-red-900/30 text-red-400 border-red-700/30",
  refunded: "bg-gray-900/30 text-gray-400 border-gray-700/30",
};

export const VALID_TRANSITIONS: Record<string, string[]> = {
  pending_confirmation: ["confirmed", "cancelled"],
  confirmed:           ["processing", "cancelled"],
  processing:          ["shipped", "cancelled"],
  shipped:             ["delivered", "cancelled"],
  delivered:           ["cancelled"],
  cancelled:           [],
};

export function canTransition(from: string, to: string): boolean {
  return VALID_TRANSITIONS[from]?.includes(to) ?? false;
}

export const PK_PROVINCES = [
  "Punjab",
  "Sindh",
  "KPK",
  "Balochistan",
  "Azad Kashmir",
  "Gilgit-Baltistan",
  "Islamabad Capital Territory",
];
