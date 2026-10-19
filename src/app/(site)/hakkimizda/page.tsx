import type { Metadata } from "next";
import Image from "next/image";
import { Gem, Clock, ShieldCheck, Users, Award, HeartHandshake } from "lucide-react";
import { PageHero } from "@/components/site/page-hero";
import { SectionHead } from "@/components/ui/primitives";
import { Reveal } from "@/components/site/reveal";
import { Button } from "@/components/ui/button";
import { getProjectCards, getSiteStats } from "@/lib/queries";

export const metadata: Metadata = {
  title: "Hakkımızda",
  description:
    "Hardworker Construction, Kuzey Kıbrıs'ta 18 yılı aşkın tecrübeyle zamanında teslim edilen, kaliteli ve güvenilir konut projeleri geliştirir.",
};

const VALUES = [
  { icon: Gem, title: "Kaliteden Ödün Yok", text: "Malzeme seçiminden işçiliğe kadar her aşamada en iyisini uygularız. Yapılarımız yıllar sonra da ilk günkü değerini korur." },
  { icon: Clock, title: "Zamanında Teslim", text: "Verdiğimiz teslim tarihine sadık kalırız. Birçok projemizi sözleşmede belirtilen tarihten önce teslim ettik." },
  { icon: ShieldCheck, title: "Güçlü Mühendislik", text: "Depreme dayanıklı taşıyıcı sistemler ve sorunsuz altyapı, projelerimizin temel şartıdır." },
  { icon: HeartHandshake, title: "Satış Sonrası Destek", text: "Teslimden sonra da yanınızdayız. Yapılarımızın arkasında yıllarca durduk, durmaya devam ediyoruz." },
  { icon: Users, title: "Sosyal Yaşam", text: "Havuz, spor salonu, çocuk alanları ve yeşil alanlar; her projede sosyal yaşamı planlarız." },
  { icon: Award, title: "Yatırım Değeri", text: "Doğru konum ve doğru mimari ile projelerimiz sahiplerine kazandırır." },
];

export default async function AboutPage() {
  const [projects, stats] = await Promise.all([getProjectCards(), getSiteStats()]);

  return (
    <>
      <PageHero
        eyebrow="Hardworker Construction Ltd."
        title="18 yıldır Kıbrıs'ta yaşam alanları inşa ediyoruz"
        description="Her projede aynı disiplini uyguluyoruz: sağlam mühendislik, dürüst iletişim ve zamanında teslim."
        image={projects[0]?.coverImage}
        breadcrumb={[{ href: "/hakkimizda", label: "Hakkımızda" }]}
      />

      <section className="section bg-bg">
        <div className="container-x grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          <Reveal>
            <SectionHead
              eyebrow="Biz Kimiz"
              title="Yenilikçi bir vizyon, güvenilir bir imza"
            />
            <div className="space-y-4 mt-6 t-lead">
              <p>
                Hardworker Construction, Gazimağusa merkezli bir inşaat ve gayrimenkul
                geliştirme şirketidir. Kuruluşumuzdan bu yana Kuzey Kıbrıs&apos;ta onlarca
                konut projesi geliştirdik ve yüzlerce aileyi yeni evleriyle buluşturduk.
              </p>
              <p>
                Bizim için bir proje, yalnızca bir yapı değil; içinde yaşanacak bir hayattır.
                Bu yüzden her projede konumu, mimariyi, sosyal alanları ve altyapıyı birlikte
                planlıyoruz. Eğitim kurumlarına yakınlık, denize erişim ve huzurlu bir çevre
                seçtiğimiz arsaların ortak özelliğidir.
              </p>
              <p>
                Yurt dışından yatırım yapan müşterilerimiz için süreci baştan sona yönetiyoruz:
                tapu işlemleri, ödeme planı, eşya paketi ve kiralama desteği dahil.
              </p>
            </div>
            <Button href="/projeler" className="mt-8">
              Projelerimizi İnceleyin
            </Button>
          </Reveal>

          <Reveal delay={120}>
            <div className="grid grid-cols-2 gap-3">
              {projects.slice(0, 4).map((p, i) => (
                <div
                  key={p.id}
                  className={`relative rounded-2xl overflow-hidden ${
                    i % 2 === 0 ? "aspect-[3/4]" : "aspect-square mt-6"
                  }`}
                >
                  {p.coverImage && (
                    <Image
                      src={p.coverImage}
                      alt={p.name}
                      fill
                      sizes="(max-width: 1024px) 50vw, 25vw"
                      className="object-cover"
                    />
                  )}
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      <section className="bg-dark">
        <div className="container-x py-14 lg:py-16">
          <dl className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { v: "18+", l: "Yıllık Tecrübe" },
              { v: `${stats.projects}`, l: "Aktif Proje" },
              { v: `${stats.units}+`, l: "Geliştirilen Daire" },
              { v: `${stats.sold}+`, l: "Teslim Edilen Daire" },
            ].map((s) => (
              <div key={s.l}>
                <dt className="t-h1 text-white num font-display">{s.v}</dt>
                <dd className="text-[0.75rem] font-semibold uppercase tracking-wider text-white/55 mt-1.5">
                  {s.l}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="section bg-surface">
        <div className="container-x">
          <Reveal>
            <SectionHead
              align="center"
              eyebrow="Değerlerimiz"
              title="Her projede aynı taahhüt"
            />
          </Reveal>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 mt-12">
            {VALUES.map((v, i) => (
              <Reveal key={v.title} delay={i * 60}>
                <div className="h-full rounded-2xl border border-border bg-bg p-6">
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
    </>
  );
}
