import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { Locale, Product, ProductImage, ProductVariant } from '@/types'
import ProductDetail from '@/components/shop/ProductDetail'
import RelatedProducts from '@/components/shop/RelatedProducts'

type FullProduct = Product & { product_images: ProductImage[]; product_variants: ProductVariant[] }

export default async function ProductPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}) {
  const { locale, slug } = await params
  const supabase = await createClient()

  const { data } = await supabase
    .from('products')
    .select('*, product_images(*), product_variants(*)')
    .eq('slug', slug)
    .eq('is_active', true)
    .single()

  if (!data) notFound()

  const product = data as FullProduct

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      <ProductDetail product={product} locale={locale as Locale} />
      <RelatedProducts currentSlug={slug} locale={locale as Locale} />
    </div>
  )
}
