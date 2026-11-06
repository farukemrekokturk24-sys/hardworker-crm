import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Building2, Handshake, ArrowRight } from "lucide-react";
import { LoginForm } from "@/components/admin/login-form";
import { Logo } from "@/components/brand/logo";
import { getSession } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Panel Girişi",
  robots: { index: false, follow: false },
};

type SP = Promise<{ next?: string; tip?: string }>;

export default async function LoginPage({ searchParams }: { searchParams: SP }) {
  const session = await getSession();
  if (session) redirect(session.role === "BROKER" ? "/emlakci" : "/panel");

  const { next, tip } = await searchParams;
  const mode = tip === "emlakci" || tip === "sirket" ? tip : null;

  return (
    <div className="min-h-dvh grid lg:grid-cols-2 bg-bg">
      {/* Sol: seçim ya da form */}
      <div className="flex flex-col justify-center px-6 py-12 sm:px-12 lg:px-16">
        <div className="w-full max-w-sm mx-auto">
          <Logo size="lg" />

          {!mode ? (
            <>
              <div className="mt-12">
                <h1 className="t-h1 text-ink">Panel Girişi</h1>
                <p className="text-muted mt-2">
                  Hangi panele giriş yapacaksınız?
                </p>
              </div>

              <div className="mt-8 space-y-3">
                <ChoiceCard
                  href={`/panel/giris?tip=sirket${next ? `&next=${encodeURIComponent(next)}` : ""}`}
                  icon={<Building2 size={22} />}
                  title="Şirket İçi CRM"
                  description="Satış ekibi ve yönetim: lead'ler, envanter, satışlar, raporlar."
                />
                <ChoiceCard
                  href="/panel/giris?tip=emlakci"
                  icon={<Handshake size={22} />}
                  title="Emlakçı Paneli"
                  description="Dış partnerler: kendi müşterilerinizi ekleyin, sunum linkinizi paylaşın."
                  accent
                />
              </div>
            </>
          ) : (
            <>
              <div className="mt-12">
                <p className="eyebrow mb-3">
                  {mode === "emlakci" ? "Emlakçı Paneli" : "Şirket İçi CRM"}
                </p>
                <h1 className="t-h1 text-ink">Giriş yapın</h1>
                <p className="text-muted mt-2">
                  {mode === "emlakci"
                    ? "Partner hesabınızla müşterilerinizi yönetin."
                    : "Satış ekibi ve yönetim paneline erişin."}
                </p>
              </div>

              <div className="mt-8">
                <LoginForm next={next} />
              </div>

              <Link
                href="/panel/giris"
                className="inline-flex items-center gap-2 text-sm font-semibold text-muted hover:text-ink transition-colors mt-6"
              >
                <ArrowLeft size={15} /> Panel seçimine dön
              </Link>
            </>
          )}

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
            backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
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
              "Emlakçı partnerler için ayrı panel",
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

function ChoiceCard({
  href,
  icon,
  title,
  description,
  accent,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  accent?: boolean;
}) {
  return (
    <Link
      href={href}
      className={[
        "group flex items-start gap-4 p-5 rounded-[var(--r-card)] border transition-all",
        accent
          ? "border-emerald-200 bg-emerald-50/50 hover:border-emerald-400"
          : "border-border bg-surface hover:border-brand/45",
      ].join(" ")}
    >
      <span
        className={[
          "h-11 w-11 rounded-xl grid place-items-center shrink-0",
          accent ? "bg-emerald-600 text-white" : "bg-brand text-white",
        ].join(" ")}
      >
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-bold text-ink">{title}</span>
        <span className="block text-sm text-muted mt-1 leading-relaxed">{description}</span>
      </span>
      <ArrowRight
        size={18}
        className="shrink-0 mt-1 text-muted transition-transform group-hover:translate-x-1"
      />
    </Link>
  );
}
