"use client";

import { useState, useTransition } from "react";
import { Check, Loader2, CircleDollarSign } from "lucide-react";
import { Badge } from "@/components/ui/primitives";
import { Button } from "@/components/ui/button";
import { updateDealStatus, markInstallmentPaid } from "@/app/panel/(crm)/actions";
import { DEAL_STATUS_LABELS } from "@/lib/constants";
import { formatPrice, formatDate, cn } from "@/lib/utils";

const FLOW: { key: string; label: string }[] = [
  { key: "RESERVATION", label: "Rezervasyon" },
  { key: "CONTRACT", label: "Sözleşme" },
  { key: "COMPLETED", label: "Tamamlandı" },
];

export function DealControls({
  dealId,
  status,
}: {
  dealId: string;
  status: string;
}) {
  const [pending, start] = useTransition();
  const [v, setV] = useState(status);

  const idx = FLOW.findIndex((f) => f.key === v);
  const next = idx >= 0 && idx < FLOW.length - 1 ? FLOW[idx + 1] : null;

  return (
    <div className="space-y-3">
      <p className="text-[0.6875rem] font-bold uppercase tracking-wider text-muted">
        Satış durumu
      </p>

      <div className="flex items-center gap-1">
        {FLOW.map((f, i) => (
          <div key={f.key} className="flex items-center gap-1 flex-1">
            <span
              className={cn(
                "h-1.5 flex-1 rounded-full",
                v === "CANCELLED"
                  ? "bg-surface-3"
                  : i <= idx
                    ? "bg-emerald-500"
                    : "bg-surface-3"
              )}
              title={f.label}
            />
          </div>
        ))}
      </div>

      {v === "CANCELLED" ? (
        <Badge tone="bg-slate-100 text-slate-600 ring-slate-200">İptal edildi</Badge>
      ) : (
        <>
          {next && (
            <Button
              fullWidth
              size="sm"
              disabled={pending}
              onClick={() =>
                start(async () => {
                  await updateDealStatus(dealId, next.key);
                  setV(next.key);
                })
              }
            >
              {pending ? (
                <Loader2 size={15} className="animate-spin" />
              ) : (
                <Check size={15} />
              )}
              {next.label} aşamasına geç
            </Button>
          )}
          <Button
            fullWidth
            size="sm"
            variant="ghost"
            disabled={pending}
            className="!text-rose-600 hover:!bg-rose-50"
            onClick={() => {
              if (!confirm("Bu satış iptal edilsin mi? Daire tekrar satışa açılacak.")) return;
              start(async () => {
                await updateDealStatus(dealId, "CANCELLED");
                setV("CANCELLED");
              });
            }}
          >
            Satışı iptal et
          </Button>
        </>
      )}

      <p className="text-xs text-muted text-center">
        Mevcut: <strong className="text-ink-soft">{DEAL_STATUS_LABELS[v]}</strong>
      </p>
    </div>
  );
}

type Inst = {
  id: string;
  no: number;
  label: string | null;
  dueDate: string;
  amount: number;
  paidAmount: number;
  paidAt: string | null;
  status: string;
};

export function InstallmentTable({
  installments,
  currency,
}: {
  installments: Inst[];
  currency: string;
}) {
  const [pending, start] = useTransition();
  const [busy, setBusy] = useState<string | null>(null);

  return (
    <div className="overflow-x-auto thin-scroll">
      <table className="data-table">
        <thead>
          <tr>
            <th>Kalem</th>
            <th>Vade</th>
            <th>Tutar</th>
            <th>Ödenen</th>
            <th>Durum</th>
            <th className="text-right">İşlem</th>
          </tr>
        </thead>
        <tbody>
          {installments.map((i) => {
            const overdue = i.status !== "PAID" && new Date(i.dueDate) < new Date();
            return (
              <tr key={i.id}>
                <td className="font-semibold text-ink">
                  {i.label ?? `${i.no}. Taksit`}
                </td>
                <td
                  className={cn(
                    "num text-[0.8125rem]",
                    overdue ? "text-rose-600 font-semibold" : "text-ink-soft"
                  )}
                >
                  {formatDate(i.dueDate)}
                </td>
                <td className="num font-medium">{formatPrice(i.amount, currency)}</td>
                <td className="num text-ink-soft">
                  {i.paidAmount > 0 ? formatPrice(i.paidAmount, currency) : "—"}
                </td>
                <td>
                  <Badge
                    tone={
                      i.status === "PAID"
                        ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
                        : overdue
                          ? "bg-rose-50 text-rose-700 ring-rose-200"
                          : i.status === "PARTIAL"
                            ? "bg-amber-50 text-amber-700 ring-amber-200"
                            : "bg-surface-2 text-muted ring-border"
                    }
                  >
                    {i.status === "PAID"
                      ? "Ödendi"
                      : overdue
                        ? "Gecikti"
                        : i.status === "PARTIAL"
                          ? "Kısmi"
                          : "Bekliyor"}
                  </Badge>
                </td>
                <td className="text-right">
                  {i.status === "PAID" ? (
                    <span className="text-[0.75rem] text-muted num">
                      {i.paidAt ? formatDate(i.paidAt) : ""}
                    </span>
                  ) : (
                    <button
                      disabled={pending && busy === i.id}
                      onClick={() => {
                        setBusy(i.id);
                        start(async () => {
                          await markInstallmentPaid(i.id);
                          setBusy(null);
                        });
                      }}
                      className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-[0.75rem] font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition-colors disabled:opacity-60"
                    >
                      {pending && busy === i.id ? (
                        <Loader2 size={13} className="animate-spin" />
                      ) : (
                        <CircleDollarSign size={13} />
                      )}
                      Ödendi işaretle
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
