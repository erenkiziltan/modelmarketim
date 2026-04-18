'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Heart, Package, ShoppingCart } from 'lucide-react'
import { Product, ProductImage, Locale } from '@/types'
import { formatPrice, getLocalizedField } from '@/lib/utils'
import { useCart } from './CartProvider'
import { useFavorites } from './FavoritesProvider'
import { toast } from 'sonner'

type ProductWithImages = Product & { product_images: ProductImage[] }

function isNew(createdAt: string): boolean {
  const diff = Date.now() - new Date(createdAt).getTime()
  return diff < 7 * 24 * 60 * 60 * 1000
}

export default function ProductCard({ product, locale }: { product: ProductWithImages; locale: Locale }) {
  const { addItem, openDrawer } = useCart()
  const { toggleFavorite, isFavorite } = useFavorites()

  const cover = product.product_images?.find(i => i.is_cover) ?? product.product_images?.[0]
  const name = getLocalizedField(product as unknown as Record<string, unknown>, 'name', locale)
  const favorited = isFavorite(product.id)
  const newProduct = isNew(product.created_at)
  const lowStock = product.stock > 0 && product.stock <= 3

  function handleQuickAdd(e: React.MouseEvent) {
    e.preventDefault()
    if (!product.stock) return
    addItem(product, 1, {})
    toast.success(`${name} sepete eklendi.`)
  }

  function handleFavorite(e: React.MouseEvent) {
    e.preventDefault()
    toggleFavorite(product.id)
    toast(favorited ? 'Favorilerden çıkarıldı' : 'Favorilere eklendi', {
      icon: favorited ? '🤍' : '❤️',
    })
  }

  return (
    <Link href={`/${locale}/products/${product.slug}`} className="group block">
      <motion.div
        whileHover={{ y: -4 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        className="bg-white rounded-2xl border border-zinc-100 overflow-hidden shadow-sm hover:shadow-xl hover:shadow-zinc-200/60 transition-shadow duration-300"
      >
        {/* Image */}
        <div className="relative aspect-square bg-zinc-50 overflow-hidden">
          {cover ? (
            <Image
              src={cover.url}
              alt={name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <Package className="h-14 w-14 text-zinc-200" />
            </div>
          )}

          {/* Out of stock overlay */}
          {product.stock === 0 && (
            <div className="absolute inset-0 bg-white/70 backdrop-blur-sm flex items-center justify-center">
              <span className="bg-zinc-900 text-white text-xs font-semibold px-3 py-1.5 rounded-full">
                Stok Yok
              </span>
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {newProduct && (
              <span className="bg-orange-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-sm">
                Yeni
              </span>
            )}
            {lowStock && (
              <motion.span
                animate={{ opacity: [1, 0.5, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-sm"
              >
                Son {product.stock}!
              </motion.span>
            )}
          </div>

          {/* Favorite button */}
          <button
            onClick={handleFavorite}
            className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center shadow-sm transition-all
              ${favorited
                ? 'bg-red-500 text-white scale-110'
                : 'bg-white/80 text-zinc-400 opacity-0 group-hover:opacity-100 hover:text-red-400'
              }`}
          >
            <Heart className={`h-4 w-4 ${favorited ? 'fill-white' : ''}`} />
          </button>

          {/* Quick add button */}
          {product.stock > 0 && (
            <button
              onClick={handleQuickAdd}
              className="absolute bottom-3 left-3 right-3 bg-zinc-900/90 backdrop-blur-sm text-white text-xs font-semibold py-2.5 rounded-xl
                opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0
                transition-all duration-200 flex items-center justify-center gap-1.5"
            >
              <ShoppingCart className="h-3.5 w-3.5" />
              Sepete Ekle
            </button>
          )}
        </div>

        {/* Info */}
        <div className="p-4">
          <h3 className="font-semibold text-zinc-900 group-hover:text-orange-600 transition-colors leading-snug line-clamp-2 mb-2">
            {name}
          </h3>
          <div className="flex items-center justify-between">
            <p className="text-xl font-bold text-orange-500">{formatPrice(product.price)}</p>
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
              product.stock > 0 ? 'bg-green-50 text-green-600' : 'bg-zinc-100 text-zinc-400'
            }`}>
              {product.stock > 0 ? 'Stokta' : 'Tükendi'}
            </span>
          </div>
        </div>
      </motion.div>
    </Link>
  )
}
