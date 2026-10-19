import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { LoginForm } from "@/components/admin/login-form";
import { Logo } from "@/components/brand/logo";
import { getSession } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Panel Girişi",
  robots: { index: false, follow: false },
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const session = await getSession();
  if (session) redirect("/panel");
  const { next } = await searchParams;

  return (
    <div className="min-h-dvh grid lg:grid-cols-2 bg-bg">
      {/* Sol: form */}
      <div className="flex flex-col justify-center px-6 py-12 sm:px-12 lg:px-16">
        <div className="w-full max-w-sm mx-auto">
          <Logo />

          <div className="mt-12">
            <h1 className="t-h1 text-ink">Panel Girişi</h1>
            <p className="text-muted mt-2">
              Satış ekibi ve yönetim paneline erişmek için giriş yapın.
            </p>
          </div>

          <div className="mt-8">
            <LoginForm next={next} />
          </div>

          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-muted hover:text-ink transition-colors mt-10"
          >
            <ArrowLeft size={15} /> Siteye dön
          </Link>
        </div>
      </div>

      {/* Sağ: marka paneli */}
      <div className="hidden lg:flex relative bg-dark items-center justify-center p-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-700/30 via-dark to-dark" />
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
            backgroundSize: "28px 28px",
          }}
        />
        <div className="relative max-w-md">
          <p className="eyebrow !text-brand-100">Hardworker CRM</p>
          <h2 className="t-h1 text-white mt-4 text-balance">
            Lead&apos;den satışa, tek ekrandan yönetin
          </h2>
          <p className="t-lead !text-white/60 mt-5">
            Siteden gelen fiyat talepleri anında lead&apos;e dönüşür. Daire
            envanteri, randevular, rezervasyonlar ve taksit takibi aynı panelde.
          </p>
          <ul className="mt-8 space-y-3 text-white/70 text-sm">
            {[
              "Otomatik lead yakalama ve puanlama",
              "Kanban satış hattı",
              "Canlı daire envanteri ve fiyat yönetimi",
              "Randevu, görev ve taksit takibi",
            ].map((t) => (
              <li key={t} className="flex items-center gap-3">
                <span className="h-1.5 w-1.5 rounded-full bg-brand" />
                {t}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
