import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight, ShieldCheck, Clock, Gem, Users, Building2, Waves,
  TrendingUp, CheckCircle2, Phone, MessageCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SectionHead, Badge } from "@/components/ui/primitives";
import { ProjectCard } from "@/components/site/project-card";
import { Reveal } from "@/components/site/reveal";
import { HeroUnlock } from "@/components/site/hero-unlock";
import { getProjectCards, getSiteStats } from "@/lib/queries";
import { BRAND } from "@/lib/constants";

export const dynamic = "force-dynamic";

const VALUES = [
  { icon: Gem, title: "Kalite", text: "Daima en iyi malzeme ve işçiliği sunduk, sunmaya devam ediyoruz." },
  { icon: Clock, title: "Zamanında Teslim", text: "Projelerimizi verdiğimiz sürede, çoğu zaman erken teslim ettik." },
  { icon: ShieldCheck, title: "Güçlü Altyapı", text: "Depreme dayanıklı, altyapı sorunu yaşamayan projeler üretiyoruz." },
  { icon: Users, title: "Satış Sonrası Destek", text: "Yapılarımızın arkasında yıllarca durduk, durmaya devam ediyoruz." },
  { icon: Waves, title: "Sosyal Yaşam", text: "Her projede havuz, spor ve sosyal alanları planladık ve uyguladık." },
  { icon: Building2, title: "Mimari Estetik", text: "Uzun yıllar değerini koruyan, estetik tasarımlar sunuyoruz." },
];

export default async function HomePage() {
  const [featured, all, stats] = await Promise.all([
    getProjectCards({ featuredOnly: true, take: 2 }),
    getProjectCards(),
    getSiteStats(),
  ]);

  const hero = featured[0] ?? all[0];

  return (
    <>
      {/* ================================================================ HERO */}
      <section className="relative min-h-[88dvh] lg:min-h-dvh flex items-end overflow-hidden bg-dark">
        {hero?.coverImage && (
          <Image
            src={hero.coverImage}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-55 scale-105"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-dark via-dark/75 to-dark/35" />
        <div className="absolute inset-0 bg-gradient-to-r from-dark/80 via-transparent to-transparent" />

        <div className="container-x relative pb-14 lg:pb-24 pt-32">
          <div className="max-w-3xl">
            <p className="anim-fade-up inline-flex items-center gap-2 text-white/70 text-[0.6875rem] font-bold tracking-[0.2em] uppercase">
              <span className="h-px w-8 bg-brand" />
              Kuzey Kıbrıs · Gazimağusa
            </p>

            <h1
              className="anim-fade-up t-display text-white mt-5 text-balance"
              style={{ animationDelay: "90ms" }}
            >
              Her Proje
              <br />
              <span className="text-brand">Yeni Bir Hayat</span>
            </h1>

            <p
              className="anim-fade-up t-lead text-white/75 mt-6 max-w-xl"
              style={{ animationDelay: "180ms" }}
            >
              18 yılı aşkın tecrübeyle Kıbrıs&apos;ta zamanında teslim edilen, değer
              kazandıran yaşam projeleri. Denize yürüme mesafesinde daireler,
              %35 peşinat ve 36 aya varan vade seçenekleri.
            </p>

            <div
              className="anim-fade-up flex flex-col sm:flex-row gap-3 mt-9"
              style={{ animationDelay: "270ms" }}
            >
              <HeroUnlock />
              <Button href="/projeler" variant="outline" size="lg" className="bg-white/10 border-white/25 text-white hover:bg-white/20 hover:border-white/40">
                Projeleri İncele
                <ArrowRight size={17} />
              </Button>
            </div>

            <dl
              className="anim-fade-up grid grid-cols-3 gap-5 sm:gap-8 mt-12 pt-8 border-t border-white/15 max-w-lg"
              style={{ animationDelay: "360ms" }}
            >
              {[
                { v: stats.projects, l: "Proje" },
                { v: stats.ongoing, l: "Devam Eden" },
                { v: `${stats.sold}+`, l: "Teslim Edilen Daire" },
              ].map((s) => (
                <div key={s.l}>
                  <dt className="t-h1 text-white num font-display">{s.v}</dt>
                  <dd className="text-[0.75rem] font-semibold uppercase tracking-wider text-white/55 mt-1">
                    {s.l}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      {/* ============================================================ PROJELER */}
      <section className="section bg-bg" id="projeler">
        <div className="container-x">
          <Reveal>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
              <SectionHead
                eyebrow="Projelerimiz"
                title="Satıştaki ve teslim edilen projeler"
                description="Her projede konum, mimari ve sosyal yaşam bir arada planlanır. Güncel fiyat listesi ve kat planları için projeye göz atın."
              />
              <Button href="/projeler" variant="outline" className="shrink-0 self-start md:self-end">
                Tümünü Gör <ArrowRight size={16} />
              </Button>
            </div>
          </Reveal>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {all.map((p, i) => (
              <Reveal key={p.id} delay={i * 70} as="div">
                <ProjectCard project={p} priority={i < 3} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================= DEĞERLER */}
      <section className="section bg-surface border-y border-border">
        <div className="container-x">
          <Reveal>
            <SectionHead
              align="center"
              eyebrow="Neden Hardworker"
              title="Tüm detaylarıyla düşünülmüş yaşam alanları"
              description="Kaliteden ödün vermeden, zamanında ve güvenle teslim ediyoruz."
            />
          </Reveal>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 mt-12">
            {VALUES.map((v, i) => (
              <Reveal key={v.title} delay={i * 60}>
                <div className="h-full rounded-2xl border border-border bg-bg p-6 hover:border-brand/30 hover:bg-brand-50/30 transition-colors">
                  <div className="h-11 w-11 rounded-xl bg-brand-50 text-brand grid place-items-center">
                    <v.icon size={21} />
                  </div>
                  <h3 className="font-display font-bold text-ink mt-4 text-lg">{v.title}</h3>
                  <p className="text-sm text-muted mt-2 leading-relaxed">{v.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================== YATIRIM */}
      <section className="section bg-bg">
        <div className="container-x">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <Reveal>
              <SectionHead
                eyebrow="Neden Kıbrıs?"
                title="Akdeniz'de kazandıran bir yatırım"
                description="Kuzey Kıbrıs, yükselen gayrimenkul değerleri, güçlü kira getirisi ve yıl boyu süren yaşam kalitesiyle bölgenin en cazip yatırım adreslerinden biri."
              />
              <ul className="mt-8 space-y-4">
                {[
                  { t: "Yıllık %8 kira garantisi", d: "Belirli ödeme planlarında 2 yıl boyunca garantili kira getirisi." },
                  { t: "%10'a varan peşin indirimi", d: "Peşinat oranına göre kademeli indirim ya da ek vade avantajı." },
                  { t: "36 aya varan vade", d: "%35 peşinat sonrası kalan tutar faizsiz taksitlendirilir." },
                  { t: "300 güneşli gün", d: "Yıl boyu yaşanabilir iklim, güçlü turizm ve öğrenci kira talebi." },
                ].map((item) => (
                  <li key={item.t} className="flex gap-3.5">
                    <CheckCircle2 size={20} className="shrink-0 mt-0.5 text-brand" />
                    <div>
                      <p className="font-semibold text-ink">{item.t}</p>
                      <p className="text-sm text-muted mt-0.5 leading-relaxed">{item.d}</p>
                    </div>
                  </li>
                ))}
              </ul>
              <Button href="/neden-kibris" className="mt-8">
                Yatırım Rehberi <ArrowRight size={16} />
              </Button>
            </Reveal>

            <Reveal delay={120}>
              <div className="grid grid-cols-2 gap-4">
                {all.slice(0, 4).map((p, i) => (
                  <Link
                    key={p.id}
                    href={`/projeler/${p.slug}`}
                    className={`relative rounded-2xl overflow-hidden group ${
                      i % 3 === 0 ? "aspect-[3/4]" : "aspect-square"
                    } ${i === 1 ? "mt-8" : ""} ${i === 3 ? "-mt-8" : ""}`}
                  >
                    {p.coverImage && (
                      <Image
                        src={p.coverImage}
                        alt={p.name}
                        fill
                        sizes="(max-width: 1024px) 50vw, 25vw"
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-dark/80 to-transparent" />
                    <p className="absolute bottom-3 left-3 right-3 text-white font-display font-bold text-sm leading-tight">
                      {p.name}
                    </p>
                  </Link>
                ))}
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ================================================================== CTA */}
      <section className="relative overflow-hidden bg-dark">
        <div className="absolute inset-0 opacity-20">
          {hero?.coverImage && (
            <Image src={hero.coverImage} alt="" fill sizes="100vw" className="object-cover" />
          )}
        </div>
        <div className="container-x relative py-16 lg:py-24">
          <div className="max-w-2xl">
            <Badge tone="bg-brand/15 text-brand-100 ring-brand/30">
              <TrendingUp size={12} /> Sınırlı sayıda daire
            </Badge>
            <h2 className="t-h1 text-white mt-5 text-balance">
              Size uygun daireyi birlikte bulalım
            </h2>
            <p className="t-lead text-white/70 mt-4">
              Satış danışmanlarımız bütçenize ve beklentinize göre en doğru seçeneği
              sunar. Proje gezisi, 360° sanal tur ve ödeme planı desteği ücretsizdir.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 mt-8">
              <Button href="/iletisim" size="lg">
                Randevu Oluştur <ArrowRight size={17} />
              </Button>
              <Button
                href={`https://wa.me/${BRAND.whatsapp}`}
                variant="outline"
                size="lg"
                className="bg-white/10 border-white/25 text-white hover:bg-white/20"
              >
                <MessageCircle size={17} /> WhatsApp
              </Button>
              <a
                href={`tel:${BRAND.phoneRaw}`}
                className="inline-flex items-center justify-center gap-2 h-13 px-7 rounded-xl font-semibold text-white/80 hover:text-white transition-colors"
              >
                <Phone size={17} /> {BRAND.phone}
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
