import { BarChart3, TrendingUp, Users, Target } from "lucide-react";
import { Card, CardHeader, StatCard, Badge } from "@/components/ui/primitives";
import { StatusBarChart, RevenueBarChart, SourcePieChart } from "@/components/admin/charts";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";
import {
  LEAD_STATUS_LABELS, LEAD_SOURCE_LABELS, PURPOSE_LABELS,
} from "@/lib/constants";
import { formatPrice, pct } from "@/lib/utils";

export const metadata = { title: "Raporlar" };

export default async function ReportsPage() {
  await requireSession();

  const [byStatus, bySource, byCountry, byPurpose, projects, agents, deals] =
    await Promise.all([
      prisma.lead.groupBy({ by: ["status"], where: { deletedAt: null }, _count: true }),
      prisma.lead.groupBy({ by: ["source"], where: { deletedAt: null }, _count: true }),
      prisma.lead.groupBy({ by: ["country"], where: { deletedAt: null }, _count: true }),
      prisma.lead.groupBy({ by: ["purpose"], where: { deletedAt: null }, _count: true }),
      prisma.project.findMany({
        select: {
          id: true, name: true,
          units: { select: { status: true, price: true } },
          _count: { select: { leads: true } },
          deals: {
            where: { status: { not: "CANCELLED" } },
            select: { agreedPrice: true, status: true },
          },
        },
        orderBy: { order: "asc" },
      }),
      prisma.user.findMany({
        where: { active: true, role: { in: ["AGENT", "SALES_MANAGER"] } },
        select: {
          id: true, name: true, role: true,
          _count: { select: { assignedLeads: true, deals: true } },
          assignedLeads: { select: { status: true } },
          deals: {
            where: { status: { not: "CANCELLED" } },
            select: { agreedPrice: true, status: true },
          },
        },
      }),
      prisma.deal.findMany({
        where: { status: { not: "CANCELLED" } },
        select: { agreedPrice: true, status: true, project: { select: { name: true } } },
      }),
    ]);

  const totalLeads = byStatus.reduce((s, x) => s + x._count, 0);
  const won = byStatus.find((s) => s.status === "WON")?._count ?? 0;
  const lost = byStatus.find((s) => s.status === "LOST")?._count ?? 0;
  const totalValue = deals.reduce((s, d) => s + d.agreedPrice, 0);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="t-h2 text-ink flex items-center gap-2.5">
          <BarChart3 size={26} className="text-brand" /> Raporlar
        </h1>
        <p className="text-muted mt-1 text-sm">Satış performansı ve lead analizleri</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Toplam Lead" value={totalLeads} icon={<Users size={20} />} />
        <StatCard
          label="Kazanılan"
          value={won}
          sub={`%${pct(won, totalLeads)} dönüşüm`}
          icon={<Target size={20} />}
          tone="emerald"
        />
        <StatCard
          label="Kaybedilen"
          value={lost}
          sub={`%${pct(lost, totalLeads)} kayıp`}
          icon={<Users size={20} />}
          tone="rose"
        />
        <StatCard
          label="Toplam Satış Değeri"
          value={formatPrice(totalValue)}
          sub={`${deals.length} kayıt`}
          icon={<TrendingUp size={20} />}
          tone="amber"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader title="Lead durum dağılımı" />
          <div className="p-4 pt-5">
            <StatusBarChart
              data={byStatus.map((s) => ({
                name: LEAD_STATUS_LABELS[s.status] ?? s.status,
                value: s._count,
              }))}
            />
          </div>
        </Card>

        <Card>
          <CardHeader title="Lead kaynakları" />
          <div className="p-4 pt-5">
            <SourcePieChart
              data={bySource.map((s) => ({
                name: LEAD_SOURCE_LABELS[s.source] ?? s.source,
                value: s._count,
              }))}
            />
          </div>
        </Card>
      </div>

      <Card>
        <CardHeader title="Proje bazlı satış değeri" />
        <div className="p-4 pt-5">
          <RevenueBarChart
            data={projects.map((p) => ({
              name: p.name,
              value: p.deals.reduce((s, d) => s + d.agreedPrice, 0),
            }))}
          />
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Proje performansı */}
        <Card className="overflow-hidden">
          <CardHeader title="Proje performansı" />
          <div className="overflow-x-auto thin-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Proje</th>
                  <th>Daire</th>
                  <th>Satılan</th>
                  <th>Lead</th>
                  <th className="text-right">Satış Değeri</th>
                </tr>
              </thead>
              <tbody>
                {projects.map((p) => {
                  const sold = p.units.filter((u) => u.status === "SOLD").length;
                  return (
                    <tr key={p.id}>
                      <td className="font-semibold text-ink">{p.name}</td>
                      <td className="num">{p.units.length}</td>
                      <td>
                        <span className="num font-medium">{sold}</span>
                        <span className="text-muted text-xs ml-1.5 num">
                          %{pct(sold, p.units.length)}
                        </span>
                      </td>
                      <td className="num">{p._count.leads}</td>
                      <td className="text-right num font-semibold">
                        {formatPrice(p.deals.reduce((s, d) => s + d.agreedPrice, 0))}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Danışman performansı */}
        <Card className="overflow-hidden">
          <CardHeader title="Danışman performansı" />
          <div className="overflow-x-auto thin-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Danışman</th>
                  <th>Lead</th>
                  <th>Kazanılan</th>
                  <th className="text-right">Satış</th>
                </tr>
              </thead>
              <tbody>
                {agents.map((a) => {
                  const w = a.assignedLeads.filter((l) => l.status === "WON").length;
                  return (
                    <tr key={a.id}>
                      <td className="font-semibold text-ink">{a.name}</td>
                      <td className="num">{a._count.assignedLeads}</td>
                      <td>
                        <span className="num font-medium">{w}</span>
                        <span className="text-muted text-xs ml-1.5 num">
                          %{pct(w, a._count.assignedLeads)}
                        </span>
                      </td>
                      <td className="text-right num font-semibold">
                        {formatPrice(a.deals.reduce((s, d) => s + d.agreedPrice, 0))}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader title="Ülkeye göre lead" />
          <ul className="p-5 space-y-2.5">
            {byCountry
              .filter((c) => c.country)
              .sort((a, b) => b._count - a._count)
              .map((c) => (
                <li key={c.country} className="flex items-center gap-3">
                  <span className="text-sm text-ink-soft w-28 shrink-0">{c.country}</span>
                  <div className="flex-1 h-2 rounded-full bg-surface-2 overflow-hidden">
                    <div
                      className="h-full bg-brand rounded-full"
                      style={{ width: `${pct(c._count, totalLeads)}%` }}
                    />
                  </div>
                  <span className="num text-sm font-semibold text-ink w-8 text-right">
                    {c._count}
                  </span>
                </li>
              ))}
          </ul>
        </Card>

        <Card>
          <CardHeader title="Alım amacı" />
          <div className="p-5 grid grid-cols-3 gap-3">
            {byPurpose
              .filter((p) => p.purpose)
              .map((p) => (
                <div key={p.purpose} className="rounded-xl border border-border p-4 text-center">
                  <p className="t-h2 num text-ink">{p._count}</p>
                  <p className="text-xs font-semibold text-muted mt-1">
                    {PURPOSE_LABELS[p.purpose!] ?? p.purpose}
                  </p>
                </div>
              ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
