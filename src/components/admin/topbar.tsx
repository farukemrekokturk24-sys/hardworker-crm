"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Menu, LogOut, ChevronDown, Bell, Search } from "lucide-react";
import { logoutAction } from "@/app/panel/(crm)/actions";
import { Avatar } from "@/components/ui/primitives";
import { ROLE_LABELS } from "@/lib/constants";
import { avatarTone } from "@/lib/utils";
import type { SessionUser } from "@/lib/auth";

export function Topbar({
  user,
  onMenu,
}: {
  user: SessionUser;
  onMenu: () => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  return (
    <header className="sticky top-0 z-30 h-16 glass border-b border-border flex items-center gap-3 px-4 sm:px-6 lg:px-8">
      <button
        onClick={onMenu}
        aria-label="Menüyü aç"
        className="lg:hidden h-10 w-10 -ml-2 rounded-xl grid place-items-center text-ink hover:bg-surface-2 transition-colors"
      >
        <Menu size={21} />
      </button>

      <form action="/panel/leadler" className="hidden sm:flex relative flex-1 max-w-sm">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
        <input
          name="q"
          placeholder="Lead, telefon veya daire ara..."
          className="w-full h-10 rounded-xl border border-border bg-surface pl-10 pr-3.5 text-sm placeholder:text-muted/70 focus:border-brand focus:ring-2 focus:ring-brand/15 focus:outline-none transition-colors"
        />
      </form>

      <div className="ml-auto flex items-center gap-1.5">
        <Link
          href="/panel/gorevler"
          aria-label="Görevler"
          className="h-10 w-10 rounded-xl grid place-items-center text-ink-soft hover:text-ink hover:bg-surface-2 transition-colors"
        >
          <Bell size={18} />
        </Link>

        <div ref={ref} className="relative">
          <button
            onClick={() => setOpen((v) => !v)}
            className="flex items-center gap-2.5 h-10 pl-1.5 pr-2.5 rounded-xl hover:bg-surface-2 transition-colors"
          >
            <Avatar name={user.name} size="sm" tone={avatarTone(user.uid)} />
            <span className="hidden sm:block text-left leading-tight">
              <span className="block text-[0.8125rem] font-semibold text-ink">
                {user.name}
              </span>
              <span className="block text-[0.6875rem] text-muted">
                {ROLE_LABELS[user.role] ?? user.role}
              </span>
            </span>
            <ChevronDown size={15} className="text-muted" />
          </button>

          {open && (
            <div className="absolute right-0 top-12 w-56 card p-1.5 shadow-lg anim-scale origin-top-right">
              <div className="px-3 py-2.5 border-b border-border mb-1">
                <p className="font-semibold text-ink text-sm truncate">{user.name}</p>
                <p className="text-xs text-muted truncate">{user.email}</p>
              </div>
              <form action={logoutAction}>
                <button
                  type="submit"
                  className="w-full flex items-center gap-2.5 px-3 h-9 rounded-lg text-sm font-medium text-rose-600 hover:bg-rose-50 transition-colors"
                >
                  <LogOut size={16} /> Çıkış Yap
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
