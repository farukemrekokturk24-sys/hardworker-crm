"use client";

import { useState, useTransition } from "react";
import { Check, Loader2 } from "lucide-react";
import { Field, inputClass } from "@/components/ui/primitives";
import { Button } from "@/components/ui/button";
import { saveSetting } from "@/app/panel/(crm)/actions";
import { cn } from "@/lib/utils";

export function PriceGateSettings({
  enabled: initialEnabled,
  title: initialTitle,
}: {
  enabled: boolean;
  title: string;
}) {
  const [enabled, setEnabled] = useState(initialEnabled);
  const [title, setTitle] = useState(initialTitle);
  const [pending, start] = useTransition();
  const [saved, setSaved] = useState(false);

  const save = () =>
    start(async () => {
      await saveSetting("crm.priceGate.enabled", enabled);
      await saveSetting("crm.priceGate.title", title);
      setSaved(true);
      setTimeout(() => setSaved(false), 2200);
    });

  return (
    <div className="space-y-5">
      <label className="flex items-center justify-between gap-4 cursor-pointer">
        <div>
          <p className="font-semibold text-ink">Fiyat kilidi aktif</p>
          <p className="text-sm text-muted mt-0.5">
            Kapatırsanız tüm ziyaretçiler fiyatları kayıt olmadan görür.
          </p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={enabled}
          onClick={() => setEnabled((v) => !v)}
          className={cn(
            "relative h-7 w-12 rounded-full transition-colors shrink-0",
            enabled ? "bg-brand" : "bg-surface-3"
          )}
        >
          <span
            className={cn(
              "absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-transform",
              enabled ? "translate-x-6" : "translate-x-1"
            )}
          />
        </button>
      </label>

      <Field label="Form başlığı" hint="Ziyaretçiye gösterilen modal başlığı.">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className={inputClass}
        />
      </Field>

      <div className="flex items-center gap-3">
        <Button onClick={save} disabled={pending}>
          {pending ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
          Kaydet
        </Button>
        {saved && (
          <span className="text-sm font-medium text-emerald-700">Kaydedildi</span>
        )}
      </div>
    </div>
  );
}
