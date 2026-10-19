import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Phone, Building2, User, Percent, Calendar } from "lucide-react";
import { Card, CardHeader, Badge } from "@/components/ui/primitives";
import { DealControls, InstallmentTable } from "@/components/admin/deal-detail";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";
import { DEAL_STATUS_LABELS, DEAL_STATUS_TONE } from "@/lib/constants";
import { formatPrice, formatDate, prettyPhone, pct } from "@/lib/utils";

type Params = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Params) {
  const { id } = await params;
  const d = await prisma.deal.findUnique({ where: { id }, select: { refNo: true } });
  return { title: d?.refNo ?? "Satış" };
}

export default async function DealDetailPage({ params }: Params) {
  const { id } = await params;
  await requireSession();

  const deal = await prisma.deal.findUnique({
    where: { id },
    include: {
      lead: { select: { id: true, name: true, phone: true, email: true } },
      project: { select: { name: true, slug: true } },
      unit: {
        select: {
          unitNo: true, type: true, floor: true,
          grossArea: true, block: { select: { name: true } },
        },
      },
      agent: { select: { name: true } },
      installments: { orderBy: { no: "asc" } },
    },
  });

  if (!deal) notFound();

  const paid = deal.installments.reduce((s, i) => s + i.paidAmount, 0);
  const progress = pct(paid, deal.agreedPrice);
  const overdue = deal.installments.filter(
    (i) => i.status !== "PAID" && i.dueDate < new Date()
  );

  return (
    <div className="space-y-5">
      <Link
        href="/panel/satislar"
        className="inline-flex items-center gap-2 text-sm font-semibold text-muted hover:text-ink transition-colors"
      >
        <ArrowLeft size={15} /> Satış listesine dön
      </Link>

      <Card className="p-5 sm:p-6">
        <div className="flex flex-col lg:flex-row lg:items-start gap-6">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="t-h2 text-ink num">{deal.refNo}</h1>
              <Badge tone={DEAL_STATUS_TONE[deal.status]}>
                {DEAL_STATUS_LABELS[deal.status]}
              </Badge>
            </div>

            <dl className="grid sm:grid-cols-2 gap-4 mt-5">
              <div>
                <dt className="flex items-center gap-1.5 text-[0.6875rem] font-bold uppercase tracking-wider text-muted">
                  <User size={13} className="text-brand" /> Müşteri
                </dt>
                <dd className="mt-1">
                  <Link
                    href={`/panel/leadler/${deal.lead.id}`}
                    className="font-semibold text-ink hover:text-brand transition-colors"
                  >
                    {deal.lead.name}
                  </Link>
                  <a
                    href={`tel:${deal.lead.phone}`}
                    className="flex items-center gap-1.5 text-sm text-muted hover:text-brand transition-colors mt-0.5 num"
                  >
                    <Phone size={12} /> {prettyPhone(deal.lead.phone)}
                  </a>
                </dd>
              </div>

              <div>
                <dt className="flex items-center gap-1.5 text-[0.6875rem] font-bold uppercase tracking-wider text-muted">
                  <Building2 size={13} className="text-brand" /> Daire
                </dt>
                <dd className="font-semibold text-ink mt-1">
                  {deal.project.name}
                  <span className="block text-sm font-normal text-muted num">
                    {deal.unit.block ? `${deal.unit.block.name} Blok · ` : ""}
                    {deal.unit.unitNo} · {deal.unit.type} · {deal.unit.floor}
                  </span>
                </dd>
              </div>

              <div>
                <dt className="flex items-center gap-1.5 text-[0.6875rem] font-bold uppercase tracking-wider text-muted">
                  <Percent size={13} className="text-brand" /> Ödeme planı
                </dt>
                <dd className="font-semibold text-ink mt-1 num">
                  %{deal.downPaymentPct} peşinat · {deal.installmentMonths} ay vade
                  <span className="block text-sm font-normal text-muted">
                    Peşinat: {formatPrice(deal.downPayment ?? 0, deal.currency)}
                  </span>
                </dd>
              </div>

              <div>
                <dt className="flex items-center gap-1.5 text-[0.6875rem] font-bold uppercase tracking-wider text-muted">
                  <Calendar size={13} className="text-brand" /> Tarihler
                </dt>
                <dd className="text-sm text-ink-soft mt-1 space-y-0.5">
                  {deal.reservedAt && <p>Rezervasyon: {formatDate(deal.reservedAt)}</p>}
                  {deal.contractAt && <p>Sözleşme: {formatDate(deal.contractAt)}</p>}
                  {deal.completedAt && <p>Tamamlandı: {formatDate(deal.completedAt)}</p>}
                </dd>
              </div>
            </dl>

            {deal.notes && (
              <p className="text-sm text-ink-soft mt-5 bg-surface-2 rounded-xl px-4 py-3 leading-relaxed">
                {deal.notes}
              </p>
            )}
          </div>

          {/* Tutar kartı */}
          <div className="lg:w-72 shrink-0 rounded-2xl bg-surface-2 p-5">
            <p className="text-[0.6875rem] font-bold uppercase tracking-wider text-muted">
              Anlaşılan tutar
            </p>
            <p className="t-h1 text-ink num mt-1">
              {formatPrice(deal.agreedPrice, deal.currency)}
            </p>
            {deal.discountPct && deal.discountPct > 0 ? (
              <p className="text-sm text-muted mt-1 num">
                Liste: {formatPrice(deal.listPrice, deal.currency)} · %{deal.discountPct} indirim
              </p>
            ) : null}

            <div className="mt-5">
              <div className="flex justify-between text-sm mb-1.5">
                <span className="text-muted">Tahsilat</span>
                <span className="font-semibold text-ink num">%{progress}</span>
              </div>
              <div className="h-2 rounded-full bg-surface-3 overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-sm text-muted mt-2 num">
                {formatPrice(paid, deal.currency)} /{" "}
                {formatPrice(deal.agreedPrice, deal.currency)}
              </p>
            </div>

            <div className="mt-5 pt-5 border-t border-border">
              <DealControls dealId={deal.id} status={deal.status} />
            </div>
          </div>
        </div>
      </Card>

      {overdue.length > 0 && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4">
          <p className="font-semibold text-rose-800">
            {overdue.length} taksit gecikmiş
          </p>
          <p className="text-sm text-rose-700 mt-0.5">
            Toplam {formatPrice(overdue.reduce((s, i) => s + (i.amount - i.paidAmount), 0), deal.currency)}{" "}
            tahsil edilmeyi bekliyor.
          </p>
        </div>
      )}

      <Card>
        <CardHeader
          title="Ödeme planı"
          subtitle={`${deal.installments.length} kalem · ${deal.installments.filter((i) => i.status === "PAID").length} ödendi`}
        />
        <InstallmentTable
          installments={deal.installments.map((i) => ({
            id: i.id,
            no: i.no,
            label: i.label,
            dueDate: i.dueDate.toISOString(),
            amount: i.amount,
            paidAmount: i.paidAmount,
            paidAt: i.paidAt?.toISOString() ?? null,
            status: i.status,
          }))}
          currency={deal.currency}
        />
      </Card>
    </div>
  );
}
