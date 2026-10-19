# Hardworker CRM — geliştirme notları

- **Dil:** Tüm arayüz metinleri ve kod yorumları Türkçedir.
- **Fiyat kaydı:** Kayıtsız ziyaretçiye gerçek fiyat **asla** gönderilmez.
  Sunucuda `canSeePrices()` ile maskelenir; istemci yalnızca `hasPrice` bayrağını
  görür. Yeni bir yerde fiyat gösterirken bu deseni koruyun.
- **Form sürtünmesi:** Fiyat formunda tek zorunlu alan telefondur. Buraya yeni
  zorunlu alan eklemeyin — dönüşümü doğrudan düşürür. Kilit ikonu/bulanıklık
  kullanılmaz; sade bir "Fiyatı gör →" bağlantısı tercih edilir.
- **Mutasyonlar** Server Action'larla yapılır (`src/app/**/actions.ts`),
  `requireSession()` + `assertCan()` ile korunur.
- **Grid/flex içindeki yatay kaydırıcılar** `min-w-0` gerektirir; aksi hâlde
  mobilde sayfa taşar.
- **`Reveal`** bileşeni `threshold: 0` kullanır — viewport'tan uzun bölümlerde
  oran tabanlı eşik asla dolmaz.
- `npm run db:reset && npm run db:seed` ile veri sıfırlanır.
