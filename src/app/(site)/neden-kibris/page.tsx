import type { Metadata } from "next";
import { TrendingUp, Sun, GraduationCap, Plane, Percent, ShieldCheck, FileText } from "lucide-react";
import { PageHero } from "@/components/site/page-hero";
import { SectionHead } from "@/components/ui/primitives";
import { Reveal } from "@/components/site/reveal";
import { Button } from "@/components/ui/button";
import { getProjectCards } from "@/lib/queries";

export const metadata: Metadata = {
  title: "Neden Kıbrıs?",
  description:
    "Kuzey Kıbrıs'ta gayrimenkul yatırımı: yükselen değerler, güçlü kira getirisi, %8 kira garantisi ve 36 aya varan ödeme planları.",
};

const REASONS = [
  { icon: TrendingUp, title: "Yükselen Gayrimenkul Değerleri", text: "Kuzey Kıbrıs gayrimenkul piyasası son yıllarda istikrarlı bir değer artışı gösteriyor. Sınırlı arsa arzı ve artan talep, yatırımın değerini koruyor." },
  { icon: Percent, title: "Güçlü Kira Getirisi", text: "Üniversite öğrencileri ve turizm kaynaklı yoğun kiralama talebi, yıl boyu süren bir kira geliri anlamına geliyor. Belirli ödeme planlarında 2 yıl %8 kira garantisi sunuyoruz." },
  { icon: Sun, title: "Yılda 300 Güneşli Gün", text: "Akdeniz iklimi, temiz denizi ve yaşam kalitesiyle Kıbrıs yalnızca bir yatırım değil, yaşanacak bir yer." },
  { icon: GraduationCap, title: "Uluslararası Eğitim Merkezi", text: "Gazimağusa ve çevresi, binlerce uluslararası öğrenciye ev sahipliği yapan üniversitelere komşu. Bu, kiralık konut için kesintisiz talep demek." },
  { icon: Plane, title: "Kolay Ulaşım", text: "Türkiye'den sık uçuşlar, Avrupa'ya yakınlık ve gelişen havalimanı altyapısı ile adaya erişim her geçen yıl kolaylaşıyor." },
  { icon: ShieldCheck, title: "Şeffaf Satın Alma Süreci", text: "Tapu işlemleri, satın alma izni ve sözleşme süreçlerinde baştan sona yanınızdayız. Yabancı yatırımcılar için süreç nettir." },
];

const STEPS = [
  { n: "01", t: "Proje ve daire seçimi", d: "Bütçenize ve amacınıza uygun seçenekleri birlikte belirliyoruz. Yerinde gezi ya da 360° sanal tur düzenliyoruz." },
  { n: "02", t: "Rezervasyon", d: "Seçtiğiniz daire için rezervasyon bedeli alınır ve daire sizin adınıza bloke edilir." },
  { n: "03", t: "Sözleşme ve peşinat", d: "Satış sözleşmesi imzalanır, peşinat ödenir. Peşinat oranınıza göre indirim ya da ek vade avantajından yararlanırsınız." },
  { n: "04", t: "Taksitler ve inşaat takibi", d: "Kalan tutar 36 aya varan vadeyle ödenir. İnşaat ilerlemesini düzenli olarak paylaşırız." },
  { n: "05", t: "Tapu ve teslim", d: "Satın alma izni ve tapu işlemleri tamamlanır, anahtarınızı teslim alırsınız." },
];

export default async function WhyCyprusPage() {
  const projects = await getProjectCards();

  return (
    <>
      <PageHero
        eyebrow="Yatırım Rehberi"
        title="Neden Kuzey Kıbrıs?"
        description="Akdeniz'in ortasında, yükselen değerler ve güçlü kira getirisi sunan bir yatırım adresi."
        image={projects.find((p) => p.coverImage)?.coverImage}
        breadcrumb={[{ href: "/neden-kibris", label: "Neden Kıbrıs?" }]}
      />

      <section className="section bg-bg">
        <div className="container-x">
          <Reveal>
            <SectionHead
              align="center"
              eyebrow="Avantajlar"
              title="Yatırımınızı değerlendiren altı neden"
            />
          </Reveal>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 mt-12">
            {REASONS.map((r, i) => (
              <Reveal key={r.title} delay={i * 60}>
                <div className="h-full rounded-2xl border border-border bg-surface p-6">
                  <div className="h-11 w-11 rounded-xl bg-brand-50 text-brand grid place-items-center">
                    <r.icon size={21} />
                  </div>
                  <h3 className="font-display font-bold text-ink mt-4 text-lg">{r.title}</h3>
                  <p className="text-sm text-muted mt-2 leading-relaxed">{r.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section bg-surface border-y border-border">
        <div className="container-x">
          <Reveal>
            <SectionHead
              eyebrow="Süreç"
              title="Satın alma adım adım"
              description="Yurt dışından yatırım yapıyorsanız bile süreci baştan sona biz yönetiriz."
            />
          </Reveal>

          <ol className="mt-12 space-y-5">
            {STEPS.map((s, i) => (
              <Reveal key={s.n} delay={i * 70}>
                <li className="flex gap-5 rounded-2xl border border-border bg-bg p-5 sm:p-6">
                  <span className="font-display font-extrabold text-2xl text-brand/30 num shrink-0">
                    {s.n}
                  </span>
                  <div>
                    <h3 className="font-display font-bold text-ink text-lg">{s.t}</h3>
                    <p className="text-sm text-muted mt-1.5 leading-relaxed">{s.d}</p>
                  </div>
                </li>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      <section className="section bg-bg">
        <div className="container-x">
          <Reveal>
            <div className="rounded-3xl bg-dark p-8 sm:p-12 text-center">
              <FileText size={32} className="text-brand mx-auto" />
              <h2 className="t-h2 text-white mt-5 text-balance">
                Size özel ödeme planını hazırlayalım
              </h2>
              <p className="t-lead !text-white/65 mt-4 max-w-xl mx-auto">
                Bütçenizi ve beklentinizi paylaşın; peşinat oranına göre indirim ve kira
                garantisi seçeneklerini birlikte değerlendirelim.
              </p>
              <Button href="/iletisim" size="lg" className="mt-8">
                Danışmanla Görüşün
              </Button>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
