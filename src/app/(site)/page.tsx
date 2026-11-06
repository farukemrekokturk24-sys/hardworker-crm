import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight, ArrowUpRight, ShieldCheck, Clock, Gem, Users, Building2,
  Waves, CheckCircle2, Phone, Compass, ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SectionHead } from "@/components/ui/primitives";
import { ProjectCard } from "@/components/site/project-card";
import { Reveal, WordRise, CountUp, Marquee, Parallax } from "@/components/site/reveal";
import { HeroVideo } from "@/components/site/hero-video";
import { HeroUnlock } from "@/components/site/hero-unlock";
import { TourButton } from "@/components/site/tour-360";
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

const MARQUEE = [
  "Denize yürüme mesafesi",
  "%35 peşinat · 36 ay vade",
  "2 yıl kira garantisi",
  "Zamanında teslim",
  "7/24 güvenlik",
  "Sosyal yaşam alanları",
];

export default async function HomePage() {
  const [all, stats] = await Promise.all([getProjectCards(), getSiteStats()]);
  const featured = all.filter((p) => p.availableUnits > 0).slice(0, 3);

  return (
    <>
      {/* ================================================================ HERO */}
      <section className="relative min-h-[92dvh] lg:min-h-dvh flex items-end overflow-hidden bg-dark">
        <HeroVideo />
        {/* Karartma yalnızca metnin oturduğu alt bölgede yoğun; üstte video açık kalır */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(to top, rgb(7 9 13) 0%, rgb(7 9 13 / 0.78) 26%, rgb(7 9 13 / 0.35) 55%, transparent 80%)",
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgb(7 9 13 / 0.55) 0%, rgb(7 9 13 / 0.12) 45%, transparent 75%)",
          }}
        />

        <div className="container-x relative pb-16 lg:pb-24 pt-32 w-full">
          <div className="max-w-4xl">
            <p className="anim-fade-up inline-flex items-center gap-2.5 text-white/70 text-[0.6875rem] font-bold tracking-[0.22em] uppercase">
              <span className="h-px w-10 bg-brand" />
              Kuzey Kıbrıs · Gazimağusa
            </p>

            <h1
              className="anim-fade-up t-display text-white mt-6 text-balance"
              style={{ animationDelay: "100ms" }}
            >
              Her Proje
              <br />
              <span className="text-brand">Yeni Bir Hayat</span>
            </h1>

            <p
              className="anim-fade-up t-lead !text-white/75 mt-7 max-w-xl"
              style={{ animationDelay: "200ms" }}
            >
              18 yılı aşkın tecrübeyle Kıbrıs&apos;ta zamanında teslim edilen, değer
              kazandıran yaşam projeleri. Denize yürüme mesafesinde daireler,
              %35 peşinat ve 36 aya varan vade.
            </p>

            <div
              className="anim-fade-up flex flex-col sm:flex-row flex-wrap gap-3 mt-10"
              style={{ animationDelay: "300ms" }}
            >
              <HeroUnlock />
              <Button
                href="/projeler"
                variant="outline"
                size="lg"
                className="bg-white/10 border-white/25 text-white hover:bg-white/20 hover:border-white/40 backdrop-blur-sm"
              >
                Projeleri İncele <ArrowRight size={17} />
              </Button>
              <TourButton variant="hero" />
            </div>

            <dl
              className="anim-fade-up grid grid-cols-3 gap-5 sm:gap-10 mt-14 pt-9 border-t border-white/15 max-w-xl"
              style={{ animationDelay: "400ms" }}
            >
              {[
                { v: stats.projects, s: "", l: "Proje" },
                { v: stats.ongoing, s: "", l: "Devam Eden" },
                { v: stats.sold, s: "+", l: "Teslim Edilen Daire" },
              ].map((x) => (
                <div key={x.l}>
                  <dt className="t-h1 text-white font-display">
                    <CountUp to={x.v} suffix={x.s} />
                  </dt>
                  <dd className="text-[0.6875rem] font-bold uppercase tracking-[0.16em] text-white/55 mt-1.5">
                    {x.l}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        <span className="absolute bottom-7 left-1/2 -translate-x-1/2 hidden lg:grid place-items-center h-11 w-7 rounded-full border border-white/25">
          <ChevronDown size={14} className="text-white/70 anim-scroll-hint" />
        </span>
      </section>

      {/* ============================================================== ŞERİT */}
      <div className="bg-dark border-t border-white/10 py-4">
        <Marquee speed={46}>
          {MARQUEE.map((t) => (
            <span
              key={t}
              className="inline-flex items-center gap-4 px-7 text-white/65 text-sm font-semibold whitespace-nowrap"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-brand" />
              {t}
            </span>
          ))}
        </Marquee>
      </div>

      {/* ============================================================ PROJELER */}
      <section className="section bg-bg" id="projeler">
        <div className="container-x">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-7 mb-12">
            <Reveal>
              <p className="eyebrow-pill mb-5">Projelerimiz</p>
              <h2 className="t-h1 text-ink max-w-2xl text-balance">
                <WordRise text="Kıbrıs'ta modern yaşam alanları geliştiriyoruz" />
              </h2>
            </Reveal>
            <Reveal delay={120} variant="right">
              <Button href="/projeler" variant="outline" className="shrink-0">
                Tümünü Gör <ArrowRight size={16} />
              </Button>
            </Reveal>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {all.map((p, i) => (
              <Reveal key={p.id} delay={i * 90} variant="up">
                <ProjectCard project={p} priority={i < 3} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================= DEĞERLER */}
      <section className="section bg-bg-tint">
        <div className="container-x">
          <Reveal>
            <div className="max-w-2xl mx-auto text-center">
              <p className="eyebrow-pill mb-5">Neden Hardworker</p>
              <h2 className="t-h1 text-ink text-balance">
                <WordRise text="Tüm detaylarıyla düşünülmüş yaşam alanları" />
              </h2>
            </div>
          </Reveal>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 mt-14">
            {VALUES.map((v, i) => {
              // Referanstaki gibi ızgarada koyu ve vurgulu kartlar serpiştirilir
              const dark = i === 0;
              const brand = i === 4;
              return (
                <Reveal key={v.title} delay={i * 70} variant="up">
                  <div
                    className={[
                      "group h-full p-7 rounded-[var(--r-card)] transition-colors duration-300",
                      dark
                        ? "card-dark"
                        : brand
                          ? "card-brand"
                          : "bg-surface border border-border hover:border-brand/35",
                    ].join(" ")}
                  >
                    <div
                      className={[
                        "h-12 w-12 rounded-xl grid place-items-center",
                        dark || brand ? "bg-white/15 text-white" : "bg-brand-50 text-brand",
                      ].join(" ")}
                    >
                      <v.icon size={22} />
                    </div>
                    <h3
                      className={[
                        "font-display font-bold mt-5 text-xl",
                        dark || brand ? "text-white" : "text-ink",
                      ].join(" ")}
                    >
                      {v.title}
                    </h3>
                    <p
                      className={[
                        "text-sm mt-2.5 leading-relaxed",
                        dark || brand ? "text-white/70" : "text-muted",
                      ].join(" ")}
                    >
                      {v.text}
                    </p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============================================================== YATIRIM */}
      <section className="section bg-bg overflow-hidden">
        <div className="container-x grid lg:grid-cols-2 gap-14 lg:gap-20 items-center">
          <Reveal variant="left">
            <p className="eyebrow-pill mb-5">Neden Kıbrıs?</p>
            <h2 className="t-h1 text-ink text-balance">
              Akdeniz&apos;de kazandıran bir yatırım
            </h2>
            <p className="t-lead mt-5">
              Kuzey Kıbrıs; yükselen gayrimenkul değerleri, güçlü kira getirisi ve yıl
              boyu süren yaşam kalitesiyle bölgenin en cazip yatırım adreslerinden biri.
            </p>

            <ul className="mt-9 space-y-5">
              {[
                { t: "Yıllık %8 kira garantisi", d: "Belirli ödeme planlarında 2 yıl boyunca garantili kira getirisi." },
                { t: "%10'a varan peşin indirimi", d: "Peşinat oranına göre kademeli indirim ya da ek vade avantajı." },
                { t: "36 aya varan vade", d: "%35 peşinat sonrası kalan tutar faizsiz taksitlendirilir." },
                { t: "300 güneşli gün", d: "Yıl boyu yaşanabilir iklim, güçlü turizm ve öğrenci kira talebi." },
              ].map((item, i) => (
                <li key={item.t} className="flex gap-4" style={{ transitionDelay: `${i * 60}ms` }}>
                  <CheckCircle2 size={21} className="shrink-0 mt-0.5 text-brand" />
                  <div>
                    <p className="font-semibold text-ink">{item.t}</p>
                    <p className="text-sm text-muted mt-1 leading-relaxed">{item.d}</p>
                  </div>
                </li>
              ))}
            </ul>

            <Button href="/neden-kibris" className="mt-9">
              Yatırım Rehberi <ArrowRight size={16} />
            </Button>
          </Reveal>

          <Reveal delay={120} variant="right">
            <div className="grid grid-cols-2 gap-4">
              {all.slice(0, 4).map((p, i) => (
                <Parallax key={p.id} amount={i % 2 === 0 ? 26 : -26}>
                  <Link
                    href={`/projeler/${p.slug}`}
                    className={`group relative block overflow-hidden rounded-[var(--r-card)] ${
                      i % 3 === 0 ? "aspect-[3/4]" : "aspect-square"
                    }`}
                  >
                    {p.coverImage && (
                      <Image
                        src={p.coverImage}
                        alt={p.name}
                        fill
                        sizes="(max-width: 1024px) 50vw, 25vw"
                        className="object-cover transition-transform duration-[900ms] group-hover:scale-110"
                      />
                    )}
                    <span className="absolute inset-0 bg-gradient-to-t from-dark/85 to-transparent" />
                    <span className="absolute bottom-4 left-4 right-4 text-white font-display font-bold text-sm leading-tight">
                      {p.name}
                    </span>
                  </Link>
                </Parallax>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ============================================================= 360 TUR */}
      <section className="section bg-dark text-white overflow-hidden">
        <div className="container-x">
          <Reveal>
            <div className="max-w-2xl">
              <p className="eyebrow !text-brand-100 mb-4">
                <span className="h-px w-8 bg-brand" />
                Sanal Tur
              </p>
              <h2 className="t-h1 text-white text-balance">
                Daireleri 360° gezin
              </h2>
              <p className="t-lead !text-white/65 mt-5">
                Kıbrıs&apos;a gelmeden önce projeleri adım adım dolaşın. Odaların
                ferahlığını, manzarayı ve sosyal alanları tarayıcınızdan görün.
              </p>
              <div className="mt-8">
                <TourButton variant="dark" />
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ================================================================== CTA */}
      <section className="section bg-bg">
        <div className="container-x">
          <Reveal variant="zoom">
            <div className="relative overflow-hidden rounded-[2rem] bg-brand px-7 py-14 sm:px-14 sm:py-20">
              <div
                className="absolute inset-0 opacity-[0.12]"
                style={{
                  backgroundImage:
                    "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
                  backgroundSize: "26px 26px",
                }}
              />
              <div className="relative max-w-2xl">
                <h2 className="t-h1 text-white text-balance">
                  Size uygun daireyi birlikte bulalım
                </h2>
                <p className="t-lead !text-white/80 mt-5">
                  Satış danışmanlarımız bütçenize ve beklentinize göre en doğru seçeneği
                  sunar. Proje gezisi, 360° sanal tur ve ödeme planı desteği ücretsizdir.
                </p>
                <div className="flex flex-col sm:flex-row flex-wrap gap-3 mt-9">
                  <Button
                    href="/iletisim"
                    size="lg"
                    className="!bg-white !text-brand hover:!bg-white/90"
                  >
                    Randevu Oluştur <ArrowUpRight size={17} />
                  </Button>
                  <a
                    href={`tel:${BRAND.phoneRaw}`}
                    className="inline-flex items-center justify-center gap-2 h-13 px-7 rounded-xl font-semibold text-white border border-white/35 hover:bg-white/10 transition-colors"
                  >
                    <Phone size={17} /> {BRAND.phone}
                  </a>
                </div>
              </div>
              <Compass
                size={260}
                className="absolute -right-14 -bottom-14 text-white/10 anim-float hidden sm:block"
              />
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
