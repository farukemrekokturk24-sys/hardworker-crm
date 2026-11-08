"use client";

import { useMemo, useState } from "react";
import {
  Link2, MousePointerClick, Users, TrendingUp, ChevronDown, Search, Trophy,
} from "lucide-react";
import { Card, CardHeader, Badge, StatCard, EmptyState, Avatar, inputClass, selectClass } from "@/components/ui/primitives";
import { formatPrice, timeAgo, avatarTone, pct, cn } from "@/lib/utils";

type LinkRow = {
  id: string; token: string; label: string | null;
  projectId: string | null; projectName: string | null;
  clicks: number; lastOpenedAt: string | null; createdAt: string;
};
type Broker = {
  id: string; name: string; company: string | null; email: string;
  phone: string | null; active: boolean; shareCode: string | null;
  accountManagerName: string | null;
  leadCount: number; won: number; lost: number; revenue: number;
  links: LinkRow[];
  byProject: { projectId: string; name: string; leads: number }[];
};

export function BrokerPerformance({
  brokers,
  projects,
}: {
  brokers: Broker[];
  projects: { id: string; name: string }[];
}) {
  const [q, setQ] = useState("");
  const [projectFilter, setProjectFilter] = useState("ALL");
  const [open, setOpen] = useState<string | null>(null);

  const rows = useMemo(() => {
    return brokers
      .map((b) => {
        const links =
          projectFilter === "ALL"
            ? b.links
            : b.links.filter((l) => l.projectId === projectFilter);
        return {
          ...b,
          links,
          clicks: links.reduce((s, l) => s + l.clicks, 0),
          linkCount: links.length,
        };
      })
      .filter((b) => {
        if (projectFilter !== "ALL" && b.linkCount === 0) return false;
        if (!q) return true;
        return `${b.name} ${b.company ?? ""} ${b.email}`
          .toLowerCase()
          .includes(q.toLowerCase());
      })
      .sort((a, b) => b.clicks - a.clicks || b.leadCount - a.leadCount);
  }, [brokers, q, projectFilter]);

  const totals = useMemo(
    () => ({
      brokers: rows.length,
      links: rows.reduce((s, b) => s + b.linkCount, 0),
      clicks: rows.reduce((s, b) => s + b.clicks, 0),
      leads: rows.reduce((s, b) => s + b.leadCount, 0),
      revenue: rows.reduce((s, b) => s + b.revenue, 0),
    }),
    [rows]
  );

  if (brokers.length === 0) {
    return (
      <Card>
        <EmptyState
          icon={<Users size={22} />}
          title="Henüz emlakçı partner yok"
          description="Kullanıcılar bölümünden BROKER rolüyle partner ekleyebilirsiniz."
        />
      </Card>
    );
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Partner Acente" value={totals.brokers} icon={<Users size={20} />} />
        <StatCard
          label="Paylaşılan Link"
          value={totals.links}
          icon={<Link2 size={20} />}
          tone="violet"
        />
        <StatCard
          label="Toplam Açılma"
          value={totals.clicks}
          sub={totals.links ? `link başına ${Math.round(totals.clicks / totals.links)}` : undefined}
          icon={<MousePointerClick size={20} />}
          tone="amber"
        />
        <StatCard
          label="Getirilen Ciro"
          value={formatPrice(totals.revenue)}
          sub={`${totals.leads} müşteri`}
          icon={<TrendingUp size={20} />}
          tone="emerald"
        />
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Acente ara…"
            className={cn(inputClass, "pl-10")}
          />
        </div>
        <select
          value={projectFilter}
          onChange={(e) => setProjectFilter(e.target.value)}
          className={cn(selectClass, "sm:max-w-[240px]")}
        >
          <option value="ALL">Tüm projeler</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      </div>

      <Card className="overflow-hidden">
        <CardHeader
          title="Acente sıralaması"
          subtitle="Link açılma sayısına göre"
        />
        <div className="overflow-x-auto thin-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th className="w-10"></th>
                <th>Acente</th>
                <th>Sorumlu</th>
                <th>Link</th>
                <th>Açılma</th>
                <th>Müşteri</th>
                <th>Kazanılan</th>
                <th className="text-right">Ciro</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((b, i) => (
                <>
                  <tr
                    key={b.id}
                    onClick={() => setOpen(open === b.id ? null : b.id)}
                    className={cn("cursor-pointer", !b.active && "opacity-60")}
                  >
                    <td>
                      {i < 3 && b.clicks > 0 ? (
                        <Trophy
                          size={15}
                          className={
                            i === 0 ? "text-amber-500" : i === 1 ? "text-slate-400" : "text-amber-700"
                          }
                        />
                      ) : (
                        <ChevronDown
                          size={15}
                          className={cn(
                            "text-muted transition-transform",
                            open === b.id && "rotate-180"
                          )}
                        />
                      )}
                    </td>
                    <td>
                      <div className="flex items-center gap-3">
                        <Avatar name={b.name} size="sm" tone={avatarTone(b.id)} />
                        <div className="min-w-0">
                          <p className="font-semibold text-ink truncate">{b.name}</p>
                          <p className="text-xs text-muted truncate">
                            {b.company ?? b.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="text-[0.8125rem]">
                      {b.accountManagerName ?? (
                        <span className="text-amber-600 font-medium text-xs">Atanmadı</span>
                      )}
                    </td>
                    <td className="num">{b.linkCount}</td>
                    <td>
                      <span className="num font-semibold text-ink">{b.clicks}</span>
                    </td>
                    <td className="num">{b.leadCount}</td>
                    <td>
                      <span className="num font-medium">{b.won}</span>
                      {b.leadCount > 0 && (
                        <span className="text-muted text-xs ml-1.5 num">
                          %{pct(b.won, b.leadCount)}
                        </span>
                      )}
                    </td>
                    <td className="text-right num font-semibold">
                      {b.revenue > 0 ? formatPrice(b.revenue) : "—"}
                    </td>
                  </tr>

                  {open === b.id && (
                    <tr key={`${b.id}-detay`}>
                      <td colSpan={8} className="!p-0">
                        <div className="bg-surface-2/60 px-5 py-5 space-y-5">
                          {/* Link dökümü */}
                          <div>
                            <p className="text-[0.6875rem] font-bold uppercase tracking-wider text-muted mb-2.5">
                              Paylaşılan sunum linkleri
                            </p>
                            {b.links.length === 0 ? (
                              <p className="text-sm text-muted">Henüz link paylaşılmamış.</p>
                            ) : (
                              <ul className="space-y-1.5">
                                {b.links.map((l) => (
                                  <li
                                    key={l.id}
                                    className="flex flex-wrap items-center gap-3 rounded-lg bg-surface px-3.5 py-2.5 border border-border"
                                  >
                                    <span className="font-medium text-ink text-sm min-w-0 flex-1 truncate">
                                      {l.projectName ?? "Tüm projeler"}
                                      {l.label && (
                                        <span className="text-muted font-normal"> · {l.label}</span>
                                      )}
                                    </span>
                                    <Badge tone="bg-brand-50 text-brand ring-brand/20">
                                      <span className="num">{l.clicks}</span> açılma
                                    </Badge>
                                    <span className="text-[0.6875rem] text-muted whitespace-nowrap">
                                      {l.lastOpenedAt
                                        ? `son: ${timeAgo(l.lastOpenedAt)}`
                                        : "hiç açılmadı"}
                                    </span>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>

                          {/* Proje bazlı müşteri dağılımı */}
                          {b.byProject.length > 0 && (
                            <div>
                              <p className="text-[0.6875rem] font-bold uppercase tracking-wider text-muted mb-2.5">
                                Getirdiği müşterilerin projelere dağılımı
                              </p>
                              <ul className="space-y-2">
                                {b.byProject
                                  .sort((x, y) => y.leads - x.leads)
                                  .map((p) => (
                                    <li key={p.projectId} className="flex items-center gap-3">
                                      <span className="text-sm text-ink-soft w-44 shrink-0 truncate">
                                        {p.name}
                                      </span>
                                      <div className="flex-1 h-2 rounded-full bg-surface-3 overflow-hidden">
                                        <div
                                          className="h-full bg-brand rounded-full"
                                          style={{ width: `${pct(p.leads, b.leadCount)}%` }}
                                        />
                                      </div>
                                      <span className="num text-sm font-semibold text-ink w-8 text-right">
                                        {p.leads}
                                      </span>
                                    </li>
                                  ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
