import Image from "next/image";
import Link from "next/link";
import { Image as ImageIcon } from "lucide-react";
import { Card, CardHeader, EmptyState } from "@/components/ui/primitives";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";
import { IMAGE_CATEGORY_LABELS } from "@/lib/constants";

export const metadata = { title: "Medya" };

export default async function MediaPage() {
  await requireSession();

  const projects = await prisma.project.findMany({
    include: { images: { orderBy: [{ category: "asc" }, { order: "asc" }] } },
    orderBy: { order: "asc" },
  });

  const total = projects.reduce((s, p) => s + p.images.length, 0);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="t-h2 text-ink flex items-center gap-2.5">
          <ImageIcon size={26} className="text-brand" /> Medya Kütüphanesi
        </h1>
        <p className="text-muted mt-1 text-sm">
          {total} görsel · {projects.length} projeye bağlı
        </p>
      </div>

      {total === 0 ? (
        <Card>
          <EmptyState icon={<ImageIcon size={22} />} title="Görsel yok" />
        </Card>
      ) : (
        projects.map((p) =>
          p.images.length === 0 ? null : (
            <Card key={p.id}>
              <CardHeader
                title={p.name}
                subtitle={`${p.images.length} görsel`}
                action={
                  <Link
                    href={`/panel/projeler/${p.id}`}
                    className="text-sm font-semibold text-brand hover:text-brand-600"
                  >
                    Yönet
                  </Link>
                }
              />
              <div className="p-5 grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-10 gap-2">
                {p.images.slice(0, 30).map((img) => (
                  <div
                    key={img.id}
                    className="relative aspect-square rounded-lg overflow-hidden bg-surface-2 border border-border"
                    title={IMAGE_CATEGORY_LABELS[img.category] ?? img.category}
                  >
                    <Image src={img.url} alt="" fill sizes="120px" className="object-cover" />
                  </div>
                ))}
                {p.images.length > 30 && (
                  <div className="aspect-square rounded-lg bg-surface-2 grid place-items-center text-sm font-semibold text-muted num">
                    +{p.images.length - 30}
                  </div>
                )}
              </div>
            </Card>
          )
        )
      )}
    </div>
  );
}
