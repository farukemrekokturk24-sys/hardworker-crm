import { redirect } from "next/navigation";
import Link from "next/link";
import { LogOut, Building2, ExternalLink } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { Avatar } from "@/components/ui/primitives";
import { logoutAction } from "@/app/panel/(crm)/actions";
import { getSession } from "@/lib/auth";
import { avatarTone } from "@/lib/utils";

export const metadata = {
  title: { default: "Emlakçı Paneli", template: "%s | Hardworker Emlakçı" },
  robots: { index: false, follow: false },
};

export default async function BrokerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSession();
  if (!user) redirect("/panel/giris");
  // Şirket içi roller kendi paneline gider; yönetici önizleme yapabilir.
  if (user.role !== "BROKER" && user.role !== "SUPER_ADMIN") redirect("/panel");

  return (
    <div className="min-h-dvh bg-bg flex flex-col">
      <header className="sticky top-0 z-30 glass border-b border-border">
        <div className="container-x flex items-center justify-between h-16 gap-4">
          <div className="flex items-center gap-4 min-w-0">
            <Logo href="/emlakci" size="sm" />
            <span className="hidden sm:inline-flex items-center gap-1.5 h-7 px-2.5 rounded-full bg-emerald-50 text-emerald-700 text-[0.6875rem] font-bold uppercase tracking-wider">
              Emlakçı Paneli
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/projeler"
              target="_blank"
              className="hidden sm:inline-flex items-center gap-1.5 h-9 px-3 rounded-lg text-[0.8125rem] font-semibold text-ink-soft hover:text-ink hover:bg-surface-2 transition-colors"
            >
              <Building2 size={15} /> Projeler <ExternalLink size={12} />
            </Link>
            <span className="flex items-center gap-2.5 h-10 pl-1.5 pr-3 rounded-xl">
              <Avatar name={user.name} size="sm" tone={avatarTone(user.uid)} />
              <span className="hidden sm:block text-[0.8125rem] font-semibold text-ink truncate max-w-[140px]">
                {user.name}
              </span>
            </span>
            <form action={logoutAction}>
              <button
                type="submit"
                aria-label="Çıkış yap"
                className="h-10 w-10 rounded-xl grid place-items-center text-muted hover:text-rose-600 hover:bg-rose-50 transition-colors"
              >
                <LogOut size={17} />
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="flex-1 container-x py-6 sm:py-8">{children}</main>
    </div>
  );
}
