import Link from "next/link";
import { Phone, Mail, MapPin } from "lucide-react";
import { FacebookIcon, InstagramIcon, YoutubeIcon } from "@/components/brand/social-icons";
import { Logo } from "@/components/brand/logo";
import { BRAND, NAV_LINKS } from "@/lib/constants";

export async function Footer({
  projects,
}: {
  projects: { slug: string; name: string }[];
}) {
  return (
    <footer className="bg-dark text-white/70 mt-auto">
      <div className="container-x py-14 lg:py-16">
        <div className="grid gap-10 lg:gap-8 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <Logo variant="dark" />
            <p className="mt-5 text-sm leading-relaxed max-w-xs">
              Kuzey Kıbrıs&apos;ta 18 yılı aşkın tecrübeyle, zamanında teslim edilen
              ve değer kazandıran yaşam projeleri geliştiriyoruz.
            </p>
            <div className="flex items-center gap-2 mt-6">
              {[
                { href: BRAND.social.facebook, icon: FacebookIcon, label: "Facebook" },
                { href: BRAND.social.instagram, icon: InstagramIcon, label: "Instagram" },
                { href: BRAND.social.youtube, icon: YoutubeIcon, label: "YouTube" },
              ].map(({ href, icon: Icon, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="h-10 w-10 rounded-xl bg-white/5 hover:bg-brand grid place-items-center text-white/70 hover:text-white transition-colors"
                >
                  <Icon size={17} />
                </a>
              ))}
            </div>
          </div>

          <div className="lg:col-span-2">
            <h3 className="text-white font-bold text-sm tracking-wide mb-4">Kurumsal</h3>
            <ul className="space-y-2.5 text-sm">
              {NAV_LINKS.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="hover:text-white transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-3">
            <h3 className="text-white font-bold text-sm tracking-wide mb-4">Projeler</h3>
            <ul className="space-y-2.5 text-sm">
              {projects.map((p) => (
                <li key={p.slug}>
                  <Link
                    href={`/projeler/${p.slug}`}
                    className="hover:text-white transition-colors"
                  >
                    {p.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-3">
            <h3 className="text-white font-bold text-sm tracking-wide mb-4">İletişim</h3>
            <ul className="space-y-3.5 text-sm">
              <li className="flex gap-3">
                <MapPin size={16} className="shrink-0 mt-0.5 text-brand" />
                <a
                  href={BRAND.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors leading-relaxed"
                >
                  {BRAND.address}
                </a>
              </li>
              <li className="flex gap-3">
                <Phone size={16} className="shrink-0 mt-0.5 text-brand" />
                <span className="flex flex-col gap-1">
                  <a href={`tel:${BRAND.phoneRaw}`} className="hover:text-white transition-colors">
                    {BRAND.phone}
                  </a>
                  <a href="tel:905469998080" className="hover:text-white transition-colors">
                    {BRAND.phone2}
                  </a>
                </span>
              </li>
              <li className="flex gap-3">
                <Mail size={16} className="shrink-0 mt-0.5 text-brand" />
                <a href={`mailto:${BRAND.email}`} className="hover:text-white transition-colors">
                  {BRAND.email}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-7 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <p>
            © {new Date().getFullYear()} {BRAND.fullName}. Tüm hakları saklıdır.
          </p>
          <div className="flex items-center gap-5">
            <Link href="/kvkk" className="hover:text-white transition-colors">
              KVKK Aydınlatma Metni
            </Link>
            <Link href="/gizlilik" className="hover:text-white transition-colors">
              Gizlilik Politikası
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
