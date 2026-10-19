"use client";

import { Lock } from "lucide-react";
import { usePriceGate } from "./price-gate";

/** Özet çubuğundaki başlangıç fiyatı — kayıtsız ziyaretçide kilitli. */
export function SummaryPrice({
  price,
  hasPrice,
  projectId,
  projectName,
}: {
  /** Kilitliyken null gelir. */
  price: string | null;
  hasPrice: boolean;
  projectId: string;
  projectName: string;
}) {
  const { unlocked, open } = usePriceGate();

  if (!hasPrice) return <span>—</span>;
  if (unlocked && price) return <span className="num">{price}</span>;

  return (
    <button
      type="button"
      onClick={() => open({ projectId, projectName })}
      className="inline-flex items-center gap-1.5 text-brand hover:text-brand-600 transition-colors"
      title="Fiyatı görmek için kayıt olun"
    >
      <Lock size={13} />
      <span className="underline decoration-dotted decoration-brand/40 underline-offset-4">
        Kayıt ol
      </span>
    </button>
  );
}
