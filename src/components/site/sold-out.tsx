import { cn } from "@/lib/utils";

/**
 * Tükenen projeler için damga.
 * Marka mavisiyle, oturma + parlama animasyonlu.
 */
export function SoldOutBadge({
  className,
  size = "md",
}: {
  className?: string;
  size?: "md" | "lg";
}) {
  return (
    <div
      className={cn(
        "absolute inset-0 grid place-items-center pointer-events-none",
        className
      )}
    >
      <span className="absolute inset-0 bg-dark/40 backdrop-blur-[1px]" />
      <span
        className={cn(
          "stamp relative font-display font-extrabold uppercase",
          "bg-brand text-white ring-4 ring-white/30",
          size === "lg"
            ? "text-2xl sm:text-4xl tracking-[0.16em] px-9 py-4 rounded-2xl"
            : "text-lg sm:text-xl tracking-[0.18em] px-6 py-3 rounded-xl"
        )}
      >
        Sold Out
      </span>
    </div>
  );
}

/**
 * "Son N daire" damgası.
 * Satışta daire kalmadığında ama rezerve daire varken kullanılır:
 * proje tükenmiş sayılmaz, rezervasyon düşerse tekrar satışa açılır.
 */
export function LastUnitsBadge({
  count,
  className,
  size = "md",
}: {
  count: number;
  className?: string;
  size?: "md" | "lg";
}) {
  return (
    <div
      className={cn(
        "absolute inset-0 grid place-items-center pointer-events-none",
        className
      )}
    >
      <span className="absolute inset-0 bg-dark/35 backdrop-blur-[1px]" />
      <span
        className={cn(
          "stamp relative font-display font-extrabold uppercase text-center",
          "bg-gold text-white ring-4 ring-white/30",
          size === "lg"
            ? "text-xl sm:text-3xl tracking-[0.12em] px-8 py-4 rounded-2xl"
            : "text-base sm:text-lg tracking-[0.14em] px-5 py-3 rounded-xl"
        )}
      >
        Son {count} Daire
      </span>
    </div>
  );
}

/** Satır içi kullanım (tablo, liste) için kompakt rozet. */
export function SoldOutChip({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md bg-brand px-2 py-1",
        "text-[0.625rem] font-extrabold uppercase tracking-[0.14em] text-white",
        className
      )}
    >
      Sold Out
    </span>
  );
}
