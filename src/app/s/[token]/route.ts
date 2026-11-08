import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { REF_COOKIE } from "@/lib/cookies";

/**
 * Emlakçı sunum linki: /s/<token>
 *
 * Açılma sayısını artırır, ziyaretçiyi emlakçıya bağlayan çerezi yazar ve
 * ilgili proje sayfasına yönlendirir. Böylece performans raporundaki
 * "açılma" rakamı gerçek tıklamaları yansıtır.
 */
export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ token: string }> }
) {
  const { token } = await ctx.params;

  const link = await prisma.shareLink.findUnique({
    where: { token },
    include: {
      project: { select: { slug: true } },
      user: { select: { shareCode: true, active: true } },
    },
  });

  const target = new URL(
    link?.project?.slug ? `/projeler/${link.project.slug}` : "/projeler",
    req.nextUrl.origin
  );

  if (!link) {
    return NextResponse.redirect(new URL("/projeler", req.nextUrl.origin));
  }

  // Sayaç hatası yönlendirmeyi engellememeli
  try {
    await prisma.shareLink.update({
      where: { id: link.id },
      data: { clicks: { increment: 1 }, lastOpenedAt: new Date() },
    });
  } catch {
    /* yoksay */
  }

  const res = NextResponse.redirect(target);

  if (link.user.active && link.user.shareCode) {
    res.cookies.set(REF_COOKIE, link.user.shareCode, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 60,
    });
  }

  return res;
}
