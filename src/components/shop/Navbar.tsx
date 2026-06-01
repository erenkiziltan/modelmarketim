'use client'

import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { useRouter, usePathname } from '@/i18n/navigation'
import { Menu, X, Heart } from 'lucide-react'
/* CART_DISABLED: import { ShoppingCart } from 'lucide-react' */
import { useState, useEffect } from 'react'
/* CART_DISABLED: import { useCart } from '@/components/shop/CartProvider' */
import { Locale } from '@/types'
import { cn } from '@/lib/utils'
import { useFavorites } from '@/components/shop/FavoritesProvider'

export default function Navbar({ locale }: { locale: Locale }) {
  const t = useTranslations('nav')
  /* CART_DISABLED: const { itemCount, openDrawer } = useCart() */
  const { favorites } = useFavorites()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const otherLocale: Locale = locale === 'tr' ? 'en' : 'tr'

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

  const switchLocale = () => {
    router.replace(pathname, { locale: otherLocale })
  }

  return (
    <header className={cn(
      'sticky top-0 z-50 w-full transition-all duration-300',
      scrolled
        ? 'bg-white/95 backdrop-blur-md shadow-sm shadow-[#102A43]/20/50 border-b border-indigo-50'
        : 'bg-white border-b border-slate-100'
    )}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">

          {/* Logo — şeffaf ikon + marka adı */}
          <Link href={`/${locale}`} className="flex items-center gap-2 group">
            <img
              src="/logo-icon.png"
              alt="Model Marketim"
              className="h-9 w-auto object-contain group-hover:opacity-90 transition-opacity"
            />
            <span className="text-lg font-bold" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
              <span style={{ color: '#102A43' }}>Model</span><span style={{ color: '#C7A06F' }}>marketim</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            <Link href={`/${locale}`} className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-[#D9E2EC]/40 rounded-lg transition-all">
              {t('home')}
            </Link>
            <Link href={`/${locale}/products`} className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-[#D9E2EC]/40 rounded-lg transition-all">
              {t('products')}
            </Link>
            <Link href={`/${locale}/track`} className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-[#D9E2EC]/40 rounded-lg transition-all">
              {t('track')}
            </Link>
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-1">
            {/* Language toggle */}
            <button
              onClick={switchLocale}
              className="hidden sm:flex px-3 py-1.5 text-xs font-semibold text-slate-500 hover:text-[#C7A06F] hover:bg-[#D9E2EC]/40 rounded-lg transition-all uppercase tracking-wide"
            >
              {otherLocale}
            </button>

            {/* Favorites */}
            <Link
              href={`/${locale}/favorites`}
              className="relative w-9 h-9 flex items-center justify-center rounded-lg text-slate-500 hover:text-[#C7A06F] hover:bg-[#D9E2EC]/40 transition-all"
            >
              <Heart className="h-5 w-5" />
              {favorites.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[#102A43] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {favorites.length}
                </span>
              )}
            </Link>

            {/* CART_DISABLED: Sepet ikonu - online ödeme entegrasyonu tamamlandığında aç
            <button
              onClick={openDrawer}
              className="relative w-9 h-9 flex items-center justify-center rounded-lg text-slate-500 hover:text-[#C7A06F] hover:bg-[#D9E2EC]/40 transition-all"
            >
              <ShoppingCart className="h-5 w-5" />
              {itemCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[#102A43] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </button>
            */}

            {/* Mobile menu toggle */}
            <button
              className="md:hidden w-9 h-9 flex items-center justify-center rounded-lg text-slate-500 hover:bg-[#D9E2EC]/40 transition-all ml-1"
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
          ].map(item => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className="px-4 py-2.5 text-sm font-medium text-slate-700 hover:text-[#C7A06F] hover:bg-[#D9E2EC]/40 rounded-xl transition-all"
            >
              {item.label}
            </Link>
          ))}
          <button
            onClick={() => { switchLocale(); setMobileOpen(false) }}
            className="px-4 py-2.5 text-sm font-medium text-slate-700 hover:text-[#C7A06F] hover:bg-[#D9E2EC]/40 rounded-xl transition-all text-left uppercase"
          >
            {otherLocale}
          </button>
        </div>
      )}
    </header>
  )
}
