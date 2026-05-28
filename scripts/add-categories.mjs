import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://tqobzccyxpodzbuxukpd.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRxb2J6Y2N5eHBvZHpidXh1a3BkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjUxNDM1NiwiZXhwIjoyMDkyMDkwMzU2fQ.HokPt3Q8jodFC2_vmvzazB4D9hmYU62wwQVl_wY8yRA'
)

// Kategori → ürün atamaları
const assignments = {
  'kisiye-ozel': [
    'Kişiye Özel Figür(Realistik)',
    'Kişiye Özel Figür(Anime)',
    'Kişiye Özel Kabartmalı Fotoğraf Tablo',
  ],
  'dizi-film': [
    'Yüzüklerin Efendisi Figür Seti',
    ' La Casa De Papel Figür Seti',
    'Buz Devri Sid İkonik Sahne',
  ],
  'arac-gerecler': [
    'Baby Yoda Telefon Tutacağı',
    'Playstation Controller Standı',
    'Playstation Controller Standı 2 Adet',
    'Sauron Figürlü Kulaklık Tutacağı',
    'Kuru Kafa Gözlük Standı ve Eşya Kasesi',
    'Takı Organizer',
  ],
}

async function run() {
  // 1. Kategorileri ekle
  console.log('📂 Kategoriler ekleniyor...')
  const { data: cats, error: catErr } = await supabase
    .from('categories')
    .insert([
      { slug: 'kisiye-ozel',   name_tr: 'Kişiye Özel Karakterler', name_en: 'Custom Characters',  sort_order: 1 },
      { slug: 'dizi-film',     name_tr: 'Dizi Film Figürleri',     name_en: 'TV & Movie Figures', sort_order: 2 },
      { slug: 'arac-gerecler', name_tr: 'Araç Gereçler',           name_en: 'Accessories',         sort_order: 3 },
    ])
    .select()

  if (catErr) { console.error('❌ Kategori hatası:', catErr.message); process.exit(1) }
  console.log('✅ 3 kategori eklendi')

  const catMap = Object.fromEntries(cats.map(c => [c.slug, c.id]))

  // 2. Ürünleri çek
  const { data: products } = await supabase.from('products').select('id, name_tr')

  // 3. Her ürüne kategori ata
  let updated = 0
  for (const [slug, names] of Object.entries(assignments)) {
    const categoryId = catMap[slug]
    for (const name of names) {
      const product = products.find(p => p.name_tr.trim() === name.trim())
      if (!product) { console.warn(`⚠️  Bulunamadı: ${name}`); continue }
      await supabase.from('products').update({ category_id: categoryId }).eq('id', product.id)
      console.log(`  ✅ ${product.name_tr} → ${slug}`)
      updated++
    }
  }

  console.log(`\n🎉 Tamamlandı! ${updated} ürün kategoriye atandı.`)
}

run()
