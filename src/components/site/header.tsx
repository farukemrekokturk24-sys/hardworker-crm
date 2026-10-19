"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Phone, MessageCircle, Lock, CheckCircle2 } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { usePriceGate } from "./price-gate";
import { NAV_LINKS, BRAND } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function Header({ overHero = false }: { overHero?: boolean }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { unlocked, open: openGate } = usePriceGate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const transparent = overHero && !scrolled && !open;

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-all duration-300",
          transparent
            ? "bg-transparent"
            : "glass border-b border-border shadow-[0_1px_3px_rgb(15_23_34/0.05)]"
        )}
      >
        <div className="container-x flex items-center justify-between h-16 lg:h-[74px]">
          <Logo variant={transparent ? "dark" : "light"} />

          <nav className="hidden lg:flex items-center gap-0.5">
            {NAV_LINKS.map((link) => {
              const active =
                link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "relative px-3.5 py-2 text-[0.875rem] font-semibold rounded-lg transition-colors",
                    transparent
                      ? "text-white/80 hover:text-white"
                      : "text-ink-soft hover:text-ink",
                    active && (transparent ? "text-white" : "text-brand")
                  )}
                >
                  {link.label}
                  {active && (
                    <span
                      className={cn(
                        "absolute inset-x-3.5 -bottom-0.5 h-0.5 rounded-full",
                        transparent ? "bg-white" : "bg-brand"
                      )}
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="hidden lg:flex items-center gap-2">
            <a
              href={`tel:${BRAND.phoneRaw}`}
              className={cn(
                "inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition-colors",
                transparent
                  ? "text-white/85 hover:text-white hover:bg-white/10"
                  : "text-ink-soft hover:text-ink hover:bg-surface-2"
              )}
            >
              <Phone size={15} />
              {BRAND.phone}
            </a>
            {unlocked ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-[0.8125rem] font-semibold text-emerald-600 bg-emerald-50">
                <CheckCircle2 size={14} />
                Fiyatlar açık
              </span>
            ) : (
              <Button onClick={() => openGate()} size="sm">
                <Lock size={14} />
                Fiyat Listesi
              </Button>
            )}
          </div>

          <button
            className={cn(
              "lg:hidden inline-flex items-center justify-center h-10 w-10 -mr-1 rounded-xl transition-colors",
              transparent ? "text-white hover:bg-white/10" : "text-ink hover:bg-surface-2"
            )}
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Menüyü kapat" : "Menüyü aç"}
            aria-expanded={open}
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </header>

      {/* Mobil menü */}
      {open && (
        <div className="lg:hidden fixed inset-0 top-16 z-40 bg-surface anim-fade overflow-y-auto">
          <nav className="container-x py-6 flex flex-col">
            {NAV_LINKS.map((link, i) => {
              const active =
                link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  style={{ animationDelay: `${i * 45}ms` }}
                  className={cn(
                    "anim-fade-up py-3.5 text-xl font-display font-bold border-b border-border transition-colors",
                    active ? "text-brand" : "text-ink hover:text-brand"
                  )}
                >
                  {link.label}
                </Link>
              );
            })}

            <div className="mt-7 space-y-3">
              {!unlocked && (
                <Button onClick={() => openGate()} size="lg" fullWidth>
                  <Lock size={16} /> Fiyat Listesini Aç
                </Button>
              )}
              <Button
                href={`https://wa.me/${BRAND.whatsapp}`}
                variant="outline"
                size="lg"
                fullWidth
              >
                <MessageCircle size={16} /> WhatsApp ile Yazın
              </Button>
              <a
                href={`tel:${BRAND.phoneRaw}`}
                className="flex items-center justify-center gap-2 h-13 rounded-xl bg-surface-2 font-semibold text-ink"
              >
                <Phone size={16} /> {BRAND.phone}
              </a>
            </div>

            <p className="mt-7 text-sm text-muted leading-relaxed">{BRAND.address}</p>
          </nav>
        </div>
      )}
    </>
  );
}
