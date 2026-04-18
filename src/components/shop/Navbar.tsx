'use client'

import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { ShoppingCart, Menu, X, Heart } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useCart } from '@/components/shop/CartProvider'
import { Locale } from '@/types'
import { cn } from '@/lib/utils'
import { useFavorites } from '@/components/shop/FavoritesProvider'

export default function Navbar({ locale }: { locale: Locale }) {
  const t = useTranslations('nav')
  const { itemCount, openDrawer } = useCart()
  const { favorites } = useFavorites()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const otherLocale = locale === 'tr' ? 'en' : 'tr'

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

  return (
    <header className={cn(
      'sticky top-0 z-50 w-full transition-all duration-300',
      scrolled
        ? 'bg-white/90 backdrop-blur-md shadow-sm border-b border-zinc-100'
        : 'bg-white border-b border-zinc-100'
    )}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">

          {/* Logo */}
          <Link href={`/${locale}`} className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center shadow-sm group-hover:bg-orange-600 transition-colors">
              <span className="text-white font-bold text-sm">P</span>
            </div>
            <span className="text-lg font-bold text-zinc-900" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
              Poly<span className="text-orange-500">Forge</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            <Link
              href={`/${locale}`}
              className="px-4 py-2 text-sm font-medium text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 rounded-lg transition-all"
            >
              {t('home')}
            </Link>
            <Link
              href={`/${locale}/products`}
              className="px-4 py-2 text-sm font-medium text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 rounded-lg transition-all"
            >
              {t('products')}
            </Link>
            <Link
              href={`/${locale}/track`}
              className="px-4 py-2 text-sm font-medium text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 rounded-lg transition-all"
            >
              Sipariş Takip
            </Link>
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {/* Locale switcher */}
            <Link
              href={`/${otherLocale}`}
              className="hidden md:flex items-center text-xs font-semibold uppercase tracking-wide text-zinc-400 hover:text-zinc-700 transition-colors px-2 py-1 rounded-md hover:bg-zinc-100"
            >
              {otherLocale === 'tr' ? '🇹🇷 TR' : '🇬🇧 EN'}
            </Link>

            {/* Favorites */}
            <Link
              href={`/${locale}/favorites`}
              className="relative hidden md:flex items-center justify-center w-10 h-10 rounded-xl text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 transition-all"
            >
              <Heart className="h-5 w-5" />
              {favorites.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-red-500 text-xs text-white flex items-center justify-center font-bold shadow-sm">
                  {favorites.length}
                </span>
              )}
            </Link>

            {/* Cart */}
            <button
              onClick={openDrawer}
              className="relative flex items-center justify-center w-10 h-10 rounded-xl text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 transition-all"
            >
              <ShoppingCart className="h-5 w-5" />
              {itemCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 h-5 w-5 rounded-full bg-orange-500 text-xs text-white flex items-center justify-center font-bold shadow-sm">
                  {itemCount > 9 ? '9+' : itemCount}
                </span>
              )}
            </button>

            {/* Mobile toggle */}
            <button
              className="md:hidden flex items-center justify-center w-10 h-10 rounded-xl text-zinc-600 hover:bg-zinc-100 transition-all"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-zinc-100 bg-white px-4 py-3 flex flex-col gap-1">
          <Link
            href={`/${locale}`}
            className="px-3 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 rounded-lg"
            onClick={() => setMobileOpen(false)}
          >
            {t('home')}
          </Link>
          <Link
            href={`/${locale}/products`}
            className="px-3 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 rounded-lg"
            onClick={() => setMobileOpen(false)}
          >
            {t('products')}
          </Link>
          <div className="border-t border-zinc-100 mt-1 pt-2">
            <Link
              href={`/${otherLocale}`}
              className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-zinc-400"
              onClick={() => setMobileOpen(false)}
            >
              {otherLocale === 'tr' ? '🇹🇷 Türkçe' : '🇬🇧 English'}
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
