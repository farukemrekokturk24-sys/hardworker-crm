import { PrismaClient } from "@prisma/client";
import { resolveDatabaseUrl } from "./db-url";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

// Adres, ortam değişkeni adından bağımsız çözülür (bkz. db-url.ts).
const resolved = resolveDatabaseUrl();

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
    ...(resolved ? { datasources: { db: { url: resolved.url } } } : {}),
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
