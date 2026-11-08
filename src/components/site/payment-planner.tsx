"use client";

import { useMemo, useState } from "react";
import { Calculator, Info, RotateCcw, TrendingDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePriceGate } from "./price-gate";
import { WhatsappIcon } from "@/components/brand/social-icons";
import { BRAND } from "@/lib/constants";
import { formatPrice, cn } from "@/lib/utils";

/**
 * Ödeme planı yapılandırıcısı.
 *
 * Müşteri peşinat oranını, ara ödemeyi, teslimde ödenecek payı ve taksit
 * sayısını kendisi ayarlar; indirim ve aylık taksit anında hesaplanır.
 * Fiyat kuralı burada da geçerli: kayıtsız ziyaretçiye tutar gösterilmez.
 */

export type PlannerTerm = { downPct: number; benefitTr: string };

/** Peşinat oranına göre uygulanan indirim (proje şartlarından türetilir). */
function discountFor(downPct: number, terms: PlannerTerm[]): number {
  const table = terms
    .map((t) => {
      const m = t.benefitTr.match(/%\s*([\d,.]+)\s*indirim/i);
      return m ? { pct: t.downPct, disc: parseFloat(m[1].replace(",", ".")) } : null;
    })
    .filter((x): x is { pct: number; disc: number } => Boolean(x))
    .sort((a, b) => a.pct - b.pct);

  let disc = 0;
  for (const row of table) if (downPct >= row.pct) disc = row.disc;
  return disc;
}

export function PaymentPlanner({
  basePrice,
  hasPrice,
  currency = "GBP",
  defaultDownPct = 35,
  defaultMonths = 36,
  terms = [],
  projectId,
  projectName,
}: {
  /** Kayıtsız ziyaretçide null gelir. */
  basePrice: number | null;
  hasPrice: boolean;
  currency?: string;
  defaultDownPct?: number;
  defaultMonths?: number;
  terms?: PlannerTerm[];
  projectId?: string;
  projectName?: string;
}) {
  const { unlocked, open } = usePriceGate();

  const [downPct, setDownPct] = useState(defaultDownPct);
  const [interimPct, setInterimPct] = useState(0);
  const [deliveryPct, setDeliveryPct] = useState(0);
  const [months, setMonths] = useState(defaultMonths);

  const maxInstallmentPct = Math.max(0, 100 - downPct - interimPct - deliveryPct);

  const plan = useMemo(() => {
    const discount = discountFor(downPct, terms);
    const price = basePrice ?? 0;
    const finalPrice = price * (1 - discount / 100);

    const down = (finalPrice * downPct) / 100;
    const interim = (finalPrice * interimPct) / 100;
    const delivery = (finalPrice * deliveryPct) / 100;
    const installmentTotal = Math.max(0, finalPrice - down - interim - delivery);
    const monthly = months > 0 ? installmentTotal / months : 0;

    return { discount, finalPrice, down, interim, delivery, installmentTotal, monthly, saved: price - finalPrice };
  }, [basePrice, downPct, interimPct, deliveryPct, months, terms]);

  const reset = () => {
    setDownPct(defaultDownPct);
    setInterimPct(0);
    setDeliveryPct(0);
    setMonths(defaultMonths);
  };

  const money = (v: number) => (unlocked && basePrice ? formatPrice(Math.round(v), currency) : "—");

  const waText = `Merhaba${projectName ? `, ${projectName} için` : ""} şu ödeme planını düşünüyorum: %${downPct} peşinat${
    interimPct ? `, %${interimPct} ara ödeme` : ""
  }${deliveryPct ? `, teslimde %${deliveryPct}` : ""}, ${months} ay taksit. Uygun mudur?`;

  return (
    <div className="card overflow-hidden">
      <div className="flex items-start gap-3 px-5 sm:px-6 py-5 border-b border-border">
        <span className="h-11 w-11 rounded-xl bg-brand-50 text-brand grid place-items-center shrink-0">
          <Calculator size={21} />
        </span>
        <div className="min-w-0">
          <h3 className="font-display font-bold text-ink text-lg">
            Ödeme planınızı oluşturun
          </h3>
          <p className="text-sm text-muted mt-0.5 leading-relaxed">
            Peşinat, ara ödeme ve taksit sayısını kendinize göre ayarlayın;
            aylık tutar anında hesaplansın.
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2">
        {/* Ayarlar */}
        <div className="p-5 sm:p-6 space-y-6 border-b lg:border-b-0 lg:border-r border-border">
          <Slider
            label="Peşinat"
            value={downPct}
            min={10}
            max={100}
            step={5}
            onChange={(v) => {
              setDownPct(v);
              // Toplam %100'ü aşmasın
              const rest = 100 - v;
              if (interimPct + deliveryPct > rest) {
                setInterimPct(Math.min(interimPct, rest));
                setDeliveryPct(Math.max(0, rest - Math.min(interimPct, rest)));
              }
            }}
            hint={plan.discount > 0 ? `%${plan.discount} indirim kazandınız` : undefined}
          />

          <Slider
            label="Ara ödeme"
            value={interimPct}
            min={0}
            max={Math.max(0, 100 - downPct - deliveryPct)}
            step={5}
            onChange={setInterimPct}
            hint="İnşaat sürecinde yapılacak tek seferlik ödeme"
          />

          <Slider
            label="Teslimde ödeme"
            value={deliveryPct}
            min={0}
            max={Math.max(0, 100 - downPct - interimPct)}
            step={5}
            onChange={setDeliveryPct}
            hint="Anahtar teslimde ödenecek pay"
          />

          <div>
            <div className="flex items-baseline justify-between mb-2.5">
              <label className="text-[0.8125rem] font-semibold text-ink-soft">
                Taksit süresi
              </label>
              <span className="font-display font-bold text-ink num">{months} ay</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {[0, 12, 24, 36, 48].map((m) => (
                <button
                  key={m}
                  onClick={() => setMonths(m)}
                  className={cn(
                    "h-9 px-3.5 rounded-lg text-[0.8125rem] font-semibold transition-colors",
                    months === m
                      ? "bg-brand text-white"
                      : "bg-surface-2 text-ink-soft hover:bg-surface-3"
                  )}
                >
                  {m === 0 ? "Peşin" : `${m} ay`}
                </button>
              ))}
            </div>
            <p className="text-xs text-muted mt-2">
              Kalan %{maxInstallmentPct} taksitlendirilir.
            </p>
          </div>

          <button
            onClick={reset}
            className="inline-flex items-center gap-1.5 text-[0.8125rem] font-semibold text-muted hover:text-ink transition-colors"
          >
            <RotateCcw size={14} /> Varsayılana dön
          </button>
        </div>

        {/* Sonuç */}
        <div className="p-5 sm:p-6 bg-surface-2/50">
          {plan.discount > 0 && unlocked && basePrice && (
            <div className="flex items-center gap-2.5 rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 mb-4">
              <TrendingDown size={18} className="text-emerald-600 shrink-0" />
              <p className="text-sm text-emerald-800">
                <strong>%{plan.discount} indirim</strong> — {money(plan.saved)} tasarruf
              </p>
            </div>
          )}

          <dl className="space-y-3">
            <Row label={`Peşinat (%${downPct})`} value={money(plan.down)} strong />
            {interimPct > 0 && (
              <Row label={`Ara ödeme (%${interimPct})`} value={money(plan.interim)} />
            )}
            {deliveryPct > 0 && (
              <Row label={`Teslimde (%${deliveryPct})`} value={money(plan.delivery)} />
            )}
            {months > 0 && maxInstallmentPct > 0 && (
              <Row
                label={`${months} taksit (toplam %${maxInstallmentPct})`}
                value={money(plan.installmentTotal)}
              />
            )}
          </dl>

          <div className="mt-5 pt-5 border-t border-border-strong/50">
            {months > 0 && maxInstallmentPct > 0 && (
              <div className="rounded-xl bg-brand text-white px-5 py-4">
                <p className="text-[0.6875rem] font-bold uppercase tracking-[0.14em] text-white/70">
                  Aylık taksit
                </p>
                <p className="font-display text-3xl font-extrabold num mt-1">
                  {money(plan.monthly)}
                </p>
              </div>
            )}

            <dl className="flex items-baseline justify-between mt-4">
              <dt className="text-sm font-semibold text-ink-soft">Toplam tutar</dt>
              <dd className="font-display text-xl font-extrabold text-ink num">
                {money(plan.finalPrice)}
              </dd>
            </dl>
          </div>

          {!unlocked || !hasPrice ? (
            <div className="mt-5">
              <p className="flex items-start gap-2 text-xs text-muted leading-relaxed mb-3">
                <Info size={14} className="shrink-0 mt-0.5" />
                Tutarları görmek için telefon numaranızı bırakmanız yeterli.
              </p>
              <Button
                onClick={() => open({ projectId, projectName })}
                fullWidth
              >
                Tutarları Göster
              </Button>
            </div>
          ) : (
            <a
              href={`https://wa.me/${BRAND.whatsapp}?text=${encodeURIComponent(waText)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 flex items-center justify-center gap-2 h-12 rounded-xl bg-[#25D366] text-white font-semibold hover:brightness-105 transition-all"
            >
              <WhatsappIcon size={18} /> Bu planı danışmana gönder
            </a>
          )}

          <p className="text-[0.6875rem] text-muted mt-3 leading-relaxed">
            Hesaplama bilgilendirme amaçlıdır; nihai koşullar sözleşmede belirlenir.
          </p>
        </div>
      </div>
    </div>
  );
}

function Slider({
  label,
  value,
  min,
  max,
  step,
  onChange,
  hint,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  hint?: string;
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between mb-2.5">
        <label className="text-[0.8125rem] font-semibold text-ink-soft">{label}</label>
        <span className="font-display font-bold text-ink num">%{value}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-label={label}
        className="w-full h-2 rounded-full appearance-none bg-surface-3 accent-[var(--brand)] cursor-pointer"
      />
      {hint && (
        <p
          className={cn(
            "text-xs mt-1.5",
            hint.includes("indirim") ? "text-emerald-600 font-medium" : "text-muted"
          )}
        >
          {hint}
        </p>
      )}
    </div>
  );
}

function Row({
  label,
  value,
  strong,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="text-sm text-muted">{label}</dt>
      <dd
        className={cn(
          "num tabular-nums",
          strong ? "font-bold text-ink" : "font-semibold text-ink-soft"
        )}
      >
        {value}
      </dd>
    </div>
  );
}
