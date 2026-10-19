import Link from "next/link";
import { Handshake, TrendingUp, Wallet, CheckCircle2 } from "lucide-react";
import { Card, CardHeader, Badge, EmptyState, StatCard } from "@/components/ui/primitives";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";
import { DEAL_STATUS_LABELS, DEAL_STATUS_TONE } from "@/lib/constants";
import { formatPrice, formatDate, pct } from "@/lib/utils";

export const metadata = { title: "Satışlar" };

export default async function DealsPage() {
  const user = await requireSession();

  const deals = await prisma.deal.findMany({
    where: user.role === "AGENT" ? { agentId: user.uid } : {},
    include: {
      lead: { select: { id: true, name: true, phone: true } },
      project: { select: { name: true } },
      unit: { select: { unitNo: true, type: true } },
      agent: { select: { name: true } },
      installments: { select: { amount: true, paidAmount: true, status: true, dueDate: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const active = deals.filter((d) => d.status !== "CANCELLED");
  const completed = deals.filter((d) => d.status === "COMPLETED");
  const pipeline = active
    .filter((d) => d.status !== "COMPLETED")
    .reduce((s, d) => s + d.agreedPrice, 0);
  const collected = deals.reduce(
    (s, d) => s + d.installments.reduce((x, i) => x + i.paidAmount, 0),
    0
  );
  const overdue = deals.reduce(
    (s, d) =>
      s +
      d.installments.filter(
        (i) => i.status !== "PAID" && i.dueDate < new Date()
      ).length,
    0
  );

  return (
    <div className="space-y-5">
      <div>
        <h1 className="t-h2 text-ink flex items-center gap-2.5">
          <Handshake size={26} className="text-brand" /> Satışlar
        </h1>
        <p className="text-muted mt-1 text-sm">
          {active.length} aktif kayıt · {completed.length} tamamlandı
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Satış Hattı"
          value={formatPrice(pipeline)}
          sub={`${active.filter((d) => d.status !== "COMPLETED").length} açık kayıt`}
          icon={<TrendingUp size={20} />}
        />
        <StatCard
          label="Tamamlanan Satış"
          value={formatPrice(completed.reduce((s, d) => s + d.agreedPrice, 0))}
          sub={`${completed.length} satış`}
          icon={<CheckCircle2 size={20} />}
          tone="emerald"
        />
        <StatCard
          label="Tahsil Edilen"
          value={formatPrice(collected)}
          icon={<Wallet size={20} />}
          tone="amber"
        />
        <StatCard
          label="Geciken Taksit"
          value={overdue}
          sub={overdue > 0 ? "Takip gerekiyor" : "Gecikme yok"}
          icon={<Handshake size={20} />}
          tone={overdue > 0 ? "rose" : "emerald"}
        />
      </div>

      {deals.length === 0 ? (
        <Card>
          <EmptyState
            icon={<Handshake size={22} />}
            title="Henüz satış kaydı yok"
            description="Lead detay sayfasından rezervasyon açtığınızda burada görünür."
          />
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <CardHeader title="Tüm satışlar" subtitle={`${deals.length} kayıt`} />
          <div className="overflow-x-auto thin-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Referans</th>
                  <th>Müşteri</th>
                  <th>Daire</th>
                  <th>Danışman</th>
                  <th>Durum</th>
                  <th>Tahsilat</th>
                  <th>Tarih</th>
                  <th className="text-right">Tutar</th>
                </tr>
              </thead>
              <tbody>
                {deals.map((d) => {
                  const paid = d.installments.reduce((s, i) => s + i.paidAmount, 0);
                  const progress = pct(paid, d.agreedPrice);
                  return (
                    <tr key={d.id}>
                      <td>
                        <Link
                          href={`/panel/satislar/${d.id}`}
                          className="font-semibold text-brand hover:text-brand-600 num"
                        >
                          {d.refNo}
                        </Link>
                      </td>
                      <td>
                        <Link
                          href={`/panel/leadler/${d.lead.id}`}
                          className="font-medium text-ink hover:text-brand transition-colors"
                        >
                          {d.lead.name}
                        </Link>
                      </td>
                      <td className="text-[0.8125rem] text-ink-soft">
                        {d.project.name}
                        <span className="block text-[0.6875rem] text-muted num">
                          {d.unit.unitNo} · {d.unit.type}
                        </span>
                      </td>
                      <td className="text-[0.8125rem] text-ink-soft">
                        {d.agent?.name ?? "—"}
                      </td>
                      <td>
                        <Badge tone={DEAL_STATUS_TONE[d.status]}>
                          {DEAL_STATUS_LABELS[d.status]}
                        </Badge>
                      </td>
                      <td className="min-w-[120px]">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 rounded-full bg-surface-2 overflow-hidden">
                            <div
                              className="h-full bg-emerald-500 rounded-full"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                          <span className="text-[0.6875rem] font-semibold text-muted num">
                            %{progress}
                          </span>
                        </div>
                      </td>
                      <td className="text-[0.75rem] text-muted whitespace-nowrap">
                        {formatDate(d.reservedAt ?? d.createdAt)}
                      </td>
                      <td className="text-right font-semibold num">
                        {formatPrice(d.agreedPrice, d.currency)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
