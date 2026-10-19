import type { Metadata } from "next";
import { Phone, Mail, MapPin, Clock } from "lucide-react";
import { PageHero } from "@/components/site/page-hero";
import { ContactForm } from "@/components/site/contact-form";
import { Card } from "@/components/ui/primitives";
import { BRAND } from "@/lib/constants";
import { getProjectCards } from "@/lib/queries";

export const metadata: Metadata = {
  title: "İletişim",
  description:
    "Hardworker Construction ile iletişime geçin. Gazimağusa ofisimiz, telefon ve WhatsApp hattımız üzerinden size yardımcı olalım.",
};

export default async function ContactPage() {
  const projects = await getProjectCards();

  return (
    <>
      <PageHero
        eyebrow="Bize Ulaşın"
        title="İletişim"
        description="Projelerimiz, fiyatlar ve ödeme planları hakkında merak ettiğiniz her şeyi sorun."
        image={projects[1]?.coverImage ?? projects[0]?.coverImage}
        breadcrumb={[{ href: "/iletisim", label: "İletişim" }]}
        size="sm"
      />

      <section className="section bg-bg">
        <div className="container-x grid lg:grid-cols-5 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <Card className="p-6">
              <h2 className="t-h3 text-ink">Ofisimiz</h2>
              <ul className="mt-5 space-y-5 text-sm">
                <li className="flex gap-3.5">
                  <MapPin size={18} className="shrink-0 mt-0.5 text-brand" />
                  <div>
                    <p className="font-semibold text-ink">Adres</p>
                    <a
                      href={BRAND.mapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted hover:text-brand transition-colors leading-relaxed block mt-0.5"
                    >
                      {BRAND.address}
                    </a>
                  </div>
                </li>
                <li className="flex gap-3.5">
                  <Phone size={18} className="shrink-0 mt-0.5 text-brand" />
                  <div>
                    <p className="font-semibold text-ink">Telefon</p>
                    <div className="flex flex-col gap-0.5 mt-0.5">
                      <a
                        href={`tel:${BRAND.phoneRaw}`}
                        className="text-muted hover:text-brand transition-colors num"
                      >
                        {BRAND.phone}
                      </a>
                      <a
                        href="tel:905469998080"
                        className="text-muted hover:text-brand transition-colors num"
                      >
                        {BRAND.phone2}
                      </a>
                    </div>
                  </div>
                </li>
                <li className="flex gap-3.5">
                  <Mail size={18} className="shrink-0 mt-0.5 text-brand" />
                  <div>
                    <p className="font-semibold text-ink">E-posta</p>
                    <a
                      href={`mailto:${BRAND.email}`}
                      className="text-muted hover:text-brand transition-colors block mt-0.5"
                    >
                      {BRAND.email}
                    </a>
                  </div>
                </li>
                <li className="flex gap-3.5">
                  <Clock size={18} className="shrink-0 mt-0.5 text-brand" />
                  <div>
                    <p className="font-semibold text-ink">Çalışma Saatleri</p>
                    <p className="text-muted mt-0.5">Pazartesi – Cumartesi · 09:00 – 18:00</p>
                  </div>
                </li>
              </ul>

              <a
                href={`https://wa.me/${BRAND.whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 h-12 rounded-xl bg-[#25D366] text-white font-semibold mt-6 hover:brightness-105 transition-all"
              >
                WhatsApp ile Yazın
              </a>
            </Card>

            <div className="rounded-2xl overflow-hidden border border-border h-64">
              <iframe
                title="Hardworker Construction ofis konumu"
                src="https://www.google.com/maps?q=35.1264,33.9387&z=14&output=embed"
                className="w-full h-full"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>

          <div className="lg:col-span-3">
            <Card className="p-6 sm:p-8">
              <h2 className="t-h3 text-ink">Mesaj gönderin</h2>
              <p className="text-sm text-muted mt-1.5">
                Formu doldurun, satış danışmanımız en kısa sürede sizinle iletişime geçsin.
              </p>
              <div className="mt-6">
                <ContactForm />
              </div>
            </Card>
          </div>
        </div>
      </section>
    </>
  );
}
