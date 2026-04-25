import { createClient } from '@/lib/supabase/server'
import { getTranslations } from 'next-intl/server'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { formatPrice, getLocalizedField } from '@/lib/utils'
import { Locale, Product, ProductImage } from '@/types'
import { ArrowRight, Sparkles, Shield, Truck, Star } from 'lucide-react'
import ProductCard from '@/components/shop/ProductCard'
import HeroModel from '@/components/shop/HeroModel'
import type { Metadata } from 'next'

type ProductWithImages = Product & { product_images: ProductImage[] }

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const isTr = locale === 'tr'
  return {
    title: isTr
      ? 'Modelmarketim | 3D Baskı Figür & Model Mağazası'
      : 'Modelmarketim | 3D Printed Figures & Models',
    description: isTr
      ? 'Türkiye\'nin 3D baskı figür mağazası. Ejderha, karakter, araç, özel tasarım figürler. PLA+ ve PETG malzeme, hızlı kargo, güvenli alışveriş.'
      : 'Turkey\'s 3D printed figures store. Dragons, characters, vehicles and custom designs. Premium PLA+ and PETG materials, fast shipping.',
    alternates: {
      canonical: `https://modelmarketim.com/${locale}`,
      languages: {
        tr: 'https://modelmarketim.com/tr',
        en: 'https://modelmarketim.com/en',
      },
    },
  }
}

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations('home')
  const supabase = await createClient()

  const { data: products } = await supabase
    .from('products')
    .select('*, product_images(*)')
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(6)

  const featured = (products ?? []) as ProductWithImages[]

  return (
    <div className="flex flex-col">

      {/* Hero */}
      <section className="relative overflow-hidden bg-white">
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-indigo-100 rounded-full opacity-40 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-[400px] h-[400px] bg-violet-100 rounded-full opacity-30 blur-3xl pointer-events-none" />
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'40\' height=\'40\' viewBox=\'0 0 40 40\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\'%3E%3Cpath d=\'M0 0h40v40H0z\'/%3E%3Cpath d=\'M0 0v40M40 0v40M0 0h40M0 40h40\' stroke=\'%234f46e5\' stroke-width=\'1\'/%3E%3C/g%3E%3C/svg%3E")' }}
        />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-100 rounded-full px-4 py-1.5 mb-6">
                <Sparkles className="h-3.5 w-3.5 text-indigo-500" />
                <span className="text-indigo-600 text-xs font-semibold tracking-wide uppercase">{t('hero_badge')}</span>
              </div>
              <h1 className="text-5xl sm:text-6xl font-bold leading-[1.08] mb-6 text-slate-900">
                {t('hero_title_1')}
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">
                  {t('hero_title_2')}
                </span>
              </h1>
              <p className="text-lg text-slate-500 mb-10 leading-relaxed max-w-lg">
                {t('hero_subtitle')}
              </p>
              <div className="flex flex-wrap gap-3">
                <Link href={`/${locale}/products`}>
                  <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2 px-8 h-12 text-base rounded-xl shadow-lg shadow-indigo-200 transition-all hover:-translate-y-0.5">
                    {t('hero_cta')} <ArrowRight className="h-5 w-5" />
                  </Button>
                </Link>
                <Link href={`/${locale}/track`}>
                  <Button size="lg" variant="outline" className="gap-2 px-8 h-12 text-base rounded-xl border-slate-200 text-slate-600 hover:border-indigo-200 hover:text-indigo-600 hover:bg-indigo-50 transition-all">
                    {t('track_order')}
                  </Button>
                </Link>
              </div>

              <div className="flex items-center gap-3 mt-10">
                <div className="flex -space-x-2">
                  {['bg-indigo-300', 'bg-violet-300', 'bg-purple-300', 'bg-indigo-400'].map((c, i) => (
                    <div key={i} className={`w-8 h-8 rounded-full ${c} border-2 border-white`} />
                  ))}
                </div>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-slate-500">{t('social_proof')}</p>
              </div>
            </div>

            <div className="hidden lg:flex items-center justify-center">
              <HeroModel />
            </div>
          </div>
        </div>
      </section>

      {/* Features strip */}
      <section className="border-y border-slate-100 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
            {([
              { icon: Sparkles, title: t('feature_1_title'), desc: t('feature_1_desc') },
              { icon: Shield, title: t('feature_2_title'), desc: t('feature_2_desc') },
              { icon: Truck, title: t('feature_3_title'), desc: t('feature_3_desc') },
            ] as const).map(f => (
              <div key={f.title} className="flex items-center gap-4 px-8 py-5">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center flex-shrink-0">
                  <f.icon className="h-5 w-5 text-indigo-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">{f.title}</p>
                  <p className="text-xs text-slate-500">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20 px-4 bg-slate-50/50">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-indigo-500 mb-2">{t('highlights_badge')}</p>
              <h2 className="text-3xl font-bold text-slate-900">{t('featured_title')}</h2>
            </div>
            <Link
              href={`/${locale}/products`}
              className="hidden sm:flex items-center gap-1.5 text-sm font-medium text-slate-400 hover:text-indigo-600 transition-colors group"
            >
              {t('view_all')}
              <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          {featured.length === 0 ? (
            <div className="text-center py-24">
              <div className="w-20 h-20 rounded-3xl bg-indigo-50 flex items-center justify-center mx-auto mb-4">
                <Sparkles className="h-8 w-8 text-indigo-300" />
              </div>
              <p className="text-slate-400 text-sm">{t('coming_soon')}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featured.map(product => (
                <ProductCard key={product.id} product={product} locale={locale as Locale} />
              ))}
            </div>
          )}

          <div className="sm:hidden text-center mt-8">
            <Link href={`/${locale}/products`}>
              <Button variant="outline" className="gap-2 border-indigo-200 text-indigo-600 hover:bg-indigo-50">
                {t('view_all')} <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-4 sm:mx-8 lg:mx-auto lg:max-w-7xl my-16">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-indigo-600 to-violet-700 px-8 py-16 text-center text-white">
          <div className="absolute -top-16 -right-16 w-64 h-64 bg-white/5 rounded-full" />
          <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-white/5 rounded-full" />
          <div className="relative">
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 mb-6">
              <Sparkles className="h-3.5 w-3.5 text-indigo-200" />
              <span className="text-indigo-100 text-xs font-semibold tracking-wide uppercase">{t('cta_badge')}</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold mb-3">{t('cta_title')}</h3>
            <p className="text-indigo-200 mb-8 text-sm max-w-md mx-auto">{t('cta_desc')}</p>
            <Link href={`/${locale}/products`}>
              <Button className="bg-white text-indigo-700 hover:bg-indigo-50 shadow-lg gap-2 px-8 h-11 rounded-xl font-semibold transition-all hover:-translate-y-0.5">
                {t('cta_btn')} <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
