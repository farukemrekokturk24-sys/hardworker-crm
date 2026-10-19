"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import {
  Search, LayoutList, Columns3, Phone, Flame, ChevronDown,
  Eye, CalendarDays, MessageSquare, SlidersHorizontal, X,
} from "lucide-react";
import { Badge, EmptyState, Avatar, inputClass, selectClass } from "@/components/ui/primitives";
import { updateLeadStatus, assignLead } from "@/app/panel/(crm)/actions";
import {
  LEAD_STATUSES, LEAD_STATUS_LABELS, LEAD_STATUS_COLORS, LEAD_SOURCE_LABELS,
  LEAD_TEMP_LABELS, LEAD_TEMP_TONE, KANBAN_COLUMNS, LEAD_SOURCES,
} from "@/lib/constants";
import { prettyPhone, timeAgo, formatPrice, avatarTone, cn } from "@/lib/utils";

export type LeadRow = {
  id: string;
  refNo: string;
  name: string;
  phone: string;
  email: string | null;
  country: string | null;
  source: string;
  status: string;
  temp: string;
  score: number;
  budgetMin: number | null;
  budgetMax: number | null;
  purpose: string | null;
  createdAt: string;
  lastActivityAt: string;
  projectName: string | null;
  assignedToId: string | null;
  assignedToName: string | null;
  activityCount: number;
  appointmentCount: number;
  viewCount: number;
};

export function LeadsView({
  leads,
  users,
  projects,
  initialStatus,
  initialQuery,
  initialView,
  canAssign,
}: {
  leads: LeadRow[];
  users: { id: string; name: string; role: string }[];
  projects: { id: string; name: string }[];
  initialStatus?: string;
  initialQuery?: string;
  initialView: "list" | "kanban";
  canAssign: boolean;
}) {
  const [view, setView] = useState<"list" | "kanban">(initialView);
  const [q, setQ] = useState(initialQuery ?? "");
  const [status, setStatus] = useState(initialStatus ?? "ALL");
  const [temp, setTemp] = useState("ALL");
  const [source, setSource] = useState("ALL");
  const [assigned, setAssigned] = useState("ALL");
  const [showFilters, setShowFilters] = useState(false);

  const filtered = useMemo(() => {
    return leads.filter((l) => {
      if (status !== "ALL" && l.status !== status) return false;
      if (temp !== "ALL" && l.temp !== temp) return false;
      if (source !== "ALL" && l.source !== source) return false;
      if (assigned === "NONE" && l.assignedToId) return false;
      if (assigned !== "ALL" && assigned !== "NONE" && l.assignedToId !== assigned) return false;
      if (q) {
        const hay = `${l.name} ${l.phone} ${l.email ?? ""} ${l.refNo} ${l.projectName ?? ""}`.toLowerCase();
        if (!hay.includes(q.toLowerCase())) return false;
      }
      return true;
    });
  }, [leads, status, temp, source, assigned, q]);

  const activeFilters =
    (status !== "ALL" ? 1 : 0) + (temp !== "ALL" ? 1 : 0) +
    (source !== "ALL" ? 1 : 0) + (assigned !== "ALL" ? 1 : 0);

  return (
    <div className="space-y-4">
      {/* Araç çubuğu */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="İsim, telefon, e-posta veya referans no ara..."
            className={cn(inputClass, "pl-10")}
          />
        </div>

        <button
          onClick={() => setShowFilters((v) => !v)}
          className={cn(
            "inline-flex items-center gap-2 h-11 px-4 rounded-xl text-sm font-semibold border transition-colors shrink-0",
            activeFilters > 0 || showFilters
              ? "border-brand bg-brand-50 text-brand"
              : "border-border bg-surface text-ink-soft hover:border-brand/40"
          )}
        >
          <SlidersHorizontal size={16} />
          Filtreler
          {activeFilters > 0 && (
            <span className="num text-[0.6875rem] font-bold bg-brand text-white px-1.5 rounded-full">
              {activeFilters}
            </span>
          )}
        </button>

        <div className="flex rounded-xl border border-border bg-surface p-1 shrink-0">
          {[
            { v: "list" as const, icon: LayoutList, label: "Liste" },
            { v: "kanban" as const, icon: Columns3, label: "Kanban" },
          ].map((opt) => (
            <button
              key={opt.v}
              onClick={() => setView(opt.v)}
              className={cn(
                "inline-flex items-center gap-1.5 h-9 px-3 rounded-lg text-[0.8125rem] font-semibold transition-colors",
                view === opt.v ? "bg-ink text-white" : "text-ink-soft hover:bg-surface-2"
              )}
            >
              <opt.icon size={15} />
              <span className="hidden sm:inline">{opt.label}</span>
            </button>
          ))}
        </div>
      </div>

      {showFilters && (
        <div className="card p-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4 anim-fade">
          <select value={status} onChange={(e) => setStatus(e.target.value)} className={selectClass}>
            <option value="ALL">Tüm durumlar</option>
            {LEAD_STATUSES.map((s) => (
              <option key={s.key} value={s.key}>{s.label}</option>
            ))}
          </select>
          <select value={temp} onChange={(e) => setTemp(e.target.value)} className={selectClass}>
            <option value="ALL">Tüm sıcaklıklar</option>
            {Object.entries(LEAD_TEMP_LABELS).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
          <select value={source} onChange={(e) => setSource(e.target.value)} className={selectClass}>
            <option value="ALL">Tüm kaynaklar</option>
            {LEAD_SOURCES.map((s) => (
              <option key={s.key} value={s.key}>{s.label}</option>
            ))}
          </select>
          <select value={assigned} onChange={(e) => setAssigned(e.target.value)} className={selectClass}>
            <option value="ALL">Tüm sorumlular</option>
            <option value="NONE">Atanmamış</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>{u.name}</option>
            ))}
          </select>
          {activeFilters > 0 && (
            <button
              onClick={() => { setStatus("ALL"); setTemp("ALL"); setSource("ALL"); setAssigned("ALL"); }}
              className="sm:col-span-2 lg:col-span-4 inline-flex items-center justify-center gap-1.5 text-sm font-semibold text-muted hover:text-ink h-9"
            >
              <X size={14} /> Filtreleri temizle
            </button>
          )}
        </div>
      )}

      <p className="text-sm text-muted">
        <strong className="text-ink num">{filtered.length}</strong> lead gösteriliyor
      </p>

      {filtered.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={<Search size={22} />}
            title="Sonuç bulunamadı"
            description="Arama veya filtreleri değiştirerek tekrar deneyin."
          />
        </div>
      ) : view === "list" ? (
        <LeadList leads={filtered} users={users} canAssign={canAssign} />
      ) : (
        <LeadKanban leads={filtered} />
      )}
    </div>
  );
}

/* ---------------------------------------------------------------- Liste */

function LeadList({
  leads,
  users,
  canAssign,
}: {
  leads: LeadRow[];
  users: { id: string; name: string }[];
  canAssign: boolean;
}) {
  return (
    <>
      {/* Masaüstü */}
      <div className="hidden lg:block card overflow-hidden">
        <div className="overflow-x-auto thin-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th>Lead</th>
                <th>Kaynak</th>
                <th>Proje</th>
                <th>Bütçe</th>
                <th>Durum</th>
                <th>Sorumlu</th>
                <th>Etkileşim</th>
                <th>Son hareket</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((l) => (
                <tr key={l.id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <Avatar name={l.name} size="sm" tone={avatarTone(l.id)} />
                      <div className="min-w-0">
                        <Link
                          href={`/panel/leadler/${l.id}`}
                          className="font-semibold text-ink hover:text-brand transition-colors block truncate"
                        >
                          {l.name}
                        </Link>
                        <a
                          href={`tel:${l.phone}`}
                          className="text-xs text-muted num hover:text-brand transition-colors"
                        >
                          {prettyPhone(l.phone)}
                        </a>
                      </div>
                      {l.temp === "HOT" && (
                        <Flame size={14} className="text-rose-500 shrink-0" />
                      )}
                    </div>
                  </td>
                  <td className="text-ink-soft text-[0.8125rem]">
                    {LEAD_SOURCE_LABELS[l.source] ?? l.source}
                    {l.country && (
                      <span className="block text-[0.6875rem] text-muted">{l.country}</span>
                    )}
                  </td>
                  <td className="text-ink-soft text-[0.8125rem]">{l.projectName ?? "—"}</td>
                  <td className="text-[0.8125rem] num text-ink-soft">
                    {l.budgetMax ? formatPrice(l.budgetMax) : "—"}
                  </td>
                  <td>
                    <StatusSelect leadId={l.id} value={l.status} />
                  </td>
                  <td>
                    {canAssign ? (
                      <AssignSelect leadId={l.id} value={l.assignedToId} users={users} />
                    ) : (
                      <span className="text-[0.8125rem] text-ink-soft">
                        {l.assignedToName ?? "—"}
                      </span>
                    )}
                  </td>
                  <td>
                    <div className="flex items-center gap-2.5 text-muted">
                      <span className="inline-flex items-center gap-1 text-[0.75rem]" title="Aktivite">
                        <MessageSquare size={12} /> <span className="num">{l.activityCount}</span>
                      </span>
                      <span className="inline-flex items-center gap-1 text-[0.75rem]" title="Randevu">
                        <CalendarDays size={12} /> <span className="num">{l.appointmentCount}</span>
                      </span>
                      <span className="inline-flex items-center gap-1 text-[0.75rem]" title="Sitede görüntüleme">
                        <Eye size={12} /> <span className="num">{l.viewCount}</span>
                      </span>
                    </div>
                  </td>
                  <td className="text-[0.75rem] text-muted whitespace-nowrap">
                    {timeAgo(l.lastActivityAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobil */}
      <ul className="lg:hidden space-y-2.5">
        {leads.map((l) => (
          <li key={l.id} className="card p-4">
            <div className="flex items-start gap-3">
              <Avatar name={l.name} tone={avatarTone(l.id)} />
              <div className="min-w-0 flex-1">
                <Link
                  href={`/panel/leadler/${l.id}`}
                  className="font-semibold text-ink hover:text-brand transition-colors flex items-center gap-1.5"
                >
                  {l.name}
                  {l.temp === "HOT" && <Flame size={14} className="text-rose-500" />}
                </Link>
                <p className="text-xs text-muted mt-0.5">
                  {LEAD_SOURCE_LABELS[l.source] ?? l.source}
                  {l.projectName && ` · ${l.projectName}`}
                </p>
              </div>
              <a
                href={`tel:${l.phone}`}
                aria-label="Ara"
                className="h-9 w-9 rounded-lg grid place-items-center text-brand bg-brand-50 shrink-0"
              >
                <Phone size={16} />
              </a>
            </div>

            <div className="flex flex-wrap items-center gap-2 mt-3.5 pt-3.5 border-t border-border">
              <Badge
                tone="ring-transparent text-white"
                className="!text-white"
                dot=""
              >
                <span
                  className="inline-block h-2 w-2 rounded-full"
                  style={{ background: LEAD_STATUS_COLORS[l.status] }}
                />
                <span style={{ color: LEAD_STATUS_COLORS[l.status] }}>
                  {LEAD_STATUS_LABELS[l.status]}
                </span>
              </Badge>
              <Badge tone={LEAD_TEMP_TONE[l.temp]}>{LEAD_TEMP_LABELS[l.temp]}</Badge>
              <span className="ml-auto text-[0.6875rem] text-muted">
                {timeAgo(l.lastActivityAt)}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}

/* --------------------------------------------------------------- Kanban */

function LeadKanban({ leads }: { leads: LeadRow[] }) {
  return (
    <div className="flex gap-3.5 overflow-x-auto thin-scroll pb-3 -mx-4 px-4 sm:mx-0 sm:px-0 max-w-[100vw] sm:max-w-full">
      {KANBAN_COLUMNS.map((col) => {
        const items = leads.filter((l) => l.status === col);
        const color = LEAD_STATUS_COLORS[col];
        return (
          <div key={col} className="shrink-0 w-[272px] flex flex-col">
            <div className="flex items-center gap-2 px-1 pb-2.5">
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: color }} />
              <h3 className="font-bold text-sm text-ink">{LEAD_STATUS_LABELS[col]}</h3>
              <span className="ml-auto num text-[0.6875rem] font-bold text-muted bg-surface-2 px-1.5 py-0.5 rounded-full">
                {items.length}
              </span>
            </div>

            <div className="flex-1 space-y-2 rounded-2xl bg-surface-2/60 p-2 min-h-[160px]">
              {items.length === 0 ? (
                <p className="text-xs text-muted text-center py-7">Kayıt yok</p>
              ) : (
                items.map((l) => (
                  <Link
                    key={l.id}
                    href={`/panel/leadler/${l.id}`}
                    className="block card p-3 hover:border-brand/40 hover:shadow-sm transition-all"
                  >
                    <div className="flex items-start gap-2">
                      <Avatar name={l.name} size="xs" tone={avatarTone(l.id)} />
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-ink text-[0.8125rem] truncate flex items-center gap-1">
                          {l.name}
                          {l.temp === "HOT" && (
                            <Flame size={11} className="text-rose-500 shrink-0" />
                          )}
                        </p>
                        <p className="text-[0.6875rem] text-muted num">
                          {prettyPhone(l.phone)}
                        </p>
                      </div>
                    </div>

                    {(l.projectName || l.budgetMax) && (
                      <p className="text-[0.6875rem] text-muted mt-2 truncate">
                        {l.projectName}
                        {l.projectName && l.budgetMax && " · "}
                        {l.budgetMax && formatPrice(l.budgetMax)}
                      </p>
                    )}

                    <div className="flex items-center justify-between mt-2.5 pt-2.5 border-t border-border">
                      <span className="text-[0.625rem] text-muted truncate">
                        {l.assignedToName ?? "Atanmadı"}
                      </span>
                      <span className="text-[0.625rem] text-muted shrink-0">
                        {timeAgo(l.lastActivityAt)}
                      </span>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* --------------------------------------------------------------- Seçici */

function StatusSelect({ leadId, value }: { leadId: string; value: string }) {
  const [pending, start] = useTransition();
  const [v, setV] = useState(value);

  return (
    <div className="relative inline-flex items-center">
      <select
        value={v}
        disabled={pending}
        onChange={(e) => {
          const next = e.target.value;
          setV(next);
          start(() => { updateLeadStatus(leadId, next); });
        }}
        className="appearance-none h-7 pl-5 pr-6 rounded-full text-[0.6875rem] font-bold cursor-pointer border-0 focus:ring-2 focus:ring-brand/30 focus:outline-none disabled:opacity-60"
        style={{
          background: `${LEAD_STATUS_COLORS[v]}1a`,
          color: LEAD_STATUS_COLORS[v],
        }}
      >
        {LEAD_STATUSES.map((s) => (
          <option key={s.key} value={s.key} className="bg-surface text-ink">
            {s.label}
          </option>
        ))}
      </select>
      <span
        className="pointer-events-none absolute left-2 h-1.5 w-1.5 rounded-full"
        style={{ background: LEAD_STATUS_COLORS[v] }}
      />
      <ChevronDown
        size={11}
        className="pointer-events-none absolute right-1.5"
        style={{ color: LEAD_STATUS_COLORS[v] }}
      />
    </div>
  );
}

function AssignSelect({
  leadId,
  value,
  users,
}: {
  leadId: string;
  value: string | null;
  users: { id: string; name: string }[];
}) {
  const [pending, start] = useTransition();
  const [v, setV] = useState(value ?? "");

  return (
    <select
      value={v}
      disabled={pending}
      onChange={(e) => {
        const next = e.target.value;
        setV(next);
        start(() => { assignLead(leadId, next || null); });
      }}
      className="h-8 rounded-lg border border-border bg-surface px-2 text-[0.8125rem] text-ink-soft focus:border-brand focus:outline-none disabled:opacity-60 max-w-[140px]"
    >
      <option value="">Atanmadı</option>
      {users.map((u) => (
        <option key={u.id} value={u.id}>{u.name}</option>
      ))}
    </select>
  );
}
