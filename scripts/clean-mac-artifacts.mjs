/**
 * macOS, exFAT/FAT diskte her dosyanın yanına "._<ad>" kaynak-çatal dosyası yazar.
 * Bu dosyalar Next'in Turbopack ve görsel önbelleklerini bozup derlemeyi düşürüyor
 * ("Loading persistence directory failed", bozuk görsel servisi).
 *
 * Derlemeden önce .next içindeki bu artıkları temizler. Linux/Vercel'de etkisizdir.
 */
import { readdirSync, rmSync, statSync } from "node:fs";
import { join } from "node:path";

if (process.platform !== "darwin") process.exit(0);

let removed = 0;

function sweep(dir) {
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const e of entries) {
    const full = join(dir, e.name);
    if (e.name.startsWith("._")) {
      try {
        rmSync(full, { recursive: true, force: true });
        removed++;
      } catch {
        /* yoksay */
      }
      continue;
    }
    if (e.isDirectory()) sweep(full);
  }
}

for (const dir of [".next", "public", "prisma", "src", "node_modules/.cache"]) {
  try {
    statSync(dir);
    sweep(dir);
  } catch {
    /* klasör yok */
  }
}

if (removed) console.log(`🧹 ${removed} macOS artık dosyası temizlendi (.next).`);
