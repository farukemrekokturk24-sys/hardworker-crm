import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Phone, Mail, MapPin, Globe, Building2, Eye,
  Calendar, Target, Wallet,
} from "lucide-react";
import { Card, CardHeader, Badge, Avatar } from "@/components/ui/primitives";
import { LeadDetail } from "@/components/admin/lead-detail";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";
import {
  LEAD_SOURCE_LABELS, LEAD_STATUS_LABELS, LEAD_STATUS_COLORS,
  LEAD_TEMP_LABELS, LEAD_TEMP_TONE, PURPOSE_LABELS,
} from "@/lib/constants";
import { prettyPhone, formatPrice, formatDate, avatarTone } from "@/lib/utils";

type Params = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Params) {
  const { id } = await params;
  const lead = await prisma.lead.findUnique({ where: { id }, select: { name: true } });
  return { title: lead?.name ?? "Lead" };
}

export default async function LeadDetailPage({ params }: Params) {
  const { id } = await params;
  const user = await requireSession();

  const [lead, users, projects] = await Promise.all([
    prisma.lead.findFirst({
      where: { id, deletedAt: null },
      include: {
        project: { select: { id: true, name: true, slug: true } },
        unit: { select: { id: true, unitNo: true, type: true } },
        assignedTo: { select: { id: true, name: true } },
        notes: {
          include: { user: { select: { name: true } } },
          orderBy: { createdAt: "desc" },
        },
        activities: {
          include: { user: { select: { name: true } } },
          orderBy: { occurredAt: "desc" },
        },
        statusHistory: {
          include: { user: { select: { name: true } } },
          orderBy: { createdAt: "desc" },
        },
        appointments: {
          include: { project: { select: { name: true } }, user: { select: { name: true } } },
          orderBy: { startsAt: "desc" },
        },
        deals: {
          include: {
            unit: { select: { unitNo: true, type: true } },
            project: { select: { name: true } },
          },
        },
        tasks: { orderBy: { dueDate: "asc" } },
        views: {
          include: {
            project: { select: { name: true } },
            unit: { select: { unitNo: true, type: true } },
          },
          orderBy: { createdAt: "desc" },
          take: 20,
        },
      },
    }),
    prisma.user.findMany({
      where: { active: true },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    prisma.project.findMany({
      select: {
        id: true,
        name: true,
        units: {
          where: { status: { in: ["AVAILABLE", "RESERVED"] } },
          select: { id: true, unitNo: true, type: true, price: true, status: true },
          orderBy: { order: "asc" },
        },
      },
      orderBy: { order: "asc" },
    }),
  ]);

  if (!lead) notFound();

  return (
    <div className="space-y-5">
      <Link
        href="/panel/leadler"
        className="inline-flex items-center gap-2 text-sm font-semibold text-muted hover:text-ink transition-colors"
      >
        <ArrowLeft size={15} /> Lead listesine dön
      </Link>

      {/* Başlık kartı */}
      <Card className="p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row gap-5">
          <Avatar name={lead.name} size="lg" tone={avatarTone(lead.id)} />

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="t-h2 text-ink">{lead.name}</h1>
              <Badge tone={LEAD_TEMP_TONE[lead.temp]}>{LEAD_TEMP_LABELS[lead.temp]}</Badge>
              <Badge
                className="!ring-transparent"
                tone=""
                dot=""
              >
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ background: LEAD_STATUS_COLORS[lead.status] }}
                />
                <span style={{ color: LEAD_STATUS_COLORS[lead.status] }}>
                  {LEAD_STATUS_LABELS[lead.status]}
                </span>
              </Badge>
            </div>

            <p className="text-sm text-muted mt-1.5 num">
              {lead.refNo} · {formatDate(lead.createdAt)} tarihinde{" "}
              {LEAD_SOURCE_LABELS[lead.source] ?? lead.source} üzerinden geldi
            </p>

            <div className="flex flex-wrap gap-x-5 gap-y-2 mt-4 text-sm">
              <a
                href={`tel:${lead.phone}`}
                className="inline-flex items-center gap-2 font-semibold text-ink hover:text-brand transition-colors"
              >
                <Phone size={15} className="text-brand" />
                <span className="num">{prettyPhone(lead.phone)}</span>
              </a>
              {lead.email && (
                <a
                  href={`mailto:${lead.email}`}
                  className="inline-flex items-center gap-2 text-ink-soft hover:text-brand transition-colors"
                >
                  <Mail size={15} className="text-muted" />
                  {lead.email}
                </a>
              )}
              {lead.country && (
                <span className="inline-flex items-center gap-2 text-ink-soft">
                  <Globe size={15} className="text-muted" />
                  {lead.country}
                </span>
              )}
            </div>
          </div>

          <div className="shrink-0 flex sm:flex-col gap-2">
            <a
              href={`https://wa.me/${lead.phone}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 h-10 px-4 rounded-xl bg-[#25D366] text-white text-sm font-semibold hover:brightness-105 transition-all"
            >
              WhatsApp
            </a>
            <a
              href={`tel:${lead.phone}`}
              className="inline-flex items-center justify-center gap-2 h-10 px-4 rounded-xl bg-brand text-white text-sm font-semibold hover:bg-brand-600 transition-colors"
            >
              <Phone size={15} /> Ara
            </a>
          </div>
        </div>

        {/* Özet bilgiler */}
        <dl className="grid grid-cols-2 lg:grid-cols-5 gap-4 mt-6 pt-5 border-t border-border">
          <Info icon={<Building2 size={14} />} label="İlgilendiği proje" value={lead.project?.name ?? "—"} />
          <Info
            icon={<Wallet size={14} />}
            label="Bütçe"
            value={
              lead.budgetMax
                ? `${lead.budgetMin ? formatPrice(lead.budgetMin) + " – " : ""}${formatPrice(lead.budgetMax)}`
                : "—"
            }
          />
          <Info
            icon={<Target size={14} />}
            label="Amaç"
            value={lead.purpose ? PURPOSE_LABELS[lead.purpose] ?? lead.purpose : "—"}
          />
          <Info icon={<Eye size={14} />} label="Sitede görüntüleme" value={String(lead.views.length)} />
          <Info
            icon={<Calendar size={14} />}
            label="Lead puanı"
            value={`${lead.score} / 100`}
          />
        </dl>
      </Card>

      <LeadDetail
        lead={{
          id: lead.id,
          name: lead.name,
          status: lead.status,
          temp: lead.temp,
          assignedToId: lead.assignedToId,
          message: lead.message,
          projectId: lead.projectId,
          utmSource: lead.utmSource,
          utmCampaign: lead.utmCampaign,
          referrer: lead.referrer,
        }}
        notes={lead.notes.map((n) => ({
          id: n.id,
          body: n.body,
          userName: n.user?.name ?? "Sistem",
          createdAt: n.createdAt.toISOString(),
        }))}
        activities={lead.activities.map((a) => ({
          id: a.id,
          type: a.type,
          title: a.title,
          detail: a.detail,
          outcome: a.outcome,
          userName: a.user?.name ?? "Sistem",
          occurredAt: a.occurredAt.toISOString(),
        }))}
        statusHistory={lead.statusHistory.map((h) => ({
          id: h.id,
          fromStatus: h.fromStatus,
          toStatus: h.toStatus,
          userName: h.user?.name ?? "Sistem",
          createdAt: h.createdAt.toISOString(),
        }))}
        appointments={lead.appointments.map((a) => ({
          id: a.id,
          type: a.type,
          status: a.status,
          startsAt: a.startsAt.toISOString(),
          location: a.location,
          notes: a.notes,
          projectName: a.project?.name ?? null,
          userName: a.user?.name ?? null,
        }))}
        deals={lead.deals.map((d) => ({
          id: d.id,
          refNo: d.refNo,
          status: d.status,
          agreedPrice: d.agreedPrice,
          currency: d.currency,
          unitLabel: `${d.project.name} · ${d.unit.unitNo} (${d.unit.type})`,
        }))}
        views={lead.views.map((v) => ({
          id: v.id,
          action: v.action,
          projectName: v.project?.name ?? null,
          unitLabel: v.unit ? `${v.unit.unitNo} · ${v.unit.type}` : null,
          createdAt: v.createdAt.toISOString(),
        }))}
        users={users}
        projects={projects.map((p) => ({
          id: p.id,
          name: p.name,
          units: p.units.map((u) => ({
            id: u.id,
            label: `${u.unitNo} · ${u.type}${u.price ? ` · ${formatPrice(u.price)}` : ""}`,
            price: u.price,
            status: u.status,
          })),
        }))}
        canAssign={user.role !== "AGENT"}
      />
    </div>
  );
}

function Info({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div>
      <dt className="flex items-center gap-1.5 text-[0.6875rem] font-bold uppercase tracking-wider text-muted">
        <span className="text-brand">{icon}</span>
        {label}
      </dt>
      <dd className="font-semibold text-ink mt-1 text-sm">{value}</dd>
    </div>
  );
}
