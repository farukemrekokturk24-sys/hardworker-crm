import { cn } from "@/lib/utils";

/**
 * Tükenen projeler için belirgin "SOLD OUT" damgası.
 * Kart görselinin üzerine çapraz oturur, uzaktan da okunur.
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
      <span className="absolute inset-0 bg-dark/45" />
      <span
        className={cn(
          "relative -rotate-[8deg] font-display font-extrabold uppercase",
          "bg-[var(--danger)] text-white shadow-2xl",
          "ring-4 ring-white/25",
          size === "lg"
            ? "text-2xl sm:text-4xl tracking-[0.14em] px-8 py-3.5 rounded-xl"
            : "text-lg sm:text-xl tracking-[0.16em] px-5 py-2.5 rounded-lg"
        )}
      >
        Sold Out
      </span>
    </div>
  );
}

/** Satır içi kullanım (tablo, liste) için kompakt rozet. */
export function SoldOutChip({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md bg-[var(--danger)] px-2 py-1",
        "text-[0.625rem] font-extrabold uppercase tracking-[0.14em] text-white",
        className
      )}
    >
      Sold Out
    </span>
  );
}
