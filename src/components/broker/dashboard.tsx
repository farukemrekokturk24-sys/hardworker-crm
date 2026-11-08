"use client";

import { useActionState, useEffect, useMemo, useState, useTransition } from "react";
import Image from "next/image";
import {
  Plus, Loader2, Copy, Check, Link2, Users, Trash2, Search,
  Phone, Building2, X, ExternalLink, MessageSquare,
} from "lucide-react";
import { Card, CardHeader, Badge, EmptyState, Avatar, Field, inputClass, selectClass, textareaClass } from "@/components/ui/primitives";
import { Button } from "@/components/ui/button";
import { WhatsappIcon } from "@/components/brand/social-icons";
import {
  addBrokerCustomer, createShareLink, deleteShareLink, addBrokerNote,
  type BrokerState,
} from "@/app/emlakci/actions";
import {
  LEAD_STATUS_LABELS, LEAD_STATUS_COLORS, LEAD_TEMP_LABELS, LEAD_TEMP_TONE,
  DEAL_STATUS_LABELS, PURPOSE_LABELS,
} from "@/lib/constants";
import { prettyPhone, timeAgo, avatarTone, cn } from "@/lib/utils";

type Lead = {
  id: string; refNo: string; name: string; phone: string; email: string | null;
  status: string; temp: string; createdAt: string; lastActivityAt: string;
  projectName: string | null; lastNote: string | null;
  dealRef: string | null; dealStatus: string | null;
};
type Project = {
  id: string; slug: string; name: string; location: string;
  coverImage: string | null; deliveryLabel: string | null; status: string;
  availableUnits: number; totalUnits: number;
};
type ShareLink = {
  id: string; token: string; label: string | null;
  projectName: string | null; projectSlug: string | null;
  clicks: number; createdAt: string;
};

const TABS = [
  { key: "projects", label: "Projeler ve Sunum Linkleri", icon: Building2 },
  { key: "customers", label: "Müşterilerim", icon: Users },
] as const;

export function BrokerDashboard({
  siteUrl,
  shareCode,
  leads,
  projects,
  links,
}: {
  siteUrl: string;
  shareCode: string | null;
  leads: Lead[];
  projects: Project[];
  links: ShareLink[];
}) {
  const [tab, setTab] = useState<(typeof TABS)[number]["key"]>("projects");
  const [adding, setAdding] = useState(false);

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex rounded-xl border border-border bg-surface p-1 overflow-x-auto no-scrollbar">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={cn(
                "inline-flex items-center gap-2 h-10 px-4 rounded-lg text-[0.8125rem] font-semibold whitespace-nowrap transition-colors",
                tab === t.key ? "bg-ink text-white" : "text-ink-soft hover:bg-surface-2"
              )}
            >
              <t.icon size={15} />
              {t.label}
              {t.key === "customers" && leads.length > 0 && (
                <span
                  className={cn(
                    "num text-[0.625rem] font-bold px-1.5 rounded-full",
                    tab === t.key ? "bg-white/20" : "bg-surface-2"
                  )}
                >
                  {leads.length}
                </span>
              )}
            </button>
          ))}
        </div>

        <Button onClick={() => setAdding(true)} className="sm:ml-auto">
          <Plus size={16} /> Müşteri Ekle
        </Button>
      </div>

      {tab === "projects" && (
        <ProjectsTab
          projects={projects}
          links={links}
          siteUrl={siteUrl}
          shareCode={shareCode}
        />
      )}
      {tab === "customers" && <CustomersTab leads={leads} />}

      {adding && (
        <AddCustomerModal projects={projects} onClose={() => setAdding(false)} />
      )}
    </div>
  );
}

/* ----------------------------------------------------- Projeler sekmesi */

function ProjectsTab({
  projects,
  links,
  siteUrl,
  shareCode,
}: {
  projects: Project[];
  links: ShareLink[];
  siteUrl: string;
  shareCode: string | null;
}) {
  return (
    <div className="space-y-5">
      {shareCode && (
        <Card className="p-5 border-brand/25 bg-brand-50/40">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="min-w-0 flex-1">
              <p className="font-bold text-ink">Genel sunum linkiniz</p>
              <p className="text-sm text-ink-soft mt-0.5 leading-relaxed">
                Tüm projeleri gösterir. Bu linkten gelen her müşteri otomatik
                olarak size bağlanır.
              </p>
            </div>
            <CopyField url={`${siteUrl}/projeler?ref=${shareCode}`} />
          </div>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {projects.map((p) => (
          <ProjectShareCard
            key={p.id}
            project={p}
            siteUrl={siteUrl}
            shareCode={shareCode}
          />
        ))}
      </div>

      {links.length > 0 && (
        <Card className="overflow-hidden">
          <CardHeader
            title="Takip edilen linkler"
            subtitle="Kaç kez açıldığını buradan görebilirsiniz."
          />
          <ul className="divide-y divide-border">
            {links.map((l) => (
              <li key={l.id} className="flex flex-wrap items-center gap-3 px-5 py-3.5">
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-ink text-sm truncate">
                    {l.projectName ?? "Tüm projeler"}
                    {l.label && <span className="text-muted font-normal"> · {l.label}</span>}
                  </p>
                  <p className="text-xs text-muted mt-0.5">{timeAgo(l.createdAt)} oluşturuldu</p>
                </div>
                <Badge tone="bg-surface-2 text-ink-soft ring-border">
                  <span className="num">{l.clicks}</span> tıklama
                </Badge>
                <CopyField url={`${siteUrl}/s/${l.token}`} compact />
                <DeleteLink id={l.id} />
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}

function ProjectShareCard({
  project,
  siteUrl,
  shareCode,
}: {
  project: Project;
  siteUrl: string;
  shareCode: string | null;
}) {
  const [tracked, setTracked] = useState<string | null>(null);
  const [making, startMaking] = useTransition();
  // Takipli link varsa onu, yoksa genel ref linkini paylaş
  const url = tracked
    ? `${siteUrl}/s/${tracked}`
    : `${siteUrl}/projeler/${project.slug}${shareCode ? `?ref=${shareCode}` : ""}`;
  const soldOut = project.totalUnits > 0 && project.availableUnits === 0;

  return (
    <Card hover className="overflow-hidden flex flex-col">
      <div className="relative aspect-[16/10] bg-surface-2">
        {project.coverImage && (
          <Image
            src={project.coverImage}
            alt={project.name}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover"
          />
        )}
        {soldOut && (
          <span className="absolute inset-0 grid place-items-center bg-dark/45">
            <span className="-rotate-[8deg] rounded-lg bg-[var(--danger)] px-4 py-2 font-display text-base font-extrabold uppercase tracking-[0.16em] text-white ring-4 ring-white/25">
              Sold Out
            </span>
          </span>
        )}
      </div>

      <div className="p-5 flex flex-col flex-1">
        <h3 className="font-display font-bold text-ink text-lg">{project.name}</h3>
        <p className="text-xs text-muted mt-1">{project.location}</p>

        <div className="flex items-center gap-4 mt-3 text-sm">
          <span className="text-muted">
            <strong className="text-ink num">{project.availableUnits}</strong> satışta
          </span>
          {project.deliveryLabel && (
            <span className="text-muted text-xs">{project.deliveryLabel}</span>
          )}
        </div>

        <div className="mt-auto pt-4 space-y-2">
          <CopyField url={url} full label="Sunum linkini kopyala" />
          {!tracked && (
            <button
              onClick={() =>
                startMaking(async () => {
                  const r = await createShareLink(project.id);
                  if (r.ok) setTracked(r.token);
                })
              }
              disabled={making}
              className="w-full inline-flex items-center justify-center gap-1.5 h-9 rounded-lg border border-border text-[0.75rem] font-semibold text-ink-soft hover:border-brand/40 transition-colors disabled:opacity-60"
            >
              {making ? <Loader2 size={13} className="animate-spin" /> : <Link2 size={13} />}
              Takip edilen link oluştur
            </button>
          )}
          <div className="flex gap-2">
            <a
              href={`https://wa.me/?text=${encodeURIComponent(
                `${project.name} projesini sizin için seçtim, detaylar: ${url}`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 inline-flex items-center justify-center gap-1.5 h-9 rounded-lg bg-[#25D366] text-white text-[0.8125rem] font-semibold hover:brightness-105 transition-all"
            >
              <WhatsappIcon size={14} /> Gönder
            </a>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-1.5 h-9 px-3 rounded-lg border border-border text-[0.8125rem] font-semibold text-ink-soft hover:border-brand/40 transition-colors"
            >
              <ExternalLink size={14} /> Önizle
            </a>
          </div>
        </div>
      </div>
    </Card>
  );
}

function CopyField({
  url,
  compact,
  full,
  label,
}: {
  url: string;
  compact?: boolean;
  full?: boolean;
  label?: string;
}) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      // Pano kapalıysa kullanıcı elle kopyalayabilsin
      window.prompt("Linki kopyalayın:", url);
      return;
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1900);
  };

  if (compact) {
    return (
      <button
        onClick={copy}
        className="inline-flex items-center gap-1.5 h-8 px-2.5 rounded-lg bg-surface-2 text-[0.75rem] font-medium text-ink-soft hover:bg-surface-3 transition-colors"
        title={url}
      >
        {copied ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
        {copied ? "Kopyalandı" : "Kopyala"}
      </button>
    );
  }

  return (
    <button
      onClick={copy}
      className={cn(
        "inline-flex items-center justify-center gap-2 h-10 px-4 rounded-xl font-semibold text-[0.8125rem] transition-colors shrink-0",
        copied
          ? "bg-emerald-600 text-white"
          : "bg-brand text-white hover:bg-brand-600",
        full && "w-full"
      )}
    >
      {copied ? <Check size={15} /> : <Link2 size={15} />}
      {copied ? "Kopyalandı" : (label ?? "Linki kopyala")}
    </button>
  );
}

function DeleteLink({ id }: { id: string }) {
  const [pending, start] = useTransition();
  return (
    <button
      disabled={pending}
      onClick={() => {
        if (!confirm("Bu sunum linki silinsin mi?")) return;
        start(() => { deleteShareLink(id); });
      }}
      aria-label="Linki sil"
      className="h-8 w-8 rounded-lg grid place-items-center text-muted hover:text-rose-600 hover:bg-rose-50 transition-colors"
    >
      {pending ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
    </button>
  );
}

/* --------------------------------------------------- Müşteriler sekmesi */

function CustomersTab({ leads }: { leads: Lead[] }) {
  const [q, setQ] = useState("");
  const [noteFor, setNoteFor] = useState<Lead | null>(null);

  const filtered = useMemo(
    () =>
      leads.filter((l) =>
        q
          ? `${l.name} ${l.phone} ${l.projectName ?? ""}`.toLowerCase().includes(q.toLowerCase())
          : true
      ),
    [leads, q]
  );

  if (leads.length === 0) {
    return (
      <Card>
        <EmptyState
          icon={<Users size={22} />}
          title="Henüz müşteriniz yok"
          description="“Müşteri Ekle” ile kaydedin ya da sunum linkinizi paylaşın; linkten gelenler otomatik size bağlanır."
        />
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative max-w-sm">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Müşteri ara…"
          className={cn(inputClass, "pl-10")}
        />
      </div>

      <ul className="space-y-2.5">
        {filtered.map((l) => (
          <li key={l.id} className="card p-4 sm:p-5">
            <div className="flex flex-wrap items-start gap-3">
              <Avatar name={l.name} tone={avatarTone(l.id)} />
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-ink">{l.name}</p>
                <p className="text-xs text-muted num mt-0.5">{prettyPhone(l.phone)}</p>
                {l.projectName && (
                  <p className="text-xs text-muted mt-1">
                    İlgilendiği proje: <strong className="text-ink-soft">{l.projectName}</strong>
                  </p>
                )}
              </div>

              <div className="flex flex-col items-end gap-1.5">
                <span
                  className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[0.6875rem] font-bold"
                  style={{
                    background: `${LEAD_STATUS_COLORS[l.status]}1a`,
                    color: LEAD_STATUS_COLORS[l.status],
                  }}
                >
                  <span
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ background: LEAD_STATUS_COLORS[l.status] }}
                  />
                  {LEAD_STATUS_LABELS[l.status]}
                </span>
                <Badge tone={LEAD_TEMP_TONE[l.temp]}>{LEAD_TEMP_LABELS[l.temp]}</Badge>
              </div>
            </div>

            {l.dealRef && (
              <p className="text-xs mt-3 px-3 py-2 rounded-lg bg-emerald-50 text-emerald-800">
                Satış kaydı <strong className="num">{l.dealRef}</strong> ·{" "}
                {DEAL_STATUS_LABELS[l.dealStatus ?? ""] ?? l.dealStatus}
              </p>
            )}

            {l.lastNote && (
              <p className="text-sm text-ink-soft mt-3 bg-surface-2 rounded-lg px-3 py-2 leading-relaxed">
                {l.lastNote}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-2 mt-3.5 pt-3.5 border-t border-border">
              <a
                href={`tel:${l.phone}`}
                className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg bg-brand-50 text-brand text-[0.8125rem] font-semibold hover:bg-brand-100 transition-colors"
              >
                <Phone size={14} /> Ara
              </a>
              <a
                href={`https://wa.me/${l.phone}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg bg-[#25D366]/10 text-[#128C45] text-[0.8125rem] font-semibold hover:bg-[#25D366]/20 transition-colors"
              >
                <WhatsappIcon size={14} /> WhatsApp
              </a>
              <button
                onClick={() => setNoteFor(l)}
                className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg border border-border text-[0.8125rem] font-semibold text-ink-soft hover:border-brand/40 transition-colors"
              >
                <MessageSquare size={14} /> Not ekle
              </button>
              <span className="ml-auto text-[0.6875rem] text-muted">
                {timeAgo(l.lastActivityAt)}
              </span>
            </div>
          </li>
        ))}
      </ul>

      {noteFor && <NoteModal lead={noteFor} onClose={() => setNoteFor(null)} />}
    </div>
  );
}

function NoteModal({ lead, onClose }: { lead: Lead; onClose: () => void }) {
  const [state, action, pending] = useActionState<BrokerState, FormData>(addBrokerNote, {});

  useEffect(() => {
    if (!state.ok) return;
    const t = setTimeout(onClose, 250);
    return () => clearTimeout(t);
  }, [state.ok, onClose]);

  return (
    <Modal title={`${lead.name} — not ekle`} onClose={onClose}>
      <form action={action} className="space-y-4">
        <input type="hidden" name="leadId" value={lead.id} />
        <Field label="Not" required>
          <textarea
            name="body"
            rows={4}
            required
            placeholder="Görüşme özeti, müşterinin beklentisi…"
            className={textareaClass}
          />
        </Field>
        {state.error && <p className="text-sm text-rose-600 font-medium">{state.error}</p>}
        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onClose}>Vazgeç</Button>
          <Button type="submit" disabled={pending}>
            {pending ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
            Kaydet
          </Button>
        </div>
      </form>
    </Modal>
  );
}

function AddCustomerModal({
  projects,
  onClose,
}: {
  projects: Project[];
  onClose: () => void;
}) {
  const [state, action, pending] = useActionState<BrokerState, FormData>(
    addBrokerCustomer,
    {}
  );

  useEffect(() => {
    if (!state.ok) return;
    const t = setTimeout(onClose, 250);
    return () => clearTimeout(t);
  }, [state.ok, onClose]);

  return (
    <Modal title="Müşteri ekle" onClose={onClose}>
      <form action={action} className="space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Ad Soyad" required>
            <input name="name" required className={inputClass} />
          </Field>
          <Field label="Telefon" required>
            <input
              name="phone"
              type="tel"
              required
              placeholder="+90 5XX XXX XX XX"
              className={inputClass}
            />
          </Field>
          <Field label="E-posta">
            <input name="email" type="email" className={inputClass} />
          </Field>
          <Field label="Ülke">
            <input name="country" className={inputClass} />
          </Field>
          <Field label="İlgilendiği proje">
            <select name="projectId" defaultValue="" className={selectClass}>
              <option value="">Belirtilmedi</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </Field>
          <Field label="Amaç">
            <select name="purpose" defaultValue="" className={selectClass}>
              <option value="">Belirtilmedi</option>
              {Object.entries(PURPOSE_LABELS).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </Field>
        </div>

        <Field label="Not">
          <textarea name="note" rows={3} className={textareaClass} />
        </Field>

        {state.error && (
          <p className="text-sm text-rose-600 bg-rose-50 rounded-xl px-3.5 py-2.5 font-medium">
            {state.error}
          </p>
        )}

        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onClose}>Vazgeç</Button>
          <Button type="submit" disabled={pending}>
            {pending ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
            Müşteriyi Kaydet
          </Button>
        </div>
      </form>
    </Modal>
  );
}

function Modal({
  title,
  children,
  onClose,
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-dark/50 backdrop-blur-sm anim-fade" onClick={onClose} />
      <div className="relative w-full sm:max-w-lg card rounded-t-3xl sm:rounded-2xl anim-slide-up sm:anim-scale safe-b max-h-[92dvh] overflow-y-auto thin-scroll">
        <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-border sticky top-0 bg-surface z-10">
          <h3 className="font-bold text-ink">{title}</h3>
          <button
            onClick={onClose}
            aria-label="Kapat"
            className="h-9 w-9 rounded-lg grid place-items-center text-muted hover:text-ink hover:bg-surface-2 transition-colors"
          >
            <X size={18} />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}
