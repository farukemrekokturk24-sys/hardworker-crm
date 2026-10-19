# Canlı Demo Kurulumu (Vercel + Postgres)

Bu rehber, projeyi müşterinin tarayıcıdan gezebileceği canlı bir adrese almak
içindir. Tamamı web arayüzünden yapılır, terminal gerekmez. Yaklaşık 10 dakika.

---

## 1. Oturum anahtarını üretin

Önce bir güvenlik anahtarı üretin — birazdan Vercel'e yapıştıracaksınız.
Terminalde şunu çalıştırın ve çıkan satırı kopyalayın:

```bash
openssl rand -base64 32
```

> Bu anahtar panel oturum çerezlerini imzalar. Kimseyle paylaşmayın.

---

## 2. Vercel'e projeyi aktarın

1. [vercel.com](https://vercel.com) adresine GitHub hesabınızla girin.
2. **Add New → Project** deyin.
3. Listeden **hardworker-crm** deposunu bulun, **Import** deyin.
4. **Deploy düğmesine henüz basmayın** — önce 3. adımı yapın.

---

## 3. Veritabanını bağlayın

Aynı ekranda (ya da proje açıldıktan sonra **Storage** sekmesinden):

1. **Storage → Create Database** deyin.
2. **Neon** (Serverless Postgres) seçin — ücretsiz paket demo için fazlasıyla yeterli.
3. Bölge olarak **Frankfurt (eu-central-1)** seçin — Kıbrıs'a en yakın olan budur.
4. **Connect** deyip projeye bağlayın.

Vercel bağlantı bilgilerini otomatik olarak ortam değişkeni şeklinde ekler.

> **Önemli:** Veritabanını **ilk dağıtımdan önce** bağlayın. Tablolar ve örnek
> veri dağıtım sırasında otomatik oluşturulur.

---

## 4. Ortam değişkenlerini girin

Proje ayarlarında **Settings → Environment Variables** bölümüne şunları ekleyin:

Elle girmeniz gereken **tek bir değişken** var:

| Ad | Değer |
|---|---|
| `AUTH_SECRET` | 1. adımda ürettiğiniz anahtar |

**Production, Preview ve Development** ortamlarının üçünü de işaretleyin.

Diğerleri kendiliğinden hallolur:

- **`DATABASE_URL`** → Neon'u bağladığınızda Vercel otomatik ekler.
- **`NEXT_PUBLIC_SITE_URL`** → gerekmez; uygulama Vercel'in verdiği alan adını
  kendisi kullanır. Yalnızca kendi alan adınızı (ör. `hardworkercyprus.com`)
  bağlarsanız eklemeniz gerekir.

> **Neon bağlantısı "pooled" mı olmalı?** Tablolar dağıtım sırasında oluşturulur
> ve bu işlem havuzlanmış bağlantıda sorun çıkarabilir. Vercel'in eklediği
> `DATABASE_URL` ile dağıtım hata verirse, Neon panelinden **"Pooled connection"
> kapalı** adresi kopyalayıp `DATABASE_URL` değerini onunla değiştirin.

---

## 5. Dağıtın

**Deploy** deyin. Vercel sırasıyla şunları yapar:

1. `prisma generate` — veritabanı istemcisini üretir
2. `prisma migrate deploy` — 18 tabloyu oluşturur
3. `prisma/seed.ts` — 4 proje, 83 daire, 246 görsel ve örnek lead'leri yükler
4. `next build` — siteyi derler

İlk dağıtım birkaç dakika sürer.

> Seed **yalnızca veritabanı boşsa** çalışır. Sonraki dağıtımlarda müşterinin
> sitede bıraktığı lead'ler korunur.

---

## 6. Kontrol edin

Dağıtım bitince verilen adreste:

- **Ana sayfa** → projeler listelenmeli
- **Bir proje → Daire ve Fiyat Listesi** → fiyatlar yerine "Fiyatı gör" yazmalı
- **"Fiyatı gör"e tıklayın** → telefon isteyen form açılmalı
- Numara girin → fiyatlar açılmalı
- **`/panel/giris`** → panele girin, bıraktığınız numara lead olarak düşmüş olmalı

### Panel giriş bilgileri

| Rol | E-posta | Şifre |
|---|---|---|
| Süper Yönetici | `admin@hardworkercyprus.com` | `hardworker2026` |
| Satış Müdürü | `satis@hardworkercyprus.com` | `hardworker2026` |
| Satış Danışmanı | `ayse@hardworkercyprus.com` | `hardworker2026` |

> ⚠️ Bunlar **demo şifreleridir** ve herkese açık depoda yazılıdır. Gerçek
> kullanıma geçerken panelden **Kullanıcılar** bölümünden şifreleri değiştirin.

---

## Sık karşılaşılan sorunlar

**Dağıtım `P1001 Can't reach database` ile düşüyor**
→ `DATABASE_URL` eksik ya da hatalı. Neon bağlantısını kontrol edip
**Deployments → Redeploy** deyin.

**Dağıtım `AUTH_SECRET tanımlı değil` ile düşüyor**
→ `AUTH_SECRET` eklenmemiş ya da 16 karakterden kısa. 1. adımdaki komutla
yeni bir anahtar üretip ekleyin ve yeniden dağıtın. (Uygulama, oturum
çerezinin taklit edilebilmesini önlemek için zayıf anahtarla açılmaz.)

**Site açılıyor ama proje görünmüyor**
→ Seed çalışmamış. Vercel'de **Deployments → (son dağıtım) → Build Logs**
bölümünde `Seed tamamlandı` satırını arayın. Yoksa veritabanını bağlayıp
yeniden dağıtın.

**Panele girince "E-posta veya şifre hatalı" diyor**
→ Seed çalışmamış demektir; yukarıdaki adımı uygulayın.

**Fiyatlar kayıt olmadan görünüyor**
→ Panel **Ayarlar → Fiyat Kilidi** bölümünden kapatılmış olabilir, açın.

---

## Veriyi sıfırlamak

Demoyu temize çekmek isterseniz, Neon panelinden veritabanını silip yeniden
oluşturun ve Vercel'de **Redeploy** deyin; seed baştan çalışır.
