import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

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
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "out_for_delivery",
  "delivered",
  "cancelled",
  "refunded",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const STATUS_LABELS: Record<OrderStatus, string> = {
  pending:          "Pending",
  confirmed:        "Confirmed",
  processing:       "Processing",
  shipped:          "Shipped",
  out_for_delivery: "Out for Delivery",
  delivered:        "Delivered",
  cancelled:        "Cancelled",
  refunded:         "Refunded",
};

export const STATUS_COLORS: Record<OrderStatus, string> = {
  pending:          "bg-yellow-900/30 text-yellow-400 border-yellow-700/30",
  confirmed:        "bg-blue-900/30 text-blue-400 border-blue-700/30",
  processing:       "bg-purple-900/30 text-purple-400 border-purple-700/30",
  shipped:          "bg-indigo-900/30 text-indigo-400 border-indigo-700/30",
  out_for_delivery: "bg-orange-900/30 text-orange-400 border-orange-700/30",
  delivered:        "bg-green-900/30 text-green-400 border-green-700/30",
  cancelled:        "bg-red-900/30 text-red-400 border-red-700/30",
  refunded:         "bg-gray-900/30 text-gray-400 border-gray-700/30",
};

export const VALID_TRANSITIONS: Record<string, string[]> = {
  pending:          ["confirmed", "cancelled"],
  confirmed:        ["processing", "cancelled", "refunded"],
  processing:       ["shipped", "cancelled", "refunded"],
  shipped:          ["out_for_delivery", "delivered"],
  out_for_delivery: ["delivered"],
  delivered:        ["refunded"],
  cancelled:        [],
  refunded:         [],
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
