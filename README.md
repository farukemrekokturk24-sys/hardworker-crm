# Hardworker Construction — Web Sitesi & CRM

Kuzey Kıbrıs Gazimağusa merkezli Hardworker Construction Ltd. için geliştirilen
kurumsal web sitesi ve satış yönetim paneli (CRM).

Sitenin can damarı **fiyat kilidi**dir: ziyaretçi daire fiyatlarını görmek için
ad ve telefon bırakır, bu kayıt anında CRM'de bir lead'e dönüşür ve ziyaretçinin
hangi projelere/dairelere baktığı satış ekibine sinyal olarak düşer.

## Teknoloji

- **Next.js 16** (App Router, Turbopack) + **React 19** + **TypeScript**
- **Tailwind CSS v4** + özel tasarım sistemi (marka mavisi `#126FB2`)
- **Prisma** ORM — geliştirmede SQLite, yayında PostgreSQL
- **jose** (JWT çerez oturumu) + **bcryptjs**
- **Recharts** (grafikler), **lucide-react** (ikonlar)
- Server Actions tabanlı mutasyonlar, `zod` ile doğrulama

## Kurulum

```bash
npm install
npx prisma migrate dev     # veritabanını oluştur
npm run db:seed            # gerçek proje verisi + örnek lead'ler
npm run dev                # http://localhost:3000
```

### Panel girişi

| Rol | E-posta | Şifre |
|---|---|---|
| Süper Yönetici | `admin@hardworkercyprus.com` | `hardworker2026` |
| Satış Müdürü | `satis@hardworkercyprus.com` | `hardworker2026` |
| Satış Danışmanı | `ayse@hardworkercyprus.com` | `hardworker2026` |

Panel adresi: `/panel/giris`

> **Yayına almadan önce** şifreleri değiştirin ve `.env` içindeki `AUTH_SECRET`
> değerini güçlü, rastgele bir değerle güncelleyin.

## Fiyat kilidi (lead gate) nasıl çalışır?

1. Kayıtsız ziyaretçi fiyat yerine bulanık bir maske ve "Fiyatı gör" bağlantısı görür.
   **Gerçek fiyatlar sunucudan hiç gönderilmez** — sayfa kaynağından da okunamaz.
2. Tıklayınca ad + telefon isteyen modal açılır (ülke, amaç, e-posta opsiyonel).
3. Form gönderilince:
   - `Lead` kaydı açılır (kaynak: `PRICE_GATE`), bütçe/amaç/proje sinyallerine göre
     puanlanır ve sıcak/ılık/soğuk olarak sınıflanır.
   - Aynı telefon tekrar kayıt olursa yeni lead açılmaz, mevcut kayıt zenginleşir.
   - İmzalı `hw_visitor` çerezi yazılır; fiyatlar 180 gün boyunca açık kalır.
4. Ziyaretçinin gezdiği her proje ve daire `UnitView` olarak kaydedilir; satış
   danışmanı lead detayındaki **Site Hareketleri** sekmesinden görür.

Kilit, panelden **Ayarlar → Fiyat Kilidi** bölümünden kapatılabilir.

## Yapı

```
src/
  app/
    (site)/              Ziyaretçiye açık site
      page.tsx           Ana sayfa
      projeler/          Liste + otomatik proje detay sayfaları
      hakkimizda/ neden-kibris/ iletisim/ kvkk/ gizlilik/
      actions.ts         Lead gate, iletişim formu, randevu talebi
    panel/
      giris/             Panel girişi
      (crm)/             Korumalı CRM (13 ekran)
        page.tsx         Genel bakış (grafikler, görevler, randevular)
        leadler/         Liste + Kanban + detay (zaman çizelgesi, notlar)
        randevular/ satislar/ gorevler/
        projeler/ daireler/ medya/
        raporlar/ mesajlar/ kullanicilar/ ayarlar/
        actions.ts       Tüm CRM mutasyonları
  components/
    site/  admin/  ui/  brand/
  lib/
    auth.ts              Personel oturumu (JWT)
    visitor.ts           Ziyaretçi oturumu + fiyat kilidi + davranış takibi
    leads.ts             Lead upsert, puanlama, referans numarası
    queries.ts           Site sorguları (fiyat maskeleme dahil)
    crm-queries.ts       Dashboard toplamları
    permissions.ts       Rol/yetki matrisi
  proxy.ts               /panel rotalarını korur
prisma/
  schema.prisma          18 model
  seed.ts, seed-data.ts  Gerçek envanter (fiyat listelerinden)
public/
  media/<proje>/<kategori>/   246 optimize edilmiş WebP görsel
  docs/                       Ödeme planı PDF'leri
```

## Veri

Seed, gerçek proje dosyalarından çıkarılan veriyi yükler:

| Proje | Daire | Durum |
|---|---|---|
| Luxera Salamis | 48 (4 blok) | Devam ediyor · Aralık 2028 |
| Sunrise Platinium | 14 | Devam ediyor · Aralık 2027 |
| Sunrise Diamond | 12 | Devam ediyor · Aralık 2028 |
| Sunrise Gold | 9 | Teslim edildi · Aralık 2024 |

Toplam **83 daire**, **246 görsel**, fiyatlar ve ödeme planları orijinal
fiyat listesi dosyalarından alınmıştır.

## Roller

| Rol | Erişim |
|---|---|
| Süper Yönetici | Her şey |
| Satış Müdürü | Lead atama, envanter ve fiyat düzenleme, raporlar |
| Satış Danışmanı | Yalnızca kendine atanan lead ve randevular |
| Pazarlama | Lead'ler, proje içeriği, medya, raporlar |
| Görüntüleyici | Yalnızca genel bakış |

## Yayına alma

1. Supabase/Neon'da PostgreSQL oluştur → `.env` içindeki `DATABASE_URL`'i değiştir.
2. `prisma/schema.prisma` içinde `provider = "postgresql"` yap, `npx prisma migrate deploy` çalıştır.
3. `AUTH_SECRET` ve admin şifrelerini güncelle, `NEXT_PUBLIC_SITE_URL`'i canlı adrese çevir.
4. `public/media` içeriğini CDN'e ya da Supabase Storage'a taşımayı değerlendir.
5. Vercel'e deploy et.

## Sonraki sürüm adayları

Çoklu dil (EN/RU) · e-posta ve WhatsApp bildirimi · panelden görsel yükleme ·
lead otomatik atama kuralları · teklif/PDF üretimi · müşteri portalı · 2FA.
