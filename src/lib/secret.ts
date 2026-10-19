import "server-only";
import { randomBytes } from "node:crypto";
import { prisma } from "./prisma";

/**
 * Oturum imzalama anahtarı.
 *
 * Öncelik sırası:
 *  1. AUTH_SECRET ortam değişkeni (elle ayarlanmışsa)
 *  2. Veritabanında saklanan, ilk açılışta üretilen rastgele anahtar
 *
 * İkinci seçenek sayesinde dağıtım sırasında elle anahtar girmeye gerek kalmaz;
 * anahtar yalnızca uygulamanın kendi (özel) veritabanında durur ve tüm
 * sunucu örnekleri aynı değeri okur.
 */

const SETTING_KEY = "auth.sessionSecret";
const ENV_MIN_LENGTH = 16;

let cached: Uint8Array | null = null;
let inflight: Promise<Uint8Array> | null = null;

function fromEnv(): string | null {
  const v = process.env.AUTH_SECRET?.trim();
  return v && v.length >= ENV_MIN_LENGTH ? v : null;
}

async function loadOrCreate(): Promise<string> {
  const existing = await prisma.setting.findUnique({ where: { key: SETTING_KEY } });
  if (existing && typeof existing.value === "string" && existing.value.length >= 32) {
    return existing.value;
  }

  const generated = randomBytes(48).toString("base64");
  try {
    await prisma.setting.create({
      data: { key: SETTING_KEY, value: generated as never },
    });
    return generated;
  } catch {
    // İki sunucu örneği aynı anda üretmiş olabilir; kazanan kaydı okuruz.
    const winner = await prisma.setting.findUnique({ where: { key: SETTING_KEY } });
    if (winner && typeof winner.value === "string") return winner.value;
    throw new Error("Oturum anahtarı oluşturulamadı.");
  }
}

/** HS256 imzalama anahtarı. İlk çağrıda üretilir, sonra bellekte tutulur. */
export async function getAuthSecret(): Promise<Uint8Array> {
  if (cached) return cached;

  const env = fromEnv();
  if (env) {
    cached = new TextEncoder().encode(env);
    return cached;
  }

  inflight ??= loadOrCreate().then((s) => {
    cached = new TextEncoder().encode(s);
    inflight = null;
    return cached;
  });

  return inflight;
}
