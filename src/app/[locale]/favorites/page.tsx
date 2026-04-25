'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useFavorites } from '@/components/shop/FavoritesProvider'
import ProductCard from '@/components/shop/ProductCard'
import { Heart, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { Locale, Product, ProductImage } from '@/types'
import { useTranslations } from 'next-intl'

type ProductWithImages = Product & { product_images: ProductImage[] }

export default function FavoritesPage() {
  const t = useTranslations('favorites')
  const { favorites } = useFavorites()
  const { locale } = useParams()
  const [products, setProducts] = useState<ProductWithImages[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchFavorites() {
      if (!favorites.length) { setProducts([]); setLoading(false); return }
      const supabase = createClient()
      const { data } = await supabase
        .from('products')
        .select('*, product_images(*)')
        .in('id', favorites)
        .eq('is_active', true)
      setProducts((data ?? []) as ProductWithImages[])
      setLoading(false)
    }
    fetchFavorites()
  }, [favorites])

  if (loading) return (
    <div className="mx-auto max-w-7xl px-4 py-20 text-center text-slate-400 text-sm">
      {t('loading')}
    </div>
  )

  return (
    <div>
      <div className="bg-white border-b border-slate-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-7">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center">
              <Heart className="h-4 w-4 text-indigo-600 fill-indigo-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">{t('title')}</h1>
              <p className="text-slate-500 text-sm mt-0.5">{t('count', { count: products.length })}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        {products.length === 0 ? (
          <div className="text-center py-24">
            <div className="w-24 h-24 rounded-3xl bg-slate-50 flex items-center justify-center mx-auto mb-4">
              <Heart className="h-10 w-10 text-slate-200" />
            </div>
            <h3 className="font-bold text-slate-900 mb-1 text-lg">{t('empty_title')}</h3>
            <p className="text-sm text-slate-400 mb-6">{t('empty_desc')}</p>
            <Link href={`/${locale}/products`}>
              <Button className="bg-indigo-600 hover:bg-indigo-700 rounded-xl gap-2">
                {t('go_to_products')} <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map(product => (
              <ProductCard key={product.id} product={product} locale={locale as Locale} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
