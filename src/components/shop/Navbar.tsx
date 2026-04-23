'use client'

import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { ShoppingCart, Menu, X, Heart } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useCart } from '@/components/shop/CartProvider'
import { Locale } from '@/types'
import { cn } from '@/lib/utils'
import { useFavorites } from '@/components/shop/FavoritesProvider'
import { usePathname } from '@/i18n/navigation'

export default function Navbar({ locale }: { locale: Locale }) {
  const t = useTranslations('nav')
  const { itemCount, openDrawer } = useCart()
  const { favorites } = useFavorites()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  // usePathname from next-intl/navigation — locale prefix YOK: "/" veya "/products"
  const pathname = usePathname()
  const otherLocale: Locale = locale === 'tr' ? 'en' : 'tr'
  // Tam URL'i kendimiz oluşturuyoruz: /en/products
  const otherLocalePath = `/${otherLocale}${pathname === '/' ? '' : pathname}`

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

  return (
    <header className={cn(
      'sticky top-0 z-50 w-full transition-all duration-300',
      scrolled
        ? 'bg-white/95 backdrop-blur-md shadow-sm shadow-indigo-100/50 border-b border-indigo-50'
        : 'bg-white border-b border-slate-100'
    )}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">

          {/* Logo */}
          <Link href={`/${locale}`} className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shadow-sm shadow-indigo-200 group-hover:bg-indigo-700 transition-colors">
              <span className="text-white font-bold text-sm">M</span>
            </div>
            <span className="text-lg font-bold text-slate-900" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
              Model<span className="text-indigo-600">marketim</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            <Link
              href={`/${locale}`}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-indigo-50 rounded-lg transition-all"
            >
              {t('home')}
            </Link>
            <Link
              href={`/${locale}/products`}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-indigo-50 rounded-lg transition-all"
            >
              {t('products')}
            </Link>
            <Link
              href={`/${locale}/track`}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-indigo-50 rounded-lg transition-all"
            >
              {t('track')}
            </Link>
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-1">
            {/* Language toggle — mevcut sayfada dil değiştirir */}
            <Link
              href={otherLocalePath}
              className="hidden sm:flex px-3 py-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all uppercase tracking-wide"
            >
              {otherLocale}
            </Link>

            {/* Favorites */}
            <Link
              href={`/${locale}/favorites`}
              className="relative w-9 h-9 flex items-center justify-center rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-all"
            >
              <Heart className="h-5 w-5" />
              {favorites.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-indigo-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {favorites.length}
                </span>
              )}
            </Link>

            {/* Cart */}
            <button
              onClick={openDrawer}
              className="relative w-9 h-9 flex items-center justify-center rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-all"
            >
              <ShoppingCart className="h-5 w-5" />
              {itemCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-indigo-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </button>

            {/* Mobile menu toggle */}
            <button
              className="md:hidden w-9 h-9 flex items-center justify-center rounded-lg text-slate-500 hover:bg-indigo-50 transition-all ml-1"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white px-4 py-3 flex flex-col gap-1">
          {[
            { href: `/${locale}`, label: t('home') },
            { href: `/${locale}/products`, label: t('products') },
            { href: `/${locale}/track`, label: t('track') },
            { href: otherLocalePath, label: otherLocale.toUpperCase() },
          ].map(item => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className="px-4 py-2.5 text-sm font-medium text-slate-700 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
            >
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  )
}
