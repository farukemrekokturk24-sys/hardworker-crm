import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function PageHero({
  eyebrow,
  title,
  description,
  image,
  breadcrumb,
  children,
  size = "md",
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  image?: string | null;
  breadcrumb?: { href: string; label: string }[];
  children?: React.ReactNode;
  size?: "sm" | "md" | "lg";
}) {
  const heights = {
    sm: "min-h-[42vh] pt-28 pb-10",
    md: "min-h-[55vh] pt-32 pb-14",
    lg: "min-h-[72vh] pt-36 pb-16",
  };

  return (
    <section className={cn("relative flex items-end overflow-hidden bg-dark", heights[size])}>
      {image ? (
        <>
          <Image src={image} alt="" fill priority sizes="100vw" className="object-cover opacity-50" />
          <div className="absolute inset-0 bg-gradient-to-t from-dark via-dark/70 to-dark/30" />
        </>
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-dark via-dark-2 to-brand-700/40" />
      )}

      <div className="container-x relative">
        {breadcrumb && (
          <nav aria-label="Konum" className="flex items-center gap-1.5 text-[0.8125rem] text-white/55 mb-5 flex-wrap">
            <Link href="/" className="hover:text-white transition-colors">Ana Sayfa</Link>
            {breadcrumb.map((b, i) => (
              <span key={b.href} className="flex items-center gap-1.5">
                <ChevronRight size={13} className="opacity-50" />
                {i === breadcrumb.length - 1 ? (
                  <span className="text-white/85 font-medium">{b.label}</span>
                ) : (
                  <Link href={b.href} className="hover:text-white transition-colors">{b.label}</Link>
                )}
              </span>
            ))}
          </nav>
        )}

        {eyebrow && (
          <p className="anim-fade-up inline-flex items-center gap-2 text-white/70 text-[0.6875rem] font-bold tracking-[0.2em] uppercase mb-4">
            <span className="h-px w-7 bg-brand" />
            {eyebrow}
          </p>
        )}

        <h1 className="anim-fade-up t-h1 text-white max-w-3xl text-balance" style={{ animationDelay: "60ms" }}>
          {title}
        </h1>

        {description && (
          <p className="anim-fade-up t-lead text-white/70 mt-4 max-w-2xl" style={{ animationDelay: "130ms" }}>
            {description}
          </p>
        )}

        {children && (
          <div className="anim-fade-up mt-8" style={{ animationDelay: "200ms" }}>
            {children}
          </div>
        )}
      </div>
    </section>
  );
}
