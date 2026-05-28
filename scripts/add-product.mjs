import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { extname } from 'path'

const SUPABASE_URL = 'https://tqobzccyxpodzbuxukpd.supabase.co'
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRxb2J6Y2N5eHBvZHpidXh1a3BkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjUxNDM1NiwiZXhwIjoyMDkyMDkwMzU2fQ.HokPt3Q8jodFC2_vmvzazB4D9hmYU62wwQVl_wY8yRA'

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)

const product = {
  slug: 'baby-yoda-telefon-tutacagi',
  name_tr: 'Baby Yoda Telefon Tutacağı',
  name_en: 'Baby Yoda Phone Holder',
  description_tr: 'Masanıza şık ve eğlenceli bir dokunuş katın! Baby Yoda figürlü bu telefon tutacağı, sevimli tasarımı ve sağlam yapısıyla telefonunuzu güvenle tutar. PLA+ filament ile üretilmiş, el boyaması detaylara sahip özel bir ürün. Çalışma masanızın, komodininizin ya da TV ünitenizin vazgeçilmezi olacak.',
  description_en: 'Add a fun and stylish touch to your desk! This Baby Yoda phone holder keeps your phone secure with its charming design and sturdy build. Crafted from PLA+ filament with hand-painted details, it\'s the perfect addition to your workspace, nightstand, or entertainment unit.',
  price: 349,
  stock: 5,
  is_active: true,
}

const imageFiles = [
  'C:\\Users\\ErenBusraPC\\Desktop\\yoda\\3c88ece8-232c-4c2c-8efc-5cff67665c98.jpg',
  'C:\\Users\\ErenBusraPC\\Desktop\\yoda\\6c2b8b31-3838-44bc-b62f-ae2d2f92a022.jpg',
  'C:\\Users\\ErenBusraPC\\Desktop\\yoda\\8758f1cc-75f8-4b34-a571-2649468a0fd3.jpg',
]

async function run() {
  console.log('🛍️  Ürün oluşturuluyor...')

  // 1. Ürünü ekle
  const { data: newProduct, error: productError } = await supabase
    .from('products')
    .insert(product)
    .select()
    .single()

  if (productError) {
    console.error('❌ Ürün eklenemedi:', productError.message)
    process.exit(1)
  }

  console.log('✅ Ürün oluşturuldu:', newProduct.id)

  // 2. Görselleri yükle
  const uploadedImages = []

  for (let i = 0; i < imageFiles.length; i++) {
    const filePath = imageFiles[i]
    const ext = extname(filePath).slice(1)
    const storagePath = `${Date.now()}-${i}.${ext}`

    console.log(`📸 Görsel ${i + 1} yükleniyor...`)

    const fileBuffer = readFileSync(filePath)

    const { error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(storagePath, fileBuffer, { contentType: `image/${ext}` })

    if (uploadError) {
      console.error(`❌ Görsel ${i + 1} yüklenemedi:`, uploadError.message)
      continue
    }

    const { data: { publicUrl } } = supabase.storage
      .from('product-images')
      .getPublicUrl(storagePath)

    uploadedImages.push({
      product_id: newProduct.id,
      url: publicUrl,
      sort_order: i,
      is_cover: i === 0,
    })

    console.log(`✅ Görsel ${i + 1} yüklendi`)
  }

  // 3. Görsel kayıtlarını DB'ye ekle
  if (uploadedImages.length > 0) {
    const { error: imgError } = await supabase
      .from('product_images')
      .insert(uploadedImages)

    if (imgError) {
      console.error('❌ Görseller DB\'ye eklenemedi:', imgError.message)
    } else {
      console.log(`✅ ${uploadedImages.length} görsel DB'ye kaydedildi`)
    }
  }

  console.log('\n🎉 Tamamlandı!')
  console.log(`🔗 https://modelmarketim.com/tr/products/${product.slug}`)
}

run()
