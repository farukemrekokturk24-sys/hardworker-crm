import type { Metadata } from "next";
import { ProjectsExplorer } from "@/components/site/projects-explorer";
import { PageHero } from "@/components/site/page-hero";
import { getProjectCards, getSiteStats } from "@/lib/queries";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Projeler",
  description:
    "Hardworker Construction'ın Kuzey Kıbrıs Gazimağusa'daki satıştaki ve teslim edilmiş konut projeleri. Fiyat listesi, kat planları ve ödeme seçenekleri.",
};

export default async function ProjectsPage() {
  const [projects, stats] = await Promise.all([getProjectCards(), getSiteStats()]);

  return (
    <>
      <PageHero
        eyebrow="Portföy"
        title="Projelerimiz"
        description="Kıbrıs'ta modern yaşam alanları geliştiriyoruz. Teslim edilen ve devam eden projelerimizi inceleyin, size uygun daireyi bulun."
        image={projects[0]?.coverImage}
        breadcrumb={[{ href: "/projeler", label: "Projeler" }]}
      >
        <dl className="grid grid-cols-3 gap-6 sm:gap-10 max-w-md">
          {[
            { v: stats.projects, l: "Proje" },
            { v: stats.ongoing, l: "Devam Eden" },
            { v: stats.completed, l: "Teslim Edilen" },
          ].map((s) => (
            <div key={s.l}>
              <dt className="t-h2 text-white num font-display">{s.v}</dt>
              <dd className="text-[0.7rem] font-semibold uppercase tracking-wider text-white/55 mt-1">
                {s.l}
              </dd>
            </div>
          ))}
        </dl>
      </PageHero>

      <section className="section bg-bg">
        <div className="container-x">
          <ProjectsExplorer projects={projects} />
        </div>
      </section>
    </>
  );
}
