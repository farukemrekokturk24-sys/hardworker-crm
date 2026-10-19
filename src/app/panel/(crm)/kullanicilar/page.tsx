import { redirect } from "next/navigation";
import { UserCog } from "lucide-react";
import { Card, CardHeader, Badge, Avatar } from "@/components/ui/primitives";
import { UsersManager } from "@/components/admin/users-manager";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";
import { can } from "@/lib/permissions";
import { ROLE_LABELS } from "@/lib/constants";
import { formatDateTime, avatarTone, prettyPhone } from "@/lib/utils";

export const metadata = { title: "Kullanıcılar" };

export default async function UsersPage() {
  const session = await requireSession();
  if (!can(session.role, "*")) redirect("/panel");

  const users = await prisma.user.findMany({
    include: { _count: { select: { assignedLeads: true, deals: true } } },
    orderBy: [{ active: "desc" }, { name: "asc" }],
  });

  return (
    <div className="space-y-5">
      <div>
        <h1 className="t-h2 text-ink flex items-center gap-2.5">
          <UserCog size={26} className="text-brand" /> Kullanıcılar
        </h1>
        <p className="text-muted mt-1 text-sm">
          {users.filter((u) => u.active).length} aktif · {users.length} toplam
        </p>
      </div>

      <UsersManager
        users={users.map((u) => ({
          id: u.id,
          name: u.name,
          email: u.email,
          phone: u.phone,
          role: u.role,
          active: u.active,
          lastLogin: u.lastLogin?.toISOString() ?? null,
          leadCount: u._count.assignedLeads,
          dealCount: u._count.deals,
        }))}
        currentUserId={session.uid}
      />
    </div>
  );
}
