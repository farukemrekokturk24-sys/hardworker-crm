import Link from "next/link";
import { MapPin, ArrowUpRight, Building2 } from "lucide-react";
import { Badge } from "@/components/ui/primitives";
import { PriceTag } from "./price-gate";
import { ProjectMedia } from "./project-media";
import { SoldOutBadge, LastUnitsBadge } from "./sold-out";
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
  /** Rezerve edilmiş daire sayısı — proje tükenmiş sayılmaz. */
  reservedUnits: number;
  minPrice: number | null;
  hasPrice: boolean;
  video?: string | null;
  videoPoster?: string | null;
};

export function ProjectCard({
  project,
  priority,
}: {
  project: ProjectCardData;
  priority?: boolean;
}) {
  // Rezerve daire varsa proje tükenmiş değildir; kıtlık vurgusu yapılır.
  const noneFree = project.totalUnits > 0 && project.availableUnits === 0;
  const soldOut = noneFree && project.reservedUnits === 0;
  const lastUnits = noneFree && project.reservedUnits > 0;

  return (
    <article className="group card card-hover overflow-hidden flex flex-col">
      <Link
        href={`/projeler/${project.slug}`}
        className="relative block aspect-[4/3] overflow-hidden"
      >
        {project.video || project.coverImage ? (
          <ProjectMedia
            video={project.video}
            poster={project.videoPoster}
            image={project.coverImage}
            alt={project.name}
            priority={priority}
            className="transition-transform duration-[900ms] group-hover:scale-[1.07]"
          />
        ) : (
          <div className="absolute inset-0 grid place-items-center bg-surface-2 text-muted">
            <Building2 size={36} />
          </div>
        )}

        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-dark/80 to-transparent" />

        <div className="absolute top-3.5 left-3.5 flex flex-wrap gap-1.5">
          <Badge
            tone={PROJECT_STATUS_TONE[project.status]}
            className="shadow-sm backdrop-blur"
          >
            {PROJECT_STATUS_LABELS[project.status]}
          </Badge>
        </div>

        {soldOut && <SoldOutBadge />}
        {lastUnits && <LastUnitsBadge count={project.reservedUnits} />}

        {project.district && (
          <p className="absolute bottom-3.5 left-3.5 flex items-center gap-1.5 text-white text-[0.8125rem] font-semibold drop-shadow">
            <MapPin size={13} />
            {project.district}
            {project.city ? `, ${project.city}` : ""}
          </p>
        )}
      </Link>

      <div className="p-5 sm:p-6 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-3">
          <h3 className="t-h3 text-ink transition-colors group-hover:text-brand">
            <Link href={`/projeler/${project.slug}`} className="after:absolute">
              {project.name}
            </Link>
          </h3>
          <span className="corner-arrow shrink-0 !h-9 !w-9">
            <ArrowUpRight size={17} />
          </span>
        </div>

        {project.tagline && (
          <p className="text-sm text-muted mt-2 line-clamp-2 leading-relaxed">
            {project.tagline}
          </p>
        )}

        <dl className="grid grid-cols-2 gap-x-4 gap-y-2 mt-5 pt-5 border-t border-border text-sm">
          <div>
            <dt className="text-[0.625rem] font-bold uppercase tracking-[0.12em] text-muted">
              Daire
            </dt>
            <dd className="font-semibold text-ink num mt-1">
              {project.totalUnits}
              {project.availableUnits > 0 && (
                <span className="text-emerald-600 font-medium text-xs ml-1.5">
                  {project.availableUnits} satışta
                </span>
              )}
            </dd>
          </div>
          <div>
            <dt className="text-[0.625rem] font-bold uppercase tracking-[0.12em] text-muted">
              Teslim
            </dt>
            <dd className="font-semibold text-ink mt-1 text-[0.8125rem]">
              {project.deliveryLabel ?? "—"}
            </dd>
          </div>
        </dl>

        {project.hasPrice ? (
          <div className="mt-5 pt-5 border-t border-border flex items-baseline gap-2 relative z-10">
            <span className="text-xs text-muted font-medium">Başlangıç</span>
            <PriceTag
              price={project.minPrice !== null ? formatPrice(project.minPrice) : null}
              projectId={project.id}
              projectName={project.name}
              size="md"
            />
          </div>
        ) : (
          <div className="mt-5 pt-5 border-t border-border">
            <span className="text-sm text-muted font-medium">
              {lastUnits
                ? `Son ${project.reservedUnits} daire · rezerve`
                : soldOut
                  ? "Tüm daireler satıldı"
                  : project.status === "COMPLETED"
                    ? "Teslim edildi"
                    : "Satışa hazırlanıyor"}
            </span>
          </div>
        )}
      </div>
    </article>
  );
}
