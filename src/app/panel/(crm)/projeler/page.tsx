import Link from "next/link";
import Image from "next/image";
import { Building2, Pencil, ExternalLink, Eye, EyeOff } from "lucide-react";
import { Card, Badge } from "@/components/ui/primitives";
import { prisma } from "@/lib/prisma";
import { PROJECT_STATUS_LABELS, PROJECT_STATUS_TONE } from "@/lib/constants";
import { formatPrice } from "@/lib/utils";

export const metadata = { title: "Projeler" };

export default async function PanelProjectsPage() {
  const projects = await prisma.project.findMany({
    include: {
      units: { select: { status: true, price: true } },
      _count: { select: { images: true, leads: true, deals: true } },
    },
    orderBy: { order: "asc" },
  });

  return (
    <div className="space-y-5">
      <div>
        <h1 className="t-h2 text-ink flex items-center gap-2.5">
          <Building2 size={26} className="text-brand" /> Projeler
        </h1>
        <p className="text-muted mt-1 text-sm">
          {projects.length} proje · {projects.reduce((s, p) => s + p.units.length, 0)} daire
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {projects.map((p) => {
          const available = p.units.filter((u) => u.status === "AVAILABLE");
          const prices = available.map((u) => u.price).filter((v): v is number => !!v);
          return (
            <Card key={p.id} hover className="overflow-hidden flex flex-col">
              <div className="relative aspect-[16/10] bg-surface-2">
                {p.coverImage ? (
                  <Image
                    src={p.coverImage}
                    alt={p.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 grid place-items-center text-muted">
                    <Building2 size={30} />
                  </div>
                )}
                <div className="absolute top-3 left-3 flex gap-1.5">
                  <Badge tone={PROJECT_STATUS_TONE[p.status]}>
                    {PROJECT_STATUS_LABELS[p.status]}
                  </Badge>
                  <Badge
                    tone={
                      p.published
                        ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
                        : "bg-slate-100 text-slate-600 ring-slate-200"
                    }
                  >
                    {p.published ? <Eye size={11} /> : <EyeOff size={11} />}
                    {p.published ? "Yayında" : "Gizli"}
                  </Badge>
                </div>
              </div>

              <div className="p-5 flex flex-col flex-1">
                <h2 className="t-h3 text-ink">{p.name}</h2>
                {p.tagline && (
                  <p className="text-sm text-muted mt-1 line-clamp-2">{p.tagline}</p>
                )}

                <dl className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-border text-center">
                  <div>
                    <dt className="text-[0.625rem] font-bold uppercase tracking-wider text-muted">
                      Satışta
                    </dt>
                    <dd className="font-display font-bold text-emerald-600 num mt-0.5">
                      {available.length}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[0.625rem] font-bold uppercase tracking-wider text-muted">
                      Lead
                    </dt>
                    <dd className="font-display font-bold text-ink num mt-0.5">
                      {p._count.leads}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[0.625rem] font-bold uppercase tracking-wider text-muted">
                      Görsel
                    </dt>
                    <dd className="font-display font-bold text-ink num mt-0.5">
                      {p._count.images}
                    </dd>
                  </div>
                </dl>

                {prices.length > 0 && (
                  <p className="text-sm text-muted mt-3">
                    Başlangıç{" "}
                    <strong className="text-ink num">
                      {formatPrice(Math.min(...prices))}
                    </strong>
                  </p>
                )}

                <div className="flex gap-2 mt-4 pt-4 border-t border-border">
                  <Link
                    href={`/panel/projeler/${p.id}`}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 h-9 rounded-lg bg-brand text-white text-[0.8125rem] font-semibold hover:bg-brand-600 transition-colors"
                  >
                    <Pencil size={14} /> Düzenle
                  </Link>
                  <Link
                    href={`/projeler/${p.slug}`}
                    target="_blank"
                    className="inline-flex items-center justify-center gap-1.5 h-9 px-3 rounded-lg border border-border text-[0.8125rem] font-semibold text-ink-soft hover:border-brand/40 transition-colors"
                  >
                    <ExternalLink size={14} /> Sitede
                  </Link>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
