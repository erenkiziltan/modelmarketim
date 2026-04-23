import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { Locale, Product, ProductImage, ProductVariant } from '@/types'
import ProductDetail from '@/components/shop/ProductDetail'
import RelatedProducts from '@/components/shop/RelatedProducts'
import type { Metadata } from 'next'

type FullProduct = Product & { product_images: ProductImage[]; product_variants: ProductVariant[] }

type Props = {
  params: Promise<{ locale: string; slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params
  const supabase = await createClient()

  const { data } = await supabase
    .from('products')
    .select('*, product_images(*)')
    .eq('slug', slug)
    .eq('is_active', true)
    .single()

  if (!data) return {}

  const name = locale === 'tr' ? data.name_tr : (data.name_en ?? data.name_tr)
  const description = locale === 'tr' ? data.description_tr : (data.description_en ?? data.description_tr)
  const coverImage = data.product_images?.find((i: ProductImage) => i.is_cover) ?? data.product_images?.[0]
  const price = new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(data.price)

  const title = `${name} — ${price}`
  const desc = description
    ? description.slice(0, 155)
    : `${name} — Modelmarketim'de satışta. 3D baskı figür, özel tasarım, hızlı kargo.`

  return {
    title,
    description: desc,
    keywords: [
      name,
      '3d baskı figür',
      '3d model',
      'figür satın al',
      '3d yazıcı figür',
      'özel 3d baskı',
      'modelmarketim',
    ],
    openGraph: {
      title,
      description: desc,
      type: 'website',
      url: `https://modelmarketim.com/${locale}/products/${slug}`,
      images: coverImage ? [{ url: coverImage.url, width: 800, height: 800, alt: name }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: desc,
      images: coverImage ? [coverImage.url] : [],
    },
    alternates: {
      canonical: `https://modelmarketim.com/tr/products/${slug}`,
      languages: {
        tr: `https://modelmarketim.com/tr/products/${slug}`,
        en: `https://modelmarketim.com/en/products/${slug}`,
      },
    },
  }
}

export default async function ProductPage({ params }: Props) {
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
  const coverImage = product.product_images?.find(i => i.is_cover) ?? product.product_images?.[0]
  const price = product.price

  // JSON-LD Structured Data — Google Shopping & Rich Results
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: locale === 'tr' ? product.name_tr : (product.name_en ?? product.name_tr),
    description: locale === 'tr'
      ? product.description_tr
      : (product.description_en ?? product.description_tr),
    image: coverImage ? [coverImage.url] : [],
    sku: product.id,
    brand: {
      '@type': 'Brand',
      name: 'Modelmarketim',
    },
    offers: {
      '@type': 'Offer',
      url: `https://modelmarketim.com/${locale}/products/${slug}`,
      priceCurrency: 'TRY',
      price: price,
      availability: product.stock > 0
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      seller: {
        '@type': 'Organization',
        name: 'Modelmarketim',
      },
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <ProductDetail product={product} locale={locale as Locale} />
        <RelatedProducts currentSlug={slug} locale={locale as Locale} />
      </div>
    </>
  )
}
