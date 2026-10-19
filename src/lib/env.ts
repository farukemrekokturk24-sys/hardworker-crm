/**
 * Ortam değişkenlerinin tek okunma noktası.
 * Edge (proxy) ve Node tarafında ortak kullanılır — "server-only" içermez.
 */

/** Yalnızca geliştirmede kullanılan sabit anahtar. */
const DEV_ONLY_SECRET = "hw-local-development-only-not-a-secret";

function readAuthSecret(): string {
  const value = process.env.AUTH_SECRET?.trim();

  if (value && value.length >= 16 && value !== DEV_ONLY_SECRET) {
    return value;
  }

  // Yayında zayıf/eksik anahtar, oturum çerezinin taklit edilebilmesi demektir;
  // sessizce varsayılana düşmek yerine açıkça durdururuz.
  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "AUTH_SECRET tanımlı değil ya da 16 karakterden kısa. " +
        "Vercel → Settings → Environment Variables bölümüne ekleyin. " +
        "Üretmek için: openssl rand -base64 32"
    );
  }

  return DEV_ONLY_SECRET;
}

/** Oturum çerezlerini imzalayan anahtar (HS256). */
export const AUTH_SECRET = new TextEncoder().encode(readAuthSecret());

/**
 * Sitenin mutlak adresi.
 * Vercel'de ayrıca bir şey girmeye gerek yoktur; platformun verdiği alan adı kullanılır.
 */
export function siteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicit) return explicit.replace(/\/+$/, "");

  const vercel =
    process.env.VERCEL_PROJECT_PRODUCTION_URL ?? process.env.VERCEL_URL;
  if (vercel) return `https://${vercel}`;

  return "http://localhost:3000";
}
