import { redirect } from "next/navigation";
import { Settings, Lock, Phone, Mail, MapPin, Shield } from "lucide-react";
import { Card, CardHeader, Badge } from "@/components/ui/primitives";
import { PriceGateSettings } from "@/components/admin/settings-form";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";
import { can } from "@/lib/permissions";
import { BRAND } from "@/lib/constants";

export const metadata = { title: "Ayarlar" };

export default async function SettingsPage() {
  const session = await requireSession();
  if (!can(session.role, "*")) redirect("/panel");

  const settings = await prisma.setting.findMany();
  const map = Object.fromEntries(settings.map((s) => [s.key, s.value]));

  const [leadCount, gateCount] = await Promise.all([
    prisma.lead.count({ where: { deletedAt: null } }),
    prisma.lead.count({ where: { deletedAt: null, source: "PRICE_GATE" } }),
  ]);

  return (
    <div className="space-y-5 max-w-3xl">
      <div>
        <h1 className="t-h2 text-ink flex items-center gap-2.5">
          <Settings size={26} className="text-brand" /> Ayarlar
        </h1>
        <p className="text-muted mt-1 text-sm">Site ve CRM davranışını yönetin</p>
      </div>

      <Card>
        <CardHeader
          title={
            <span className="flex items-center gap-2">
              <Lock size={17} className="text-brand" /> Fiyat Kilidi (Lead Gate)
            </span>
          }
          subtitle="Ziyaretçilerin fiyatları görmek için kayıt olması"
        />
        <div className="p-5">
          <div className="rounded-xl bg-brand-50/60 border border-brand/20 p-4 mb-5">
            <p className="text-sm text-ink-soft leading-relaxed">
              Fiyat kilidi açıkken ziyaretçiler daire fiyatlarını göremez; &quot;Fiyatı
              gör&quot; bağlantısına tıkladıklarında ad ve telefon isteyen bir form açılır.
              Form gönderildiğinde CRM&apos;de otomatik olarak{" "}
              <strong className="text-ink">PRICE_GATE</strong> kaynaklı bir lead oluşur ve
              ziyaretçinin hangi projelere baktığı kaydedilmeye başlar.
            </p>
            <p className="text-sm font-semibold text-brand mt-3 num">
              Şu ana kadar {gateCount} lead bu yolla geldi ({leadCount} toplam lead).
            </p>
          </div>

          <PriceGateSettings
            enabled={map["crm.priceGate.enabled"] !== false}
            title={
              (map["crm.priceGate.title"] as string) ??
              "Fiyat listesini görmek için kayıt olun"
            }
          />
        </div>
      </Card>

      <Card>
        <CardHeader
          title={
            <span className="flex items-center gap-2">
              <Phone size={17} className="text-brand" /> İletişim Bilgileri
            </span>
          }
          subtitle="Sitede ve panelde görünen kurumsal bilgiler"
        />
        <dl className="p-5 space-y-3.5 text-sm">
          <div className="flex gap-3">
            <dt className="text-muted w-28 shrink-0 flex items-center gap-1.5">
              <Phone size={13} /> Telefon
            </dt>
            <dd className="font-medium text-ink num">
              {BRAND.phone} · {BRAND.phone2}
            </dd>
          </div>
          <div className="flex gap-3">
            <dt className="text-muted w-28 shrink-0 flex items-center gap-1.5">
              <Mail size={13} /> E-posta
            </dt>
            <dd className="font-medium text-ink">{BRAND.email}</dd>
          </div>
          <div className="flex gap-3">
            <dt className="text-muted w-28 shrink-0 flex items-center gap-1.5">
              <MapPin size={13} /> Adres
            </dt>
            <dd className="font-medium text-ink leading-relaxed">{BRAND.address}</dd>
          </div>
          <p className="text-xs text-muted pt-2 border-t border-border">
            Bu bilgiler <code className="bg-surface-2 px-1.5 py-0.5 rounded">src/lib/constants.ts</code>{" "}
            dosyasındaki <strong>BRAND</strong> sabitinde tutulur.
          </p>
        </dl>
      </Card>

      <Card>
        <CardHeader
          title={
            <span className="flex items-center gap-2">
              <Shield size={17} className="text-brand" /> Roller ve Yetkiler
            </span>
          }
        />
        <ul className="p-5 space-y-3 text-sm">
          {[
            { role: "Süper Yönetici", desc: "Tüm modüllere ve ayarlara erişir." },
            { role: "Satış Müdürü", desc: "Lead atar, envanter ve fiyatları düzenler, raporları görür." },
            { role: "Satış Danışmanı", desc: "Sadece kendisine atanan lead'leri ve randevuları görür." },
            { role: "Pazarlama", desc: "Lead'leri ve proje içeriğini yönetir, raporlara erişir." },
            { role: "Görüntüleyici", desc: "Sadece genel bakış ekranını görür." },
          ].map((r) => (
            <li key={r.role} className="flex gap-3">
              <Badge className="shrink-0 w-32 justify-center">{r.role}</Badge>
              <span className="text-ink-soft">{r.desc}</span>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
