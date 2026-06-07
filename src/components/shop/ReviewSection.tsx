import { createClient } from '@/lib/supabase/server'
import type { Locale, Review, ReviewImage } from '@/types'
import ReviewForm from './ReviewForm'
import ReviewList from './ReviewList'

type ReviewRow = Review & { review_images: ReviewImage[] }
type ProfileRow = { id: string; full_name: string; avatar_url: string }
type ReviewWithDetails = ReviewRow & { profiles?: ProfileRow }

export default async function ReviewSection({
  productId,
  locale,
}: {
  productId: string
  locale: Locale
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: reviewsData } = await supabase
    .from('reviews')
    .select('*, review_images(*)')
    .eq('product_id', productId)
    .order('created_at', { ascending: false })

  const reviewsRaw = (reviewsData ?? []) as ReviewRow[]

  // profiles tablosuna doğrudan FK olmadığı için ayrı çekiyoruz
  const userIds = [...new Set(reviewsRaw.map(r => r.user_id))]
  const { data: profilesData } = userIds.length > 0
    ? await supabase.from('profiles').select('id, full_name, avatar_url').in('id', userIds)
    : { data: [] as ProfileRow[] }

  const profilesMap: Record<string, ProfileRow> = Object.fromEntries(
    (profilesData ?? []).map((p: ProfileRow) => [p.id, p])
  )

  const allReviews: ReviewWithDetails[] = reviewsRaw.map(r => ({
    ...r,
    profiles: profilesMap[r.user_id] ?? undefined,
  }))

  const userReview = user ? (allReviews.find(r => r.user_id === user.id) ?? null) : null

  return (
    <div className="mt-14 border-t border-slate-100 pt-10">
      <h2 className="text-lg font-bold text-slate-900 mb-6">
        {locale === 'tr' ? 'Müşteri Yorumları' : 'Customer Reviews'}
        {allReviews.length > 0 && (
          <span className="ml-2 text-sm font-normal text-slate-400">({allReviews.length})</span>
        )}
      </h2>
      <ReviewForm productId={productId} user={user} userReview={userReview} />
      <ReviewList reviews={allReviews} />
    </div>
  )
}
