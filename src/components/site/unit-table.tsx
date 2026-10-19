"use client";

import { useMemo, useState } from "react";
import { Layers, Check } from "lucide-react";
import { PriceCell, UnlockBanner } from "./price-gate";
import { Badge, EmptyState } from "@/components/ui/primitives";
import { UNIT_STATUS_LABELS, UNIT_STATUS_TONE, UNIT_STATUS_DOT } from "@/lib/constants";
import { formatPrice, formatArea, cn } from "@/lib/utils";

export type PublicUnit = {
  id: string;
  unitNo: string;
  type: string;
  definition: string | null;
  floor: string | null;
  grossArea: number | null;
  terraceArea: number | null;
  gardenArea: number | null;
  facing: string | null;
  /** Kilitliyken null — gerçek fiyat istemciye gönderilmez. */
  price: number | null;
  hasPrice: boolean;
  currency: string;
  status: string;
  blockName: string | null;
};

export function UnitTable({
  units,
  projectId,
  projectName,
}: {
  units: PublicUnit[];
  projectId: string;
  projectName: string;
}) {
  const blocks = useMemo(
    () => [...new Set(units.map((u) => u.blockName).filter(Boolean))] as string[],
    [units]
  );
  const types = useMemo(() => [...new Set(units.map((u) => u.type))], [units]);

  const [block, setBlock] = useState("ALL");
  const [type, setType] = useState("ALL");
  const [onlyAvailable, setOnlyAvailable] = useState(false);

  const filtered = useMemo(
    () =>
      units.filter((u) => {
        if (block !== "ALL" && u.blockName !== block) return false;
        if (type !== "ALL" && u.type !== type) return false;
        if (onlyAvailable && u.status !== "AVAILABLE") return false;
        return true;
      }),
    [units, block, type, onlyAvailable]
  );

  const available = units.filter((u) => u.status === "AVAILABLE").length;

  return (
    <div>
      <UnlockBanner projectId={projectId} projectName={projectName} className="mb-6" />

      {/* Filtreler */}
      <div className="flex flex-wrap items-center gap-2 mb-5 max-w-full">
        {blocks.length > 0 && (
          <div className="flex gap-1.5 overflow-x-auto no-scrollbar max-w-full">
            <FilterChip active={block === "ALL"} onClick={() => setBlock("ALL")}>
              Tüm Bloklar
            </FilterChip>
            {blocks.map((b) => (
              <FilterChip key={b} active={block === b} onClick={() => setBlock(b)}>
                {b} Blok
              </FilterChip>
            ))}
          </div>
        )}

        <div className="flex gap-1.5 overflow-x-auto no-scrollbar max-w-full">
          <FilterChip active={type === "ALL"} onClick={() => setType("ALL")}>
            Tüm Tipler
          </FilterChip>
          {types.map((t) => (
            <FilterChip key={t} active={type === t} onClick={() => setType(t)}>
              {t}
            </FilterChip>
          ))}
        </div>

        <button
          onClick={() => setOnlyAvailable((v) => !v)}
          className={cn(
            "ml-auto inline-flex items-center gap-2 h-9 px-3.5 rounded-full text-[0.8125rem] font-semibold transition-all shrink-0",
            onlyAvailable
              ? "bg-emerald-600 text-white"
              : "bg-surface border border-border text-ink-soft hover:border-emerald-400"
          )}
        >
          {onlyAvailable && <Check size={14} />}
          Sadece satıştakiler ({available})
        </button>
      </div>

      {filtered.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={<Layers size={24} />}
            title="Bu filtrelerde daire yok"
            description="Blok veya tip filtresini değiştirip tekrar deneyin."
          />
        </div>
      ) : (
        <>
          {/* Masaüstü tablo */}
          <div className="hidden md:block card overflow-hidden">
            <div className="overflow-x-auto thin-scroll">
              <table className="data-table">
                <thead>
                  <tr>
                    {blocks.length > 0 && <th>Blok</th>}
                    <th>Daire No</th>
                    <th>Tip</th>
                    <th>Kat</th>
                    <th>Brüt Alan</th>
                    <th>Bahçe / Teras</th>
                    {units.some((u) => u.facing) && <th>Cephe</th>}
                    <th>Durum</th>
                    <th className="text-right">Fiyat</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((u) => (
                    <tr key={u.id}>
                      {blocks.length > 0 && (
                        <td className="font-semibold">{u.blockName ?? "—"}</td>
                      )}
                      <td className="font-bold num text-ink">{u.unitNo}</td>
                      <td>
                        <span className="font-semibold">{u.type}</span>
                        {u.definition && u.definition !== "FLAT" && (
                          <span className="block text-[0.6875rem] text-muted font-medium">
                            {u.definition === "PENTHOUSE"
                              ? "Penthouse"
                              : u.definition === "LOFT PENTHOUSE"
                                ? "Loft Penthouse"
                                : u.definition}
                          </span>
                        )}
                      </td>
                      <td className="text-ink-soft">{u.floor ?? "—"}</td>
                      <td className="num">{formatArea(u.grossArea)}</td>
                      <td className="text-ink-soft text-[0.8125rem]">
                        {u.gardenArea
                          ? `Bahçe ${formatArea(u.gardenArea)}`
                          : u.terraceArea
                            ? `Teras ${formatArea(u.terraceArea)}`
                            : "—"}
                      </td>
                      {units.some((x) => x.facing) && (
                        <td className="text-ink-soft text-[0.8125rem]">{u.facing ?? "—"}</td>
                      )}
                      <td>
                        <Badge tone={UNIT_STATUS_TONE[u.status]} dot={UNIT_STATUS_DOT[u.status]}>
                          {UNIT_STATUS_LABELS[u.status]}
                        </Badge>
                      </td>
                      <td className="text-right">
                        {u.status === "SOLD" ? (
                          <span className="text-muted font-medium">Satıldı</span>
                        ) : u.hasPrice ? (
                          <PriceCell
                            price={u.price !== null ? formatPrice(u.price, u.currency) : null}
                            projectId={projectId}
                            unitId={u.id}
                            projectName={projectName}
                          />
                        ) : (
                          <span className="text-muted">Bilgi alın</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobil kart listesi */}
          <ul className="md:hidden space-y-2.5">
            {filtered.map((u) => (
              <li key={u.id} className="card p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-display font-bold text-ink">
                      {u.blockName ? `${u.blockName} Blok · ` : ""}
                      <span className="num">{u.unitNo}</span>
                    </p>
                    <p className="text-sm text-ink-soft mt-0.5">
                      {u.type}
                      {u.definition && u.definition !== "FLAT" && (
                        <span className="text-muted"> · {u.definition === "PENTHOUSE" ? "Penthouse" : "Loft"}</span>
                      )}
                    </p>
                  </div>
                  <Badge tone={UNIT_STATUS_TONE[u.status]} dot={UNIT_STATUS_DOT[u.status]}>
                    {UNIT_STATUS_LABELS[u.status]}
                  </Badge>
                </div>

                <dl className="grid grid-cols-3 gap-2 mt-3.5 pt-3.5 border-t border-border text-[0.8125rem]">
                  <div>
                    <dt className="text-[0.625rem] uppercase tracking-wider text-muted font-semibold">Kat</dt>
                    <dd className="font-medium text-ink-soft mt-0.5">{u.floor ?? "—"}</dd>
                  </div>
                  <div>
                    <dt className="text-[0.625rem] uppercase tracking-wider text-muted font-semibold">Alan</dt>
                    <dd className="font-medium text-ink-soft num mt-0.5">{formatArea(u.grossArea)}</dd>
                  </div>
                  <div>
                    <dt className="text-[0.625rem] uppercase tracking-wider text-muted font-semibold">
                      {u.gardenArea ? "Bahçe" : "Teras"}
                    </dt>
                    <dd className="font-medium text-ink-soft num mt-0.5">
                      {formatArea(u.gardenArea ?? u.terraceArea)}
                    </dd>
                  </div>
                </dl>

                <div className="mt-3.5 pt-3.5 border-t border-border flex items-center justify-between">
                  <span className="text-xs text-muted font-semibold uppercase tracking-wider">Fiyat</span>
                  {u.status === "SOLD" ? (
                    <span className="text-muted font-medium text-sm">Satıldı</span>
                  ) : u.hasPrice ? (
                    <PriceCell
                      price={u.price !== null ? formatPrice(u.price, u.currency) : null}
                      projectId={projectId}
                      unitId={u.id}
                      projectName={projectName}
                    />
                  ) : (
                    <span className="text-muted text-sm">Bilgi alın</span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "shrink-0 h-9 px-3.5 rounded-full text-[0.8125rem] font-semibold transition-all whitespace-nowrap",
        active
          ? "bg-ink text-white"
          : "bg-surface border border-border text-ink-soft hover:border-ink/25"
      )}
    >
      {children}
    </button>
  );
}
