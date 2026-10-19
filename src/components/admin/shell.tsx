"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";
import type { SessionUser } from "@/lib/auth";

export function Shell({
  user,
  counts,
  children,
}: {
  user: SessionUser;
  counts?: Record<string, number>;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-dvh bg-bg">
      {/* Masaüstü sidebar */}
      <aside className="hidden lg:block fixed inset-y-0 left-0 w-[248px] z-40">
        <Sidebar role={user.role} counts={counts} />
      </aside>

      {/* Mobil sidebar */}
      {open && (
        <>
          <div
            className="lg:hidden fixed inset-0 bg-dark/50 backdrop-blur-sm z-40 anim-fade"
            onClick={() => setOpen(false)}
          />
          <aside className="lg:hidden fixed inset-y-0 left-0 w-[272px] z-50 anim-fade-up">
            <Sidebar role={user.role} counts={counts} onNavigate={() => setOpen(false)} />
            <button
              onClick={() => setOpen(false)}
              aria-label="Menüyü kapat"
              className="absolute top-4 -right-12 h-10 w-10 rounded-xl bg-surface shadow-lg grid place-items-center text-ink"
            >
              <X size={20} />
            </button>
          </aside>
        </>
      )}

      <div className="lg:pl-[248px] flex flex-col min-h-dvh min-w-0">
        <Topbar user={user} onMenu={() => setOpen(true)} />
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}

export function MobileMenuButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      aria-label="Menüyü aç"
      className="lg:hidden h-10 w-10 -ml-2 rounded-xl grid place-items-center text-ink hover:bg-surface-2 transition-colors"
    >
      <Menu size={21} />
    </button>
  );
}
