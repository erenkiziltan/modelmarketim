'use client'

import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { useRouter, usePathname } from '@/i18n/navigation'
import { Menu, X, Heart, LogIn } from 'lucide-react'
/* CART_DISABLED: import { ShoppingCart } from 'lucide-react' */
import { useState, useEffect } from 'react'
/* CART_DISABLED: import { useCart } from '@/components/shop/CartProvider' */
import { Locale } from '@/types'
import { cn } from '@/lib/utils'
import { useFavorites } from '@/components/shop/FavoritesProvider'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

export default function Navbar({ locale }: { locale: Locale }) {
  const t = useTranslations('nav')
  /* CART_DISABLED: const { itemCount, openDrawer } = useCart() */
  const { favorites } = useFavorites()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const otherLocale: Locale = locale === 'tr' ? 'en' : 'tr'

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  const switchLocale = () => {
    router.replace(pathname, { locale: otherLocale })
  }

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    setUser(null)
    setUserMenuOpen(false)
    router.refresh()
  }

  function handleSignIn() {
    const supabase = createClient()
    supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/api/auth/callback?next=${encodeURIComponent(window.location.pathname)}`,
      },
    })
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

            {/* Kullanıcı */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(o => !o)}
                  className="w-9 h-9 rounded-full overflow-hidden border-2 border-[#C7A06F]/40 hover:border-[#C7A06F] transition-colors flex-shrink-0"
                >
                  {user.user_metadata?.avatar_url ? (
                    <img src={user.user_metadata.avatar_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-[#102A43] text-white text-xs font-bold flex items-center justify-center">
                      {user.email?.[0]?.toUpperCase() ?? 'U'}
                    </div>
                  )}
                </button>
                {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 bg-white border border-slate-100 rounded-xl shadow-lg p-1.5 w-48 z-50">
                    <p className="text-xs text-slate-400 px-3 py-1.5 truncate border-b border-slate-100 mb-1">
                      {user.user_metadata?.full_name ?? user.email}
                    </p>
                    <Link
                      href={`/${locale}/hesabim`}
                      onClick={() => setUserMenuOpen(false)}
                      className="w-full text-left px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-lg transition-colors flex items-center gap-2"
                    >
                      Hesabım
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
                    >
                      Çıkış Yap
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={handleSignIn}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-500 hover:text-[#C7A06F] hover:bg-[#D9E2EC]/40 rounded-lg transition-all"
              >
                <LogIn className="h-3.5 w-3.5" />
                Giriş
              </button>
            )}

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
