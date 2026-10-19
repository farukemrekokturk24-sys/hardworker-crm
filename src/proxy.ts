import { NextResponse, type NextRequest } from "next/server";
import { STAFF_COOKIE } from "@/lib/cookies";

/**
 * /panel için hızlı ön eleme.
 *
 * Burası edge çalışma zamanıdır; oturum anahtarı veritabanında durduğu için
 * imza doğrulaması burada yapılamaz. Yalnızca çerezin varlığına bakıp oturumu
 * olmayanı giriş sayfasına yollarız.
 *
 * Asıl doğrulama sunucu tarafındadır: panel yerleşimi `getSession()` ile
 * token'ı doğrular ve geçersizse yönlendirir, her server action da
 * `requireSession()` çağırır. Geçersiz bir çerez buradan geçse bile panele
 * erişemez.
 */
export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (!pathname.startsWith("/panel")) return NextResponse.next();
  if (pathname === "/panel/giris") return NextResponse.next();

  if (!req.cookies.get(STAFF_COOKIE)?.value) {
    const url = req.nextUrl.clone();
    url.pathname = "/panel/giris";
    url.searchParams.set("next", req.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/panel/:path*"],
};
