import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Star, Package, MessageSquare, Clock, ChevronRight } from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import type { Locale, ReviewImage } from '@/types'

type OrderStatus = 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled'

const statusMap: Record<OrderStatus, { label: string; cls: string }> = {
  pending:   { label: 'Beklemede',      cls: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
  confirmed: { label: 'Onaylandı',      cls: 'bg-blue-50 text-blue-700 border-blue-200' },
  shipped:   { label: 'Kargoda',        cls: 'bg-purple-50 text-purple-700 border-purple-200' },
  delivered: { label: 'Teslim Edildi',  cls: 'bg-green-50 text-green-700 border-green-200' },
  cancelled: { label: 'İptal Edildi',   cls: 'bg-red-50 text-red-700 border-red-200' },
}

export default async function HesabimPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ tab?: string }>
}) {
  const { locale } = await params
  const { tab } = await searchParams
  const activeTab = tab === 'yorumlar' ? 'yorumlar' : 'siparisler'

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect(`/${locale}/products`)

  // Profil bilgisi
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, avatar_url, email')
    .eq('id', user.id)
    .single()

  // Siparişler — service role ile çekiyoruz (e-posta eşleşmesi)
  const serviceClient = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: ordersData } = await serviceClient
    .from('orders')
    .select('*')
    .eq('customer_email', user.email!)
    .order('created_at', { ascending: false })

  // Yorumlar
  const { data: reviewsData } = await supabase
    .from('reviews')
    .select('*, review_images(*)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  // Yorumlar için ürün bilgisi
  const reviewProductIds = [...new Set((reviewsData ?? []).map((r: { product_id: string }) => r.product_id))]
  const { data: productsData } = reviewProductIds.length > 0
    ? await supabase
        .from('products')
        .select('id, name_tr, name_en, slug, product_images(*)')
        .in('id', reviewProductIds)
    : { data: [] }

  const productsMap = Object.fromEntries(
    (productsData ?? []).map((p: { id: string; name_tr: string; name_en: string; slug: string; product_images: { is_cover: boolean; url: string }[] }) => [p.id, p])
  )

  const orders = ordersData ?? []
  const reviews = reviewsData ?? []
  const displayName = profile?.full_name ?? user.user_metadata?.full_name ?? user.email?.split('@')[0] ?? 'Kullanıcı'
  const avatar = profile?.avatar_url ?? user.user_metadata?.avatar_url

  return (
    <div className="min-h-screen bg-slate-50/50">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-10">

        {/* Profil kartı */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6 mb-6 flex items-center gap-4 shadow-sm">
          {avatar ? (
            <img src={avatar} alt="" className="w-16 h-16 rounded-full object-cover border-2 border-[#C7A06F]/40 flex-shrink-0" />
          ) : (
            <div className="w-16 h-16 rounded-full bg-[#102A43] text-white text-xl font-bold flex items-center justify-center flex-shrink-0">
              {displayName[0]?.toUpperCase() ?? 'U'}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-bold text-slate-900 truncate">{displayName}</h1>
            <p className="text-sm text-slate-400 truncate">{user.email}</p>
          </div>
          <div className="flex gap-5 text-center flex-shrink-0">
            <div>
              <div className="text-xl font-bold text-slate-900">{orders.length}</div>
              <div className="text-xs text-slate-400">Sipariş</div>
            </div>
            <div>
              <div className="text-xl font-bold text-slate-900">{reviews.length}</div>
              <div className="text-xs text-slate-400">Yorum</div>
            </div>
          </div>
        </div>

        {/* Tab menü */}
        <div className="flex gap-2 mb-6">
          {[
            { key: 'siparisler', label: 'Siparişlerim', icon: Package, count: orders.length, href: `/${locale}/hesabim` },
            { key: 'yorumlar', label: 'Yorumlarım', icon: MessageSquare, count: reviews.length, href: `/${locale}/hesabim?tab=yorumlar` },
          ].map(t => (
            <Link
              key={t.key}
              href={t.href}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all border ${
                activeTab === t.key
                  ? 'bg-[#102A43] text-white border-[#102A43] shadow-sm'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-[#102A43]/30'
              }`}
            >
              <t.icon className="h-4 w-4" />
              {t.label}
              <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${
                activeTab === t.key ? 'bg-white/20' : 'bg-slate-100 text-slate-500'
              }`}>
                {t.count}
              </span>
            </Link>
          ))}
        </div>

        {/* Siparişler */}
        {activeTab === 'siparisler' && (
          <div className="space-y-3">
            {orders.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-100 p-14 text-center">
                <Package className="h-12 w-12 text-slate-200 mx-auto mb-3" />
                <p className="text-slate-400 text-sm mb-3">Henüz sipariş vermediniz.</p>
                <Link
                  href={`/${locale}/products`}
                  className="inline-flex items-center gap-1 text-sm font-semibold text-[#C7A06F] hover:text-[#b8904f] transition-colors"
                >
                  Alışverişe Başla <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            ) : (
              orders.map((order: {
                id: string
                order_number: string
                status: OrderStatus
                total_price: number
                created_at: string
                items: { product_name: string; quantity: number; unit_price: number; variant?: string }[]
              }) => {
                const s = statusMap[order.status] ?? { label: order.status, cls: 'bg-slate-50 text-slate-500 border-slate-200' }
                return (
                  <div key={order.id} className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div>
                        <p className="font-bold text-slate-900 text-sm">#{order.order_number}</p>
                        <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(order.created_at).toLocaleDateString('tr-TR', {
                            day: 'numeric', month: 'long', year: 'numeric',
                          })}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${s.cls}`}>
                          {s.label}
                        </span>
                        <span className="text-sm font-bold text-[#C7A06F]">{formatPrice(order.total_price)}</span>
                      </div>
                    </div>
                    <div className="border-t border-slate-100 pt-3 space-y-1.5">
                      {(order.items ?? []).map((item, i) => (
                        <div key={i} className="flex justify-between text-xs">
                          <span className="text-slate-600">
                            {item.product_name} × {item.quantity}
                            {item.variant && <span className="text-slate-400 ml-1">({item.variant})</span>}
                          </span>
                          <span className="text-slate-700 font-medium">{formatPrice(item.unit_price * item.quantity)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })
            )}
          </div>
        )}

        {/* Yorumlar */}
        {activeTab === 'yorumlar' && (
          <div className="space-y-3">
            {reviews.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-100 p-14 text-center">
                <MessageSquare className="h-12 w-12 text-slate-200 mx-auto mb-3" />
                <p className="text-slate-400 text-sm">Henüz yorum yapmadınız.</p>
              </div>
            ) : (
              reviews.map((review: {
                id: string
                product_id: string
                rating: number
                comment: string | null
                created_at: string
                review_images: ReviewImage[]
              }) => {
                const product = productsMap[review.product_id]
                const productName = product
                  ? (locale === 'tr' ? product.name_tr : product.name_en)
                  : 'Ürün'
                const coverImage = product?.product_images?.find((i: { is_cover: boolean }) => i.is_cover)
                  ?? product?.product_images?.[0]

                return (
                  <div key={review.id} className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
                    <div className="flex items-start gap-4">
                      {coverImage && (
                        <img
                          src={coverImage.url}
                          alt=""
                          className="w-14 h-14 rounded-xl object-cover border border-slate-100 flex-shrink-0"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <Link
                          href={`/${locale}/products/${product?.slug ?? ''}`}
                          className="font-semibold text-slate-900 hover:text-[#C7A06F] transition-colors text-sm"
                        >
                          {productName}
                        </Link>
                        <div className="flex gap-0.5 mt-1">
                          {[1, 2, 3, 4, 5].map(s => (
                            <Star
                              key={s}
                              className={`h-3.5 w-3.5 ${s <= review.rating ? 'fill-[#C7A06F] text-[#C7A06F]' : 'text-slate-200'}`}
                            />
                          ))}
                        </div>
                        {review.comment && (
                          <p className="text-sm text-slate-600 mt-1.5 leading-relaxed">{review.comment}</p>
                        )}
                        {review.review_images?.length > 0 && (
                          <div className="flex gap-2 mt-2 flex-wrap">
                            {review.review_images.map(img => (
                              <img
                                key={img.id}
                                src={img.url}
                                alt=""
                                className="w-12 h-12 rounded-lg object-cover border border-slate-100"
                              />
                            ))}
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 flex-shrink-0">
                        {new Date(review.created_at).toLocaleDateString('tr-TR', {
                          day: 'numeric', month: 'long',
                        })}
                      </p>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        )}

      </div>
    </div>
  )
}
