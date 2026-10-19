"use client";

import { useEffect, useState } from "react";
import { Phone, ArrowUp } from "lucide-react";
import { WhatsappIcon } from "@/components/brand/social-icons";
import { BRAND } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function FloatingActions() {
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 700);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="fixed right-3.5 bottom-4 sm:right-5 sm:bottom-6 z-40 flex flex-col gap-2.5 safe-b">
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        aria-label="Yukarı çık"
        className={cn(
          "h-11 w-11 rounded-full glass border border-border shadow-lg grid place-items-center text-ink-soft hover:text-brand transition-all",
          showTop ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3 pointer-events-none"
        )}
      >
        <ArrowUp size={18} />
      </button>

      <a
        href={`tel:${BRAND.phoneRaw}`}
        aria-label="Telefonla arayın"
        className="h-12 w-12 rounded-full bg-dark text-white shadow-lg grid place-items-center hover:bg-dark-2 transition-colors sm:hidden"
      >
        <Phone size={20} />
      </a>

      <a
        href={`https://wa.me/${BRAND.whatsapp}?text=${encodeURIComponent(
          "Merhaba, projeleriniz hakkında bilgi almak istiyorum."
        )}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="WhatsApp ile yazın"
        className="h-13 w-13 h-[52px] w-[52px] rounded-full bg-[#25D366] text-white shadow-lg shadow-[#25D366]/30 grid place-items-center hover:brightness-105 active:scale-95 transition-all"
      >
        <WhatsappIcon size={25} />
      </a>
    </div>
  );
}
