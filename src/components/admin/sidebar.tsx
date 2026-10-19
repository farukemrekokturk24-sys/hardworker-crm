"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Users, CalendarDays, Handshake, Building2,
  Layers, CheckSquare, BarChart3, Settings, Image as ImageIcon,
  MessageSquare, UserCog,
} from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { can } from "@/lib/permissions";
import { cn } from "@/lib/utils";

const NAV: {
  section: string;
  items: { href: string; label: string; icon: typeof Users; area: string; badge?: number }[];
}[] = [
  {
    section: "Satış",
    items: [
      { href: "/panel", label: "Genel Bakış", icon: LayoutDashboard, area: "dashboard" },
      { href: "/panel/leadler", label: "Lead'ler", icon: Users, area: "leads" },
      { href: "/panel/randevular", label: "Randevular", icon: CalendarDays, area: "appointments" },
      { href: "/panel/satislar", label: "Satışlar", icon: Handshake, area: "deals" },
      { href: "/panel/gorevler", label: "Görevler", icon: CheckSquare, area: "tasks" },
    ],
  },
  {
    section: "Portföy",
    items: [
      { href: "/panel/projeler", label: "Projeler", icon: Building2, area: "projects" },
      { href: "/panel/daireler", label: "Daire Envanteri", icon: Layers, area: "units" },
      { href: "/panel/medya", label: "Medya", icon: ImageIcon, area: "media" },
    ],
  },
  {
    section: "Yönetim",
    items: [
      { href: "/panel/raporlar", label: "Raporlar", icon: BarChart3, area: "reports" },
      { href: "/panel/mesajlar", label: "İletişim Mesajları", icon: MessageSquare, area: "leads" },
      { href: "/panel/kullanicilar", label: "Kullanıcılar", icon: UserCog, area: "*" },
      { href: "/panel/ayarlar", label: "Ayarlar", icon: Settings, area: "*" },
    ],
  },
];

export function Sidebar({
  role,
  counts,
  onNavigate,
}: {
  role: string;
  counts?: Record<string, number>;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();

  return (
    <div className="flex flex-col h-full bg-dark text-white/70">
      <div className="h-16 flex items-center px-5 border-b border-white/10 shrink-0">
        <Logo variant="dark" href="/panel" />
      </div>

      <nav className="flex-1 overflow-y-auto thin-scroll px-3 py-5 space-y-6">
        {NAV.map((group) => {
          const items = group.items.filter((i) => can(role, i.area) || i.area === "view");
          if (!items.length) return null;
          return (
            <div key={group.section}>
              <p className="px-3 text-[0.625rem] font-bold uppercase tracking-[0.14em] text-white/35 mb-2">
                {group.section}
              </p>
              <ul className="space-y-0.5">
                {items.map((item) => {
                  const active =
                    item.href === "/panel"
                      ? pathname === "/panel"
                      : pathname.startsWith(item.href);
                  const badge = counts?.[item.href];
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={onNavigate}
                        className={cn(
                          "flex items-center gap-3 px-3 h-10 rounded-xl text-[0.875rem] font-medium transition-colors",
                          active
                            ? "bg-brand text-white shadow-sm shadow-brand/25"
                            : "hover:bg-white/8 hover:text-white"
                        )}
                      >
                        <item.icon size={17} className="shrink-0" />
                        <span className="truncate">{item.label}</span>
                        {badge ? (
                          <span
                            className={cn(
                              "ml-auto num text-[0.6875rem] font-bold px-1.5 py-0.5 rounded-full",
                              active ? "bg-white/20" : "bg-brand/20 text-brand-100"
                            )}
                          >
                            {badge}
                          </span>
                        ) : null}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </nav>

      <div className="p-3 border-t border-white/10 shrink-0">
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-3 px-3 h-10 rounded-xl text-[0.8125rem] font-medium hover:bg-white/8 hover:text-white transition-colors"
        >
          <Building2 size={16} />
          Siteyi görüntüle
        </Link>
      </div>
    </div>
  );
}
