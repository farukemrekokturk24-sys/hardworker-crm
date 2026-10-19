import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { Card, CardHeader } from "@/components/ui/primitives";
import { ProjectForm, ProjectImages } from "@/components/admin/project-form";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";

type Params = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Params) {
  const { id } = await params;
  const p = await prisma.project.findUnique({ where: { id }, select: { name: true } });
  return { title: p?.name ?? "Proje" };
}

export default async function EditProjectPage({ params }: Params) {
  const { id } = await params;
  await requireSession();

  const project = await prisma.project.findUnique({
    where: { id },
    include: { images: { orderBy: [{ category: "asc" }, { order: "asc" }] } },
  });
  if (!project) notFound();

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/panel/projeler"
          className="inline-flex items-center gap-2 text-sm font-semibold text-muted hover:text-ink transition-colors"
        >
          <ArrowLeft size={15} /> Projelere dön
        </Link>
        <Link
          href={`/projeler/${project.slug}`}
          target="_blank"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand hover:text-brand-600"
        >
          Sitede görüntüle <ExternalLink size={14} />
        </Link>
      </div>

      <Card>
        <CardHeader title={project.name} subtitle="Proje bilgileri ve site içeriği" />
        <div className="p-5">
          <ProjectForm
            project={{
              id: project.id,
              name: project.name,
              tagline: project.tagline,
              descriptionTr: project.descriptionTr,
              status: project.status,
              published: project.published,
              featured: project.featured,
              city: project.city,
              district: project.district,
              address: project.address,
              deliveryLabel: project.deliveryLabel,
              downPaymentPct: project.downPaymentPct,
              installmentMonths: project.installmentMonths,
              paymentTermsTr: project.paymentTermsTr,
              seoTitle: project.seoTitle,
              seoDescription: project.seoDescription,
              features: (project.features as string[] | null) ?? [],
            }}
          />
        </div>
      </Card>

      <Card>
        <CardHeader
          title="Görseller"
          subtitle={`${project.images.length} görsel · kapak seçmek için bir görsele tıklayın`}
        />
        <div className="p-5">
          <ProjectImages
            projectId={project.id}
            coverImage={project.coverImage}
            images={project.images.map((i) => ({
              id: i.id,
              url: i.url,
              category: i.category,
            }))}
          />
        </div>
      </Card>
    </div>
  );
}
