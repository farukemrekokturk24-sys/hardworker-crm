import { MapPin, ExternalLink } from "lucide-react";
import { BRAND } from "@/lib/constants";
import { cn } from "@/lib/utils";

/**
 * Ofis konumu — Google işletme kaydından alınan gerçek koordinata gömülüdür.
 * (CID tabanlı gömme, işletme pinini adıyla birlikte gösterir.)
 */
export function OfficeMap({ className }: { className?: string }) {
  return (
    <div className={cn("overflow-hidden rounded-[var(--r-card)] border border-border", className)}>
      <iframe
        title="Hardworker Construction ofis konumu"
        src={BRAND.mapsEmbedUrl}
        className="w-full h-[320px] sm:h-[380px] border-0 block"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        allowFullScreen
      />
      <div className="flex flex-wrap items-center justify-between gap-3 bg-surface px-5 py-4 border-t border-border">
        <p className="flex items-start gap-2.5 text-sm text-ink-soft leading-relaxed">
          <MapPin size={16} className="shrink-0 mt-0.5 text-brand" />
          {BRAND.address}
        </p>
        <a
          href={BRAND.mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand hover:text-brand-600 transition-colors shrink-0"
        >
          Yol tarifi al <ExternalLink size={14} />
        </a>
      </div>
    </div>
  );
}
