"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight, Expand } from "lucide-react";
import { IMAGE_CATEGORY_LABELS } from "@/lib/constants";
import { cn } from "@/lib/utils";

type Img = { id: string; url: string; category: string; caption: string | null };

export function Gallery({ images }: { images: Img[] }) {
  const categories = useMemo(() => {
    const order = ["exterior", "render", "interior", "activity", "siteplan", "floorplan", "360", "progress", "location"];
    const present = [...new Set(images.map((i) => i.category))];
    return present.sort((a, b) => order.indexOf(a) - order.indexOf(b));
  }, [images]);

  const [active, setActive] = useState(categories[0] ?? "");
  const [lightbox, setLightbox] = useState<number | null>(null);

  const shown = useMemo(
    () => images.filter((i) => i.category === active),
    [images, active]
  );

  const next = useCallback(
    () => setLightbox((i) => (i === null ? null : (i + 1) % shown.length)),
    [shown.length]
  );
  const prev = useCallback(
    () => setLightbox((i) => (i === null ? null : (i - 1 + shown.length) % shown.length)),
    [shown.length]
  );

  useEffect(() => {
    if (lightbox === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightbox(null);
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [lightbox, next, prev]);

  if (!images.length) return null;

  const isPlan = active === "floorplan" || active === "siteplan" || active === "location";

  return (
    <div>
      <div className="flex gap-2 overflow-x-auto no-scrollbar mask-fade-r -mx-1 px-1 pb-1 max-w-full">
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setActive(c)}
            className={cn(
              "shrink-0 inline-flex items-center gap-2 h-9 px-3.5 rounded-full text-[0.8125rem] font-semibold transition-all",
              active === c
                ? "bg-ink text-white"
                : "bg-surface border border-border text-ink-soft hover:border-ink/25"
            )}
          >
            {IMAGE_CATEGORY_LABELS[c] ?? c}
            <span
              className={cn(
                "text-[0.625rem] num font-bold px-1.5 rounded-full",
                active === c ? "bg-white/20" : "bg-surface-2"
              )}
            >
              {images.filter((i) => i.category === c).length}
            </span>
          </button>
        ))}
      </div>

      <div
        className={cn(
          "grid gap-3 mt-5",
          isPlan
            ? "sm:grid-cols-2 lg:grid-cols-3"
            : "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4"
        )}
      >
        {shown.map((img, i) => (
          <button
            key={img.id}
            onClick={() => setLightbox(i)}
            className={cn(
              "group relative overflow-hidden rounded-xl bg-surface-2 border border-border",
              isPlan ? "aspect-[4/3]" : "aspect-square",
              i === 0 && !isPlan && "col-span-2 row-span-2 aspect-square"
            )}
          >
            <Image
              src={img.url}
              alt={img.caption ?? ""}
              fill
              sizes="(max-width: 640px) 50vw, 25vw"
              className={cn(
                "transition-transform duration-500 group-hover:scale-105",
                isPlan ? "object-contain p-2 bg-white" : "object-cover"
              )}
            />
            <div className="absolute inset-0 bg-dark/0 group-hover:bg-dark/25 transition-colors grid place-items-center">
              <Expand
                size={20}
                className="text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow"
              />
            </div>
          </button>
        ))}
      </div>

      {lightbox !== null && shown[lightbox] && (
        <div className="fixed inset-0 z-[90] bg-dark/95 anim-fade flex flex-col">
          <div className="flex items-center justify-between px-4 py-3 text-white/70 text-sm">
            <span className="num">
              {lightbox + 1} / {shown.length} · {IMAGE_CATEGORY_LABELS[active] ?? active}
            </span>
            <button
              onClick={() => setLightbox(null)}
              aria-label="Kapat"
              className="h-10 w-10 rounded-full grid place-items-center hover:bg-white/10 transition-colors"
            >
              <X size={22} />
            </button>
          </div>

          <div className="relative flex-1 min-h-0" onClick={() => setLightbox(null)}>
            <Image
              src={shown[lightbox].url}
              alt={shown[lightbox].caption ?? ""}
              fill
              sizes="100vw"
              className="object-contain p-4"
            />
          </div>

          {shown.length > 1 && (
            <>
              <button
                onClick={prev}
                aria-label="Önceki"
                className="absolute left-2 sm:left-5 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full glass-dark text-white grid place-items-center hover:bg-white/15 transition-colors"
              >
                <ChevronLeft size={24} />
              </button>
              <button
                onClick={next}
                aria-label="Sonraki"
                className="absolute right-2 sm:right-5 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full glass-dark text-white grid place-items-center hover:bg-white/15 transition-colors"
              >
                <ChevronRight size={24} />
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
