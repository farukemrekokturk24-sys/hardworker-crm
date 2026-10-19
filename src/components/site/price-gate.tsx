"use client";

import {
  useActionState, useEffect, useState, createContext, useContext,
  useCallback, useRef, useMemo,
} from "react";
import { createPortal } from "react-dom";
import { Lock, X, ShieldCheck, Loader2, CheckCircle2 } from "lucide-react";
import { registerForPrices, type RegisterState } from "@/app/(site)/actions";
import { Button } from "@/components/ui/button";
import { Field, inputClass, selectClass } from "@/components/ui/primitives";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------- Context */

type GateContext = { projectId?: string; unitId?: string; projectName?: string };

type GateCtx = {
  unlocked: boolean;
  open: (ctx?: GateContext) => void;
  /** Sayfa bağlamını kaydeder; header gibi bağlamsız tetikleyiciler de projeyi taşır. */
  setPageContext: (ctx: GateContext | null) => void;
};

const Ctx = createContext<GateCtx>({
  unlocked: false,
  open: () => {},
  setPageContext: () => {},
});

export function usePriceGate() {
  return useContext(Ctx);
}

export function PriceGateProvider({
  unlocked: initial,
  children,
}: {
  unlocked: boolean;
  children: React.ReactNode;
}) {
  const [unlocked, setUnlocked] = useState(initial);
  const [modal, setModal] = useState<GateContext | null>(null);
  const pageCtx = useRef<GateContext | null>(null);

  useEffect(() => setUnlocked(initial), [initial]);

  const setPageContext = useCallback((ctx: GateContext | null) => {
    pageCtx.current = ctx;
  }, []);

  // Bağlam verilmezse sayfanın kendi bağlamına (ör. açık proje) düşer.
  const open = useCallback((ctx?: GateContext) => {
    setModal(ctx ?? pageCtx.current ?? {});
  }, []);

  const value = useMemo(
    () => ({ unlocked, open, setPageContext }),
    [unlocked, open, setPageContext]
  );

  return (
    <Ctx.Provider value={value}>
      {children}
      {modal && (
        <PriceGateModal
          {...modal}
          onClose={() => setModal(null)}
          onSuccess={() => {
            setUnlocked(true);
            setModal(null);
          }}
        />
      )}
    </Ctx.Provider>
  );
}

/* --------------------------------------------------------------- Modal */

const COUNTRIES = [
  "KKTC", "Türkiye", "İngiltere", "Almanya", "Rusya", "İsrail",
  "İran", "Ukrayna", "Polonya", "Diğer",
];

function PriceGateModal({
  projectId,
  unitId,
  projectName,
  onClose,
  onSuccess,
}: {
  projectId?: string;
  unitId?: string;
  projectName?: string;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [state, action, pending] = useActionState<RegisterState, FormData>(
    registerForPrices,
    { ok: false }
  );
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (state.ok) {
      const t = setTimeout(onSuccess, 1100);
      return () => clearTimeout(t);
    }
  }, [state.ok, onSuccess]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  if (!mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center">
      <div
        className="absolute inset-0 bg-dark/60 backdrop-blur-sm anim-fade"
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="gate-title"
        className={cn(
          "relative w-full sm:max-w-[460px] bg-surface shadow-2xl",
          "rounded-t-3xl sm:rounded-3xl max-h-[92dvh] overflow-y-auto thin-scroll",
          "anim-slide-up sm:anim-scale safe-b"
        )}
      >
        {/* mobil tutamaç */}
        <div className="sm:hidden pt-3 pb-1 flex justify-center">
          <div className="h-1 w-10 rounded-full bg-border-strong" />
        </div>

        <button
          onClick={onClose}
          aria-label="Kapat"
          className="absolute right-3 top-3 h-9 w-9 rounded-full grid place-items-center text-muted hover:text-ink hover:bg-surface-2 transition-colors z-10"
        >
          <X size={18} />
        </button>

        {state.ok ? (
          <div className="px-7 py-16 text-center">
            <div className="h-16 w-16 rounded-2xl bg-emerald-50 text-emerald-600 grid place-items-center mx-auto mb-5 anim-scale">
              <CheckCircle2 size={32} />
            </div>
            <h2 className="t-h2 text-ink">Fiyatlar açıldı</h2>
            <p className="text-muted mt-2 text-sm">
              Teşekkürler! Satış danışmanımız kısa süre içinde sizinle iletişime geçecek.
            </p>
          </div>
        ) : (
          <form action={action} className="px-6 sm:px-7 pb-7 pt-5 sm:pt-8">
            <div className="h-12 w-12 rounded-2xl bg-brand-50 text-brand grid place-items-center mb-4">
              <Lock size={22} />
            </div>

            <h2 id="gate-title" className="t-h2 text-ink text-balance">
              Fiyatları görmek için kayıt olun
            </h2>
            <p className="text-sm text-muted mt-2 leading-relaxed">
              {projectName ? (
                <>
                  <span className="font-semibold text-ink-soft">{projectName}</span>{" "}
                  güncel fiyat listesi, kat planları ve ödeme seçenekleri anında açılır.
                </>
              ) : (
                "Tüm projelerin güncel fiyat listesi, kat planları ve ödeme seçenekleri anında açılır."
              )}
            </p>

            {projectId && <input type="hidden" name="projectId" value={projectId} />}
            {unitId && <input type="hidden" name="unitId" value={unitId} />}

            <div className="space-y-3.5 mt-6">
              <Field label="Ad Soyad" required error={state.fieldErrors?.name}>
                <input
                  name="name"
                  required
                  autoComplete="name"
                  placeholder="Adınız ve soyadınız"
                  className={inputClass}
                />
              </Field>

              <Field
                label="Telefon"
                required
                error={state.fieldErrors?.phone}
                hint="WhatsApp üzerinden de ulaşabilmemiz için"
              >
                <input
                  name="phone"
                  type="tel"
                  required
                  inputMode="tel"
                  autoComplete="tel"
                  placeholder="+90 5XX XXX XX XX"
                  className={inputClass}
                />
              </Field>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Ülke">
                  <select name="country" className={selectClass} defaultValue="">
                    <option value="">Seçiniz</option>
                    {COUNTRIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Amacınız">
                  <select name="purpose" className={selectClass} defaultValue="">
                    <option value="">Seçiniz</option>
                    <option value="YATIRIM">Yatırım</option>
                    <option value="OTURUM">Oturum</option>
                    <option value="KIRALAMA">Kiralama geliri</option>
                  </select>
                </Field>
              </div>

              <Field label="E-posta" error={state.fieldErrors?.email}>
                <input
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="ornek@email.com (opsiyonel)"
                  className={inputClass}
                />
              </Field>

              <label className="flex items-start gap-2.5 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  name="kvkk"
                  defaultChecked
                  className="mt-0.5 h-4 w-4 rounded border-border-strong text-brand focus:ring-brand/30 accent-[var(--brand)]"
                />
                <span className="text-xs text-muted leading-relaxed">
                  Kişisel verilerimin satış süreci kapsamında işlenmesini ve benimle
                  iletişime geçilmesini kabul ediyorum.
                </span>
              </label>
              {state.fieldErrors?.kvkk && (
                <p className="text-xs font-medium text-rose-600">{state.fieldErrors.kvkk}</p>
              )}
            </div>

            {state.error && !state.fieldErrors && (
              <p className="mt-4 text-sm text-rose-600 bg-rose-50 rounded-xl px-3.5 py-2.5">
                {state.error}
              </p>
            )}

            <Button type="submit" size="lg" fullWidth className="mt-6" disabled={pending}>
              {pending ? (
                <>
                  <Loader2 size={18} className="animate-spin" /> Gönderiliyor...
                </>
              ) : (
                "Fiyatları Göster"
              )}
            </Button>

            <p className="flex items-center justify-center gap-1.5 text-[0.6875rem] text-muted mt-3.5">
              <ShieldCheck size={13} />
              Bilgileriniz üçüncü taraflarla paylaşılmaz
            </p>
          </form>
        )}
      </div>
    </div>,
    document.body
  );
}

/* ---------------------------------------------------------- Fiyat etiketi */

/**
 * Kayıtlı ziyaretçiye gerçek fiyatı, kayıtsıza bulanık bir maske + kilit gösterir.
 */
export function PriceTag({
  price,
  projectId,
  unitId,
  projectName,
  className,
  size = "md",
}: {
  /** Kilitliyken null gelir — gerçek fiyat istemciye hiç gönderilmez. */
  price: string | null;
  projectId?: string;
  unitId?: string;
  projectName?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  const { unlocked, open } = usePriceGate();
  const sizes = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-xl sm:text-2xl",
  };

  if (unlocked && price) {
    return (
      <span className={cn("font-display font-bold num text-ink", sizes[size], className)}>
        {price}
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={() => open({ projectId, unitId, projectName })}
      className={cn(
        "group inline-flex items-center gap-1.5 font-display font-bold text-brand hover:text-brand-600 transition-colors",
        sizes[size],
        className
      )}
      title="Fiyatı görmek için kayıt olun"
    >
      <Lock size={size === "lg" ? 17 : 13} className="shrink-0" />
      <span className="underline decoration-dotted decoration-brand/40 underline-offset-4 group-hover:decoration-brand">
        Fiyatı gör
      </span>
    </button>
  );
}

/** Kayıtsız ziyaretçi için bulanık fiyat bloğu (tablo hücreleri) */
export function PriceCell({
  price,
  projectId,
  unitId,
  projectName,
}: {
  /** Kilitliyken null gelir; maske sabit bir yer tutucuyla çizilir. */
  price: string | null;
  projectId?: string;
  unitId?: string;
  projectName?: string;
}) {
  const { unlocked, open } = usePriceGate();

  if (unlocked && price) {
    return <span className="font-semibold num text-ink">{price}</span>;
  }
  return (
    <button
      type="button"
      onClick={() => open({ projectId, unitId, projectName })}
      className="group inline-flex items-center gap-2"
      title="Fiyatı görmek için kayıt olun"
    >
      <span className="price-locked font-semibold num" aria-hidden>
        £000.000
      </span>
      <span className="sr-only">Fiyatı görmek için kayıt olun</span>
      <Lock size={12} className="text-brand group-hover:scale-110 transition-transform" />
    </button>
  );
}

/** "Fiyat listesinin kilidini aç" bannerı */
export function UnlockBanner({
  projectId,
  projectName,
  className,
}: {
  projectId?: string;
  projectName?: string;
  className?: string;
}) {
  const { unlocked, open } = usePriceGate();
  if (unlocked) return null;

  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row sm:items-center gap-4 rounded-2xl border border-brand/20 bg-brand-50/70 p-4 sm:p-5",
        className
      )}
    >
      <div className="h-11 w-11 rounded-xl bg-brand text-white grid place-items-center shrink-0 anim-pulse-ring">
        <Lock size={19} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-bold text-ink">Fiyatlar kayıtlı ziyaretçilere açıktır</p>
        <p className="text-sm text-ink-soft mt-0.5">
          30 saniyede kaydolun; tüm daire fiyatlarını, kat planlarını ve ödeme
          planını anında görün.
        </p>
      </div>
      <Button onClick={() => open({ projectId, projectName })} className="shrink-0">
        Fiyatları Aç
      </Button>
    </div>
  );
}

/* ------------------------------------------------------- Sayfa bağlamı */

/**
 * Proje sayfasında render edilir; header gibi bağlamsız tetikleyicilerin de
 * doğru projeyi lead kaydına yazmasını sağlar.
 */
export function GatePageContext({
  projectId,
  projectName,
}: {
  projectId: string;
  projectName: string;
}) {
  const { setPageContext } = usePriceGate();
  useEffect(() => {
    setPageContext({ projectId, projectName });
    return () => setPageContext(null);
  }, [projectId, projectName, setPageContext]);
  return null;
}
