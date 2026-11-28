import { UserCircle, KeyRound, ShieldCheck } from "lucide-react";
import { Card, CardHeader, Badge, Avatar } from "@/components/ui/primitives";
import { PasswordForm } from "@/components/account/password-form";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";
import { ROLE_LABELS } from "@/lib/constants";
import { formatDateTime, avatarTone, prettyPhone } from "@/lib/utils";

export const metadata = { title: "Hesabım" };

export default async function AccountPage() {
  // Giriş yapmış her kullanıcı kendi hesabına erişebilir — rol kısıtı yok.
  const session = await requireSession();

  const user = await prisma.user.findUnique({
    where: { id: session.uid },
    select: { name: true, email: true, phone: true, role: true, lastLogin: true },
  });

  return (
    <div className="space-y-5 max-w-3xl">
      <div>
        <h1 className="t-h2 text-ink flex items-center gap-2.5">
          <UserCircle size={26} className="text-brand" /> Hesabım
        </h1>
        <p className="text-muted mt-1 text-sm">Bilgileriniz ve giriş şifreniz</p>
      </div>

      <Card>
        <CardHeader title="Bilgileriniz" subtitle="Değişiklik için yöneticinize başvurun" />
        <div className="p-5 sm:p-6 pt-0 flex items-start gap-4">
          <Avatar name={user?.name ?? session.name} tone={avatarTone(session.uid)} />
          <div className="min-w-0 space-y-1">
            <p className="font-semibold text-ink">{user?.name ?? session.name}</p>
            <p className="text-sm text-muted break-all">{user?.email ?? session.email}</p>
            {user?.phone && (
              <p className="text-sm text-muted num">{prettyPhone(user.phone)}</p>
            )}
            <div className="flex items-center gap-2 pt-1.5">
              <Badge>{ROLE_LABELS[user?.role ?? session.role] ?? session.role}</Badge>
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
          Şifreniz geri döndürülemez biçimde saklanır; yöneticiler dahil kimse
          mevcut şifrenizi göremez. Şifrenizi unutursanız yöneticiniz size yeni
          bir şifre atayabilir.
        </p>
      </div>
    </div>
  );
}
