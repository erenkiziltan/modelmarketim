'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Heart, Package } from 'lucide-react'
import { Product, ProductImage, Locale } from '@/types'
import { formatPrice, getLocalizedField } from '@/lib/utils'
import { useFavorites } from './FavoritesProvider'
import { toast } from 'sonner'
import { useTranslations } from 'next-intl'

type ProductWithImages = Product & { product_images: ProductImage[] }

function isNew(createdAt: string): boolean {
  return Date.now() - new Date(createdAt).getTime() < 7 * 24 * 60 * 60 * 1000
}

export default function ProductCard({ product, locale }: { product: ProductWithImages; locale: Locale }) {
  const t = useTranslations('products')
  const { toggleFavorite, isFavorite } = useFavorites()

  const cover = product.product_images?.find(i => i.is_cover) ?? product.product_images?.[0]
  const name = getLocalizedField(product as unknown as Record<string, unknown>, 'name', locale)
  const favorited = isFavorite(product.id)
  const newProduct = isNew(product.created_at)
  const lowStock = product.stock > 0 && product.stock <= 3

  function handleQuickAdd(e: React.MouseEvent) {
    e.preventDefault()
    if (!product.stock) return
    window.open('https://link.dolap.com/7lp4ce', '_blank')
  }

  function handleFavorite(e: React.MouseEvent) {
    e.preventDefault()
    toggleFavorite(product.id)
    toast(favorited ? t('toast_unfavorited') : t('toast_favorited'), {
      icon: favorited ? '🤍' : '❤️',
    })
  }

  return (
    <Link href={`/${locale}/products/${product.slug}`} className="group block">
      <div className="bg-white rounded-2xl border border-slate-100 hover:border-[#D9E2EC] overflow-hidden shadow-sm hover:shadow-xl hover:shadow-slate-200 transition-all duration-300 hover:-translate-y-1">

        {/* Image */}
        <div className="relative aspect-square bg-slate-50 overflow-hidden">
          {cover ? (
            <Image
              src={cover.url}
              alt={name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <Package className="h-12 w-12 text-slate-200" />
            </div>
          )}

          {/* Out of stock overlay */}
          {product.stock === 0 && (
            <div className="absolute inset-0 bg-white/70 backdrop-blur-sm flex items-center justify-center">
              <span className="bg-slate-900 text-white text-xs font-semibold px-3 py-1.5 rounded-full">
                {t('out_of_stock_badge')}
              </span>
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5">
            {newProduct && (
              <span className="bg-[#102A43] text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {t('badge_new')}
              </span>
            )}
            {lowStock && (
              <span className="bg-amber-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {t('last_stock', { count: product.stock })}
              </span>
            )}
          </div>

          {/* Favorite button */}
          <button
            onClick={handleFavorite}
            className={`absolute top-2.5 right-2.5 w-7 h-7 rounded-full flex items-center justify-center shadow-sm transition-all
              ${favorited
                ? 'bg-[#102A43] text-white'
                : 'bg-white/90 text-slate-300 opacity-0 group-hover:opacity-100 hover:text-[#C7A06F]'
              }`}
          >
            <Heart className={`h-3.5 w-3.5 ${favorited ? 'fill-white' : ''}`} />
          </button>
        </div>

        {/* Info */}
        <div className="p-3.5">
          <h3 className="text-sm font-semibold text-slate-800 group-hover:text-[#C7A06F] transition-colors leading-snug line-clamp-2 mb-2.5">
            {name}
          </h3>
          <div className="flex items-center justify-between gap-2">
            <p className="text-base font-bold text-[#C7A06F]">{formatPrice(product.price)}</p>
            <button
              onClick={handleQuickAdd}
              disabled={product.stock === 0}
              className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg transition-all active:scale-[0.97] disabled:opacity-40 disabled:cursor-not-allowed bg-[#25D6A2] hover:bg-[#1fc090] text-white"
            >
              <img src="/dolap-logo.svg" alt="Dolap" className="h-3.5 w-3.5 brightness-0 invert" />
              Dolap&apos;tan Al
            </button>
          </div>
        </div>
      </div>
    </Link>
  )
}
