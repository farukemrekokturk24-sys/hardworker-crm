import type { Metadata } from "next";
import { PageHero } from "@/components/site/page-hero";
import { BRAND } from "@/lib/constants";

export const metadata: Metadata = {
  title: "KVKK Aydınlatma Metni",
  robots: { index: true, follow: true },
};

export default function KvkkPage() {
  return (
    <>
      <PageHero
        title="KVKK Aydınlatma Metni"
        description="Kişisel verilerinizin işlenmesine ilişkin bilgilendirme"
        breadcrumb={[{ href: "/kvkk", label: "KVKK" }]}
        size="sm"
      />
      <section className="section bg-bg">
        <div className="container-x max-w-3xl prose-content space-y-6 text-ink-soft leading-relaxed">
          <Block title="Veri Sorumlusu">
            {BRAND.fullName} (&quot;Şirket&quot;), kişisel verilerinizin güvenliğine önem
            verir. Bu metin, Şirket tarafından toplanan kişisel verilerin işlenme amaçlarını
            ve haklarınızı açıklamak üzere hazırlanmıştır.
          </Block>

          <Block title="İşlenen Kişisel Veriler">
            Web sitemiz üzerinden fiyat listesi talebi, iletişim formu ya da proje gezisi
            talebi oluşturduğunuzda ad-soyad, telefon numarası, e-posta adresi, ülke bilgisi
            ve talebinize ilişkin tercihleriniz (bütçe aralığı, ilgilendiğiniz proje, alım
            amacı) işlenmektedir. Ayrıca site kullanımınıza dair teknik veriler (IP adresi,
            tarayıcı bilgisi, görüntülediğiniz sayfalar) kayıt altına alınır.
          </Block>

          <Block title="İşleme Amaçları">
            Verileriniz; talebinizin karşılanması, size uygun proje ve ödeme seçeneklerinin
            sunulması, satış sürecinin yürütülmesi, randevu planlaması, müşteri ilişkileri
            yönetimi ve yasal yükümlülüklerin yerine getirilmesi amaçlarıyla işlenir.
          </Block>

          <Block title="Hukuki Sebep">
            Kişisel verileriniz, açık rızanıza ve sözleşmenin kurulması ya da ifasıyla
            doğrudan ilgili olması hukuki sebeplerine dayanarak işlenmektedir.
          </Block>

          <Block title="Verilerin Aktarımı">
            Kişisel verileriniz, yasal zorunluluklar dışında üçüncü taraflarla paylaşılmaz.
            Satış sürecinin yürütülmesi için gerekli olduğu ölçüde grup şirketlerimiz ve
            hizmet aldığımız tedarikçilerle sınırlı paylaşım yapılabilir.
          </Block>

          <Block title="Saklama Süresi">
            Verileriniz, işleme amacının gerektirdiği süre boyunca ve ilgili mevzuatta
            öngörülen zamanaşımı süreleri boyunca saklanır; sürenin dolmasıyla silinir ya da
            anonim hale getirilir.
          </Block>

          <Block title="Haklarınız">
            Kişisel verilerinizin işlenip işlenmediğini öğrenme, işlenmişse bilgi talep etme,
            düzeltilmesini ya da silinmesini isteme, işlemeye itiraz etme ve zararın
            giderilmesini talep etme haklarına sahipsiniz. Taleplerinizi{" "}
            <a href={`mailto:${BRAND.email}`} className="text-brand font-semibold hover:underline">
              {BRAND.email}
            </a>{" "}
            adresine iletebilirsiniz.
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
