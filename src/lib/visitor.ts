import "server-only";
import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import { prisma } from "./prisma";
import { getAuthSecret } from "./secret";
import { VISITOR_COOKIE as COOKIE } from "./cookies";

/**
 * Ziyaretçi oturumu — "fiyat görmek için kayıt ol" akışının arkasındaki katman.
 * Telefon numarasıyla kayıt olan ziyaretçi CRM'de bir Lead olarak açılır;
 * imzalı çerez o lead'i işaret eder ve fiyatları açar.
 */

export { VISITOR_COOKIE } from "./cookies";
const MAX_AGE = 60 * 60 * 24 * 180; // 180 gün

export type Visitor = { lid: string; name: string; phone: string };

export async function signVisitor(v: Visitor) {
  const token = await new SignJWT({ ...v })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE}s`)
    .sign(await getAuthSecret());

  (await cookies()).set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function getVisitor(): Promise<Visitor | null> {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, await getAuthSecret());
    if (!payload.lid) return null;
    return {
      lid: payload.lid as string,
      name: payload.name as string,
      phone: payload.phone as string,
    };
  } catch {
    return null;
  }
}

/** Fiyatlar yalnızca kayıtlı ziyaretçiye açılır. */
export async function canSeePrices(): Promise<boolean> {
  const v = await getVisitor();
  if (!v) return false;
  const lead = await prisma.lead.findFirst({
    where: { id: v.lid, deletedAt: null },
    select: { id: true },
  });
  return Boolean(lead);
}

export async function clearVisitor() {
  (await cookies()).delete(COOKIE);
}

/** Ziyaretçinin baktığı daire/proje kaydı — satış ekibine sıcak sinyal */
export async function trackView(opts: {
  projectId?: string | null;
  unitId?: string | null;
  action?: "VIEW" | "PRICE_UNLOCK" | "DOWNLOAD" | "FAVORITE";
}) {
  const v = await getVisitor();
  if (!v) return;
  try {
    await prisma.$transaction([
      prisma.unitView.create({
        data: {
          leadId: v.lid,
          projectId: opts.projectId ?? null,
          unitId: opts.unitId ?? null,
          action: opts.action ?? "VIEW",
        },
      }),
      prisma.lead.update({
        where: { id: v.lid },
        data: { lastActivityAt: new Date() },
      }),
    ]);
  } catch {
    /* takip hatası sayfayı bozmaz */
  }
}
