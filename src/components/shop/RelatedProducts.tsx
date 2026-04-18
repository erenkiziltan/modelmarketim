import { createClient } from '@/lib/supabase/server'
import { Locale, Product, ProductImage } from '@/types'
import ProductCard from './ProductCard'

type ProductWithImages = Product & { product_images: ProductImage[] }

export default async function RelatedProducts({
  currentSlug,
  locale,
}: {
  currentSlug: string
  locale: Locale
}) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('products')
    .select('*, product_images(*)')
    .eq('is_active', true)
    .neq('slug', currentSlug)
    .order('created_at', { ascending: false })
    .limit(4)

  const products = (data ?? []) as ProductWithImages[]
  if (!products.length) return null

  return (
    <div className="mt-20 border-t border-zinc-100 pt-16">
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-orange-500 mb-1">Keşfet</p>
        <h2 className="text-2xl font-bold text-zinc-900">Diğer Ürünler</h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {products.map(product => (
          <ProductCard key={product.id} product={product} locale={locale} />
        ))}
      </div>
    </div>
  )
}
