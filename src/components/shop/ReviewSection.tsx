import { createClient } from '@/lib/supabase/server'
import type { Locale } from '@/types'
import ReviewForm from './ReviewForm'
import ReviewList from './ReviewList'

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

  const { data: reviews } = await supabase
    .from('reviews')
    .select('*, profiles(full_name, avatar_url), review_images(*)')
    .eq('product_id', productId)
    .order('created_at', { ascending: false })

  const allReviews = reviews ?? []
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
