import Link from "next/link";
import {
  Users, Flame, Handshake, TrendingUp, Building2, CalendarDays,
  CheckSquare, ArrowRight, Phone, AlertCircle, Target,
} from "lucide-react";
import { StatCard, Card, CardHeader, Badge, EmptyState, Avatar } from "@/components/ui/primitives";
import { Button } from "@/components/ui/button";
import { LeadTrendChart, SourcePieChart } from "@/components/admin/charts";
import { requireSession } from "@/lib/auth";
import { getDashboardData } from "@/lib/crm-queries";
import {
  LEAD_STATUS_LABELS, LEAD_SOURCE_LABELS, LEAD_TEMP_TONE,
  LEAD_TEMP_LABELS, APPOINTMENT_TYPE_LABELS,
} from "@/lib/constants";
import { formatPrice, formatDateTime, timeAgo, prettyPhone, avatarTone, cn } from "@/lib/utils";

export default async function DashboardPage() {
  const user = await requireSession();
  const d = await getDashboardData(user.uid, user.role);

  const firstName = user.name.split(" ")[0];
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Günaydın" : hour < 18 ? "İyi günler" : "İyi akşamlar";

  return (
    <div className="space-y-6">
      {/* Başlık */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="t-h2 text-ink">
            {greeting}, {firstName}
          </h1>
          <p className="text-muted mt-1 text-sm">
            {d.newLeads > 0 ? (
              <>
                <strong className="text-ink-soft">{d.newLeads} yeni lead</strong> sizi
                bekliyor
                {d.todayAppointments.length > 0 &&
                  ` · bugün ${d.todayAppointments.length} randevunuz var`}
                .
              </>
            ) : (
              "Bugün için bekleyen yeni lead yok."
            )}
          </p>
        </div>
        <Button href="/panel/leadler/yeni">
          <Users size={16} /> Yeni Lead
        </Button>
      </div>

      {/* Özet kartlar */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Toplam Lead"
          value={d.totalLeads}
          sub={`Son 30 günde ${d.leadsLast30}`}
          icon={<Users size={20} />}
          trend={{ value: d.growth, label: "önceki 30 güne göre" }}
        />
        <StatCard
          label="Sıcak Lead"
          value={d.hotLeads}
          sub={`${d.newLeads} tanesi henüz aranmadı`}
          icon={<Flame size={20} />}
          tone="rose"
        />
        <StatCard
          label="Satış Hattı"
          value={formatPrice(d.pipelineValue)}
          sub={`Kapanan: ${formatPrice(d.closedValue)}`}
          icon={<Handshake size={20} />}
          tone="amber"
        />
        <StatCard
          label="Dönüşüm"
          value={`%${d.conversion}`}
          sub={`${d.wonLeads} kazanıldı · ${d.lostLeads} kaybedildi`}
          icon={<Target size={20} />}
          tone="emerald"
        />
      </div>

      {/* Envanter şeridi */}
      <Card className="p-5">
        <div className="flex flex-col sm:flex-row sm:items-center gap-5">
          <div className="flex items-center gap-3 shrink-0">
            <div className="h-11 w-11 rounded-xl bg-brand-50 text-brand grid place-items-center">
              <Building2 size={20} />
            </div>
            <div>
              <p className="text-[0.6875rem] font-bold uppercase tracking-wider text-muted">
                Daire Envanteri
              </p>
              <p className="font-display font-bold text-ink text-lg num">
                {d.unitStats.total} daire
              </p>
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex h-3 rounded-full overflow-hidden bg-surface-2">
              {[
                { n: d.unitStats.available, c: "bg-emerald-500" },
                { n: d.unitStats.reserved, c: "bg-amber-500" },
                { n: d.unitStats.sold, c: "bg-rose-500" },
              ].map((s, i) => (
                <div
                  key={i}
                  className={s.c}
                  style={{ width: `${(s.n / Math.max(d.unitStats.total, 1)) * 100}%` }}
                />
              ))}
            </div>
            <div className="flex flex-wrap gap-x-5 gap-y-1.5 mt-3 text-sm">
              {[
                { label: "Satışta", n: d.unitStats.available, c: "bg-emerald-500" },
                { label: "Rezerve", n: d.unitStats.reserved, c: "bg-amber-500" },
                { label: "Satıldı", n: d.unitStats.sold, c: "bg-rose-500" },
              ].map((s) => (
                <span key={s.label} className="inline-flex items-center gap-2">
                  <span className={cn("h-2 w-2 rounded-full", s.c)} />
                  <span className="text-muted">{s.label}</span>
                  <strong className="text-ink num">{s.n}</strong>
                </span>
              ))}
            </div>
          </div>

          <Button href="/panel/daireler" variant="outline" size="sm" className="shrink-0">
            Envanteri Aç <ArrowRight size={14} />
          </Button>
        </div>
      </Card>

      {/* Grafikler */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader
            title="Lead akışı"
            subtitle="Son 12 hafta"
            action={
              <Badge tone={d.growth >= 0 ? "bg-emerald-50 text-emerald-700 ring-emerald-200" : "bg-rose-50 text-rose-700 ring-rose-200"}>
                <TrendingUp size={11} /> %{Math.abs(d.growth)}
              </Badge>
            }
          />
          <div className="p-4 pt-5">
            <LeadTrendChart data={d.weekly} />
          </div>
        </Card>

        <Card>
          <CardHeader title="Lead kaynakları" subtitle="Tüm zamanlar" />
          <div className="p-4 pt-5">
            <SourcePieChart
              data={d.bySource.map((s) => ({
                name: LEAD_SOURCE_LABELS[s.source] ?? s.source,
                value: s.count,
              }))}
            />
          </div>
        </Card>
      </div>

      {/* Alt bölüm */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Son lead'ler */}
        <Card className="lg:col-span-2">
          <CardHeader
            title="Son gelen lead'ler"
            action={
              <Link
                href="/panel/leadler"
                className="text-sm font-semibold text-brand hover:text-brand-600 inline-flex items-center gap-1"
              >
                Tümü <ArrowRight size={14} />
              </Link>
            }
          />
          {d.recentLeads.length === 0 ? (
            <EmptyState icon={<Users size={22} />} title="Henüz lead yok" />
          ) : (
            <ul className="divide-y divide-border">
              {d.recentLeads.map((l) => (
                <li key={l.id}>
                  <Link
                    href={`/panel/leadler/${l.id}`}
                    className="flex items-center gap-3.5 px-5 py-3.5 hover:bg-surface-2/60 transition-colors"
                  >
                    <Avatar name={l.name} size="sm" tone={avatarTone(l.id)} />
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-ink text-sm truncate">
                        {l.name}
                        <span className="font-normal text-muted ml-2 num text-xs">
                          {prettyPhone(l.phone)}
                        </span>
                      </p>
                      <p className="text-xs text-muted truncate mt-0.5">
                        {LEAD_SOURCE_LABELS[l.source] ?? l.source}
                        {l.project && ` · ${l.project.name}`}
                        {l.assignedTo ? ` · ${l.assignedTo.name}` : " · atanmadı"}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <Badge tone={LEAD_TEMP_TONE[l.temp]}>{LEAD_TEMP_LABELS[l.temp]}</Badge>
                      <span className="text-[0.6875rem] text-muted">
                        {timeAgo(l.createdAt)}
                      </span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <div className="space-y-4">
          {/* Bugünkü randevular */}
          <Card>
            <CardHeader
              title="Yaklaşan randevular"
              action={
                <Link
                  href="/panel/randevular"
                  className="text-sm font-semibold text-brand hover:text-brand-600"
                >
                  Takvim
                </Link>
              }
            />
            {d.upcomingAppointments.length === 0 ? (
              <EmptyState icon={<CalendarDays size={22} />} title="Randevu yok" />
            ) : (
              <ul className="divide-y divide-border">
                {d.upcomingAppointments.map((a) => (
                  <li key={a.id} className="px-5 py-3.5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <Link
                          href={`/panel/leadler/${a.lead.id}`}
                          className="font-semibold text-ink text-sm hover:text-brand transition-colors"
                        >
                          {a.lead.name}
                        </Link>
                        <p className="text-xs text-muted mt-0.5 truncate">
                          {APPOINTMENT_TYPE_LABELS[a.type]}
                          {a.project && ` · ${a.project.name}`}
                        </p>
                      </div>
                      <a
                        href={`tel:${a.lead.phone}`}
                        aria-label="Ara"
                        className="h-8 w-8 rounded-lg grid place-items-center text-brand hover:bg-brand-50 transition-colors shrink-0"
                      >
                        <Phone size={15} />
                      </a>
                    </div>
                    <p className="text-[0.6875rem] font-semibold text-brand mt-1.5 num">
                      {formatDateTime(a.startsAt)}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          {/* Görevlerim */}
          <Card>
            <CardHeader
              title="Görevlerim"
              subtitle={d.overdueTasks > 0 ? `${d.overdueTasks} gecikmiş` : undefined}
              action={
                <Link
                  href="/panel/gorevler"
                  className="text-sm font-semibold text-brand hover:text-brand-600"
                >
                  Tümü
                </Link>
              }
            />
            {d.myTasks.length === 0 ? (
              <EmptyState icon={<CheckSquare size={22} />} title="Bekleyen görev yok" />
            ) : (
              <ul className="divide-y divide-border">
                {d.myTasks.slice(0, 5).map((t) => {
                  const overdue = t.dueDate && t.dueDate < new Date();
                  return (
                    <li key={t.id} className="px-5 py-3 flex items-start gap-2.5">
                      {overdue ? (
                        <AlertCircle size={15} className="text-rose-500 shrink-0 mt-0.5" />
                      ) : (
                        <CheckSquare size={15} className="text-muted shrink-0 mt-0.5" />
                      )}
                      <div className="min-w-0">
                        <p className="text-sm text-ink leading-snug">{t.title}</p>
                        {t.dueDate && (
                          <p
                            className={cn(
                              "text-[0.6875rem] mt-0.5 font-medium",
                              overdue ? "text-rose-600" : "text-muted"
                            )}
                          >
                            {formatDateTime(t.dueDate)}
                          </p>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </Card>
        </div>
      </div>

      {/* Satış hattı dağılımı */}
      <Card>
        <CardHeader title="Satış hattı" subtitle="Lead durumuna göre dağılım" />
        <div className="p-5 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {Object.entries(LEAD_STATUS_LABELS).map(([key, label]) => {
            const count = d.byStatus.find((s) => s.status === key)?.count ?? 0;
            return (
              <Link
                key={key}
                href={`/panel/leadler?status=${key}`}
                className="rounded-xl border border-border p-3.5 hover:border-brand/40 hover:bg-brand-50/40 transition-colors"
              >
                <p className="t-h3 num text-ink">{count}</p>
                <p className="text-[0.6875rem] font-semibold text-muted mt-1 leading-tight">
                  {label}
                </p>
              </Link>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
