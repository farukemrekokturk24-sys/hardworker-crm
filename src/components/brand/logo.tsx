import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

export function Logo({
  variant = "light",
  href = "/",
  className,
  compact,
}: {
  variant?: "light" | "dark";
  href?: string | null;
  className?: string;
  compact?: boolean;
}) {
  const inner = (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <Image
        src="/brand/logo.png"
        alt="Hardworker Construction"
        width={40}
        height={30}
        priority
        className={cn(
          "h-8 w-auto object-contain transition-[filter]",
          variant === "dark" && "brightness-0 invert"
        )}
      />
      {!compact && (
        <span className="flex flex-col leading-none">
          <span
            className={cn(
              "font-display font-extrabold tracking-tight text-[0.95rem]",
              variant === "dark" ? "text-white" : "text-ink"
            )}
          >
            HARDWORKER
          </span>
          <span
            className={cn(
              "text-[0.5625rem] font-semibold tracking-[0.22em] mt-0.5",
              variant === "dark" ? "text-white/60" : "text-muted"
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
