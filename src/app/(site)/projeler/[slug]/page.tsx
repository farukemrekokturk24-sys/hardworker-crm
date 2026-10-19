import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import {
  MapPin, Calendar, Building2, CheckCircle2, Download, Compass,
  Wallet, Percent, ArrowRight, Layers, Phone,
} from "lucide-react";
import { PageHero } from "@/components/site/page-hero";
import { Gallery } from "@/components/site/gallery";
import { UnitTable, type PublicUnit } from "@/components/site/unit-table";
import { Reveal } from "@/components/site/reveal";
import { Button } from "@/components/ui/button";
import { Badge, SectionHead } from "@/components/ui/primitives";
import { AppointmentForm } from "@/components/site/appointment-form";
import { SummaryPrice } from "@/components/site/summary-price";
import { GatePageContext } from "@/components/site/price-gate";
import { getProjectBySlug } from "@/lib/queries";
import { prisma } from "@/lib/prisma";
import { trackView, canSeePrices } from "@/lib/visitor";
import {
  PROJECT_STATUS_LABELS, PROJECT_STATUS_TONE, BRAND,
} from "@/lib/constants";
import { formatPrice, formatArea } from "@/lib/utils";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const p = await prisma.project.findFirst({
    where: { slug, published: true },
    select: { name: true, seoTitle: true, seoDescription: true, tagline: true, coverImage: true },
  });
  if (!p) return { title: "Proje bulunamadı" };
  return {
    title: p.seoTitle ?? p.name,
    description: p.seoDescription ?? p.tagline ?? undefined,
    openGraph: {
      title: p.seoTitle ?? p.name,
      description: p.seoDescription ?? p.tagline ?? undefined,
      images: p.coverImage ? [p.coverImage] : undefined,
    },
  };
}

type SpecialTerm = { downPct: number; benefitTr: string };

export default async function ProjectDetailPage({ params }: Params) {
  const { slug } = await params;
  const [project, showPrices] = await Promise.all([
    getProjectBySlug(slug),
    canSeePrices(),
  ]);
  if (!project) notFound();

  await trackView({ projectId: project.id, action: "VIEW" });

  // Kilitliyken gerçek fiyat istemciye hiç gönderilmez; yalnızca varlığı taşınır.
  const units: PublicUnit[] = project.units.map((u) => ({
    id: u.id,
    unitNo: u.unitNo,
    type: u.type,
    definition: u.definition,
    floor: u.floor,
    grossArea: u.grossArea,
    terraceArea: u.terraceArea,
    gardenArea: u.gardenArea,
    facing: u.facing,
    price: showPrices ? u.price : null,
    hasPrice: u.price !== null,
    currency: u.currency,
    status: u.status,
    blockName: u.block?.name ?? null,
  }));

  const available = units.filter((u) => u.status === "AVAILABLE");
  const prices = project.units
    .filter((u) => u.status === "AVAILABLE")
    .map((u) => u.price)
    .filter((v): v is number => !!v);
  const minPrice = prices.length ? Math.min(...prices) : null;
  const areas = units.map((u) => u.grossArea).filter((v): v is number => !!v);
  const types = [...new Set(units.map((u) => u.type))];

  const features = (project.features as string[] | null) ?? [];
  const amenities = (project.amenities as { icon: string; labelTr: string }[] | null) ?? [];
  const terms = (project.specialTerms as SpecialTerm[] | null) ?? [];

  return (
    <>
      <GatePageContext projectId={project.id} projectName={project.name} />
      <PageHero
        eyebrow={[project.district, project.city].filter(Boolean).join(", ")}
        title={project.name}
        description={project.tagline ?? undefined}
        image={project.heroImage ?? project.coverImage}
        breadcrumb={[
          { href: "/projeler", label: "Projeler" },
          { href: `/projeler/${project.slug}`, label: project.name },
        ]}
        size="lg"
      >
        <div className="flex flex-wrap items-center gap-2.5">
          <Badge tone={PROJECT_STATUS_TONE[project.status]} className="!px-3 !py-1.5 !text-xs">
            {PROJECT_STATUS_LABELS[project.status]}
          </Badge>
          {project.deliveryLabel && (
            <Badge className="!bg-white/10 !text-white !ring-white/20 !px-3 !py-1.5 !text-xs">
              <Calendar size={12} /> {project.deliveryLabel}
            </Badge>
          )}
          <Badge className="!bg-white/10 !text-white !ring-white/20 !px-3 !py-1.5 !text-xs">
            <Building2 size={12} /> {units.length} daire
          </Badge>
          {available.length > 0 && (
            <Badge className="!bg-emerald-500/20 !text-emerald-100 !ring-emerald-400/30 !px-3 !py-1.5 !text-xs">
              <CheckCircle2 size={12} /> {available.length} daire satışta
            </Badge>
          )}
        </div>
      </PageHero>

      {/* ============================================================ ÖZET */}
      <section className="bg-surface border-b border-border sticky top-16 lg:top-[74px] z-30">
        <div className="container-x">
          <dl className="grid grid-cols-2 md:grid-cols-4 divide-x divide-border">
            <SummaryItem
              label="Başlangıç Fiyatı"
              icon={<Wallet size={15} />}
              value={
                <SummaryPrice
                  price={showPrices && minPrice ? formatPrice(minPrice) : null}
                  hasPrice={minPrice !== null}
                  projectId={project.id}
                  projectName={project.name}
                />
              }
            />
            <SummaryItem
              label="Daire Tipleri"
              value={types.slice(0, 3).join(" · ") + (types.length > 3 ? "…" : "")}
              icon={<Layers size={15} />}
            />
            <SummaryItem
              label="Alan Aralığı"
              value={
                areas.length
                  ? `${formatArea(Math.min(...areas))} – ${formatArea(Math.max(...areas))}`
                  : "—"
              }
              icon={<Compass size={15} />}
            />
            <SummaryItem
              label="Ödeme"
              value={
                project.downPaymentPct
                  ? `%${project.downPaymentPct} peşinat · ${project.installmentMonths} ay`
                  : "Bilgi alın"
              }
              icon={<Percent size={15} />}
            />
          </dl>
        </div>
      </section>

      {/* ========================================================= İÇERİK */}
      <section className="section bg-bg">
        <div className="container-x grid lg:grid-cols-12 gap-10 lg:gap-12">
          <div className="lg:col-span-8 min-w-0 space-y-14">
            {project.descriptionTr && (
              <Reveal>
                <div>
                  <h2 className="t-h2 text-ink">Proje Hakkında</h2>
                  <p className="t-lead mt-4 whitespace-pre-line">{project.descriptionTr}</p>
                </div>
              </Reveal>
            )}

            {features.length > 0 && (
              <Reveal>
                <div>
                  <h2 className="t-h2 text-ink">Öne Çıkan Özellikler</h2>
                  <ul className="grid sm:grid-cols-2 gap-x-6 gap-y-3 mt-5">
                    {features.map((f) => (
                      <li key={f} className="flex gap-2.5 text-[0.9375rem] text-ink-soft">
                        <CheckCircle2 size={18} className="shrink-0 mt-0.5 text-brand" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            )}

            {amenities.length > 0 && (
              <Reveal>
                <div>
                  <h2 className="t-h2 text-ink">Sosyal Olanaklar</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-5">
                    {amenities.map((a) => (
                      <div
                        key={a.labelTr}
                        className="rounded-xl border border-border bg-surface px-4 py-3.5 text-sm font-semibold text-ink-soft"
                      >
                        {a.labelTr}
                      </div>
                    ))}
                  </div>
                </div>
              </Reveal>
            )}

            {/* ------------------------------------------------ Daireler */}
            <Reveal>
              <div id="daireler" className="scroll-mt-36">
                <SectionHead
                  eyebrow="Envanter"
                  title="Daire ve Fiyat Listesi"
                  description="Güncel durum anlık olarak güncellenir. Rezerve edilen daireler listeden çıkarılmaz; satış durumu etikette görünür."
                />
                <div className="mt-7">
                  <UnitTable
                    units={units}
                    projectId={project.id}
                    projectName={project.name}
                  />
                </div>
              </div>
            </Reveal>

            {/* ------------------------------------------------- Galeri */}
            {project.images.length > 0 && (
              <Reveal>
                <div id="galeri" className="scroll-mt-36">
                  <SectionHead
                    eyebrow="Görseller"
                    title="Proje Galerisi"
                    description="Dış mekan, iç mekan, kat planları ve inşaat ilerleme fotoğrafları."
                  />
                  <div className="mt-7">
                    <Gallery images={project.images} />
                  </div>
                </div>
              </Reveal>
            )}

            {/* ---------------------------------------------- Ödeme planı */}
            {(terms.length > 0 || project.paymentTermsTr) && (
              <Reveal>
                <div id="odeme" className="scroll-mt-36">
                  <SectionHead
                    eyebrow="Ödeme"
                    title="Ödeme Planı ve Avantajlar"
                    description={project.paymentTermsTr ?? undefined}
                  />

                  {terms.length > 0 && (
                    <div className="grid sm:grid-cols-2 gap-4 mt-7">
                      {terms.map((t) => (
                        <div
                          key={t.downPct}
                          className="rounded-2xl border border-brand/20 bg-brand-50/50 p-5"
                        >
                          <p className="font-display font-extrabold text-2xl text-brand num">
                            %{t.downPct}
                          </p>
                          <p className="text-[0.6875rem] font-bold uppercase tracking-wider text-brand-600 mt-0.5">
                            Peşinatta
                          </p>
                          <p className="text-sm text-ink-soft mt-3 leading-relaxed">
                            {t.benefitTr}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}

                  <p className="text-sm text-muted mt-5 bg-surface-2 rounded-xl px-4 py-3 leading-relaxed">
                    <strong className="text-ink-soft">Not:</strong> Kira garantisinden
                    yararlanmak isteyen yatırımcıların şirketin eşya paketinden almaları
                    gerekmektedir. Fiyatlar ve koşullar değişiklik gösterebilir; güncel
                    teklif için satış danışmanımızla görüşün.
                  </p>

                  {project.paymentPlanUrl && (
                    <Button
                      href={project.paymentPlanUrl}
                      variant="outline"
                      className="mt-5"
                    >
                      <Download size={16} /> Ödeme Planını İndir (PDF)
                    </Button>
                  )}
                </div>
              </Reveal>
            )}
          </div>

          {/* --------------------------------------------------- Yan panel */}
          <aside className="lg:col-span-4 min-w-0">
            <div className="lg:sticky lg:top-44 space-y-4">
              <div className="card p-5">
                <h3 className="font-display font-bold text-ink text-lg">
                  Bu projeyi yerinde görün
                </h3>
                <p className="text-sm text-muted mt-1.5 leading-relaxed">
                  Satış danışmanımız size özel gezi planlasın. Uzaktaysanız 360° sanal
                  tur düzenleyebiliriz.
                </p>
                <div className="mt-5">
                  <AppointmentForm projectId={project.id} projectName={project.name} />
                </div>
              </div>

              <div className="card p-5">
                <h3 className="font-semibold text-ink text-sm">Hemen iletişime geçin</h3>
                <div className="space-y-2 mt-3.5">
                  <a
                    href={`tel:${BRAND.phoneRaw}`}
                    className="flex items-center gap-3 rounded-xl border border-border px-3.5 py-3 hover:border-brand/40 hover:bg-brand-50/40 transition-colors"
                  >
                    <Phone size={17} className="text-brand" />
                    <span className="text-sm font-semibold text-ink">{BRAND.phone}</span>
                  </a>
                  <a
                    href={`https://wa.me/${BRAND.whatsapp}?text=${encodeURIComponent(
                      `Merhaba, ${project.name} projesi hakkında bilgi almak istiyorum.`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 rounded-xl border border-border px-3.5 py-3 hover:border-[#25D366]/50 hover:bg-[#25D366]/5 transition-colors"
                  >
                    <span className="h-[17px] w-[17px] rounded-full bg-[#25D366]" />
                    <span className="text-sm font-semibold text-ink">WhatsApp ile yazın</span>
                  </a>
                </div>
              </div>

              {(project.lat || project.address) && (
                <div className="card p-5">
                  <h3 className="font-semibold text-ink text-sm flex items-center gap-2">
                    <MapPin size={15} className="text-brand" /> Konum
                  </h3>
                  <p className="text-sm text-muted mt-2 leading-relaxed">
                    {project.address ??
                      [project.district, project.city].filter(Boolean).join(", ")}
                  </p>
                  {project.lat && project.lng && (
                    <a
                      href={`https://maps.google.com/?q=${project.lat},${project.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand hover:text-brand-600 mt-3"
                    >
                      Haritada aç <ArrowRight size={14} />
                    </a>
                  )}
                </div>
              )}
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}

function SummaryItem({
  label,
  value,
  icon,
}: {
  label: string;
  value: React.ReactNode;
  icon: React.ReactNode;
}) {
  return (
    <div className="px-3 sm:px-5 py-3.5 first:pl-0 min-w-0">
      <dt className="flex items-center gap-1.5 text-[0.625rem] sm:text-[0.6875rem] font-bold uppercase tracking-wider text-muted">
        <span className="text-brand">{icon}</span>
        <span className="truncate">{label}</span>
      </dt>
      <dd className="font-display font-bold text-ink mt-1 text-sm sm:text-base truncate">
        {value}
      </dd>
    </div>
  );
}
