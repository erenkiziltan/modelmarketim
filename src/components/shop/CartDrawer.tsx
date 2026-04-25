'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useCart } from './CartProvider'
import { formatPrice } from '@/lib/utils'
import { X, ShoppingCart, Trash2, Package, ArrowRight } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Locale } from '@/types'
import { useTranslations } from 'next-intl'

export default function CartDrawer({ locale }: { locale: Locale }) {
  const t = useTranslations('cart')
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
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40"
            onClick={closeDrawer}
          />

          {/* Drawer */}
          <motion.div
            key="drawer"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-white z-50 shadow-2xl shadow-indigo-100/20 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5 text-indigo-600" />
                <h2 className="text-lg font-bold text-slate-900" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                  {t('title')}
                </h2>
                {itemCount > 0 && (
                  <span className="bg-indigo-600 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                    {itemCount}
                  </span>
                )}
              </div>
              <button
                onClick={closeDrawer}
                className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-16">
                  <div className="w-24 h-24 rounded-3xl bg-indigo-50 flex items-center justify-center mb-4">
                    <ShoppingCart className="h-10 w-10 text-indigo-200" />
                  </div>
                  <h3 className="font-bold text-slate-900 mb-1">{t('drawer_empty_title')}</h3>
                  <p className="text-sm text-slate-400 mb-6">{t('drawer_empty_desc')}</p>
                  <Link href={`/${locale}/products`} onClick={closeDrawer}>
                    <Button className="bg-indigo-600 hover:bg-indigo-700 rounded-xl gap-2">
                      {t('go_to_products')} <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  <AnimatePresence initial={false}>
                    {items.map(item => {
                      const cover = item.product.images?.find((i: { is_cover: boolean }) => i.is_cover) ?? item.product.images?.[0]
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
                          className="flex gap-3 bg-slate-50 rounded-2xl p-3"
                        >
                          {/* Image */}
                          <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0">
                            {cover ? (
                              <Image src={cover.url} alt={item.product.name_tr} fill className="object-cover" />
                            ) : (
                              <div className="flex items-center justify-center h-full">
                                <Package className="h-6 w-6 text-slate-300" />
                              </div>
                            )}
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-slate-900 text-sm truncate">{item.product.name_tr}</p>
                            {variantLabel && <p className="text-xs text-slate-400 mt-0.5">{variantLabel}</p>}
                            <p className="text-indigo-600 font-bold text-sm mt-1">{formatPrice(item.product.price)}</p>

                            {/* Quantity controls */}
                            <div className="flex items-center gap-2 mt-2">
                              <div className="inline-flex items-center border border-slate-200 rounded-lg overflow-hidden">
                                <button
                                  onClick={() => updateQuantity(item.product.id, item.selectedVariants, item.quantity - 1)}
                                  className="w-7 h-7 flex items-center justify-center text-slate-600 hover:bg-slate-100 text-sm transition-colors"
                                >−</button>
                                <span className="w-7 text-center text-xs font-bold text-slate-900">{item.quantity}</span>
                                <button
                                  onClick={() => updateQuantity(item.product.id, item.selectedVariants, item.quantity + 1)}
                                  className="w-7 h-7 flex items-center justify-center text-slate-600 hover:bg-slate-100 text-sm transition-colors"
                                >+</button>
                              </div>
                            </div>
                          </div>

                          {/* Remove & subtotal */}
                          <div className="flex flex-col items-end justify-between">
                            <button
                              onClick={() => removeItem(item.product.id, item.selectedVariants)}
                              className="text-slate-300 hover:text-red-400 transition-colors"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                            <p className="text-xs font-bold text-slate-700">
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
              <div className="px-6 py-4 border-t border-slate-100 bg-white">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-sm text-slate-500">{t('total')}</span>
                  <span className="text-2xl font-bold text-slate-900" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                    {formatPrice(total)}
                  </span>
                </div>
                <Link href={`/${locale}/checkout`} onClick={closeDrawer}>
                  <Button className="w-full bg-indigo-600 hover:bg-indigo-700 h-12 rounded-xl text-base font-semibold shadow-lg shadow-indigo-100 gap-2">
                    {t('complete_order')} <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <button
                  onClick={closeDrawer}
                  className="w-full text-center text-sm text-slate-400 hover:text-slate-600 mt-3 transition-colors"
                >
                  {t('continue_shopping')}
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
