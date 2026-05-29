import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { routing } from '@/i18n/routing'
import { Toaster } from '@/components/ui/sonner'
import Navbar from '@/components/shop/Navbar'
import Footer from '@/components/shop/Footer'
/* CART_DISABLED: import { CartProvider } from '@/components/shop/CartProvider' */
import { FavoritesProvider } from '@/components/shop/FavoritesProvider'
import PageTransition from '@/components/shared/PageTransition'
/* CART_DISABLED: import CartDrawer from '@/components/shop/CartDrawer' */
import WhatsAppButton from '@/components/shop/WhatsAppButton'
import DolapButton from '@/components/shop/DolapButton'

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  if (!routing.locales.includes(locale as 'tr' | 'en')) {
    notFound()
  }

  const messages = await getMessages()

  return (
    <NextIntlClientProvider messages={messages}>
      {/* CART_DISABLED: <CartProvider> */}
      <FavoritesProvider>
        <Navbar locale={locale as 'tr' | 'en'} />
        {/* CART_DISABLED: <CartDrawer locale={locale as 'tr' | 'en'} /> */}
        <main className="flex-1">
          <PageTransition>
            {children}
          </PageTransition>
        </main>
        <Footer locale={locale} />
        <DolapButton />
        <WhatsAppButton />
        <Toaster richColors position="bottom-right" />
      </FavoritesProvider>
      {/* CART_DISABLED: </CartProvider> */}
    </NextIntlClientProvider>
  )
}
