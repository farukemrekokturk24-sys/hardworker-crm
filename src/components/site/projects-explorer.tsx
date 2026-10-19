"use client";

import { useMemo, useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { ProjectCard, type ProjectCardData } from "./project-card";
import { UnlockBanner } from "./price-gate";
import { EmptyState, inputClass } from "@/components/ui/primitives";
import { PROJECT_STATUS_LABELS } from "@/lib/constants";
import { cn } from "@/lib/utils";

const FILTERS = [
  { key: "ALL", label: "Tümü" },
  { key: "ONGOING", label: PROJECT_STATUS_LABELS.ONGOING },
  { key: "COMPLETED", label: PROJECT_STATUS_LABELS.COMPLETED },
  { key: "AVAILABLE", label: "Satışta Daire Var" },
];

export function ProjectsExplorer({ projects }: { projects: ProjectCardData[] }) {
  const [filter, setFilter] = useState("ALL");
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    return projects.filter((p) => {
      if (filter === "AVAILABLE" && p.availableUnits === 0) return false;
      if (filter !== "ALL" && filter !== "AVAILABLE" && p.status !== filter) return false;
      if (q) {
        const hay = `${p.name} ${p.tagline ?? ""} ${p.district ?? ""} ${p.city ?? ""}`.toLowerCase();
        if (!hay.includes(q.toLowerCase())) return false;
      }
      return true;
    });
  }, [projects, filter, q]);

  return (
    <div>
      <UnlockBanner className="mb-8" />

      <div className="flex flex-col lg:flex-row lg:items-center gap-4 mb-8">
        <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-1 px-1 lg:mx-0 lg:px-0">
          {FILTERS.map((f) => {
            const count =
              f.key === "ALL"
                ? projects.length
                : f.key === "AVAILABLE"
                  ? projects.filter((p) => p.availableUnits > 0).length
                  : projects.filter((p) => p.status === f.key).length;
            return (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={cn(
                  "shrink-0 inline-flex items-center gap-2 h-10 px-4 rounded-full text-sm font-semibold transition-all",
                  filter === f.key
                    ? "bg-brand text-white shadow-sm shadow-brand/25"
                    : "bg-surface border border-border text-ink-soft hover:border-brand/40 hover:text-ink"
                )}
              >
                {f.label}
                <span
                  className={cn(
                    "text-[0.6875rem] num font-bold px-1.5 py-0.5 rounded-full",
                    filter === f.key ? "bg-white/20" : "bg-surface-2"
                  )}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        <div className="relative lg:ml-auto lg:w-72">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Proje veya bölge ara..."
            className={cn(inputClass, "pl-10")}
            aria-label="Proje ara"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={<SlidersHorizontal size={24} />}
            title="Sonuç bulunamadı"
            description="Filtreleri değiştirerek tekrar deneyin."
          />
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p, i) => (
            <ProjectCard key={p.id} project={p} priority={i < 3} />
          ))}
        </div>
      )}
    </div>
  );
}
