import { createClient } from '@/lib/supabase/server'
import { getTranslations } from 'next-intl/server'
import { Product, ProductImage, Locale } from '@/types'
import { Package } from 'lucide-react'
import ProductCard from '@/components/shop/ProductCard'
import ProductFilters from '@/components/shop/ProductFilters'
import type { Metadata } from 'next'

type ProductWithImages = Product & { product_images: ProductImage[] }

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const isTr = locale === 'tr'
  return {
    title: isTr ? 'Tüm Ürünler — 3D Baskı Figür & Model' : 'All Products — 3D Printed Figures',
    description: isTr
      ? '3D baskı figürler, modeller, araç gereçler ve koleksiyon ürünleri. Ejderha, karakter, araç figürleri ve daha fazlası. Hızlı kargo, güvenli ödeme.'
      : 'Browse all 3D printed figures, models and collectibles. Fast shipping across Turkey.',
    keywords: ['3d baskı figür', '3d model satın al', 'figür mağazası', 'koleksiyon figür', '3d yazıcı ürünleri', 'ejderha figür', 'karakter figür', '3d baskı türkiye'],
    alternates: {
      canonical: `https://modelmarketim.com/${locale}/products`,
      languages: {
        tr: 'https://modelmarketim.com/tr/products',
        en: 'https://modelmarketim.com/en/products',
      },
    },
  }
}

export default async function ProductsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ sort?: string; q?: string }>
}) {
  const { locale } = await params
  const { sort, q } = await searchParams
  const t = await getTranslations('products')
  const supabase = await createClient()

  let query = supabase.from('products').select('*, product_images(*)').eq('is_active', true)

  if (q) query = query.ilike('name_tr', `%${q}%`)
  if (sort === 'price_asc') query = query.order('price', { ascending: true })
  else if (sort === 'price_desc') query = query.order('price', { ascending: false })
  else query = query.order('created_at', { ascending: false })

  const { data } = await query
  const products = (data ?? []) as ProductWithImages[]

  return (
    <div>
      <div className="bg-white border-b border-slate-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-7">
          <p className="text-xs font-semibold uppercase tracking-widest text-indigo-500 mb-1">{t('collection')}</p>
          <h1 className="text-2xl font-bold text-slate-900">{t('title')}</h1>
          <p className="text-slate-500 text-sm mt-0.5">{t('product_count', { count: products.length })}</p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        <ProductFilters currentSort={sort} currentQ={q} />

        {products.length === 0 ? (
          <div className="text-center py-24">
            <div className="w-24 h-24 rounded-3xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
              <Package className="h-12 w-12 text-slate-200" />
            </div>
            <h3 className="font-bold text-slate-900 mb-1 text-lg">
              {q ? t('search_empty', { query: q }) : t('no_results')}
            </h3>
            <p className="text-sm text-slate-400">{t('no_products')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-6">
            {products.map(product => (
              <ProductCard key={product.id} product={product} locale={locale as Locale} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
