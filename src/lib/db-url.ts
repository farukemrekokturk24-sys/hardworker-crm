/**
 * Veritabanı adresini ortam değişkeni adından bağımsız çözer.
 *
 * Vercel'de barındırma sağlayıcısına göre değişken farklı isimlerle gelir
 * (Prisma Postgres, Neon, Supabase hepsi farklı ad kullanır). Burada hepsini
 * tarayıp kullanılabilir olanı seçeriz; böylece panelde elle değişken
 * adı düzeltmeye gerek kalmaz.
 */

/** Sırayla denenecek değişken adları — doğrudan TCP adresleri önce gelir. */
const CANDIDATES = [
  "DATABASE_URL",
  "POSTGRES_URL_NON_POOLING",
  "DATABASE_URL_UNPOOLED",
  "POSTGRES_URL",
  "POSTGRES_PRISMA_URL",
  "PRISMA_DATABASE_URL",
  "STORAGE_URL",
  "STORAGE_POSTGRES_URL",
  "STORAGE_DATABASE_URL",
] as const;

function isDirect(url: string) {
  return url.startsWith("postgres://") || url.startsWith("postgresql://");
}

function isPrismaProtocol(url: string) {
  return url.startsWith("prisma://") || url.startsWith("prisma+postgres://");
}

export type ResolvedDbUrl = { url: string; from: string };

/**
 * Bulunan ilk geçerli adresi döndürür.
 * Doğrudan `postgres://` adresi, `prisma+postgres://` adresine tercih edilir:
 * tablo oluşturma (migrate) her ortamda doğrudan bağlantıyla sorunsuz çalışır.
 */
export function resolveDatabaseUrl(
  env: NodeJS.ProcessEnv = process.env
): ResolvedDbUrl | null {
  const found: ResolvedDbUrl[] = [];

  for (const name of CANDIDATES) {
    const value = env[name]?.trim();
    if (!value) continue;
    if (isDirect(value) || isPrismaProtocol(value)) {
      found.push({ url: value, from: name });
    }
  }

  return found.find((f) => isDirect(f.url)) ?? found[0] ?? null;
}
