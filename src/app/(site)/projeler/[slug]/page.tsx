import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  MapPin, Calendar, Building2, CheckCircle2, Download, Compass,
  Wallet, Percent, Layers, Phone, ArrowRight, Images,
} from "lucide-react";
import { Gallery } from "@/components/site/gallery";
import { UnitTable, type PublicUnit } from "@/components/site/unit-table";
import { Reveal } from "@/components/site/reveal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/primitives";
import { AppointmentForm } from "@/components/site/appointment-form";
import { SummaryPrice } from "@/components/site/summary-price";
import { GatePageContext } from "@/components/site/price-gate";
import { TourButton, TourCard } from "@/components/site/tour-360";
import { SoldOutBadge } from "@/components/site/sold-out";
import { ProjectHeroMedia } from "@/components/site/project-hero-media";
import { SectionNav } from "@/components/site/project-sections";
import { WhatsappIcon } from "@/components/brand/social-icons";
import { getProjectBySlug } from "@/lib/queries";
import { prisma } from "@/lib/prisma";
import { trackView, canSeePrices } from "@/lib/visitor";
import { projectVideo } from "@/lib/media";
import { PROJECT_STATUS_LABELS, PROJECT_STATUS_TONE, BRAND } from "@/lib/constants";
import { formatPrice, formatArea } from "@/lib/utils";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ slug: string }> };
type SpecialTerm = { downPct: number; benefitTr: string };

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

export default async function ProjectDetailPage({ params }: Params) {
  const { slug } = await params;
  const [project, showPrices] = await Promise.all([
    getProjectBySlug(slug),
    canSeePrices(),
  ]);
  if (!project) notFound();

  await trackView({ projectId: project.id, action: "VIEW" });

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
  const soldOut = units.length > 0 && available.length === 0;

  const features = (project.features as string[] | null) ?? [];
  const amenities = (project.amenities as { icon: string; labelTr: string }[] | null) ?? [];
  const terms = (project.specialTerms as SpecialTerm[] | null) ?? [];
  const vid = projectVideo(project.slug);

  const heroImages = project.images
    .filter((i) => ["exterior", "render", "interior"].includes(i.category))
    .slice(0, 5)
    .map((i) => i.url);

  const sections = [
    { id: "genel", label: "Genel Bakış" },
    { id: "daireler", label: "Daireler ve Fiyatlar" },
    { id: "odeme", label: "Ödeme Planı" },
    { id: "galeri", label: "Galeri" },
    { id: "konum", label: "Konum ve İletişim" },
  ];

  return (
    <>
      <GatePageContext projectId={project.id} projectName={project.name} />

      {/* ================================================================ HERO */}
      {/* Üstte dönen medya, altta özet — iki parça net ayrışır */}
      <section className="pt-[4.5rem] lg:pt-[5.5rem] bg-bg">
        <div className="container-x pt-5">
          <div className="relative overflow-hidden rounded-[2rem] aspect-[4/5] sm:aspect-[16/9] lg:aspect-[21/9]">
            <ProjectHeroMedia
              video={vid?.video}
              poster={vid?.poster}
              images={heroImages}
              alt={project.name}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-dark/85 via-dark/20 to-dark/10 pointer-events-none" />
            {soldOut && <SoldOutBadge size="lg" />}

            <div className="absolute inset-x-0 bottom-0 p-6 sm:p-9 pointer-events-none">
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <Badge tone={PROJECT_STATUS_TONE[project.status]} className="!px-3 !py-1.5 !text-xs">
                  {PROJECT_STATUS_LABELS[project.status]}
                </Badge>
                {project.deliveryLabel && (
                  <Badge className="!bg-white/15 !text-white !ring-white/25 !px-3 !py-1.5 !text-xs backdrop-blur">
                    <Calendar size={12} /> {project.deliveryLabel}
                  </Badge>
                )}
                {available.length > 0 && (
                  <Badge className="!bg-emerald-500/25 !text-emerald-50 !ring-emerald-300/30 !px-3 !py-1.5 !text-xs backdrop-blur">
                    <CheckCircle2 size={12} /> {available.length} daire satışta
                  </Badge>
                )}
              </div>

              <h1 className="t-h1 text-white text-balance">{project.name}</h1>
              {project.tagline && (
                <p className="t-lead !text-white/75 mt-2.5 max-w-xl">{project.tagline}</p>
              )}
              <p className="flex items-center gap-1.5 text-white/70 text-sm mt-3">
                <MapPin size={14} />
                {[project.district, project.city].filter(Boolean).join(", ")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================== ÖZET */}
      <section className="bg-bg pt-6">
        <div className="container-x">
          <dl className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <SummaryTile
              icon={<Wallet size={16} />}
              label="Başlangıç Fiyatı"
              value={
                <SummaryPrice
                  price={showPrices && minPrice ? formatPrice(minPrice) : null}
                  hasPrice={minPrice !== null}
                  projectId={project.id}
                  projectName={project.name}
                />
              }
            />
            <SummaryTile
              icon={<Layers size={16} />}
              label="Daire Tipleri"
              value={types.slice(0, 3).join(" · ") + (types.length > 3 ? "…" : "")}
            />
            <SummaryTile
              icon={<Compass size={16} />}
              label="Alan Aralığı"
              value={
                areas.length
                  ? `${formatArea(Math.min(...areas))} – ${formatArea(Math.max(...areas))}`
                  : "—"
              }
            />
            <SummaryTile
              icon={<Percent size={16} />}
              label="Ödeme"
              value={
                project.downPaymentPct
                  ? `%${project.downPaymentPct} peşinat · ${project.installmentMonths} ay`
                  : "Bilgi alın"
              }
            />
          </dl>
        </div>
      </section>

      <div className="h-6 bg-bg" />
      <SectionNav sections={sections} />

      {/* ============================================================ GENEL */}
      <section id="genel" className="section bg-bg scroll-mt-32">
        <div className="container-x grid lg:grid-cols-12 gap-10 lg:gap-12">
          <div className="lg:col-span-7 min-w-0 space-y-10">
            {project.descriptionTr && (
              <Reveal>
                <h2 className="t-h2 text-ink">Proje Hakkında</h2>
                <p className="t-lead mt-4 whitespace-pre-line">{project.descriptionTr}</p>
              </Reveal>
            )}

            {features.length > 0 && (
              <Reveal>
                <h3 className="t-h3 text-ink">Öne Çıkan Özellikler</h3>
                <ul className="grid sm:grid-cols-2 gap-x-6 gap-y-2.5 mt-4">
                  {features.map((f) => (
                    <li key={f} className="flex gap-2.5 text-[0.9375rem] text-ink-soft">
                      <CheckCircle2 size={18} className="shrink-0 mt-0.5 text-brand" />
                      {f}
                    </li>
                  ))}
                </ul>
              </Reveal>
            )}

            {amenities.length > 0 && (
              <Reveal>
                <h3 className="t-h3 text-ink">Sosyal Olanaklar</h3>
                <div className="flex flex-wrap gap-2 mt-4">
                  {amenities.map((a) => (
                    <span
                      key={a.labelTr}
                      className="inline-flex items-center rounded-full border border-border bg-surface px-4 py-2 text-sm font-medium text-ink-soft"
                    >
                      {a.labelTr}
                    </span>
                  ))}
                </div>
              </Reveal>
            )}
          </div>

          {/* Yan panel: sadece aksiyon */}
          <aside className="lg:col-span-5 min-w-0">
            <div className="lg:sticky lg:top-40 space-y-4">
              <div className="card p-6">
                <h3 className="font-display font-bold text-ink text-lg">
                  Bu projeyi yerinde görün
                </h3>
                <p className="text-sm text-muted mt-1.5 leading-relaxed">
                  Satış danışmanımız size özel gezi planlasın. Uzaktaysanız görüntülü
                  tur düzenleyebiliriz.
                </p>
                <div className="mt-5">
                  <AppointmentForm projectId={project.id} projectName={project.name} />
                </div>
              </div>

              <TourCard projectName={project.name} />

              <div className="card p-5">
                <div className="grid grid-cols-2 gap-2">
                  <a
                    href={`tel:${BRAND.phoneRaw}`}
                    className="inline-flex items-center justify-center gap-2 h-11 rounded-xl bg-brand-50 text-brand text-sm font-semibold hover:bg-brand-100 transition-colors"
                  >
                    <Phone size={16} /> Ara
                  </a>
                  <a
                    href={`https://wa.me/${BRAND.whatsapp}?text=${encodeURIComponent(
                      `Merhaba, ${project.name} projesi hakkında bilgi almak istiyorum.`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 h-11 rounded-xl bg-[#25D366]/12 text-[#128C45] text-sm font-semibold hover:bg-[#25D366]/20 transition-colors"
                  >
                    <WhatsappIcon size={16} /> WhatsApp
                  </a>
                </div>
                {project.paymentPlanUrl && (
                  <Button
                    href={project.paymentPlanUrl}
                    variant="outline"
                    fullWidth
                    className="mt-2"
                  >
                    <Download size={16} /> Ödeme Planı (PDF)
                  </Button>
                )}
              </div>
            </div>
          </aside>
        </div>
      </section>

      {/* ========================================================== DAİRELER */}
      <section id="daireler" className="section bg-bg-tint scroll-mt-32">
        <div className="container-x">
          <Reveal>
            <div className="max-w-2xl">
              <p className="eyebrow-pill mb-4">Envanter</p>
              <h2 className="t-h1 text-ink text-balance">Daireler ve Fiyatlar</h2>
              <p className="t-lead mt-4">
                Durum anlık güncellenir. Blok ve tipe göre filtreleyin, size uygun
                daireyi bulun.
              </p>
            </div>
          </Reveal>

          <div className="mt-9">
            <UnitTable units={units} projectId={project.id} projectName={project.name} />
          </div>
        </div>
      </section>

      {/* ============================================================ ÖDEME */}
      {(terms.length > 0 || project.paymentTermsTr) && (
        <section id="odeme" className="section bg-bg scroll-mt-32">
          <div className="container-x">
            <Reveal>
              <div className="max-w-2xl">
                <p className="eyebrow-pill mb-4">Ödeme</p>
                <h2 className="t-h1 text-ink text-balance">Ödeme Planı ve Avantajlar</h2>
                {project.paymentTermsTr && (
                  <p className="t-lead mt-4">{project.paymentTermsTr}</p>
                )}
              </div>
            </Reveal>

            {terms.length > 0 && (
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-9">
                {terms.map((t, i) => (
                  <Reveal key={t.downPct} delay={i * 70}>
                    <div className="h-full rounded-[var(--r-card)] border border-brand/20 bg-brand-50/50 p-6">
                      <p className="font-display font-extrabold text-3xl text-brand num">
                        %{t.downPct}
                      </p>
                      <p className="text-[0.625rem] font-bold uppercase tracking-[0.14em] text-brand-600 mt-1">
                        Peşinatta
                      </p>
                      <p className="text-sm text-ink-soft mt-3.5 leading-relaxed">
                        {t.benefitTr}
                      </p>
                    </div>
                  </Reveal>
                ))}
              </div>
            )}

            <p className="text-sm text-muted mt-6 bg-surface-2 rounded-xl px-4 py-3.5 leading-relaxed max-w-3xl">
              <strong className="text-ink-soft">Not:</strong> Kira garantisinden
              yararlanmak isteyen yatırımcıların şirketin eşya paketinden almaları
              gerekmektedir. Fiyatlar ve koşullar değişebilir; güncel teklif için
              satış danışmanımızla görüşün.
            </p>
          </div>
        </section>
      )}

      {/* =========================================================== GALERİ */}
      {project.images.length > 0 && (
        <section id="galeri" className="section bg-bg-tint scroll-mt-32">
          <div className="container-x">
            <Reveal>
              <div className="flex flex-wrap items-end justify-between gap-5">
                <div className="max-w-2xl">
                  <p className="eyebrow-pill mb-4">Görseller</p>
                  <h2 className="t-h1 text-ink text-balance">Proje Galerisi</h2>
                  <p className="t-lead mt-4">
                    Dış mekan, iç mekan, kat planları ve inşaat ilerlemesi.
                  </p>
                </div>
                <TourButton label="360° Sanal Tur" />
              </div>
            </Reveal>

            <div className="mt-9">
              <Gallery images={project.images} />
            </div>
          </div>
        </section>
      )}

      {/* ============================================================ KONUM */}
      <section id="konum" className="section bg-bg scroll-mt-32">
        <div className="container-x">
          <div className="relative overflow-hidden rounded-[2rem] bg-dark px-7 py-12 sm:px-12 sm:py-16">
            <div
              className="absolute inset-0 opacity-[0.08]"
              style={{
                backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
                backgroundSize: "24px 24px",
              }}
            />
            <div className="relative grid lg:grid-cols-2 gap-10 items-center">
              <div>
                <p className="eyebrow !text-brand-100 mb-4">Konum</p>
                <h2 className="t-h2 text-white text-balance">
                  {[project.district, project.city].filter(Boolean).join(", ") ||
                    "Kuzey Kıbrıs"}
                </h2>
                {project.address && (
                  <p className="t-lead !text-white/65 mt-4">{project.address}</p>
                )}
                <div className="flex flex-wrap gap-3 mt-8">
                  <Button href="/iletisim" size="lg" className="!bg-white !text-dark hover:!bg-white/90">
                    İletişime Geç <ArrowRight size={17} />
                  </Button>
                  {project.lat && project.lng && (
                    <a
                      href={`https://maps.google.com/?q=${project.lat},${project.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 h-13 px-6 rounded-xl font-semibold text-white border border-white/30 hover:bg-white/10 transition-colors"
                    >
                      <MapPin size={17} /> Haritada aç
                    </a>
                  )}
                </div>
              </div>

              <div className="hidden lg:flex items-center justify-center">
                <Building2 size={200} className="text-white/10 anim-float" aria-hidden />
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function SummaryTile({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="rounded-[var(--r-xl)] border border-border bg-surface px-4 py-3.5 min-w-0">
      <dt className="flex items-center gap-1.5 text-[0.625rem] font-bold uppercase tracking-[0.12em] text-muted">
        <span className="text-brand">{icon}</span>
        <span className="truncate">{label}</span>
      </dt>
      <dd className="font-display font-bold text-ink mt-1.5 text-[0.9375rem] sm:text-base truncate">
        {value}
      </dd>
    </div>
  );
}
