"use client";

import { useActionState, useState, useTransition, useEffect } from "react";
import Link from "next/link";
import {
  Phone, MessageSquare, Mail, Users as UsersIcon, CalendarDays, Handshake,
  Eye, History, StickyNote, Plus, Loader2, Check, Flame, Lock,
} from "lucide-react";
import { Card, CardHeader, Badge, EmptyState, Field, inputClass, textareaClass, selectClass } from "@/components/ui/primitives";
import { Button } from "@/components/ui/button";
import {
  addLeadNote, addLeadActivity, assignLead, updateLeadTemp,
  createAppointment, createDeal, type ActionState,
} from "@/app/panel/(crm)/actions";
import {
  ACTIVITY_TYPES, ACTIVITY_TYPE_LABELS, APPOINTMENT_TYPE_LABELS,
  APPOINTMENT_STATUS_LABELS, DEAL_STATUS_LABELS, DEAL_STATUS_TONE,
  LEAD_STATUS_LABELS, LEAD_TEMP_LABELS,
} from "@/lib/constants";
import { formatDateTime, timeAgo, formatPrice, cn } from "@/lib/utils";

type Note = { id: string; body: string; userName: string; createdAt: string };
type Activity = {
  id: string; type: string; title: string; detail: string | null;
  outcome: string | null; userName: string; occurredAt: string;
};
type StatusEntry = {
  id: string; fromStatus: string | null; toStatus: string;
  userName: string; createdAt: string;
};
type Appt = {
  id: string; type: string; status: string; startsAt: string;
  location: string | null; notes: string | null;
  projectName: string | null; userName: string | null;
};
type DealRow = {
  id: string; refNo: string; status: string;
  agreedPrice: number; currency: string; unitLabel: string;
};
type ViewRow = {
  id: string; action: string; projectName: string | null;
  unitLabel: string | null; createdAt: string;
};
type ProjectOpt = {
  id: string; name: string;
  units: { id: string; label: string; price: number | null; status: string }[];
};

const TABS = [
  { key: "timeline", label: "Zaman Çizelgesi", icon: History },
  { key: "notes", label: "Notlar", icon: StickyNote },
  { key: "appointments", label: "Randevular", icon: CalendarDays },
  { key: "deals", label: "Satış", icon: Handshake },
  { key: "views", label: "Site Hareketleri", icon: Eye },
] as const;

export function LeadDetail({
  lead, notes, activities, statusHistory, appointments, deals, views,
  users, projects, canAssign,
}: {
  lead: {
    id: string; name: string; status: string; temp: string;
    assignedToId: string | null; message: string | null;
    projectId: string | null; utmSource: string | null;
    utmCampaign: string | null; referrer: string | null;
  };
  notes: Note[];
  activities: Activity[];
  statusHistory: StatusEntry[];
  appointments: Appt[];
  deals: DealRow[];
  views: ViewRow[];
  users: { id: string; name: string }[];
  projects: ProjectOpt[];
  canAssign: boolean;
}) {
  const [tab, setTab] = useState<(typeof TABS)[number]["key"]>("timeline");

  const counts: Record<string, number> = {
    timeline: activities.length + statusHistory.length,
    notes: notes.length,
    appointments: appointments.length,
    deals: deals.length,
    views: views.length,
  };

  return (
    <div className="grid lg:grid-cols-3 gap-5">
      <div className="lg:col-span-2 min-w-0 space-y-4">
        {/* Hızlı aksiyon */}
        <Card>
          <CardHeader title="Etkileşim kaydet" subtitle="Görüşme sonrası not düşün" />
          <div className="p-5">
            <ActivityForm leadId={lead.id} />
          </div>
        </Card>

        {/* Sekmeler */}
        <Card>
          <div className="flex gap-1 overflow-x-auto no-scrollbar border-b border-border px-2">
            {TABS.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={cn(
                  "shrink-0 inline-flex items-center gap-2 px-3.5 h-12 text-[0.8125rem] font-semibold border-b-2 -mb-px transition-colors",
                  tab === t.key
                    ? "border-brand text-brand"
                    : "border-transparent text-muted hover:text-ink"
                )}
              >
                <t.icon size={15} />
                {t.label}
                {counts[t.key] > 0 && (
                  <span className="num text-[0.625rem] font-bold bg-surface-2 text-muted px-1.5 rounded-full">
                    {counts[t.key]}
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="p-5">
            {tab === "timeline" && (
              <Timeline activities={activities} statusHistory={statusHistory} />
            )}
            {tab === "notes" && <Notes leadId={lead.id} notes={notes} />}
            {tab === "appointments" && (
              <Appointments
                leadId={lead.id}
                appointments={appointments}
                projects={projects}
                users={users}
              />
            )}
            {tab === "deals" && (
              <Deals leadId={lead.id} deals={deals} projects={projects} />
            )}
            {tab === "views" && <Views views={views} />}
          </div>
        </Card>
      </div>

      {/* Yan panel */}
      <aside className="min-w-0 space-y-4">
        <Card>
          <CardHeader title="Atama ve öncelik" />
          <div className="p-5 space-y-4">
            {canAssign && (
              <Field label="Sorumlu danışman">
                <AssignControl leadId={lead.id} value={lead.assignedToId} users={users} />
              </Field>
            )}
            <Field label="Sıcaklık">
              <TempControl leadId={lead.id} value={lead.temp} />
            </Field>
          </div>
        </Card>

        {lead.message && (
          <Card>
            <CardHeader title="Müşteri mesajı" />
            <p className="px-5 py-4 text-sm text-ink-soft leading-relaxed whitespace-pre-line">
              {lead.message}
            </p>
          </Card>
        )}

        {(lead.utmSource || lead.utmCampaign || lead.referrer) && (
          <Card>
            <CardHeader title="Pazarlama kaynağı" />
            <dl className="px-5 py-4 space-y-2.5 text-sm">
              {lead.utmSource && (
                <div className="flex justify-between gap-3">
                  <dt className="text-muted">UTM kaynak</dt>
                  <dd className="font-medium text-ink truncate">{lead.utmSource}</dd>
                </div>
              )}
              {lead.utmCampaign && (
                <div className="flex justify-between gap-3">
                  <dt className="text-muted">Kampanya</dt>
                  <dd className="font-medium text-ink truncate">{lead.utmCampaign}</dd>
                </div>
              )}
              {lead.referrer && (
                <div className="flex justify-between gap-3">
                  <dt className="text-muted">Yönlendiren</dt>
                  <dd className="font-medium text-ink truncate max-w-[55%]">{lead.referrer}</dd>
                </div>
              )}
            </dl>
          </Card>
        )}
      </aside>
    </div>
  );
}

/* ------------------------------------------------------- Etkileşim formu */

function ActivityForm({ leadId }: { leadId: string }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(
    addLeadActivity,
    {}
  );
  const [type, setType] = useState("CALL");

  return (
    <form action={action} key={state.ok ? "reset" : "form"} className="space-y-3">
      <input type="hidden" name="leadId" value={leadId} />

      <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
        {ACTIVITY_TYPES.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setType(t.key)}
            className={cn(
              "shrink-0 h-9 px-3.5 rounded-full text-[0.8125rem] font-semibold transition-all",
              type === t.key
                ? "bg-brand text-white"
                : "bg-surface-2 text-ink-soft hover:bg-surface-3"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>
      <input type="hidden" name="type" value={type} />

      <input
        name="title"
        required
        placeholder="Ne oldu? (ör. Fiyat listesi gönderildi)"
        className={inputClass}
      />
      <textarea
        name="detail"
        rows={2}
        placeholder="Detay (opsiyonel)"
        className={textareaClass}
      />

      <div className="flex flex-col sm:flex-row gap-3">
        <select name="outcome" className={cn(selectClass, "sm:max-w-[220px]")} defaultValue="">
          <option value="">Sonuç seçin</option>
          <option value="ULASILDI">Ulaşıldı</option>
          <option value="ULASILAMADI">Ulaşılamadı</option>
          <option value="MESGUL">Meşgul / sonra arayacak</option>
          <option value="ILGILENMIYOR">İlgilenmiyor</option>
        </select>
        <Button type="submit" disabled={pending} className="sm:ml-auto">
          {pending ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
          Kaydet
        </Button>
      </div>

      {state.error && <p className="text-xs text-rose-600 font-medium">{state.error}</p>}
    </form>
  );
}

/* ------------------------------------------------------- Zaman çizelgesi */

const ACTIVITY_ICON: Record<string, typeof Phone> = {
  CALL: Phone,
  WHATSAPP: MessageSquare,
  EMAIL: Mail,
  MEETING: UsersIcon,
  VIEWING: CalendarDays,
  NOTE: StickyNote,
  SYSTEM: History,
};

function Timeline({
  activities,
  statusHistory,
}: {
  activities: Activity[];
  statusHistory: StatusEntry[];
}) {
  const merged = [
    ...activities.map((a) => ({ kind: "activity" as const, at: a.occurredAt, data: a })),
    ...statusHistory.map((h) => ({ kind: "status" as const, at: h.createdAt, data: h })),
  ].sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());

  if (!merged.length) {
    return <EmptyState icon={<History size={22} />} title="Henüz hareket yok" />;
  }

  return (
    <ol className="relative space-y-5 pl-7">
      <span className="absolute left-[11px] top-2 bottom-2 w-px bg-border" />
      {merged.map((item) => {
        if (item.kind === "status") {
          const h = item.data;
          return (
            <li key={h.id} className="relative">
              <span className="absolute -left-7 top-0.5 h-[23px] w-[23px] rounded-full bg-surface-2 border-2 border-surface grid place-items-center">
                <History size={11} className="text-muted" />
              </span>
              <p className="text-sm text-ink-soft">
                Durum{" "}
                {h.fromStatus && (
                  <>
                    <strong className="text-ink">{LEAD_STATUS_LABELS[h.fromStatus]}</strong>{" "}
                    →{" "}
                  </>
                )}
                <strong className="text-ink">{LEAD_STATUS_LABELS[h.toStatus]}</strong>
              </p>
              <p className="text-[0.6875rem] text-muted mt-0.5">
                {h.userName} · {formatDateTime(h.createdAt)}
              </p>
            </li>
          );
        }

        const a = item.data;
        const Icon = ACTIVITY_ICON[a.type] ?? History;
        return (
          <li key={a.id} className="relative">
            <span className="absolute -left-7 top-0.5 h-[23px] w-[23px] rounded-full bg-brand-50 border-2 border-surface grid place-items-center">
              <Icon size={11} className="text-brand" />
            </span>
            <div className="flex items-start justify-between gap-3">
              <p className="font-semibold text-ink text-sm">{a.title}</p>
              {a.outcome && (
                <Badge
                  tone={
                    a.outcome === "ULASILDI"
                      ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
                      : a.outcome === "ILGILENMIYOR"
                        ? "bg-rose-50 text-rose-700 ring-rose-200"
                        : "bg-amber-50 text-amber-700 ring-amber-200"
                  }
                >
                  {a.outcome === "ULASILDI"
                    ? "Ulaşıldı"
                    : a.outcome === "ULASILAMADI"
                      ? "Ulaşılamadı"
                      : a.outcome === "MESGUL"
                        ? "Meşgul"
                        : "İlgilenmiyor"}
                </Badge>
              )}
            </div>
            {a.detail && (
              <p className="text-sm text-ink-soft mt-1 leading-relaxed whitespace-pre-line">
                {a.detail}
              </p>
            )}
            <p className="text-[0.6875rem] text-muted mt-1">
              {ACTIVITY_TYPE_LABELS[a.type] ?? a.type} · {a.userName} ·{" "}
              {timeAgo(a.occurredAt)}
            </p>
          </li>
        );
      })}
    </ol>
  );
}

/* ---------------------------------------------------------------- Notlar */

function Notes({ leadId, notes }: { leadId: string; notes: Note[] }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(addLeadNote, {});

  return (
    <div className="space-y-5">
      <form action={action} key={state.ok ? "reset" : "form"} className="space-y-2.5">
        <input type="hidden" name="leadId" value={leadId} />
        <textarea
          name="body"
          rows={3}
          required
          placeholder="İç not ekleyin — bu not müşteriye gösterilmez."
          className={textareaClass}
        />
        <div className="flex justify-end">
          <Button type="submit" size="sm" disabled={pending}>
            {pending ? <Loader2 size={15} className="animate-spin" /> : <Plus size={15} />}
            Not Ekle
          </Button>
        </div>
        {state.error && <p className="text-xs text-rose-600 font-medium">{state.error}</p>}
      </form>

      {notes.length === 0 ? (
        <EmptyState icon={<StickyNote size={22} />} title="Henüz not yok" />
      ) : (
        <ul className="space-y-2.5">
          {notes.map((n) => (
            <li key={n.id} className="rounded-xl bg-surface-2/70 p-4">
              <p className="text-sm text-ink leading-relaxed whitespace-pre-line">{n.body}</p>
              <p className="text-[0.6875rem] text-muted mt-2">
                {n.userName} · {formatDateTime(n.createdAt)}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/* ------------------------------------------------------------- Randevular */

function Appointments({
  leadId,
  appointments,
  projects,
  users,
}: {
  leadId: string;
  appointments: Appt[];
  projects: ProjectOpt[];
  users: { id: string; name: string }[];
}) {
  const [state, action, pending] = useActionState<ActionState, FormData>(
    createAppointment,
    {}
  );
  const [showForm, setShowForm] = useState(appointments.length === 0);

  useEffect(() => {
    if (state.ok) setShowForm(false);
  }, [state.ok]);

  return (
    <div className="space-y-5">
      {showForm ? (
        <form
          action={action}
          key={state.ok ? "reset" : "form"}
          className="rounded-xl border border-border p-4 space-y-3"
        >
          <input type="hidden" name="leadId" value={leadId} />
          <div className="grid sm:grid-cols-2 gap-3">
            <Field label="Randevu tipi">
              <select name="type" className={selectClass} defaultValue="VIEWING">
                {Object.entries(APPOINTMENT_TYPE_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </Field>
            <Field label="Tarih ve saat" required>
              <input name="startsAt" type="datetime-local" required className={inputClass} />
            </Field>
            <Field label="Proje">
              <select name="projectId" className={selectClass} defaultValue="">
                <option value="">Seçiniz</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </Field>
            <Field label="Danışman">
              <select name="userId" className={selectClass} defaultValue="">
                <option value="">Ben</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>{u.name}</option>
                ))}
              </select>
            </Field>
          </div>
          <Field label="Konum">
            <input name="location" placeholder="Şantiye / ofis" className={inputClass} />
          </Field>
          <Field label="Not">
            <textarea name="notes" rows={2} className={textareaClass} />
          </Field>
          {state.error && <p className="text-xs text-rose-600 font-medium">{state.error}</p>}
          <div className="flex gap-2 justify-end">
            {appointments.length > 0 && (
              <Button type="button" variant="ghost" size="sm" onClick={() => setShowForm(false)}>
                Vazgeç
              </Button>
            )}
            <Button type="submit" size="sm" disabled={pending}>
              {pending ? <Loader2 size={15} className="animate-spin" /> : <Plus size={15} />}
              Randevu Oluştur
            </Button>
          </div>
        </form>
      ) : (
        <Button variant="outline" size="sm" onClick={() => setShowForm(true)}>
          <Plus size={15} /> Yeni Randevu
        </Button>
      )}

      {appointments.length === 0 ? (
        <EmptyState icon={<CalendarDays size={22} />} title="Randevu yok" />
      ) : (
        <ul className="space-y-2.5">
          {appointments.map((a) => (
            <li key={a.id} className="rounded-xl border border-border p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-semibold text-ink text-sm">
                    {APPOINTMENT_TYPE_LABELS[a.type] ?? a.type}
                    {a.projectName && (
                      <span className="text-muted font-normal"> · {a.projectName}</span>
                    )}
                  </p>
                  <p className="text-[0.8125rem] text-brand font-semibold mt-1 num">
                    {formatDateTime(a.startsAt)}
                  </p>
                  {a.location && <p className="text-xs text-muted mt-1">{a.location}</p>}
                  {a.notes && (
                    <p className="text-sm text-ink-soft mt-2 leading-relaxed">{a.notes}</p>
                  )}
                </div>
                <Badge
                  tone={
                    a.status === "COMPLETED"
                      ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
                      : a.status === "CANCELLED" || a.status === "NO_SHOW"
                        ? "bg-rose-50 text-rose-700 ring-rose-200"
                        : "bg-sky-50 text-sky-700 ring-sky-200"
                  }
                >
                  {APPOINTMENT_STATUS_LABELS[a.status] ?? a.status}
                </Badge>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ Satış */

function Deals({
  leadId,
  deals,
  projects,
}: {
  leadId: string;
  deals: DealRow[];
  projects: ProjectOpt[];
}) {
  const [state, action, pending] = useActionState<ActionState, FormData>(createDeal, {});
  const [projectId, setProjectId] = useState(projects[0]?.id ?? "");
  const [showForm, setShowForm] = useState(false);

  const units = projects.find((p) => p.id === projectId)?.units ?? [];

  return (
    <div className="space-y-5">
      {deals.length > 0 && (
        <ul className="space-y-2.5">
          {deals.map((d) => (
            <li key={d.id}>
              <Link
                href={`/panel/satislar/${d.id}`}
                className="flex items-center justify-between gap-3 rounded-xl border border-border p-4 hover:border-brand/40 transition-colors"
              >
                <div className="min-w-0">
                  <p className="font-semibold text-ink text-sm num">{d.refNo}</p>
                  <p className="text-xs text-muted mt-0.5 truncate">{d.unitLabel}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-display font-bold text-ink num">
                    {formatPrice(d.agreedPrice, d.currency)}
                  </p>
                  <Badge tone={DEAL_STATUS_TONE[d.status]} className="mt-1">
                    {DEAL_STATUS_LABELS[d.status]}
                  </Badge>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}

      {showForm ? (
        <form action={action} className="rounded-xl border border-border p-4 space-y-3">
          <input type="hidden" name="leadId" value={leadId} />
          <div className="grid sm:grid-cols-2 gap-3">
            <Field label="Proje" required>
              <select
                name="projectId"
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className={selectClass}
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </Field>
            <Field label="Daire" required>
              <select name="unitId" required className={selectClass}>
                {units.length === 0 ? (
                  <option value="">Uygun daire yok</option>
                ) : (
                  units.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.label} {u.status === "RESERVED" ? "(rezerve)" : ""}
                    </option>
                  ))
                )}
              </select>
            </Field>
            <Field label="Anlaşılan fiyat (£)" required>
              <input
                name="agreedPrice"
                type="number"
                required
                min={0}
                step={100}
                className={inputClass}
              />
            </Field>
            <Field label="Peşinat oranı (%)">
              <input
                name="downPaymentPct"
                type="number"
                defaultValue={35}
                min={0}
                max={100}
                className={inputClass}
              />
            </Field>
            <Field label="Vade (ay)">
              <input
                name="installmentMonths"
                type="number"
                defaultValue={36}
                min={0}
                max={120}
                className={inputClass}
              />
            </Field>
          </div>
          <Field label="Not">
            <textarea name="notes" rows={2} className={textareaClass} />
          </Field>
          {state.error && <p className="text-xs text-rose-600 font-medium">{state.error}</p>}
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="ghost" size="sm" onClick={() => setShowForm(false)}>
              Vazgeç
            </Button>
            <Button type="submit" size="sm" disabled={pending || units.length === 0}>
              {pending ? <Loader2 size={15} className="animate-spin" /> : <Handshake size={15} />}
              Rezervasyon Aç
            </Button>
          </div>
        </form>
      ) : (
        <Button variant="outline" size="sm" onClick={() => setShowForm(true)}>
          <Plus size={15} /> Rezervasyon / Satış Oluştur
        </Button>
      )}

      {deals.length === 0 && !showForm && (
        <EmptyState
          icon={<Handshake size={22} />}
          title="Henüz satış kaydı yok"
          description="Müşteri bir daireye karar verdiğinde rezervasyon açın; taksit planı otomatik oluşur."
        />
      )}
    </div>
  );
}

/* --------------------------------------------------------- Site hareketleri */

function Views({ views }: { views: ViewRow[] }) {
  if (!views.length) {
    return (
      <EmptyState
        icon={<Eye size={22} />}
        title="Site hareketi yok"
        description="Müşteri sitede gezindiğinde hangi projelere ve dairelere baktığı burada görünür."
      />
    );
  }

  return (
    <ul className="space-y-2">
      {views.map((v) => (
        <li
          key={v.id}
          className="flex items-center gap-3 rounded-xl bg-surface-2/60 px-4 py-3"
        >
          <span
            className={cn(
              "h-8 w-8 rounded-lg grid place-items-center shrink-0",
              v.action === "PRICE_UNLOCK"
                ? "bg-brand-50 text-brand"
                : "bg-surface-3 text-muted"
            )}
          >
            {v.action === "PRICE_UNLOCK" ? <Lock size={14} /> : <Eye size={14} />}
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-ink truncate">
              {v.action === "PRICE_UNLOCK" ? "Fiyat listesinin kilidini açtı" : "Görüntüledi"}
              {v.projectName && <span className="text-muted"> · {v.projectName}</span>}
              {v.unitLabel && <span className="text-muted"> · {v.unitLabel}</span>}
            </p>
          </div>
          <span className="text-[0.6875rem] text-muted shrink-0">
            {timeAgo(v.createdAt)}
          </span>
        </li>
      ))}
    </ul>
  );
}

/* ------------------------------------------------------------- Kontroller */

function AssignControl({
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
  const [saved, setSaved] = useState(false);

  return (
    <div className="relative">
      <select
        value={v}
        disabled={pending}
        onChange={(e) => {
          const next = e.target.value;
          setV(next);
          start(async () => {
            await assignLead(leadId, next || null);
            setSaved(true);
            setTimeout(() => setSaved(false), 1600);
          });
        }}
        className={selectClass}
      >
        <option value="">Atanmadı</option>
        {users.map((u) => (
          <option key={u.id} value={u.id}>{u.name}</option>
        ))}
      </select>
      {saved && (
        <Check size={16} className="absolute right-9 top-1/2 -translate-y-1/2 text-emerald-600" />
      )}
    </div>
  );
}

function TempControl({ leadId, value }: { leadId: string; value: string }) {
  const [pending, start] = useTransition();
  const [v, setV] = useState(value);

  const tones: Record<string, string> = {
    HOT: "bg-rose-500 text-white",
    WARM: "bg-amber-500 text-white",
    COLD: "bg-sky-500 text-white",
  };

  return (
    <div className="flex gap-1.5">
      {Object.entries(LEAD_TEMP_LABELS).map(([k, label]) => (
        <button
          key={k}
          type="button"
          disabled={pending}
          onClick={() => {
            setV(k);
            start(() => { updateLeadTemp(leadId, k); });
          }}
          className={cn(
            "flex-1 inline-flex items-center justify-center gap-1.5 h-10 rounded-xl text-[0.8125rem] font-semibold transition-all disabled:opacity-60",
            v === k ? tones[k] : "bg-surface-2 text-ink-soft hover:bg-surface-3"
          )}
        >
          {k === "HOT" && <Flame size={14} />}
          {label}
        </button>
      ))}
    </div>
  );
}
