import { Users, Link2, TrendingUp, Clock } from "lucide-react";
import { StatCard } from "@/components/ui/primitives";
import { BrokerDashboard } from "@/components/broker/dashboard";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";
import { canSeePrices } from "@/lib/visitor";

export const dynamic = "force-dynamic";

export default async function BrokerHome() {
  const user = await requireSession();

  const [leads, projects, links] = await Promise.all([
    prisma.lead.findMany({
      where: { referredById: user.uid, deletedAt: null },
      include: {
        project: { select: { name: true, slug: true } },
        notes: { orderBy: { createdAt: "desc" }, take: 1 },
        deals: {
          where: { status: { not: "CANCELLED" } },
          select: { refNo: true, status: true },
          take: 1,
        },
      },
      orderBy: { lastActivityAt: "desc" },
    }),
    prisma.project.findMany({
      where: { published: true },
      orderBy: { order: "asc" },
      select: {
        id: true, slug: true, name: true, district: true, city: true,
        coverImage: true, deliveryLabel: true, status: true,
        units: { select: { status: true } },
      },
    }),
    prisma.shareLink.findMany({
      where: { userId: user.uid },
      include: { project: { select: { name: true, slug: true } } },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const me = await prisma.user.findUnique({
    where: { id: user.uid },
    select: { shareCode: true, company: true },
  });

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ??
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : "http://localhost:3000");

  const won = leads.filter((l) => l.status === "WON").length;
  const active = leads.filter((l) => !["WON", "LOST"].includes(l.status)).length;
  const totalClicks = links.reduce((s, l) => s + l.clicks, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="t-h2 text-ink">Merhaba, {user.name.split(" ")[0]}</h1>
        <p className="text-muted mt-1 text-sm">
          Müşterilerinizi ekleyin, proje sunum linkinizi paylaşın ve süreci buradan takip edin.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Müşterilerim" value={leads.length} icon={<Users size={20} />} />
        <StatCard label="Aktif Süreç" value={active} icon={<Clock size={20} />} tone="amber" />
        <StatCard label="Kazanılan" value={won} icon={<TrendingUp size={20} />} tone="emerald" />
        <StatCard
          label="Link Tıklaması"
          value={totalClicks}
          sub={`${links.length} sunum linki`}
          icon={<Link2 size={20} />}
          tone="violet"
        />
      </div>

      <BrokerDashboard
        siteUrl={siteUrl}
        shareCode={me?.shareCode ?? null}
        leads={leads.map((l) => ({
          id: l.id,
          refNo: l.refNo,
          name: l.name,
          phone: l.phone,
          email: l.email,
          status: l.status,
          temp: l.temp,
          createdAt: l.createdAt.toISOString(),
          lastActivityAt: l.lastActivityAt.toISOString(),
          projectName: l.project?.name ?? null,
          lastNote: l.notes[0]?.body ?? null,
          dealRef: l.deals[0]?.refNo ?? null,
          dealStatus: l.deals[0]?.status ?? null,
        }))}
        projects={projects.map((p) => ({
          id: p.id,
          slug: p.slug,
          name: p.name,
          location: [p.district, p.city].filter(Boolean).join(", "),
          coverImage: p.coverImage,
          deliveryLabel: p.deliveryLabel,
          status: p.status,
          availableUnits: p.units.filter((u) => u.status === "AVAILABLE").length,
          totalUnits: p.units.length,
        }))}
        links={links.map((l) => ({
          id: l.id,
          token: l.token,
          label: l.label,
          projectName: l.project?.name ?? null,
          projectSlug: l.project?.slug ?? null,
          clicks: l.clicks,
          createdAt: l.createdAt.toISOString(),
        }))}
      />
    </div>
  );
}
