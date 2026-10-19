"use client";

import { useMemo, useState, useTransition, useActionState } from "react";
import Link from "next/link";
import {
  Search, Pencil, X, Loader2, Check, Percent, Tags, Layers,
} from "lucide-react";
import { Card, Badge, EmptyState, Field, inputClass, selectClass, textareaClass } from "@/components/ui/primitives";
import { Button } from "@/components/ui/button";
import {
  updateUnit, bulkUpdateUnitStatus, bulkAdjustPrices, type ActionState,
} from "@/app/panel/(crm)/actions";
import { UNIT_STATUS_LABELS, UNIT_STATUS_TONE, UNIT_STATUS_DOT } from "@/lib/constants";
import { formatPrice, formatArea, cn } from "@/lib/utils";

export type UnitRow = {
  id: string;
  projectId: string;
  projectName: string;
  blockName: string | null;
  unitNo: string;
  type: string;
  definition: string | null;
  floor: string | null;
  grossArea: number | null;
  terraceArea: number | null;
  gardenArea: number | null;
  facing: string | null;
  price: number | null;
  currency: string;
  status: string;
  notes: string | null;
  dealRef: string | null;
  dealLeadId: string | null;
  dealLeadName: string | null;
};

export function UnitsManager({
  units,
  projects,
  canEdit,
}: {
  units: UnitRow[];
  projects: { id: string; name: string }[];
  canEdit: boolean;
}) {
  const [project, setProject] = useState("ALL");
  const [status, setStatus] = useState("ALL");
  const [type, setType] = useState("ALL");
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [editing, setEditing] = useState<UnitRow | null>(null);

  const types = useMemo(() => [...new Set(units.map((u) => u.type))], [units]);

  const filtered = useMemo(
    () =>
      units.filter((u) => {
        if (project !== "ALL" && u.projectId !== project) return false;
        if (status !== "ALL" && u.status !== status) return false;
        if (type !== "ALL" && u.type !== type) return false;
        if (q) {
          const hay = `${u.unitNo} ${u.blockName ?? ""} ${u.projectName} ${u.type} ${u.floor ?? ""}`.toLowerCase();
          if (!hay.includes(q.toLowerCase())) return false;
        }
        return true;
      }),
    [units, project, status, type, q]
  );

  const toggle = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const allSelected = filtered.length > 0 && filtered.every((u) => selected.has(u.id));

  const totalValue = filtered
    .filter((u) => u.status === "AVAILABLE" && u.price)
    .reduce((s, u) => s + (u.price ?? 0), 0);

  return (
    <div className="space-y-4">
      {/* Filtreler */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="relative lg:col-span-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Daire no, blok..."
            className={cn(inputClass, "pl-10")}
          />
        </div>
        <select value={project} onChange={(e) => setProject(e.target.value)} className={selectClass}>
          <option value="ALL">Tüm projeler</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className={selectClass}>
          <option value="ALL">Tüm durumlar</option>
          {Object.entries(UNIT_STATUS_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
        <select value={type} onChange={(e) => setType(e.target.value)} className={selectClass}>
          <option value="ALL">Tüm tipler</option>
          {types.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted">
          <strong className="text-ink num">{filtered.length}</strong> daire
          {totalValue > 0 && (
            <>
              {" · satıştaki portföy değeri "}
              <strong className="text-ink num">{formatPrice(totalValue)}</strong>
            </>
          )}
        </p>
      </div>

      {/* Toplu işlem çubuğu */}
      {canEdit && selected.size > 0 && (
        <BulkBar
          count={selected.size}
          ids={[...selected]}
          onDone={() => setSelected(new Set())}
        />
      )}

      {filtered.length === 0 ? (
        <Card>
          <EmptyState icon={<Layers size={22} />} title="Daire bulunamadı" />
        </Card>
      ) : (
        <>
          {/* Masaüstü tablo */}
          <Card className="hidden lg:block overflow-hidden">
            <div className="overflow-x-auto thin-scroll">
              <table className="data-table">
                <thead>
                  <tr>
                    {canEdit && (
                      <th className="w-10">
                        <input
                          type="checkbox"
                          checked={allSelected}
                          onChange={() =>
                            setSelected(
                              allSelected ? new Set() : new Set(filtered.map((u) => u.id))
                            )
                          }
                          className="h-4 w-4 rounded border-border-strong accent-[var(--brand)]"
                          aria-label="Tümünü seç"
                        />
                      </th>
                    )}
                    <th>Proje</th>
                    <th>Daire</th>
                    <th>Tip</th>
                    <th>Kat</th>
                    <th>Alan</th>
                    <th>Durum</th>
                    <th>Müşteri</th>
                    <th className="text-right">Fiyat</th>
                    {canEdit && <th className="w-12"></th>}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((u) => (
                    <tr key={u.id} className={selected.has(u.id) ? "bg-brand-50/50" : undefined}>
                      {canEdit && (
                        <td>
                          <input
                            type="checkbox"
                            checked={selected.has(u.id)}
                            onChange={() => toggle(u.id)}
                            className="h-4 w-4 rounded border-border-strong accent-[var(--brand)]"
                            aria-label={`${u.unitNo} seç`}
                          />
                        </td>
                      )}
                      <td className="text-ink-soft text-[0.8125rem]">{u.projectName}</td>
                      <td className="font-bold text-ink num">
                        {u.blockName ? `${u.blockName}${u.unitNo.replace(u.blockName, "")}` : u.unitNo}
                      </td>
                      <td>
                        <span className="font-semibold">{u.type}</span>
                        {u.definition && u.definition !== "FLAT" && (
                          <span className="block text-[0.6875rem] text-muted">
                            {u.definition}
                          </span>
                        )}
                      </td>
                      <td className="text-ink-soft text-[0.8125rem]">{u.floor ?? "—"}</td>
                      <td className="num text-[0.8125rem]">{formatArea(u.grossArea)}</td>
                      <td>
                        <Badge tone={UNIT_STATUS_TONE[u.status]} dot={UNIT_STATUS_DOT[u.status]}>
                          {UNIT_STATUS_LABELS[u.status]}
                        </Badge>
                      </td>
                      <td className="text-[0.8125rem]">
                        {u.dealLeadId ? (
                          <Link
                            href={`/panel/leadler/${u.dealLeadId}`}
                            className="text-brand hover:text-brand-600 font-medium"
                          >
                            {u.dealLeadName}
                          </Link>
                        ) : (
                          <span className="text-muted">—</span>
                        )}
                      </td>
                      <td className="text-right font-semibold num">
                        {u.price ? formatPrice(u.price, u.currency) : "—"}
                      </td>
                      {canEdit && (
                        <td>
                          <button
                            onClick={() => setEditing(u)}
                            aria-label="Düzenle"
                            className="h-8 w-8 rounded-lg grid place-items-center text-muted hover:text-brand hover:bg-brand-50 transition-colors"
                          >
                            <Pencil size={15} />
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Mobil kartlar */}
          <ul className="lg:hidden space-y-2.5">
            {filtered.map((u) => (
              <li key={u.id} className="card p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-display font-bold text-ink">
                      {u.blockName ? `${u.blockName} Blok · ` : ""}
                      <span className="num">{u.unitNo}</span>
                    </p>
                    <p className="text-xs text-muted mt-0.5">
                      {u.projectName} · {u.type} · {u.floor ?? "—"}
                    </p>
                  </div>
                  <Badge tone={UNIT_STATUS_TONE[u.status]} dot={UNIT_STATUS_DOT[u.status]}>
                    {UNIT_STATUS_LABELS[u.status]}
                  </Badge>
                </div>

                <div className="flex items-center justify-between mt-3.5 pt-3.5 border-t border-border">
                  <span className="text-sm text-muted num">{formatArea(u.grossArea)}</span>
                  <span className="font-display font-bold text-ink num">
                    {u.price ? formatPrice(u.price, u.currency) : "—"}
                  </span>
                  {canEdit && (
                    <button
                      onClick={() => setEditing(u)}
                      className="h-8 w-8 rounded-lg grid place-items-center text-muted hover:text-brand"
                      aria-label="Düzenle"
                    >
                      <Pencil size={15} />
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </>
      )}

      {editing && <EditUnitModal unit={editing} onClose={() => setEditing(null)} />}
    </div>
  );
}

/* ---------------------------------------------------------- Toplu işlem */

function BulkBar({
  count,
  ids,
  onDone,
}: {
  count: number;
  ids: string[];
  onDone: () => void;
}) {
  const [pending, start] = useTransition();
  const [percent, setPercent] = useState("");

  return (
    <div className="card p-4 flex flex-col sm:flex-row sm:items-center gap-3 border-brand/30 bg-brand-50/40">
      <p className="text-sm font-semibold text-ink shrink-0">
        <span className="num">{count}</span> daire seçildi
      </p>

      <div className="flex flex-wrap items-center gap-2 sm:ml-auto">
        <select
          defaultValue=""
          disabled={pending}
          onChange={(e) => {
            const v = e.target.value;
            if (!v) return;
            start(async () => {
              await bulkUpdateUnitStatus(ids, v);
              onDone();
            });
          }}
          className={cn(selectClass, "!h-9 !w-auto min-w-[150px] text-[0.8125rem]")}
        >
          <option value="">Durum değiştir...</option>
          {Object.entries(UNIT_STATUS_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>

        <div className="flex items-center gap-1.5">
          <div className="relative">
            <Percent size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted" />
            <input
              value={percent}
              onChange={(e) => setPercent(e.target.value)}
              type="number"
              step="0.5"
              placeholder="5 / -3"
              className={cn(inputClass, "!h-9 !w-28 pl-7 text-[0.8125rem]")}
            />
          </div>
          <Button
            size="sm"
            variant="outline"
            disabled={pending || !percent}
            onClick={() =>
              start(async () => {
                await bulkAdjustPrices(ids, Number(percent));
                setPercent("");
                onDone();
              })
            }
          >
            {pending ? <Loader2 size={14} className="animate-spin" /> : <Tags size={14} />}
            Fiyat güncelle
          </Button>
        </div>

        <Button size="sm" variant="ghost" onClick={onDone}>
          <X size={14} /> Seçimi temizle
        </Button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------ Düzenleme */

function EditUnitModal({ unit, onClose }: { unit: UnitRow; onClose: () => void }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(updateUnit, {});

  if (state.ok) {
    setTimeout(onClose, 300);
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-dark/50 backdrop-blur-sm anim-fade" onClick={onClose} />
      <div className="relative w-full sm:max-w-md card rounded-t-3xl sm:rounded-2xl anim-slide-up sm:anim-scale safe-b">
        <div className="flex items-start justify-between gap-3 px-5 py-4 border-b border-border">
          <div>
            <h3 className="font-bold text-ink">
              {unit.blockName ? `${unit.blockName} Blok · ` : ""}
              <span className="num">{unit.unitNo}</span>
            </h3>
            <p className="text-sm text-muted mt-0.5">
              {unit.projectName} · {unit.type} · {formatArea(unit.grossArea)}
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Kapat"
            className="h-9 w-9 rounded-lg grid place-items-center text-muted hover:text-ink hover:bg-surface-2 transition-colors shrink-0"
          >
            <X size={18} />
          </button>
        </div>

        <form action={action} className="p-5 space-y-4">
          <input type="hidden" name="id" value={unit.id} />

          <Field label={`Fiyat (${unit.currency})`}>
            <input
              name="price"
              type="number"
              min={0}
              step={100}
              defaultValue={unit.price ?? ""}
              placeholder="Boş bırakılırsa fiyat gösterilmez"
              className={inputClass}
            />
          </Field>

          <Field label="Durum">
            <select name="status" defaultValue={unit.status} className={selectClass}>
              {Object.entries(UNIT_STATUS_LABELS).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </Field>

          <Field label="İç not" hint="Sadece panelde görünür.">
            <textarea
              name="notes"
              rows={2}
              defaultValue={unit.notes ?? ""}
              className={textareaClass}
            />
          </Field>

          {unit.dealRef && (
            <p className="text-xs text-muted bg-surface-2 rounded-lg px-3 py-2">
              Bu daire <strong className="text-ink-soft num">{unit.dealRef}</strong> kaydına
              bağlı. Durumu satış ekranından yönetmek daha doğrudur.
            </p>
          )}

          {state.error && <p className="text-sm text-rose-600 font-medium">{state.error}</p>}

          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="ghost" onClick={onClose}>Vazgeç</Button>
            <Button type="submit" disabled={pending}>
              {pending ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
              Kaydet
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
