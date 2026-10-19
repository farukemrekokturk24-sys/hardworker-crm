/**
 * Ortam değişkenlerinin tek okunma noktası.
 * Oturum anahtarı için bkz. src/lib/secret.ts
 */

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
