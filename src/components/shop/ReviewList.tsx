import Image from 'next/image'
import { Star } from 'lucide-react'
import type { Review, ReviewImage, Profile } from '@/types'

type ReviewWithDetails = Review & {
  profiles?: Pick<Profile, 'full_name' | 'avatar_url'>
  review_images?: ReviewImage[]
}

function StarRating({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'xs' }) {
  const cls = size === 'xs' ? 'h-3 w-3' : 'h-3.5 w-3.5'
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(s => (
        <Star
          key={s}
          className={`${cls} ${s <= rating ? 'fill-[#C7A06F] text-[#C7A06F]' : 'text-slate-200'}`}
        />
      ))}
    </div>
  )
}

export default function ReviewList({ reviews }: { reviews: ReviewWithDetails[] }) {
  if (reviews.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-slate-400 text-sm">Henüz yorum yok. İlk yorumu sen yaz!</p>
      </div>
    )
  }

  const avg = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length

  return (
    <div>
      {/* Özet */}
      <div className="flex items-center gap-5 mb-6 p-5 bg-slate-50 rounded-2xl border border-slate-100">
        <div className="text-center flex-shrink-0">
          <div className="text-4xl font-bold text-slate-900 leading-none">{avg.toFixed(1)}</div>
          <StarRating rating={Math.round(avg)} size="sm" />
          <p className="text-xs text-slate-400 mt-1">{reviews.length} yorum</p>
        </div>
        <div className="flex-1 space-y-1.5">
          {[5, 4, 3, 2, 1].map(star => {
            const count = reviews.filter(r => r.rating === star).length
            const pct = (count / reviews.length) * 100
            return (
              <div key={star} className="flex items-center gap-2 text-xs">
                <span className="w-2 text-slate-500 text-right">{star}</span>
                <Star className="h-3 w-3 fill-[#C7A06F] text-[#C7A06F] flex-shrink-0" />
                <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#C7A06F] rounded-full transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="w-4 text-slate-400 text-right">{count}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Yorumlar */}
      <div className="space-y-4">
        {reviews.map(review => {
          const name = review.profiles?.full_name ?? 'Kullanıcı'
          const avatar = review.profiles?.avatar_url
          const date = new Date(review.created_at).toLocaleDateString('tr-TR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })

          return (
            <div key={review.id} className="p-5 rounded-2xl border border-slate-100 bg-white">
              <div className="flex items-start gap-3">
                {avatar ? (
                  <img src={avatar} alt="" className="w-9 h-9 rounded-full object-cover flex-shrink-0" />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-[#D9E2EC] flex items-center justify-center text-sm font-bold text-[#102A43] flex-shrink-0">
                    {name[0]?.toUpperCase() ?? '?'}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-sm font-semibold text-slate-900 truncate">{name}</span>
                    <span className="text-xs text-slate-400 flex-shrink-0">{date}</span>
                  </div>
                  <StarRating rating={review.rating} size="xs" />
                  {review.comment && (
                    <p className="text-sm text-slate-600 mt-2 leading-relaxed">{review.comment}</p>
                  )}
                  {review.review_images && review.review_images.length > 0 && (
                    <div className="flex gap-2 mt-3 flex-wrap">
                      {review.review_images
                        .sort((a, b) => a.sort_order - b.sort_order)
                        .map(img => (
                          <div
                            key={img.id}
                            className="relative w-20 h-20 rounded-xl overflow-hidden border border-slate-100"
                          >
                            <Image src={img.url} alt="" fill className="object-cover" />
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
