import { createClient } from '@/lib/supabase/server'
import { getTranslations } from 'next-intl/server'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { formatPrice, getLocalizedField } from '@/lib/utils'
import { Locale, Product, ProductImage } from '@/types'
import { ArrowRight, Sparkles, Shield, Truck, Package } from 'lucide-react'
import ProductCard from '@/components/shop/ProductCard'

type ProductWithImages = Product & { product_images: ProductImage[] }

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
      <section className="relative overflow-hidden bg-zinc-900 text-white">
        {/* Background texture */}
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle at 25% 25%, #ea580c 0%, transparent 50%), radial-gradient(circle at 75% 75%, #f97316 0%, transparent 50%)' }}
        />
        <div className="absolute inset-0"
          style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.02\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")', }}
        />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/20 rounded-full px-4 py-1.5 mb-6">
              <Sparkles className="h-3.5 w-3.5 text-orange-400" />
              <span className="text-orange-300 text-xs font-semibold tracking-wide uppercase">El Yapımı 3D Baskı</span>
            </div>
            <h1 className="text-5xl sm:text-6xl font-bold leading-[1.1] mb-6">
              Her Figür
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-600">
                Bir Hikaye
              </span>
            </h1>
            <p className="text-lg text-zinc-400 mb-10 leading-relaxed max-w-lg">
              {t('hero_subtitle')}
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href={`/${locale}/products`}>
                <Button size="lg" className="bg-orange-500 hover:bg-orange-600 text-white gap-2 px-8 h-12 text-base rounded-xl shadow-lg shadow-orange-500/25 transition-all hover:shadow-orange-500/40 hover:-translate-y-0.5">
                  {t('hero_cta')}
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[#fafaf9] to-transparent" />
      </section>

      {/* Features strip */}
      <section className="border-b border-zinc-100 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-zinc-100">
            {[
              { icon: Sparkles, title: 'Özel Tasarım', desc: 'Her ürün elle üretilir' },
              { icon: Shield, title: 'Yüksek Kalite', desc: 'PLA+ ve PETG malzeme' },
              { icon: Truck, title: 'Hızlı Teslimat', desc: 'Türkiye geneli kargo' },
            ].map(f => (
              <div key={f.title} className="flex items-center gap-4 px-8 py-5">
                <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center flex-shrink-0">
                  <f.icon className="h-5 w-5 text-orange-500" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-zinc-900">{f.title}</p>
                  <p className="text-xs text-zinc-500">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20 px-4">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-orange-500 mb-2">Koleksiyon</p>
              <h2 className="text-3xl font-bold text-zinc-900">{t('featured_title')}</h2>
            </div>
            <Link
              href={`/${locale}/products`}
              className="hidden sm:flex items-center gap-1.5 text-sm font-medium text-zinc-500 hover:text-orange-500 transition-colors group"
            >
              {t('view_all')}
              <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          {featured.length === 0 ? (
            <div className="text-center py-24 text-zinc-300">
              <Package className="h-16 w-16 mx-auto mb-4" />
              <p className="text-zinc-400 text-sm">Yakında ürünler eklenecek.</p>
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
              <Button variant="outline" className="gap-2">
                {t('view_all')} <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-4 sm:mx-8 lg:mx-auto lg:max-w-7xl mb-16">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-zinc-900 to-zinc-800 px-8 py-14 text-center text-white">
          <div className="absolute inset-0 opacity-20"
            style={{ backgroundImage: 'radial-gradient(circle at 50% 0%, #ea580c 0%, transparent 60%)' }}
          />
          <div className="relative">
            <h3 className="text-2xl sm:text-3xl font-bold mb-3">Koleksiyonu Keşfet</h3>
            <p className="text-zinc-400 mb-8 text-sm max-w-md mx-auto">
              Tüm 3D baskı figürlerimizi incele, dilediğini sepetine ekle.
            </p>
            <Link href={`/${locale}/products`}>
              <Button className="bg-orange-500 hover:bg-orange-600 shadow-lg shadow-orange-500/30 gap-2 px-8 h-11 rounded-xl">
                Tüm Ürünlere Git <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

