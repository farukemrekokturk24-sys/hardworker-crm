"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X, Rotate3d, Maximize2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BRAND } from "@/lib/constants";
import { cn } from "@/lib/utils";

/**
 * 360° sanal tur.
 * Tur ayrı bir sitede barındığı için tam ekran bir katmanda iframe ile açılır;
 * sayfadan ayrılmadan gezilir.
 */
export function TourButton({
  variant = "default",
  label = "360° Sanal Tur",
  className,
}: {
  variant?: "default" | "hero" | "dark" | "ghost";
  label?: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);

  const styles: Record<string, string> = {
    default: "",
    hero: "bg-white/10 border-white/25 text-white hover:bg-white/20 hover:border-white/40 backdrop-blur-sm",
    dark: "!bg-white !text-dark hover:!bg-white/90",
    ghost: "",
  };

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        size="lg"
        variant={variant === "default" ? "primary" : "outline"}
        className={cn(styles[variant], className)}
      >
        <Rotate3d size={18} /> {label}
      </Button>
      {open && <TourOverlay onClose={() => setOpen(false)} />}
    </>
  );
}

function TourOverlay({ onClose }: { onClose: () => void }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

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
    <div className="fixed inset-0 z-[95] bg-dark anim-fade flex flex-col">
      <div className="flex items-center justify-between gap-3 px-4 sm:px-6 h-14 border-b border-white/10 shrink-0">
        <p className="flex items-center gap-2.5 text-white font-semibold text-sm">
          <Rotate3d size={17} className="text-brand" />
          360° Sanal Tur
        </p>
        <div className="flex items-center gap-1.5">
          <a
            href={BRAND.tour360Url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg text-[0.8125rem] font-semibold text-white/70 hover:text-white hover:bg-white/10 transition-colors"
          >
            <ExternalLink size={14} />
            <span className="hidden sm:inline">Yeni sekmede aç</span>
          </a>
          <button
            onClick={onClose}
            aria-label="Turu kapat"
            className="h-10 w-10 rounded-lg grid place-items-center text-white/70 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      <iframe
        src={BRAND.tour360Url}
        title="Hardworker 360 derece sanal tur"
        className="flex-1 w-full border-0 bg-dark-2"
        allow="fullscreen; accelerometer; gyroscope; xr-spatial-tracking"
        allowFullScreen
      />
    </div>,
    document.body
  );
}

/** Proje sayfasında kullanılan geniş tur kartı. */
export function TourCard({ projectName }: { projectName?: string }) {
  return (
    <div className="relative overflow-hidden rounded-[var(--r-card)] card-dark p-6 sm:p-7">
      <div
        className="absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
          backgroundSize: "22px 22px",
        }}
      />
      <div className="relative">
        <div className="h-11 w-11 rounded-xl bg-brand grid place-items-center text-white">
          <Rotate3d size={21} />
        </div>
        <h3 className="font-display font-bold text-white text-lg mt-4">
          360° Sanal Tur
        </h3>
        <p className="text-sm text-white/65 mt-2 leading-relaxed">
          {projectName
            ? `${projectName} dairelerini tarayıcınızdan adım adım gezin.`
            : "Daireleri tarayıcınızdan adım adım gezin."}
        </p>
        <div className="mt-5">
          <TourButton variant="dark" label="Turu Başlat" />
        </div>
      </div>
      <Maximize2
        size={150}
        className="absolute -right-8 -bottom-8 text-white/5"
        aria-hidden
      />
    </div>
  );
}
