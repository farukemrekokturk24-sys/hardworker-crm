import Link from "next/link";
import Image from "next/image";
import { MapPin, Building2, ArrowUpRight } from "lucide-react";
import { Badge } from "@/components/ui/primitives";
import { PriceTag } from "./price-gate";
import { PROJECT_STATUS_LABELS, PROJECT_STATUS_TONE } from "@/lib/constants";
import { formatPrice } from "@/lib/utils";

export type ProjectCardData = {
  id: string;
  slug: string;
  name: string;
  tagline: string | null;
  status: string;
  city: string | null;
  district: string | null;
  coverImage: string | null;
  deliveryLabel: string | null;
  totalUnits: number;
  availableUnits: number;
  minPrice: number | null;
  /** Fiyat tanımlı mı — kilitliyken gerçek değer gönderilmez. */
  hasPrice: boolean;
};

export function ProjectCard({
  project,
  priority,
}: {
  project: ProjectCardData;
  priority?: boolean;
}) {
  const sold = project.totalUnits > 0 && project.availableUnits === 0;

  return (
    <article className="group card card-hover overflow-hidden flex flex-col">
      <Link
        href={`/projeler/${project.slug}`}
        className="relative block aspect-[4/3] overflow-hidden bg-surface-2"
      >
        {project.coverImage ? (
          <Image
            src={project.coverImage}
            alt={project.name}
            fill
            priority={priority}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-700 group-hover:scale-[1.06]"
          />
        ) : (
          <div className="absolute inset-0 grid place-items-center text-muted">
            <Building2 size={36} />
          </div>
        )}

        <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-dark/70 to-transparent" />

        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          <Badge tone={PROJECT_STATUS_TONE[project.status]} className="shadow-sm backdrop-blur">
            {PROJECT_STATUS_LABELS[project.status]}
          </Badge>
          {sold && project.status !== "COMPLETED" && (
            <Badge tone="bg-rose-50 text-rose-700 ring-rose-200" className="shadow-sm">
              Tükendi
            </Badge>
          )}
        </div>

        {project.district && (
          <p className="absolute bottom-3 left-3 flex items-center gap-1.5 text-white text-[0.8125rem] font-semibold drop-shadow">
            <MapPin size={13} />
            {project.district}
            {project.city ? `, ${project.city}` : ""}
          </p>
        )}
      </Link>

      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-3">
          <h3 className="t-h3 text-ink group-hover:text-brand transition-colors">
            <Link href={`/projeler/${project.slug}`} className="after:absolute">
              {project.name}
            </Link>
          </h3>
          <ArrowUpRight
            size={18}
            className="shrink-0 mt-1 text-muted group-hover:text-brand group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-all"
          />
        </div>

        {project.tagline && (
          <p className="text-sm text-muted mt-1.5 line-clamp-2 leading-relaxed">
            {project.tagline}
          </p>
        )}

        <dl className="grid grid-cols-2 gap-x-4 gap-y-2 mt-4 pt-4 border-t border-border text-sm">
          <div>
            <dt className="text-[0.6875rem] font-semibold uppercase tracking-wider text-muted">
              Daire
            </dt>
            <dd className="font-semibold text-ink num mt-0.5">
              {project.totalUnits}
              {project.availableUnits > 0 && (
                <span className="text-emerald-600 font-medium text-xs ml-1.5">
                  {project.availableUnits} satışta
                </span>
              )}
            </dd>
          </div>
          <div>
            <dt className="text-[0.6875rem] font-semibold uppercase tracking-wider text-muted">
              Teslim
            </dt>
            <dd className="font-semibold text-ink mt-0.5 text-[0.8125rem]">
              {project.deliveryLabel ?? "—"}
            </dd>
          </div>
        </dl>

        {project.hasPrice ? (
          <div className="mt-4 pt-4 border-t border-border flex items-baseline gap-1.5 relative z-10">
            <span className="text-xs text-muted font-medium">Başlangıç</span>
            <PriceTag
              price={project.minPrice !== null ? formatPrice(project.minPrice) : null}
              projectId={project.id}
              projectName={project.name}
              size="md"
            />
          </div>
        ) : (
          <div className="mt-4 pt-4 border-t border-border">
            <span className="text-sm text-muted font-medium">
              {project.status === "COMPLETED" ? "Teslim edildi" : "Satışa hazırlanıyor"}
            </span>
          </div>
        )}
      </div>
    </article>
  );
}
