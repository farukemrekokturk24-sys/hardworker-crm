/**
 * Dağıtım öncesi veritabanı hazırlığı.
 *
 * Vercel'de veritabanı adresi sağlayıcıya göre farklı isimde gelebildiği için
 * önce doğru değişkeni buluruz, sonra Prisma komutlarını o adresle çalıştırırız.
 * Adres hiç yoksa derlemeyi düşürmek yerine açık bir uyarı bırakırız; site
 * derlenir, veritabanı bağlanınca yeniden dağıtım yeterlidir.
 */
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";

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
];

const isDirect = (u) => u.startsWith("postgres://") || u.startsWith("postgresql://");
const isPrisma = (u) => u.startsWith("prisma://") || u.startsWith("prisma+postgres://");

function resolve() {
  const found = [];
  for (const name of CANDIDATES) {
    const v = process.env[name]?.trim();
    if (v && (isDirect(v) || isPrisma(v))) found.push({ url: v, from: name });
  }
  return found.find((f) => isDirect(f.url)) ?? found[0] ?? null;
}

function run(cmd, args, env) {
  console.log(`\n→ ${cmd} ${args.join(" ")}`);
  const r = spawnSync(cmd, args, { stdio: "inherit", env });
  if (r.status !== 0) process.exit(r.status ?? 1);
}

const baseEnv = { ...process.env };

// prisma generate veritabanı olmadan da çalışır; her hâlükârda gerekli.
run("npx", ["prisma", "generate"], baseEnv);

const resolved = resolve();

if (!resolved) {
  console.warn(
    "\n⚠️  Veritabanı adresi bulunamadı — tablo kurulumu ve örnek veri atlandı." +
      "\n   Aranan değişkenler: " + CANDIDATES.join(", ") +
      "\n   Vercel'de Storage bölümünden veritabanını bağlayıp yeniden dağıtın.\n"
  );
  process.exit(0);
}

console.log(`\n✓ Veritabanı adresi "${resolved.from}" değişkeninden alındı.`);
if (!isDirect(resolved.url)) {
  console.log("  (prisma protokolü kullanılıyor)");
}

const env = { ...baseEnv, DATABASE_URL: resolved.url };

run("npx", ["prisma", "migrate", "deploy"], env);
run("npx", ["tsx", "prisma/seed.ts"], env);
