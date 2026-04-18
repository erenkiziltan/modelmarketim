# PolyForge — 3D Baskı Figür E-Ticaret Platformu

**PolyForge**, 3D yazıcı ile üretilen özel tasarım figürlerin satıldığı, modern ve profesyonel bir e-ticaret platformudur. Hem müşteriye yönelik alışveriş deneyimi hem de kapsamlı bir yönetim paneli içerir.

---

## Özellikler

### Müşteri Tarafı
- Anasayfa — hero banner, öne çıkan ürünler, özellik bandı
- Ürün listesi — arama, fiyat sıralama, stok durumu
- Ürün detay — çoklu görsel, varyant seçimi (renk, boyut vb.)
- Sepet drawer — sağdan açılan panel, sayfa değişmeden alışveriş
- Sipariş formu — ad, adres, telefon, not
- Sipariş takip — sipariş numarasıyla adım adım durum sorgulama
- Favori listesi — localStorage tabanlı, kalp ikonu ile kaydetme
- Türkçe / İngilizce dil desteği
- Sayfa geçiş animasyonları (Framer Motion)
- Tam responsive tasarım

### Admin Paneli (`/admin`)
- Güvenli giriş (Supabase Auth)
- Dashboard — toplam ürün, sipariş, bekleyen sipariş, düşük stok uyarısı
- Ürün yönetimi — ekle, düzenle, sil, yayına al/gizle
- Görsel yönetimi — drag & drop yükleme, kapak görseli seçimi
- Varyant yönetimi — renk, boyut gibi seçenekler + fiyat farkı
- Sipariş yönetimi — durum güncelleme, detay görüntüleme

---

## Teknoloji Yığını

| Katman | Teknoloji |
|---|---|
| Frontend | Next.js 15 (App Router) + TypeScript |
| Stil | Tailwind CSS v4 + shadcn/ui |
| Animasyon | Framer Motion |
| Font | Space Grotesk (başlık) + Inter (metin) |
| Backend | Next.js API Routes |
| Veritabanı | Supabase (PostgreSQL) |
| Auth | Supabase Auth |
| Depolama | Supabase Storage |
| i18n | next-intl (TR/EN) |
| Deploy | Vercel |

---

## Kurulum

### Gereksinimler
- Node.js 18+
- npm veya yarn
- Supabase hesabı (ücretsiz)

### 1. Repoyu klonla

```bash
git clone https://github.com/erenkiziltan/polyforge.git
cd polyforge
npm install
```

### 2. Ortam değişkenlerini ayarla

`.env.local` dosyası oluştur:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 3. Veritabanı şemasını kur

[Supabase Dashboard](https://supabase.com) → SQL Editor → `supabase/schema.sql` dosyasını yapıştır → Run

### 4. Admin kullanıcısı oluştur

Supabase Dashboard → Authentication → Users → Add User

### 5. Geliştirme sunucusunu başlat

```bash
npm run dev
```

Uygulama `http://localhost:3000` adresinde çalışır.
Admin paneli: `http://localhost:3000/admin/login`

---

## Proje Yapısı

```
src/
├── app/
│   ├── [locale]/           # Müşteri sitesi (tr/en)
│   │   ├── page.tsx        # Anasayfa
│   │   ├── products/       # Ürün listesi + detay
│   │   ├── cart/           # Sepet
│   │   ├── checkout/       # Sipariş formu
│   │   ├── track/          # Sipariş takip
│   │   └── favorites/      # Favoriler
│   └── admin/              # Yönetim paneli
│       ├── login/
│       ├── dashboard/
│       ├── products/
│       └── orders/
├── components/
│   ├── shop/               # Müşteri UI bileşenleri
│   ├── admin/              # Admin UI bileşenleri
│   ├── shared/             # Ortak bileşenler
│   └── ui/                 # shadcn/ui bileşenleri
├── lib/
│   ├── supabase/           # Client & server Supabase
│   └── utils.ts
├── messages/               # i18n çeviri dosyaları
│   ├── tr.json
│   └── en.json
└── types/                  # TypeScript tipleri
```

---

## Veritabanı Şeması

- **products** — ürün bilgileri (TR/EN isim, açıklama, fiyat, stok)
- **product_images** — ürün görselleri (Supabase Storage)
- **product_variants** — varyant seçenekleri (renk, boyut vb.)
- **orders** — sipariş kayıtları ve durum takibi

---

## Yol Haritası

- [x] Temel e-ticaret altyapısı
- [x] Admin paneli
- [x] TR/EN dil desteği
- [x] Sepet drawer & animasyonlar
- [x] Favori listesi & sipariş takip
- [ ] İyzico ödeme entegrasyonu
- [ ] n8n otomasyon (sipariş bildirimi, fatura, mail)
- [ ] Kargo API entegrasyonu (MNG, Yurtiçi)
- [ ] SEO optimizasyonu
- [ ] Google Analytics

---

## Lisans

MIT © [PolyForge](https://github.com/erenkiziltan/polyforge)
