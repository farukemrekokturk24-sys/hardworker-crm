import Link from "next/link";
import { cn } from "@/lib/utils";
import type { ComponentProps, ReactNode } from "react";

type Variant = "primary" | "secondary" | "outline" | "ghost" | "dark" | "danger" | "gold";
type Size = "sm" | "md" | "lg" | "icon";

const VARIANTS: Record<Variant, string> = {
  primary:
    "bg-brand text-white hover:bg-brand-600 active:bg-brand-700 shadow-sm shadow-brand/25",
  secondary:
    "bg-surface-2 text-ink hover:bg-surface-3 border border-border",
  outline:
    "border border-border-strong text-ink bg-surface hover:bg-surface-2 hover:border-brand/40",
  ghost: "text-ink-soft hover:text-ink hover:bg-surface-2",
  dark: "bg-dark text-white hover:bg-dark-2 shadow-sm",
  danger: "bg-rose-600 text-white hover:bg-rose-700 shadow-sm",
  gold: "bg-gold text-white hover:brightness-110 shadow-sm",
};

const SIZES: Record<Size, string> = {
  sm: "h-9 px-3.5 text-[0.8125rem] gap-1.5 rounded-lg",
  md: "h-11 px-5 text-sm gap-2 rounded-xl",
  lg: "h-13 px-7 text-[0.9375rem] gap-2.5 rounded-xl",
  icon: "h-10 w-10 rounded-xl",
};

const BASE =
  "inline-flex items-center justify-center font-semibold tracking-tight transition-all duration-200 " +
  "disabled:opacity-50 disabled:pointer-events-none select-none whitespace-nowrap active:scale-[0.98]";

type Props = {
  variant?: Variant;
  size?: Size;
  href?: string;
  className?: string;
  children?: ReactNode;
  fullWidth?: boolean;
} & Omit<ComponentProps<"button">, "children">;

export function Button({
  variant = "primary",
  size = "md",
  href,
  className,
  children,
  fullWidth,
  ...rest
}: Props) {
  const cls = cn(BASE, VARIANTS[variant], SIZES[size], fullWidth && "w-full", className);
  if (href) {
    return (
      <Link href={href} className={cls}>
        {children}
      </Link>
    );
  }
  return (
    <button className={cls} {...rest}>
      {children}
    </button>
  );
}
