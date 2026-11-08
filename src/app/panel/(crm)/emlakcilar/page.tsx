import { redirect } from "next/navigation";
import { Handshake } from "lucide-react";
import { BrokerPerformance } from "@/components/admin/broker-performance";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";
import { can } from "@/lib/permissions";

export const metadata = { title: "Emlakçı Performansı" };
export const dynamic = "force-dynamic";

export default async function BrokerPerformancePage() {
  const user = await requireSession();
  if (!can(user.role, "reports") && !can(user.role, "*")) redirect("/panel");

  const brokers = await prisma.user.findMany({
    where: { role: "BROKER" },
    include: {
      accountManager: { select: { id: true, name: true } },
      shareLinks: {
        include: { project: { select: { id: true, name: true, slug: true } } },
        orderBy: { clicks: "desc" },
      },
      referredLeads: {
        where: { deletedAt: null },
        select: {
          id: true, status: true, createdAt: true,
          project: { select: { id: true, name: true } },
          deals: {
            where: { status: { not: "CANCELLED" } },
            select: { agreedPrice: true, status: true },
          },
        },
      },
    },
    orderBy: { name: "asc" },
  });

  const projects = await prisma.project.findMany({
    select: { id: true, name: true },
    orderBy: { order: "asc" },
  });

  return (
    <div className="space-y-5">
      <div>
        <h1 className="t-h2 text-ink flex items-center gap-2.5">
          <Handshake size={26} className="text-brand" /> Emlakçı Performansı
        </h1>
        <p className="text-muted mt-1 text-sm">
          Partner acentelerin paylaştığı sunum linkleri, açılma sayıları ve
          getirdikleri müşteriler.
        </p>
      </div>

      <BrokerPerformance
        projects={projects}
        brokers={brokers.map((b) => {
          const won = b.referredLeads.filter((l) => l.status === "WON").length;
          const lost = b.referredLeads.filter((l) => l.status === "LOST").length;
          const revenue = b.referredLeads.reduce(
            (s, l) => s + l.deals.reduce((x, d) => x + d.agreedPrice, 0),
            0
          );
          return {
            id: b.id,
            name: b.name,
            company: b.company,
            email: b.email,
            phone: b.phone,
            active: b.active,
            shareCode: b.shareCode,
            accountManagerName: b.accountManager?.name ?? null,
            leadCount: b.referredLeads.length,
            won,
            lost,
            revenue,
            links: b.shareLinks.map((l) => ({
              id: l.id,
              token: l.token,
              label: l.label,
              projectId: l.project?.id ?? null,
              projectName: l.project?.name ?? null,
              clicks: l.clicks,
              lastOpenedAt: l.lastOpenedAt?.toISOString() ?? null,
              createdAt: l.createdAt.toISOString(),
            })),
            // Proje bazlı lead dağılımı
            byProject: Object.values(
              b.referredLeads.reduce<Record<string, { projectId: string; name: string; leads: number }>>(
                (acc, l) => {
                  const key = l.project?.id ?? "none";
                  acc[key] ??= {
                    projectId: key,
                    name: l.project?.name ?? "Belirtilmemiş",
                    leads: 0,
                  };
                  acc[key].leads++;
                  return acc;
                },
                {}
              )
            ),
          };
        })}
      />
    </div>
  );
}
