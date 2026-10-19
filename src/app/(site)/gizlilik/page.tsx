import type { Metadata } from "next";
import { PageHero } from "@/components/site/page-hero";
import { BRAND } from "@/lib/constants";

export const metadata: Metadata = { title: "Gizlilik Politikası" };

export default function PrivacyPage() {
  return (
    <>
      <PageHero
        title="Gizlilik Politikası"
        description="Bilgilerinizi nasıl topladığımız ve koruduğumuz"
        breadcrumb={[{ href: "/gizlilik", label: "Gizlilik" }]}
        size="sm"
      />
      <section className="section bg-bg">
        <div className="container-x max-w-3xl space-y-6 text-ink-soft leading-relaxed">
          <Block title="Topladığımız Bilgiler">
            Sitemizi ziyaret ettiğinizde ad, telefon ve e-posta gibi doğrudan paylaştığınız
            bilgileri; ayrıca hangi projeleri ve daireleri görüntülediğiniz gibi kullanım
            verilerini toplarız. Bu veriler size daha isabetli öneriler sunmamızı sağlar.
          </Block>

          <Block title="Çerezler">
            Oturumunuzun devamlılığı için zorunlu çerezler kullanıyoruz. Fiyat listesini
            açtığınızda tarayıcınıza güvenli bir oturum çerezi yerleştirilir; bu çerez
            fiyatların sizin için açık kalmasını sağlar ve üçüncü taraflarla paylaşılmaz.
          </Block>

          <Block title="Bilgilerin Kullanımı">
            Bilgileriniz yalnızca talebinizin karşılanması, satış danışmanlığı hizmetinin
            sunulması ve sizinle iletişim kurulması amacıyla kullanılır. İzniniz olmadan
            pazarlama amaçlı üçüncü taraflara aktarılmaz.
          </Block>

          <Block title="Güvenlik">
            Verileriniz şifreli bağlantı üzerinden iletilir ve yetkilendirilmiş personel
            dışında erişime kapalı sistemlerde saklanır.
          </Block>

          <Block title="İletişim">
            Gizlilik uygulamalarımız hakkında sorularınız için{" "}
            <a href={`mailto:${BRAND.email}`} className="text-brand font-semibold hover:underline">
              {BRAND.email}
            </a>{" "}
            adresinden bize ulaşabilirsiniz.
          </Block>
        </div>
      </section>
    </>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="t-h3 text-ink mb-2.5">{title}</h2>
      <p>{children}</p>
    </div>
  );
}
