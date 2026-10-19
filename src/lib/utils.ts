import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const CURRENCY_SYMBOL: Record<string, string> = {
  GBP: "£",
  EUR: "€",
  USD: "$",
  TRY: "₺",
};

/** 149900 → "£149.900" */
export function formatPrice(
  value: number | null | undefined,
  currency = "GBP"
): string {
  if (value === null || value === undefined || Number.isNaN(value)) return "—";
  const sym = CURRENCY_SYMBOL[currency] ?? currency + " ";
  return sym + new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 0 }).format(value);
}

/** 1250000 → "£1,25M" (kompakt kart gösterimi) */
export function formatPriceCompact(value: number | null | undefined, currency = "GBP") {
  if (!value) return "—";
  const sym = CURRENCY_SYMBOL[currency] ?? currency + " ";
  if (value >= 1_000_000) return `${sym}${(value / 1_000_000).toFixed(2).replace(".", ",")}M`;
  if (value >= 1_000) return `${sym}${Math.round(value / 1000)}K`;
  return sym + value;
}

export function formatNumber(value: number | null | undefined) {
  if (value === null || value === undefined) return "—";
  return new Intl.NumberFormat("tr-TR").format(value);
}

export function formatArea(value: number | null | undefined) {
  if (!value) return "—";
  const s = Number.isInteger(value) ? String(value) : value.toFixed(1).replace(".", ",");
  return `${s} m²`;
}

const DATE_TR = new Intl.DateTimeFormat("tr-TR", {
  day: "2-digit",
  month: "long",
  year: "numeric",
});
const DATETIME_TR = new Intl.DateTimeFormat("tr-TR", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});
const SHORT_TR = new Intl.DateTimeFormat("tr-TR", {
  day: "2-digit",
  month: "2-digit",
  year: "2-digit",
});

export function formatDate(d: Date | string | null | undefined) {
  if (!d) return "—";
  return DATE_TR.format(new Date(d));
}
export function formatDateTime(d: Date | string | null | undefined) {
  if (!d) return "—";
  return DATETIME_TR.format(new Date(d));
}
export function formatDateShort(d: Date | string | null | undefined) {
  if (!d) return "—";
  return SHORT_TR.format(new Date(d));
}

/** "3 saat önce" */
export function timeAgo(d: Date | string | null | undefined) {
  if (!d) return "—";
  const diff = Date.now() - new Date(d).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return "az önce";
  if (min < 60) return `${min} dk önce`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr} saat önce`;
  const day = Math.floor(hr / 24);
  if (day < 7) return `${day} gün önce`;
  if (day < 30) return `${Math.floor(day / 7)} hafta önce`;
  if (day < 365) return `${Math.floor(day / 30)} ay önce`;
  return `${Math.floor(day / 365)} yıl önce`;
}

/** Türkçe karakterleri çözerek slug üretir */
export function slugify(text: string): string {
  const map: Record<string, string> = {
    ı: "i", İ: "i", ş: "s", Ş: "s", ğ: "g", Ğ: "g",
    ü: "u", Ü: "u", ö: "o", Ö: "o", ç: "c", Ç: "c",
  };
  return text
    .split("")
    .map((c) => map[c] ?? c)
    .join("")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** +90 548 840 80 80 → 905488408080 */
export function normalizePhone(raw: string): string {
  let d = raw.replace(/\D/g, "");
  if (d.startsWith("00")) d = d.slice(2);
  if (d.length === 10 && !d.startsWith("90")) d = "90" + d;
  if (d.length === 11 && d.startsWith("0")) d = "90" + d.slice(1);
  return d;
}

/** 905488408080 → "+90 548 840 80 80" */
export function prettyPhone(raw: string): string {
  const d = normalizePhone(raw);
  if (d.startsWith("90") && d.length === 12) {
    return `+90 ${d.slice(2, 5)} ${d.slice(5, 8)} ${d.slice(8, 10)} ${d.slice(10)}`;
  }
  return "+" + d;
}

export function isValidPhone(raw: string): boolean {
  const d = normalizePhone(raw);
  return d.length >= 10 && d.length <= 15;
}

export function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

/** HW-2026-0042 formatında referans numarası */
export function makeRef(prefix: string, n: number): string {
  return `${prefix}-${new Date().getFullYear()}-${String(n).padStart(4, "0")}`;
}

export function pct(part: number, total: number): number {
  if (!total) return 0;
  return Math.round((part / total) * 100);
}

/** Kişiye özel stabil renk (avatar arkaplanı) */
export function avatarTone(seed: string): string {
  const tones = [
    "bg-sky-100 text-sky-700",
    "bg-emerald-100 text-emerald-700",
    "bg-amber-100 text-amber-700",
    "bg-violet-100 text-violet-700",
    "bg-rose-100 text-rose-700",
    "bg-teal-100 text-teal-700",
    "bg-indigo-100 text-indigo-700",
  ];
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return tones[h % tones.length];
}
