# Hardworker Construction — Web Sitesi & CRM

Kuzey Kıbrıs Gazimağusa merkezli Hardworker Construction Ltd. için geliştirilen
kurumsal web sitesi ve satış yönetim paneli (CRM).

Sitenin can damarı **fiyat kaydı**dır: ziyaretçi daire fiyatlarını görmek için
yalnızca telefon numarasını bırakır, bu kayıt anında CRM'de bir lead'e dönüşür ve
ziyaretçinin hangi projelere/dairelere baktığı satış ekibine sinyal olarak düşer.

## Teknoloji

- **Next.js 16** (App Router, Turbopack) + **React 19** + **TypeScript**
- **Tailwind CSS v4** + özel tasarım sistemi (marka mavisi `#126FB2`)
- **Prisma** ORM + **PostgreSQL** (Neon / Supabase / Vercel Postgres)
- **jose** (JWT çerez oturumu) + **bcryptjs**
- **Recharts** (grafikler), **lucide-react** (ikonlar)
- Server Actions tabanlı mutasyonlar, `zod` ile doğrulama

## Canlı demo

Projeyi müşterinin gezebileceği bir adrese almak için → **[DEPLOY.md](DEPLOY.md)**
(Vercel + Neon Postgres, tamamı web arayüzünden, ~10 dakika).

## Yerel kurulum

Bir PostgreSQL veritabanı gerekir (Neon'un ücretsiz paketi yeterlidir).

```bash
npm install
cp .env.example .env       # DATABASE_URL ve AUTH_SECRET'i doldurun
npx prisma migrate deploy  # tabloları oluştur
npm run db:seed            # gerçek proje verisi + örnek lead'ler
npm run dev                # http://localhost:3000
```

> `db:seed` veritabanı boş değilse hiçbir şey yapmaz. Sıfırlamak için:
> `npm run db:reset`

### Panel girişi

| Rol | E-posta | Şifre |
|---|---|---|
| Süper Yönetici | `admin@hardworkercyprus.com` | `hardworker2026` |
| Satış Müdürü | `satis@hardworkercyprus.com` | `hardworker2026` |
| Satış Danışmanı | `ayse@hardworkercyprus.com` | `hardworker2026` |

Panel adresi: `/panel/giris`

> **Yayına almadan önce** şifreleri değiştirin ve `.env` içindeki `AUTH_SECRET`
> değerini güçlü, rastgele bir değerle güncelleyin.

## Fiyat kaydı (lead gate) nasıl çalışır?

Akış kasıtlı olarak tek adımdır — sürtünme ne kadar azsa dönüşüm o kadar yüksektir.

1. Kayıtsız ziyaretçi fiyat yerine sade bir **"Fiyatı gör →"** bağlantısı görür.
   Kilit ikonu ya da bulanık maske yoktur. **Gerçek fiyatlar sunucudan hiç
   gönderilmez** — sayfa kaynağından da okunamaz.
2. Tıklayınca tek zorunlu alanı **telefon numarası** olan bir form açılır.
   Ad alanı isteğe bağlıdır; boş bırakılırsa CRM'de numara görünür ad olarak kullanılır.
3. Form gönderilince:
   - `Lead` kaydı açılır (kaynak: `PRICE_GATE`), bakılan proje/daire sinyallerine
     göre puanlanır ve sıcak/ılık/soğuk olarak sınıflanır.
   - Aynı telefon tekrar kayıt olursa yeni lead açılmaz, mevcut kayıt zenginleşir.
   - İmzalı `hw_visitor` çerezi yazılır; fiyatlar 180 gün boyunca açık kalır.
4. Ziyaretçinin gezdiği her proje ve daire `UnitView` olarak kaydedilir; satış
   danışmanı lead detayındaki **Site Hareketleri** sekmesinden görür.

Fiyat kaydı, panelden **Ayarlar → Fiyat Kilidi** bölümünden tamamen kapatılabilir.

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

Adım adım rehber: **[DEPLOY.md](DEPLOY.md)**

Dağıtım sırasında `npm run build` sırasıyla şunları yapar: `prisma generate` →
`prisma migrate deploy` (tabloları kurar) → `prisma/seed.ts` (veritabanı boşsa
örnek veriyi yükler) → `next build`.

Gerçek kullanıma geçmeden önce:
- Panelden **Kullanıcılar** bölümünde demo şifrelerini değiştirin
- `AUTH_SECRET`'i güçlü bir değerle ayarlayın
- `public/media` (52 MB) içeriğini bir CDN'e taşımayı değerlendirin

## Sonraki sürüm adayları

Çoklu dil (EN/RU) · e-posta ve WhatsApp bildirimi · panelden görsel yükleme ·
lead otomatik atama kuralları · teklif/PDF üretimi · müşteri portalı · 2FA.
