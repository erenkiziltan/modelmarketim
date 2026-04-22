'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { Product, ProductImage, ProductVariant, Locale } from '@/types'
import { formatPrice, getLocalizedField } from '@/lib/utils'
import { useCart } from './CartProvider'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { ShoppingCart, Package, ChevronLeft, Shield, RotateCcw, Truck } from 'lucide-react'
import Link from 'next/link'

type FullProduct = Product & { product_images: ProductImage[]; product_variants: ProductVariant[] }

export default function ProductDetail({ product, locale }: { product: FullProduct; locale: Locale }) {
  const t = useTranslations('products')
  const { addItem } = useCart()
  const [selectedImage, setSelectedImage] = useState(
    product.product_images?.find(i => i.is_cover) ?? product.product_images?.[0]
  )
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({})
  const [quantity, setQuantity] = useState(1)
  const [added, setAdded] = useState(false)

  const name = getLocalizedField(product as unknown as Record<string, unknown>, 'name', locale)
  const description = getLocalizedField(product as unknown as Record<string, unknown>, 'description', locale)
  const inStock = product.stock > 0

  function handleAddToCart() {
    if (!inStock) return
    for (const v of product.product_variants ?? []) {
      const varName = getLocalizedField(v as unknown as Record<string, unknown>, 'name', locale)
      if (!selectedVariants[varName]) {
        toast.error(`Lütfen ${varName} seçin.`)
        return
      }
    }
    addItem(product, quantity, selectedVariants)
    toast.success(`${name} sepete eklendi.`)
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  return (
    <div>
      {/* Breadcrumb */}
      <Link
        href={`/${locale}/products`}
        className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-indigo-600 mb-8 transition-colors group"
      >
        <ChevronLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
        Ürünlere Dön
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">

        {/* Images */}
        <div className="flex flex-col gap-3">
          <div className="relative aspect-square rounded-2xl overflow-hidden bg-slate-50 border border-slate-100">
            {selectedImage ? (
              <Image
                src={selectedImage.url}
                alt={name}
                fill
                className="object-cover"
                priority
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <Package className="h-24 w-24 text-zinc-200" />
              </div>
            )}
            {!inStock && (
              <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center">
                <span className="bg-zinc-900 text-white text-sm font-semibold px-4 py-2 rounded-full">
                  {t('out_of_stock')}
                </span>
              </div>
            )}
          </div>

          {product.product_images?.length > 1 && (
            <div className="flex gap-2 flex-wrap">
              {product.product_images.map(img => (
                <button
                  key={img.id}
                  onClick={() => setSelectedImage(img)}
                  className={`relative w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${
                    selectedImage?.id === img.id
                      ? 'border-indigo-500 shadow-sm shadow-indigo-100'
                      : 'border-slate-100 hover:border-slate-300'
                  }`}
                >
                  <Image src={img.url} alt="" fill className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col gap-6">
          {/* Name & Price */}
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-3 leading-tight">{name}</h1>
            <div className="flex items-baseline gap-3">
              <span className="text-4xl font-bold text-indigo-600">{formatPrice(product.price)}</span>
            </div>
          </div>

          {/* Stock badge */}
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${inStock ? 'bg-green-500' : 'bg-zinc-300'}`} />
            <span className={`text-sm font-medium ${inStock ? 'text-green-600' : 'text-zinc-400'}`}>
              {inStock ? t('in_stock') : t('out_of_stock')}
            </span>
            {inStock && product.stock <= 5 && (
              <span className="text-xs bg-amber-50 text-amber-600 font-semibold px-2 py-0.5 rounded-full border border-amber-100">
                Son {product.stock} adet
              </span>
            )}
          </div>

          {/* Variants */}
          {product.product_variants?.map(variant => {
            const varName = getLocalizedField(variant as unknown as Record<string, unknown>, 'name', locale)
            return (
              <div key={variant.id}>
                <p className="text-sm font-semibold text-slate-700 mb-3">
                  {varName}
                  {selectedVariants[varName] && (
                    <span className="font-normal text-zinc-400 ml-2">— {selectedVariants[varName]}</span>
                  )}
                </p>
                <div className="flex flex-wrap gap-2">
                  {variant.options.map(opt => (
                    <button
                      key={opt}
                      onClick={() => setSelectedVariants(prev => ({ ...prev, [varName]: opt }))}
                      className={`px-4 py-2 rounded-xl border text-sm font-medium transition-all ${
                        selectedVariants[varName] === opt
                          ? 'border-indigo-500 bg-indigo-50 text-indigo-700 shadow-sm'
                          : 'border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            )
          })}

          {/* Quantity */}
          <div>
            <p className="text-sm font-semibold text-slate-700 mb-3">{t('quantity')}</p>
            <div className="inline-flex items-center gap-0 border border-zinc-200 rounded-xl overflow-hidden">
              <button
                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                className="w-11 h-11 flex items-center justify-center text-lg text-zinc-700 hover:bg-zinc-50 transition-colors"
              >
                −
              </button>
              <span className="w-12 text-center text-sm font-bold text-zinc-900">{quantity}</span>
              <button
                onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
                disabled={!inStock}
                className="w-11 h-11 flex items-center justify-center text-lg text-zinc-700 hover:bg-zinc-50 transition-colors disabled:opacity-40"
              >
                +
              </button>
            </div>
          </div>

          {/* Add to cart */}
          <Button
            size="lg"
            onClick={handleAddToCart}
            disabled={!inStock}
            className={`gap-2 h-13 text-base rounded-xl transition-all w-full sm:w-auto shadow-lg ${
              added
                ? 'bg-green-500 hover:bg-green-500 shadow-green-200'
                : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200 hover:shadow-indigo-300 hover:-translate-y-0.5'
            }`}
          >
            <ShoppingCart className="h-5 w-5" />
            {added ? 'Sepete Eklendi ✓' : inStock ? t('add_to_cart') : t('out_of_stock')}
          </Button>

          {/* Trust badges */}
          <div className="grid grid-cols-3 gap-3 pt-2">
            {[
              { icon: Shield, text: 'Güvenli Alışveriş' },
              { icon: Truck, text: 'Hızlı Kargo' },
              { icon: RotateCcw, text: 'Kolay İade' },
            ].map(b => (
              <div key={b.text} className="flex flex-col items-center gap-1.5 p-3 bg-slate-50 rounded-xl">
                <b.icon className="h-4 w-4 text-zinc-400" />
                <span className="text-xs text-zinc-500 text-center leading-tight">{b.text}</span>
              </div>
            ))}
          </div>

          {/* Description */}
          {description && (
            <div className="border-t border-slate-100 pt-6">
              <h2 className="font-semibold text-slate-900 mb-3">{t('description')}</h2>
              <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap">{description}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
