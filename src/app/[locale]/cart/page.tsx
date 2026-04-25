'use client'

import { useTranslations } from 'next-intl'
import Link from 'next/link'
import Image from 'next/image'
import { useParams } from 'next/navigation'
import { useCart } from '@/components/shop/CartProvider'
import { formatPrice } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Trash2, ShoppingBag, Package } from 'lucide-react'

export default function CartPage() {
  const t = useTranslations('cart')
  const { locale } = useParams()
  const { items, total, removeItem, updateQuantity } = useCart()

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <ShoppingBag className="h-14 w-14 text-slate-300 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-slate-900 mb-2">{t('title')}</h1>
        <p className="text-slate-500 mb-6">{t('empty')}</p>
        <Link href={`/${locale}/products`}>
          <Button className="bg-indigo-600 hover:bg-indigo-700">{t('empty_cta')}</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-2xl font-bold text-slate-900 mb-8">{t('title')}</h1>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Items */}
        <div className="flex-1 flex flex-col gap-4">
          {items.map(item => {
            const cover = item.product.images?.find(i => i.is_cover) ?? item.product.images?.[0]
            const variantLabel = Object.entries(item.selectedVariants).map(([k, v]) => `${k}: ${v}`).join(', ')
            return (
              <div key={`${item.product.id}-${JSON.stringify(item.selectedVariants)}`} className="flex gap-4 bg-white rounded-xl border border-slate-100 p-4">
                <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0">
                  {cover ? (
                    <Image src={cover.url} alt={item.product.name_tr} fill className="object-cover" />
                  ) : (
                    <div className="flex items-center justify-center h-full text-slate-300">
                      <Package className="h-8 w-8" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-slate-900 truncate">{item.product.name_tr}</h3>
                  {variantLabel && <p className="text-xs text-slate-500 mt-0.5">{variantLabel}</p>}
                  <p className="text-indigo-600 font-bold mt-1">{formatPrice(item.product.price)}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <button
                      onClick={() => updateQuantity(item.product.id, item.selectedVariants, item.quantity - 1)}
                      className="w-7 h-7 rounded border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-100"
                    >−</button>
                    <span className="text-sm font-semibold w-5 text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.product.id, item.selectedVariants, item.quantity + 1)}
                      className="w-7 h-7 rounded border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-100"
                    >+</button>
                  </div>
                </div>
                <div className="flex flex-col items-end justify-between">
                  <button
                    onClick={() => removeItem(item.product.id, item.selectedVariants)}
                    className="text-slate-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                  <p className="font-bold text-slate-900 text-sm">{formatPrice(item.product.price * item.quantity)}</p>
                </div>
              </div>
            )
          })}
        </div>

        {/* Summary */}
        <div className="lg:w-72">
          <div className="bg-white rounded-xl border border-slate-100 p-6 sticky top-24">
            <h2 className="font-bold text-slate-900 mb-4">{t('order_summary')}</h2>
            <div className="flex justify-between text-sm text-slate-600 mb-2">
              <span>{t('subtotal')}</span>
              <span>{formatPrice(total)}</span>
            </div>
            <div className="flex justify-between text-sm text-slate-600 mb-4">
              <span>{t('shipping')}</span>
              <span className="text-green-600">{t('free')}</span>
            </div>
            <div className="flex justify-between font-bold text-slate-900 text-lg border-t border-slate-100 pt-4 mb-6">
              <span>{t('total')}</span>
              <span>{formatPrice(total)}</span>
            </div>
            <Link href={`/${locale}/checkout`}>
              <Button className="w-full bg-indigo-600 hover:bg-indigo-700">{t('checkout')}</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
