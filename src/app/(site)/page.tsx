import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight, ArrowUpRight, ShieldCheck, Clock, Gem, Users, Building2,
  Waves, CheckCircle2, Phone, Play, MapPin,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProjectCard } from "@/components/site/project-card";
import { Reveal, WordRise, CountUp, Marquee } from "@/components/site/reveal";
import { HeroVideo } from "@/components/site/hero-video";
import { HeroUnlock } from "@/components/site/hero-unlock";
import { TourButton } from "@/components/site/tour-360";
import { ProjectFan } from "@/components/site/project-fan";
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

  return (
    <>
      {/* ================================================================ HERO */}
      {/* Tam genişlikte sinematik video sahnesi: yatay video dar sütuna
          sıkışmadan nefes alıyor, metin üstüne biniyor. */}
      <section className="bg-bg pt-[5.25rem] lg:pt-[6.25rem] pb-8">
        <div className="container-x">
          <div className="relative overflow-hidden rounded-[2rem] bg-dark aspect-[4/5] sm:aspect-[16/10] lg:aspect-[2.3/1]">
            <HeroVideo />

            {/* Metnin oturduğu alt-sol bölge koyulaşır, üst taraf açık kalır */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                backgroundImage:
                  "linear-gradient(to top, rgb(7 9 13 / 0.92) 0%, rgb(7 9 13 / 0.55) 34%, rgb(7 9 13 / 0.12) 62%, transparent 85%)",
              }}
            />
            <div
              className="absolute inset-0 pointer-events-none hidden lg:block"
              style={{
                backgroundImage:
                  "linear-gradient(to right, rgb(7 9 13 / 0.6) 0%, rgb(7 9 13 / 0.1) 48%, transparent 72%)",
              }}
            />

            {/* Üst şerit: konum + 360 */}
            <div className="absolute inset-x-0 top-0 p-5 sm:p-7 flex items-start justify-between gap-3">
              <p className="inline-flex items-center gap-2 rounded-full glass-dark px-3.5 py-2 text-white text-[0.75rem] font-semibold">
                <MapPin size={13} className="text-brand" />
                Kuzey Kıbrıs · Gazimağusa
              </p>
              <TourButton
                variant="hero"
                label="360° Tur"
                className="!h-10 !px-4 !text-[0.8125rem]"
              />
            </div>

            {/* Alt: başlık ve çağrılar */}
            <div className="absolute inset-x-0 bottom-0 p-6 sm:p-9 lg:p-12">
              <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8">
                <div className="max-w-2xl">
                  <h1 className="t-display text-white text-balance">
                    Her Proje
                    <br />
                    <span className="text-brand">Yeni Bir Hayat</span>
                  </h1>

                  <p className="t-lead !text-white/75 mt-5 max-w-lg hidden sm:block">
                    18 yılı aşkın tecrübeyle Kıbrıs&apos;ta zamanında teslim edilen,
                    değer kazandıran yaşam projeleri.
                  </p>

                  <div className="flex flex-col sm:flex-row gap-3 mt-7">
                    <HeroUnlock />
                    <Button
                      href="/projeler"
                      variant="outline"
                      size="lg"
                      className="bg-white/10 border-white/30 text-white hover:bg-white/20 backdrop-blur-sm"
                    >
                      Projeleri İncele <ArrowRight size={17} />
                    </Button>
                  </div>
                </div>

                {/* Sağ alt: cam istatistik kartı */}
                <dl className="hidden lg:grid grid-cols-3 gap-7 rounded-2xl glass-dark px-7 py-5 shrink-0">
                  {[
                    { v: stats.projects, s: "", l: "Proje" },
                    { v: stats.ongoing, s: "", l: "Devam Eden" },
                    { v: stats.sold, s: "+", l: "Teslim" },
                  ].map((x) => (
                    <div key={x.l}>
                      <dt className="font-display text-3xl font-extrabold text-white">
                        <CountUp to={x.v} suffix={x.s} />
                      </dt>
                      <dd className="text-[0.625rem] font-bold uppercase tracking-[0.14em] text-white/55 mt-1">
                        {x.l}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>
          </div>

          {/* Video altı bilgi şeridi */}
          <div className="flex flex-wrap items-center gap-x-8 gap-y-4 mt-6 px-1">
            <div className="flex items-center gap-3.5">
              <span className="grid place-items-center h-14 w-14 rounded-full bg-brand text-white shrink-0">
                <span className="font-display text-xl font-extrabold leading-none">18</span>
                <span className="text-[0.5rem] font-bold uppercase tracking-[0.1em] opacity-85">
                  yıl
                </span>
              </span>
              <p className="text-sm text-ink-soft leading-snug max-w-[190px]">
                Kıbrıs&apos;ta <strong className="text-ink">18 yılı aşkın</strong> inşaat
                tecrübesi
              </p>
            </div>

            {/* Mobilde istatistikler burada görünür */}
            <dl className="grid grid-cols-3 gap-6 lg:hidden">
              {[
                { v: stats.projects, s: "", l: "Proje" },
                { v: stats.ongoing, s: "", l: "Devam Eden" },
                { v: stats.sold, s: "+", l: "Teslim" },
              ].map((x) => (
                <div key={x.l}>
                  <dt className="font-display text-2xl font-extrabold text-ink">
                    <CountUp to={x.v} suffix={x.s} />
                  </dt>
                  <dd className="text-[0.625rem] font-bold uppercase tracking-[0.12em] text-muted mt-0.5">
                    {x.l}
                  </dd>
                </div>
              ))}
            </dl>

            <a
              href={`tel:${BRAND.phoneRaw}`}
              className="group ml-auto inline-flex items-center gap-3 rounded-full bg-dark pl-2 pr-5 py-2 text-white hover:bg-dark-2 transition-colors"
            >
              <span className="grid place-items-center h-9 w-9 rounded-full bg-white/15">
                <Phone size={15} />
              </span>
              <span className="text-sm font-semibold whitespace-nowrap">
                {BRAND.phone}
              </span>
            </a>
          </div>
        </div>
      </section>

      {/* ============================================================== ŞERİT */}
      <div className="bg-dark py-4">
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

          {/* 2'li ızgara — kartlar yan yana ve daha iri */}
          <div className="grid gap-6 md:grid-cols-2">
            {all.map((p, i) => (
              <Reveal key={p.id} delay={i * 90} variant="up">
                <ProjectCard project={p} priority={i < 2} />
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
            {VALUES.map((v, i) => (
              <Reveal key={v.title} delay={i * 70} variant="up">
                {/* Hepsi aynı renk; ayrım üzerine gelince oluşur */}
                <div className="group relative h-full overflow-hidden rounded-[var(--r-card)] border border-border bg-surface p-7 transition-colors duration-500 hover:border-brand">
                  {/* Alttan dolan mavi zemin */}
                  <span className="absolute inset-0 bg-brand translate-y-full transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-y-0" />

                  <div className="relative">
                    <div className="h-12 w-12 rounded-xl bg-brand-50 text-brand grid place-items-center transition-colors duration-500 group-hover:bg-white/20 group-hover:text-white">
                      <v.icon size={22} />
                    </div>
                    <h3 className="font-display font-bold mt-5 text-xl text-ink transition-colors duration-500 group-hover:text-white">
                      {v.title}
                    </h3>
                    <p className="text-sm mt-2.5 leading-relaxed text-muted transition-colors duration-500 group-hover:text-white/80">
                      {v.text}
                    </p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================== YATIRIM */}
      <section className="section bg-bg overflow-hidden">
        <div className="container-x">
          <Reveal>
            <div className="max-w-2xl mx-auto text-center">
              <p className="eyebrow-pill mb-5">Neden Kıbrıs?</p>
              <h2 className="t-h1 text-ink text-balance">
                <WordRise text="Akdeniz'de kazandıran bir yatırım" />
              </h2>
              <p className="t-lead mt-5">
                Yükselen gayrimenkul değerleri, güçlü kira getirisi ve yıl boyu süren
                yaşam kalitesi. Projelerimizi kaydırarak inceleyin.
              </p>
            </div>
          </Reveal>
        </div>

        {/* Yelpaze kart karuseli */}
        <ProjectFan projects={all} />

        <div className="container-x">
          <Reveal>
            <ul className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-6">
              {[
                { t: "Yıllık %8 kira garantisi", d: "Belirli ödeme planlarında 2 yıl garantili getiri." },
                { t: "%10'a varan indirim", d: "Peşinat oranına göre kademeli indirim ya da ek vade." },
                { t: "36 aya varan vade", d: "%35 peşinat sonrası kalan tutar faizsiz taksitlendirilir." },
                { t: "300 güneşli gün", d: "Yıl boyu turizm ve öğrenci kaynaklı kira talebi." },
              ].map((item, i) => (
                <li
                  key={item.t}
                  className="rounded-[var(--r-card)] border border-border bg-surface p-6"
                  style={{ transitionDelay: `${i * 60}ms` }}
                >
                  <CheckCircle2 size={22} className="text-brand" />
                  <p className="font-semibold text-ink mt-4">{item.t}</p>
                  <p className="text-sm text-muted mt-1.5 leading-relaxed">{item.d}</p>
                </li>
              ))}
            </ul>

            <div className="flex justify-center mt-10">
              <Button href="/neden-kibris" size="lg">
                Yatırım Rehberi <ArrowRight size={17} />
              </Button>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ============================================================= 360 TUR */}
      <section className="section bg-dark text-white overflow-hidden relative">
        <div className="container-x relative">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <Reveal>
              <p className="eyebrow !text-brand-100 mb-4">Sanal Tur</p>
              <h2 className="t-h1 text-white text-balance">Daireleri 360° gezin</h2>
              <p className="t-lead !text-white/65 mt-5">
                Kıbrıs&apos;a gelmeden önce projeleri adım adım dolaşın. Odaların
                ferahlığını, manzarayı ve sosyal alanları tarayıcınızdan görün.
              </p>
              <div className="mt-8">
                <TourButton variant="dark" />
              </div>
            </Reveal>

            {/* Sağda düşük opaklıklı 3D küre */}
            <Reveal variant="right" className="hidden lg:block">
              <div className="relative grid place-items-center h-[340px]">
                <span className="absolute h-[300px] w-[300px] rounded-full border border-white/10" />
                <span className="absolute h-[230px] w-[230px] rounded-full border border-white/10" />
                <div
                  className="relative h-[260px] w-[260px] rounded-full opacity-[0.22] anim-float"
                  style={{
                    background:
                      "radial-gradient(circle at 32% 28%, #7fc4f2 0%, #126fb2 42%, #0b4672 72%, #07090d 100%)",
                    boxShadow:
                      "inset -28px -28px 70px rgba(0,0,0,0.65), 0 40px 90px -40px rgba(18,111,178,0.9)",
                  }}
                />
                <Image
                  src="/brand/logo.png"
                  alt=""
                  width={130}
                  height={150}
                  aria-hidden
                  className="absolute logo-3d opacity-30 brightness-0 invert"
                />
              </div>
            </Reveal>
          </div>
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
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
