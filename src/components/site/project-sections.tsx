"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export type SectionDef = { id: string; label: string };

/**
 * Proje sayfası bölüm gezintisi.
 * Sayfa kaydıkça aktif bölümü işaretler; tıklanınca o bölüme götürür.
 */
export function SectionNav({ sections }: { sections: SectionDef[] }) {
  const [active, setActive] = useState(sections[0]?.id ?? "");

  useEffect(() => {
    const els = sections
      .map((s) => document.getElementById(s.id))
      .filter((e): e is HTMLElement => Boolean(e));
    if (!els.length) return;

    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (visible) setActive(visible.target.id);
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
    );
    els.forEach((e) => io.observe(e));
    return () => io.disconnect();
  }, [sections]);

  return (
    <nav
      aria-label="Proje bölümleri"
      className="sticky top-[4.5rem] lg:top-[5.5rem] z-30 bg-surface/92 backdrop-blur-md border-b border-border"
    >
      <div className="container-x">
        <ul className="flex gap-1 overflow-x-auto no-scrollbar -mx-1 px-1">
          {sections.map((s) => (
            <li key={s.id}>
              <a
                href={`#${s.id}`}
                className={cn(
                  "inline-flex items-center h-12 px-4 text-[0.8125rem] font-semibold whitespace-nowrap border-b-2 -mb-px transition-colors",
                  active === s.id
                    ? "border-brand text-brand"
                    : "border-transparent text-muted hover:text-ink"
                )}
              >
                {s.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
