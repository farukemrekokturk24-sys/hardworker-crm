import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";
import { AUTH_SECRET } from "@/lib/env";

const SECRET = AUTH_SECRET;

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (!pathname.startsWith("/panel")) return NextResponse.next();
  if (pathname === "/panel/giris") return NextResponse.next();

  const token = req.cookies.get("hw_session")?.value;
  if (!token) return toLogin(req);

  try {
    await jwtVerify(token, SECRET);
    return NextResponse.next();
  } catch {
    return toLogin(req);
  }
}

function toLogin(req: NextRequest) {
  const url = req.nextUrl.clone();
  url.pathname = "/panel/giris";
  url.searchParams.set("next", req.nextUrl.pathname);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/panel/:path*"],
};
