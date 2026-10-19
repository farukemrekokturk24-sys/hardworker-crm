import "server-only";
import { cookies, headers } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";
import { AUTH_SECRET } from "./env";

const SECRET = AUTH_SECRET;

export const STAFF_COOKIE = "hw_session";
const MAX_AGE = 60 * 60 * 24 * 7; // 7 gün

export type SessionUser = {
  uid: string;
  name: string;
  email: string;
  role: string;
  avatar?: string | null;
};

export function hashPassword(pw: string) {
  return bcrypt.hash(pw, 10);
}
export function verifyPassword(pw: string, hash: string) {
  return bcrypt.compare(pw, hash);
}

async function sign(user: SessionUser) {
  return new SignJWT({ ...user })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE}s`)
    .sign(SECRET);
}

export async function verifyToken(token: string): Promise<SessionUser | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET);
    if (!payload.uid) return null;
    return {
      uid: payload.uid as string,
      name: payload.name as string,
      email: payload.email as string,
      role: payload.role as string,
      avatar: (payload.avatar as string | undefined) ?? null,
    };
  } catch {
    return null;
  }
}

export async function getSession(): Promise<SessionUser | null> {
  const token = (await cookies()).get(STAFF_COOKIE)?.value;
  if (!token) return null;
  return verifyToken(token);
}

export async function requireSession(): Promise<SessionUser> {
  const s = await getSession();
  if (!s) throw new Error("UNAUTHORIZED");
  return s;
}

export async function login(
  email: string,
  password: string
): Promise<{ ok: true; user: SessionUser } | { ok: false; error: string }> {
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase().trim() },
  });
  if (!user || !user.active || !(await verifyPassword(password, user.passwordHash))) {
    return { ok: false, error: "E-posta veya şifre hatalı." };
  }

  const sessionUser: SessionUser = {
    uid: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    avatar: user.avatar,
  };

  (await cookies()).set(STAFF_COOKIE, await sign(sessionUser), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
  });

  await prisma.user.update({
    where: { id: user.id },
    data: { lastLogin: new Date() },
  });
  await logActivity(user.id, "login", "user", user.id, `${user.name} giriş yaptı`);

  return { ok: true, user: sessionUser };
}

export async function logout() {
  (await cookies()).delete(STAFF_COOKIE);
}

export async function logActivity(
  userId: string | null,
  action: string,
  entity: string,
  entityId?: string | null,
  summary?: string,
  meta?: Record<string, unknown>
) {
  try {
    await prisma.activityLog.create({
      data: {
        userId,
        action,
        entity,
        entityId: entityId ?? null,
        summary: summary ?? null,
        meta: meta ? (meta as never) : undefined,
      },
    });
  } catch {
    /* log hatası akışı bozmaz */
  }
}

/** İstekten IP + user agent çıkarır (lead kaynağı için) */
export async function requestMeta() {
  const h = await headers();
  return {
    ipAddress:
      h.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      h.get("x-real-ip") ??
      null,
    userAgent: h.get("user-agent"),
    referrer: h.get("referer"),
  };
}
