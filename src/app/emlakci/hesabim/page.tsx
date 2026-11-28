import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, UserCircle, KeyRound, ShieldCheck } from "lucide-react";
import { Card, CardHeader, Badge, Avatar } from "@/components/ui/primitives";
import { PasswordForm } from "@/components/account/password-form";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";
import { formatDateTime, avatarTone, prettyPhone } from "@/lib/utils";

export const metadata = { title: "Hesabım" };

export default async function BrokerAccountPage() {
  const session = await requireSession();
  if (session.role !== "BROKER") redirect("/panel/hesabim");

  const user = await prisma.user.findUnique({
    where: { id: session.uid },
    select: { name: true, email: true, phone: true, company: true, lastLogin: true },
  });

  return (
    <div className="container-x py-8 space-y-5 max-w-2xl">
      <Link
        href="/emlakci"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted hover:text-ink transition-colors"
      >
        <ArrowLeft size={15} /> Panele dön
      </Link>

      <div>
        <h1 className="t-h2 text-ink flex items-center gap-2.5">
          <UserCircle size={26} className="text-brand" /> Hesabım
        </h1>
        <p className="text-muted mt-1 text-sm">Bilgileriniz ve giriş şifreniz</p>
      </div>

      <Card>
        <CardHeader title="Bilgileriniz" subtitle="Değişiklik için satış danışmanınıza başvurun" />
        <div className="p-5 sm:p-6 pt-0 flex items-start gap-4">
          <Avatar name={user?.name ?? session.name} tone={avatarTone(session.uid)} />
          <div className="min-w-0 space-y-1">
            <p className="font-semibold text-ink">{user?.name ?? session.name}</p>
            <p className="text-sm text-muted break-all">{user?.email ?? session.email}</p>
            {user?.phone && (
              <p className="text-sm text-muted num">{prettyPhone(user.phone)}</p>
            )}
            <div className="flex items-center gap-2 pt-1.5">
              <Badge tone="bg-emerald-50 text-emerald-700 ring-emerald-200">
                {user?.company ?? "Emlakçı"}
              </Badge>
              {user?.lastLogin && (
                <span className="text-xs text-muted">
                  Son giriş: {formatDateTime(user.lastLogin)}
                </span>
              )}
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader
          title={
            <span className="flex items-center gap-2">
              <KeyRound size={17} className="text-brand" /> Şifre Değiştir
            </span>
          }
          subtitle="Yeni şifrenizi yalnızca siz bilmelisiniz"
        />
        <div className="p-5 sm:p-6 pt-0">
          <PasswordForm />
        </div>
      </Card>

      <div className="flex items-start gap-3 rounded-xl bg-surface-2 px-4 py-3.5">
        <ShieldCheck size={18} className="text-brand shrink-0 mt-0.5" />
        <p className="text-[0.8125rem] text-muted leading-relaxed">
          Şifreniz geri döndürülemez biçimde saklanır; kimse mevcut şifrenizi
          göremez. Unutursanız sorumlu satış danışmanınız yeni bir şifre
          atayabilir.
        </p>
      </div>
    </div>
  );
}
