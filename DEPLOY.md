# Canlı Demo Kurulumu (Vercel + Neon Postgres)

Müşterinin tarayıcıdan gezebileceği canlı bir adrese almak için. Tamamı
tıklamayla yapılır — **elle girilecek hiçbir değer yoktur.** ~5 dakika.

---

## 1. Projeyi Vercel'e aktarın

1. [vercel.com/new](https://vercel.com/new) adresine GitHub hesabınızla girin.
2. **hardworker-crm** deposunu bulun, **Import** deyin.
3. Ayarlara dokunmayın (Next.js otomatik algılanır), **Create Project** deyin.

> İlk derleme **başarısız olacak** — veritabanı henüz bağlı değil. Bu beklenen
> durumdur, bir sonraki adımda düzelir.

---

## 2. Veritabanını bağlayın

1. Proje ekranında üstteki **Storage** sekmesine geçin.
2. **Create Database** → **Neon** (Serverless Postgres) seçin.
3. Bölge: **Frankfurt (eu-central-1)** — Kıbrıs'a en yakın olan budur.
4. **Connect** deyin.

Vercel `DATABASE_URL`'i otomatik ekler. Başka bir şey girmenize gerek yok:
oturum anahtarı uygulama tarafından üretilip veritabanında saklanır.

---

## 3. Yeniden dağıtın

**Deployments** sekmesi → en üstteki satırın sağındaki **⋯** → **Redeploy**.

Derleme sırasıyla şunları yapar:

1. `prisma generate` — veritabanı istemcisini üretir
2. `prisma migrate deploy` — 18 tabloyu oluşturur
3. `prisma/seed.ts` — 4 proje, 83 daire, 246 görsel ve örnek lead'leri yükler
4. `next build` — siteyi derler

> Seed **yalnızca veritabanı boşsa** çalışır. Sonraki dağıtımlarda müşterinin
> sitede bıraktığı lead'ler korunur.

---

## 4. Kontrol edin

Verilen adreste:

- **Ana sayfa** → 4 proje listelenmeli
- **Bir proje → Daire ve Fiyat Listesi** → fiyat yerine "Fiyatı gör" yazmalı
- **"Fiyatı gör"e tıklayın** → yalnızca telefon isteyen form açılmalı
- Numara girin → fiyatlar açılmalı
- **`/panel/giris`** → panele girin; bıraktığınız numara lead olarak düşmüş olmalı

### Panel giriş bilgileri

| Rol | E-posta | Şifre |
|---|---|---|
| Süper Yönetici | `admin@hardworkercyprus.com` | `hardworker2026` |
| Satış Müdürü | `satis@hardworkercyprus.com` | `hardworker2026` |
| Satış Danışmanı | `ayse@hardworkercyprus.com` | `hardworker2026` |

> ⚠️ Bunlar **demo şifreleridir** ve herkese açık depoda yazılıdır. Gerçek
> kullanıma geçerken panelden **Kullanıcılar** bölümünden değiştirin.

---

## Sık karşılaşılan sorunlar

**Derleme `P1001 Can't reach database` ile düşüyor**
→ Veritabanı bağlanmamış. 2. adımı yapıp **Redeploy** deyin.

**Derleme veritabanı bağlıyken de düşüyor**
→ Neon'un havuzlanmış (pooled) adresi tablo oluştururken sorun çıkarabilir.
Neon panelinden **"Pooled connection" kapalı** adresi kopyalayın ve Vercel'de
**Settings → Environment Variables** altındaki `DATABASE_URL` değerini onunla
değiştirip yeniden dağıtın.

**Site açılıyor ama proje görünmüyor**
→ Seed çalışmamış. **Deployments → (son dağıtım) → Build Logs** içinde
`Seed tamamlandı` satırını arayın; yoksa **Redeploy** deyin.

**Panele girince "E-posta veya şifre hatalı" diyor**
→ Seed çalışmamış demektir; yukarıdaki adımı uygulayın.

---

## İsteğe bağlı ayarlar

Bunlar **gerekli değildir**, yalnızca ihtiyaç olursa:

| Değişken | Ne zaman gerekir |
|---|---|
| `AUTH_SECRET` | Oturum anahtarını kendiniz yönetmek isterseniz (en az 16 karakter). Boş bırakılırsa uygulama üretir. |
| `NEXT_PUBLIC_SITE_URL` | Kendi alan adınızı bağlarsanız, ör. `https://hardworkercyprus.com` |

## Veriyi sıfırlamak

Neon panelinden veritabanını silip yeniden oluşturun, ardından Vercel'de
**Redeploy** deyin; seed baştan çalışır.
