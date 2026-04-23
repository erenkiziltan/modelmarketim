import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { routing } from '@/i18n/routing'
import { Toaster } from '@/components/ui/sonner'
import Navbar from '@/components/shop/Navbar'
import Footer from '@/components/shop/Footer'
import { CartProvider } from '@/components/shop/CartProvider'
import { FavoritesProvider } from '@/components/shop/FavoritesProvider'
import PageTransition from '@/components/shared/PageTransition'
import CartDrawer from '@/components/shop/CartDrawer'
import WhatsAppButton from '@/components/shop/WhatsAppButton'

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
      <CartProvider>
        <FavoritesProvider>
          <Navbar locale={locale as 'tr' | 'en'} />
          <CartDrawer locale={locale as 'tr' | 'en'} />
          <main className="flex-1">
            <PageTransition>
              {children}
            </PageTransition>
          </main>
          <Footer locale={locale} />
          <WhatsAppButton />
          <Toaster richColors position="bottom-right" />
        </FavoritesProvider>
      </CartProvider>
    </NextIntlClientProvider>
  )
}
