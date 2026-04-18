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

type ProductWithImages = Product & { product_images: ProductImage[] }

export default function FavoritesPage() {
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
    <div className="mx-auto max-w-7xl px-4 py-20 text-center text-zinc-400 text-sm">
      Yükleniyor...
    </div>
  )

  return (
    <div>
      <div className="bg-white border-b border-zinc-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
              <Heart className="h-5 w-5 text-red-500 fill-red-500" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-zinc-900">Favorilerim</h1>
              <p className="text-zinc-500 text-sm mt-0.5">{products.length} ürün</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        {products.length === 0 ? (
          <div className="text-center py-24">
            <div className="w-24 h-24 rounded-3xl bg-zinc-50 flex items-center justify-center mx-auto mb-4">
              <Heart className="h-10 w-10 text-zinc-200" />
            </div>
            <h3 className="font-bold text-zinc-900 mb-1 text-lg">Henüz favori yok</h3>
            <p className="text-sm text-zinc-400 mb-6">Ürünlerde kalp ikonuna tıklayarak favorilere ekleyebilirsin.</p>
            <Link href={`/${locale}/products`}>
              <Button className="bg-orange-500 hover:bg-orange-600 rounded-xl gap-2">
                Ürünlere Git <ArrowRight className="h-4 w-4" />
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
