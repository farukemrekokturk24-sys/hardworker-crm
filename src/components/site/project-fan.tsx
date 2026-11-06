"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, ChevronLeft, ChevronRight } from "lucide-react";
import { SoldOutBadge } from "./sold-out";
import type { ProjectCardData } from "./project-card";
import { cn } from "@/lib/utils";

/**
 * Yelpaze kart karuseli.
 * Kartlar hafif dönük ve bindirmeli durur; scroll ile ortadaki öne çıkar.
 * Tüm kartlar aynı ölçüdedir.
 */
export function ProjectFan({ projects }: { projects: ProjectCardData[] }) {
  const track = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  // Ortaya en yakın kartı bul — öne çıkarmak için
  useEffect(() => {
    const el = track.current;
    if (!el) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const mid = el.scrollLeft + el.clientWidth / 2;
      let best = 0;
      let bestDist = Infinity;
      [...el.children].forEach((c, i) => {
        const node = c as HTMLElement;
        const center = node.offsetLeft + node.offsetWidth / 2;
        const d = Math.abs(center - mid);
        if (d < bestDist) {
          bestDist = d;
          best = i;
        }
      });
      setActive(best);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    el.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      el.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  const scrollBy = (dir: -1 | 1) => {
    const el = track.current;
    if (!el) return;
    const card = el.children[0] as HTMLElement | undefined;
    el.scrollBy({ left: dir * ((card?.offsetWidth ?? 320) + 20), behavior: "smooth" });
  };

  if (!projects.length) return null;

  return (
    <div className="relative mt-12">
      <div
        ref={track}
        className="fan-track px-[max(1.125rem,calc((100vw-1280px)/2+2.5rem))]"
      >
        {projects.map((p, i) => {
          const offset = i - active;
          const soldOut = p.totalUnits > 0 && p.availableUnits === 0;
          return (
            <article
              key={p.id}
              className="fan-card w-[270px] sm:w-[320px]"
              style={{
                transform: `rotate(${offset * 2.4}deg) translateY(${Math.abs(offset) * 14}px) scale(${
                  offset === 0 ? 1 : 0.95
                })`,
                zIndex: 10 - Math.abs(offset),
              }}
            >
              <Link
                href={`/projeler/${p.slug}`}
                className="group block overflow-hidden rounded-[var(--r-card)] bg-surface border border-border shadow-[0_18px_46px_-28px_rgb(10_14_20/0.4)]"
              >
                <div className="relative aspect-[3/4] overflow-hidden bg-surface-2">
                  {p.coverImage && (
                    <Image
                      src={p.coverImage}
                      alt={p.name}
                      fill
                      sizes="320px"
                      className="object-cover transition-transform duration-[900ms] group-hover:scale-110"
                    />
                  )}
                  <span className="absolute inset-0 bg-gradient-to-t from-dark/90 via-dark/15 to-transparent" />
                  {soldOut && <SoldOutBadge />}

                  <div className="absolute inset-x-0 bottom-0 p-5">
                    <p className="font-display font-bold text-white text-lg leading-tight">
                      {p.name}
                    </p>
                    <p className="text-white/70 text-xs mt-1">
                      {[p.district, p.city].filter(Boolean).join(", ")}
                    </p>
                    <p className="flex items-center gap-1.5 text-white text-[0.75rem] font-semibold mt-3">
                      {soldOut ? "Tamamı satıldı" : `${p.availableUnits} daire satışta`}
                      <ArrowUpRight
                        size={14}
                        className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                      />
                    </p>
                  </div>
                </div>
              </Link>
            </article>
          );
        })}
      </div>

      {/* Gezinme */}
      <div className="container-x">
        <div className="flex items-center justify-center gap-3 mt-2">
          <button
            onClick={() => scrollBy(-1)}
            aria-label="Önceki proje"
            className="h-12 w-12 rounded-full bg-brand text-white grid place-items-center hover:bg-brand-600 active:scale-95 transition-all"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={() => scrollBy(1)}
            aria-label="Sonraki proje"
            className="h-12 w-12 rounded-full bg-brand text-white grid place-items-center hover:bg-brand-600 active:scale-95 transition-all"
          >
            <ChevronRight size={20} />
          </button>

          <div className="flex items-center gap-1.5 ml-3">
            {projects.map((p, i) => (
              <span
                key={p.id}
                className={cn(
                  "h-1.5 rounded-full transition-all duration-300",
                  i === active ? "w-7 bg-brand" : "w-1.5 bg-border-strong"
                )}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
