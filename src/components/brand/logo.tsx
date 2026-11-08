import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

type Size = "sm" | "md" | "lg";

const MARK: Record<Size, string> = {
  sm: "h-9",
  md: "h-11",
  lg: "h-14",
};
const NAME: Record<Size, string> = {
  sm: "text-[1.0625rem]",
  md: "text-[1.25rem]",
  lg: "text-[1.5rem]",
};
const SUB: Record<Size, string> = {
  sm: "text-[0.5625rem] tracking-[0.26em]",
  md: "text-[0.625rem] tracking-[0.28em]",
  lg: "text-[0.6875rem] tracking-[0.3em]",
};

export function Logo({
  variant = "light",
  href = "/",
  className,
  compact,
  size = "md",
}: {
  variant?: "light" | "dark";
  href?: string | null;
  className?: string;
  compact?: boolean;
  size?: Size;
}) {
  const onDark = variant === "dark";

  const inner = (
    <span className={cn("inline-flex items-center gap-3", className)}>
      <Image
        // Koyu zeminde siyah "H" beyaza çevrilmiş sürüm kullanılır; mavi altıgen aynen kalır
        src={onDark ? "/brand/logo-dark.png" : "/brand/logo.png"}
        alt="Hardworker Construction"
        width={347}
        height={400}
        priority
        className={cn(MARK[size], "w-auto object-contain")}
      />
      {!compact && (
        <span className="flex flex-col leading-none">
          <span
            className={cn(
              "font-display font-extrabold tracking-[-0.03em]",
              NAME[size],
              onDark ? "text-white" : "text-ink"
            )}
          >
            {/* Logodaki gibi H ve W marka mavisinde */}
            <span className="text-[#0085e3]">H</span>ARD
            <span className="text-[#0085e3]">W</span>ORKER
          </span>
          <span
            className={cn(
              "font-semibold mt-1",
              SUB[size],
              onDark ? "text-white/55" : "text-muted"
            )}
          >
            CONSTRUCTION
          </span>
        </span>
      )}
    </span>
  );

  if (!href) return inner;
  return (
    <Link href={href} aria-label="Hardworker Construction ana sayfa">
      {inner}
    </Link>
  );
}
