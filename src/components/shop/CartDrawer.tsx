'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useCart } from './CartProvider'
import { formatPrice } from '@/lib/utils'
import { X, ShoppingCart, Trash2, Package, ArrowRight } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Locale } from '@/types'

export default function CartDrawer({ locale }: { locale: Locale }) {
  const { items, total, itemCount, isDrawerOpen, closeDrawer, removeItem, updateQuantity } = useCart()

  return (
    <AnimatePresence>
      {isDrawerOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
            onClick={closeDrawer}
          />

          {/* Drawer */}
          <motion.div
            key="drawer"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-white z-50 shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100">
              <div className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5 text-zinc-700" />
                <h2 className="text-lg font-bold text-zinc-900" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                  Sepetim
                </h2>
                {itemCount > 0 && (
                  <span className="bg-orange-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                    {itemCount}
                  </span>
                )}
              </div>
              <button
                onClick={closeDrawer}
                className="w-9 h-9 rounded-xl flex items-center justify-center text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-all"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-16">
                  <div className="w-24 h-24 rounded-3xl bg-zinc-50 flex items-center justify-center mb-4">
                    <ShoppingCart className="h-10 w-10 text-zinc-200" />
                  </div>
                  <h3 className="font-bold text-zinc-900 mb-1">Sepetiniz boş</h3>
                  <p className="text-sm text-zinc-400 mb-6">Ürün ekleyerek alışverişe başlayın.</p>
                  <Link href={`/${locale}/products`} onClick={closeDrawer}>
                    <Button className="bg-orange-500 hover:bg-orange-600 rounded-xl gap-2">
                      Ürünlere Git <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  <AnimatePresence initial={false}>
                    {items.map(item => {
                      const cover = item.product.images?.find(i => i.is_cover) ?? item.product.images?.[0]
                      const variantLabel = Object.entries(item.selectedVariants)
                        .map(([k, v]) => `${k}: ${v}`).join(', ')
                      const key = `${item.product.id}-${JSON.stringify(item.selectedVariants)}`

                      return (
                        <motion.div
                          key={key}
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2 }}
                          className="flex gap-3 bg-zinc-50 rounded-2xl p-3"
                        >
                          {/* Image */}
                          <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-zinc-100 flex-shrink-0">
                            {cover ? (
                              <Image src={cover.url} alt={item.product.name_tr} fill className="object-cover" />
                            ) : (
                              <div className="flex items-center justify-center h-full">
                                <Package className="h-6 w-6 text-zinc-300" />
                              </div>
                            )}
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-zinc-900 text-sm truncate">{item.product.name_tr}</p>
                            {variantLabel && <p className="text-xs text-zinc-400 mt-0.5">{variantLabel}</p>}
                            <p className="text-orange-500 font-bold text-sm mt-1">{formatPrice(item.product.price)}</p>

                            {/* Quantity controls */}
                            <div className="flex items-center gap-2 mt-2">
                              <div className="inline-flex items-center border border-zinc-200 rounded-lg overflow-hidden">
                                <button
                                  onClick={() => updateQuantity(item.product.id, item.selectedVariants, item.quantity - 1)}
                                  className="w-7 h-7 flex items-center justify-center text-zinc-600 hover:bg-zinc-100 text-sm transition-colors"
                                >−</button>
                                <span className="w-7 text-center text-xs font-bold text-zinc-900">{item.quantity}</span>
                                <button
                                  onClick={() => updateQuantity(item.product.id, item.selectedVariants, item.quantity + 1)}
                                  className="w-7 h-7 flex items-center justify-center text-zinc-600 hover:bg-zinc-100 text-sm transition-colors"
                                >+</button>
                              </div>
                            </div>
                          </div>

                          {/* Remove & subtotal */}
                          <div className="flex flex-col items-end justify-between">
                            <button
                              onClick={() => removeItem(item.product.id, item.selectedVariants)}
                              className="text-zinc-300 hover:text-red-400 transition-colors"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                            <p className="text-xs font-bold text-zinc-700">
                              {formatPrice(item.product.price * item.quantity)}
                            </p>
                          </div>
                        </motion.div>
                      )
                    })}
                  </AnimatePresence>
                </div>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="px-6 py-4 border-t border-zinc-100 bg-white">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-sm text-zinc-500">Toplam</span>
                  <span className="text-2xl font-bold text-zinc-900" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                    {formatPrice(total)}
                  </span>
                </div>
                <Link href={`/${locale}/checkout`} onClick={closeDrawer}>
                  <Button className="w-full bg-orange-500 hover:bg-orange-600 h-12 rounded-xl text-base font-semibold shadow-lg shadow-orange-200 gap-2">
                    Siparişi Tamamla <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <button
                  onClick={closeDrawer}
                  className="w-full text-center text-sm text-zinc-400 hover:text-zinc-600 mt-3 transition-colors"
                >
                  Alışverişe devam et
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
