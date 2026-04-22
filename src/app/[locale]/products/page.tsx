import { createClient } from '@/lib/supabase/server'
import { getTranslations } from 'next-intl/server'
import { Product, ProductImage, Locale } from '@/types'
import { Package } from 'lucide-react'
import ProductCard from '@/components/shop/ProductCard'
import ProductFilters from '@/components/shop/ProductFilters'

type ProductWithImages = Product & { product_images: ProductImage[] }

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

  let query = supabase
    .from('products')
    .select('*, product_images(*)')
    .eq('is_active', true)

  if (q) query = query.ilike('name_tr', `%${q}%`)

  if (sort === 'price_asc') query = query.order('price', { ascending: true })
  else if (sort === 'price_desc') query = query.order('price', { ascending: false })
  else query = query.order('created_at', { ascending: false })

  const { data } = await query
  const products = (data ?? []) as ProductWithImages[]

  return (
    <div>
      {/* Page header */}
      <div className="bg-white border-b border-zinc-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
          <p className="text-xs font-semibold uppercase tracking-widest text-indigo-500 mb-1">Koleksiyon</p>
          <h1 className="text-3xl font-bold text-slate-900">{t('title')}</h1>
          <p className="text-zinc-500 text-sm mt-1">{products.length} ürün</p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <ProductFilters currentSort={sort} currentQ={q} />

        {products.length === 0 ? (
          <div className="text-center py-24">
            <div className="w-24 h-24 rounded-3xl bg-zinc-100 flex items-center justify-center mx-auto mb-4">
              <Package className="h-12 w-12 text-zinc-200" />
            </div>
            <h3 className="font-bold text-zinc-900 mb-1 text-lg">
              {q ? `"${q}" için sonuç bulunamadı` : 'Ürün bulunamadı'}
            </h3>
            <p className="text-sm text-zinc-400">
              {q ? 'Farklı bir arama terimi deneyin.' : t('no_products')}
            </p>
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
