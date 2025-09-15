import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, "-") // Replace spaces with -
    .replace(/[^\w-]+/g, "") // Remove all non-word chars
    .replace(/--+/g, "-") // Replace multiple - with single -
    .replace(/^-+/, "") // Trim - from start of text
    .replace(/-+$/, ""); // Trim - from end of text
}

export function formatPrice(price: number): string {
  return `रू ${price.toLocaleString("en-IN")}`;
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + "...";
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

export function calculateDiscountPercentage(
  originalPrice: number,
  discountedPrice: number
): number {
  return Math.round(((originalPrice - discountedPrice) / originalPrice) * 100);
}

export function getRandomColor(): string {
  const colors = [
    "bg-red-500",
    "bg-blue-500",
    "bg-green-500",
    "bg-yellow-500",
    "bg-purple-500",
    "bg-pink-500",
    "bg-indigo-500",
    "bg-teal-500",
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

export function generateSKU(prefix = "SKU"): string {
  return `${prefix}-${Math.random()
    .toString(36)
    .substring(2, 10)
    .toUpperCase()}`;
}

export const protocol =
  process.env.NODE_ENV === "production" ? "https" : "http";
export const rootDomain =
  process.env.NEXT_PUBLIC_ROOT_DOMAIN || "localhost:3000";

function isSubdomain() {
  if (typeof window === "undefined") return false;
  const hostname = window.location.hostname;
  return hostname.split(".").length > 2 && !hostname.includes("localhost");
}

export function getSubdomain(): string | null {
  if (typeof window === "undefined") return null;
  const hostname = window.location.hostname;

  // For localhost:3000
  if (hostname.includes("localhost")) {
    const subdomain = hostname.split(".")[0];
    if (subdomain !== "localhost") return subdomain;
    return null;
  }

  // For production (e.g., store.example.com)
  const parts = hostname.split(".");
  if (parts.length >= 3) {
    return parts[0]; // subdomain
  }

  return null;
}
