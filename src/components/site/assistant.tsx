"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Send, X, Sparkles, Loader2 } from "lucide-react";
import { WhatsappIcon } from "@/components/brand/social-icons";
import { usePriceGate } from "./price-gate";
import { answer, QUICK_CHIPS, type Reply } from "@/lib/assistant-intents";
import type { AssistantData } from "@/lib/assistant";
import { BRAND } from "@/lib/constants";
import { cn } from "@/lib/utils";

const NAME = "Deniz";

type Msg = {
  id: number;
  from: "bot" | "user";
  text: string;
  chips?: string[];
  links?: { label: string; href: string }[];
  askPrice?: boolean;
  toWhatsapp?: boolean;
};

let seq = 0;
const nextId = () => ++seq;

export function Assistant({ data }: { data: AssistantData }) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const { open: openGate } = usePriceGate();
  const scroller = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // İlk açılışta selamlama
  useEffect(() => {
    if (open && msgs.length === 0) {
      setMsgs([
        {
          id: nextId(),
          from: "bot",
          text: `Merhaba, ben ${NAME} 👋 Hardworker'ın dijital satış danışmanıyım. Projeler, daire tipleri, ödeme planı ve teslim tarihleri hakkında sorabilirsiniz.`,
          chips: QUICK_CHIPS,
        },
      ]);
    }
  }, [open, msgs.length]);

  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: "smooth" });
  }, [msgs, typing]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const send = (text: string) => {
    const t = text.trim();
    if (!t) return;
    setMsgs((m) => [...m, { id: nextId(), from: "user", text: t }]);
    setInput("");
    setTyping(true);

    // Kısa bir gecikme sohbeti doğal hissettirir
    window.setTimeout(() => {
      const r: Reply = answer(t, data);
      setTyping(false);
      setMsgs((m) => [
        ...m,
        {
          id: nextId(),
          from: "bot",
          text: r.text,
          chips: r.chips,
          links: r.links,
          askPrice: r.askPrice,
          toWhatsapp: r.toWhatsapp,
        },
      ]);
    }, 480);
  };

  const waHref = (context?: string) =>
    `https://wa.me/${BRAND.whatsapp}?text=${encodeURIComponent(
      context
        ? `Merhaba, siteden yazıyorum. ${context}`
        : "Merhaba, projeleriniz hakkında bilgi almak istiyorum."
    )}`;

  return (
    <>
      {/* Tetikleyici */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className={cn(
            "group fixed right-3.5 sm:right-5 bottom-[8.25rem] sm:bottom-[9rem] z-40",
            "flex items-center gap-2.5 h-[52px] pl-2 pr-4 rounded-full",
            "bg-dark text-white shadow-lg shadow-dark/25",
            "hover:bg-dark-2 active:scale-95 transition-all safe-b"
          )}
          aria-label={`${NAME} ile sohbet et`}
        >
          <span className="relative grid place-items-center h-9 w-9 rounded-full bg-brand shrink-0">
            <Sparkles size={17} />
            <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-400 ring-2 ring-dark" />
          </span>
          <span className="text-sm font-semibold whitespace-nowrap">
            {NAME}&apos;e sor
          </span>
        </button>
      )}

      {/* Panel */}
      {open && (
        <div
          role="dialog"
          aria-label={`${NAME} — satış danışmanı`}
          className={cn(
            "fixed z-[60] bg-surface shadow-2xl flex flex-col",
            "inset-x-0 bottom-0 top-auto h-[85dvh] rounded-t-3xl",
            "sm:inset-auto sm:right-5 sm:bottom-5 sm:h-[600px] sm:w-[400px] sm:rounded-3xl",
            "anim-slide-up sm:anim-scale border border-border overflow-hidden safe-b"
          )}
        >
          {/* Başlık */}
          <div className="flex items-center gap-3 px-4 py-3.5 bg-dark text-white shrink-0">
            <span className="relative grid place-items-center h-10 w-10 rounded-full bg-brand shrink-0">
              <Sparkles size={18} />
              <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-400 ring-2 ring-dark" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-sm leading-tight">{NAME}</p>
              <p className="text-[0.6875rem] text-white/60">
                Satış Danışmanı · genelde hemen yanıtlar
              </p>
            </div>
            <button
              onClick={() => setOpen(false)}
              aria-label="Sohbeti kapat"
              className="h-9 w-9 rounded-lg grid place-items-center text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Mesajlar */}
          <div ref={scroller} className="flex-1 overflow-y-auto thin-scroll px-4 py-4 space-y-3.5">
            {msgs.map((m) => (
              <div key={m.id}>
                <div
                  className={cn(
                    "max-w-[88%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-line",
                    m.from === "bot"
                      ? "bg-surface-2 text-ink rounded-tl-md"
                      : "bg-brand text-white ml-auto rounded-tr-md"
                  )}
                >
                  {m.text}
                </div>

                {m.links && m.links.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {m.links.map((l) => (
                      <Link
                        key={l.href}
                        href={l.href}
                        onClick={() => setOpen(false)}
                        className="inline-flex items-center h-8 px-3 rounded-full bg-brand-50 text-brand text-[0.75rem] font-semibold hover:bg-brand-100 transition-colors"
                      >
                        {l.label} →
                      </Link>
                    ))}
                  </div>
                )}

                {m.askPrice && (
                  <button
                    onClick={() => {
                      setOpen(false);
                      openGate();
                    }}
                    className="mt-2 inline-flex items-center h-9 px-4 rounded-full bg-brand text-white text-[0.8125rem] font-semibold hover:bg-brand-600 transition-colors"
                  >
                    Fiyatları aç →
                  </button>
                )}

                {m.toWhatsapp && (
                  <a
                    href={waHref(m.text.slice(0, 90))}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-flex items-center gap-2 h-9 px-4 rounded-full bg-[#25D366] text-white text-[0.8125rem] font-semibold hover:brightness-105 transition-all"
                  >
                    <WhatsappIcon size={15} /> WhatsApp&apos;tan devam et
                  </a>
                )}

                {m.chips && m.chips.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2.5">
                    {m.chips.map((c) => (
                      <button
                        key={c}
                        onClick={() => send(c)}
                        className="inline-flex items-center h-8 px-3 rounded-full border border-border bg-surface text-ink-soft text-[0.75rem] font-medium hover:border-brand/45 hover:text-brand transition-colors"
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {typing && (
              <div className="inline-flex items-center gap-2 bg-surface-2 rounded-2xl rounded-tl-md px-3.5 py-2.5">
                <Loader2 size={14} className="animate-spin text-muted" />
                <span className="text-xs text-muted">{NAME} yazıyor…</span>
              </div>
            )}
          </div>

          {/* Giriş */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
            className="shrink-0 border-t border-border p-3 flex items-center gap-2"
          >
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Sorunuzu yazın…"
              className="flex-1 h-11 rounded-xl border border-border bg-surface px-3.5 text-sm placeholder:text-muted/70 focus:border-brand focus:ring-2 focus:ring-brand/15 focus:outline-none transition-colors"
            />
            <button
              type="submit"
              disabled={!input.trim()}
              aria-label="Gönder"
              className="h-11 w-11 shrink-0 rounded-xl bg-brand text-white grid place-items-center hover:bg-brand-600 disabled:opacity-40 transition-colors"
            >
              <Send size={17} />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
