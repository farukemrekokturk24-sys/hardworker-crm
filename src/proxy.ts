import { NextResponse, type NextRequest } from "next/server";
import { STAFF_COOKIE, REF_COOKIE } from "@/lib/cookies";

/**
 * Edge katmanı iki iş yapar:
 *
 * 1. Sunum linki takibi — adreste ?ref=<kod> varsa emlakçı kodu çereze yazılır;
 *    o ziyaretten doğan lead otomatik olarak emlakçıya bağlanır.
 * 2. Panel ön elemesi — oturum çerezi yoksa giriş sayfasına yollar.
 *    Oturum anahtarı veritabanında durduğu için imza doğrulaması burada
 *    yapılamaz; asıl doğrulama sunucuda (getSession / requireSession).
 */
export function proxy(req: NextRequest) {
  const { pathname, searchParams } = req.nextUrl;
  const ref = searchParams.get("ref")?.trim();

  const guard = guardPanel(req, pathname);
  const res = guard ?? NextResponse.next();

  if (ref && /^[a-z0-9-]{3,40}$/i.test(ref)) {
    res.cookies.set(REF_COOKIE, ref, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 60, // 60 gün
    });
  }

  return res;
}

function guardPanel(req: NextRequest, pathname: string) {
  const isPanel = pathname.startsWith("/panel") || pathname.startsWith("/emlakci");
  if (!isPanel) return null;
  if (pathname === "/panel/giris") return null;

  if (!req.cookies.get(STAFF_COOKIE)?.value) {
    const url = req.nextUrl.clone();
    url.pathname = "/panel/giris";
    url.search = "";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }
  return null;
}

export const config = {
  matcher: ["/panel/:path*", "/emlakci/:path*", "/projeler/:path*", "/"],
};
