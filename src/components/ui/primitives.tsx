import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

/* --------------------------------------------------------------- Badge */

export function Badge({
  children,
  className,
  tone,
  dot,
}: {
  children: ReactNode;
  className?: string;
  tone?: string;
  dot?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[0.6875rem] font-bold tracking-wide ring-1 ring-inset",
        tone ?? "bg-surface-2 text-ink-soft ring-border",
        className
      )}
    >
      {dot && <span className={cn("h-1.5 w-1.5 rounded-full", dot)} />}
      {children}
    </span>
  );
}

/* ---------------------------------------------------------------- Card */

export function Card({
  children,
  className,
  hover,
}: {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}) {
  return (
    <div className={cn("card", hover && "card-hover", className)}>{children}</div>
  );
}

export function CardHeader({
  title,
  subtitle,
  action,
  className,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-start justify-between gap-4 px-5 py-4 border-b border-border",
        className
      )}
    >
      <div className="min-w-0">
        <h3 className="font-bold text-ink tracking-tight">{title}</h3>
        {subtitle && <p className="text-sm text-muted mt-0.5">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

/* --------------------------------------------------------------- Form */

export function Field({
  label,
  hint,
  error,
  required,
  children,
  className,
}: {
  label?: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      {label && (
        <label className="block text-[0.8125rem] font-semibold text-ink-soft">
          {label}
          {required && <span className="text-rose-500 ml-0.5">*</span>}
        </label>
      )}
      {children}
      {hint && !error && <p className="text-xs text-muted">{hint}</p>}
      {error && <p className="text-xs font-medium text-rose-600">{error}</p>}
    </div>
  );
}

export const inputClass =
  "w-full h-11 rounded-xl border border-border bg-surface px-3.5 text-sm text-ink " +
  "placeholder:text-muted/70 transition-colors " +
  "focus:border-brand focus:ring-2 focus:ring-brand/15 focus:outline-none " +
  "disabled:bg-surface-2 disabled:text-muted";

export const textareaClass =
  "w-full rounded-xl border border-border bg-surface px-3.5 py-3 text-sm text-ink " +
  "placeholder:text-muted/70 transition-colors resize-y min-h-[96px] " +
  "focus:border-brand focus:ring-2 focus:ring-brand/15 focus:outline-none";

export const selectClass =
  "w-full h-11 rounded-xl border border-border bg-surface px-3 text-sm text-ink " +
  "transition-colors focus:border-brand focus:ring-2 focus:ring-brand/15 focus:outline-none " +
  "appearance-none bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%236b7684%22 stroke-width=%222%22 stroke-linecap=%22round%22><path d=%22M6 9l6 6 6-6%22/></svg>')] " +
  "bg-[length:18px] bg-[right_0.75rem_center] bg-no-repeat pr-10";

/* ---------------------------------------------------------- Empty / Stat */

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-6">
      {icon && (
        <div className="h-14 w-14 rounded-2xl bg-surface-2 grid place-items-center text-muted mb-4">
          {icon}
        </div>
      )}
      <h3 className="font-bold text-ink">{title}</h3>
      {description && (
        <p className="text-sm text-muted mt-1.5 max-w-sm">{description}</p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function StatCard({
  label,
  value,
  sub,
  icon,
  tone = "brand",
  trend,
}: {
  label: string;
  value: ReactNode;
  sub?: string;
  icon?: ReactNode;
  tone?: "brand" | "emerald" | "amber" | "rose" | "violet";
  trend?: { value: number; label?: string };
}) {
  const tones = {
    brand: "bg-brand-50 text-brand",
    emerald: "bg-emerald-50 text-emerald-600",
    amber: "bg-amber-50 text-amber-600",
    rose: "bg-rose-50 text-rose-600",
    violet: "bg-violet-50 text-violet-600",
  };
  return (
    <div className="card p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[0.75rem] font-semibold uppercase tracking-wider text-muted">
            {label}
          </p>
          <p className="t-h2 num mt-2 text-ink">{value}</p>
          {sub && <p className="text-xs text-muted mt-1">{sub}</p>}
          {trend && (
            <p
              className={cn(
                "text-xs font-semibold mt-1.5",
                trend.value >= 0 ? "text-emerald-600" : "text-rose-600"
              )}
            >
              {trend.value >= 0 ? "▲" : "▼"} %{Math.abs(trend.value)}{" "}
              <span className="text-muted font-normal">{trend.label}</span>
            </p>
          )}
        </div>
        {icon && (
          <div className={cn("h-11 w-11 rounded-xl grid place-items-center shrink-0", tones[tone])}>
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------- Avatar */

export function Avatar({
  name,
  tone,
  size = "md",
  className,
}: {
  name: string;
  tone?: string;
  size?: "xs" | "sm" | "md" | "lg";
  className?: string;
}) {
  const sizes = {
    xs: "h-6 w-6 text-[0.625rem]",
    sm: "h-8 w-8 text-xs",
    md: "h-10 w-10 text-sm",
    lg: "h-14 w-14 text-lg",
  };
  const letters = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
  return (
    <div
      className={cn(
        "rounded-full grid place-items-center font-bold shrink-0",
        sizes[size],
        tone ?? "bg-brand-50 text-brand",
        className
      )}
      title={name}
    >
      {letters}
    </div>
  );
}

/* -------------------------------------------------------------- Section */

export function SectionHead({
  eyebrow,
  title,
  description,
  align = "left",
  className,
}: {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  align?: "left" | "center";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "max-w-2xl",
        align === "center" && "mx-auto text-center",
        className
      )}
    >
      {eyebrow && <p className="eyebrow mb-3">{eyebrow}</p>}
      <h2 className="t-h1 text-ink text-balance">{title}</h2>
      {description && <p className="t-lead mt-4 text-pretty">{description}</p>}
    </div>
  );
}

export function Divider({ className }: { className?: string }) {
  return <div className={cn("h-px bg-border", className)} />;
}
