'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Star, Upload, X, LogIn } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'
import type { Review, ReviewImage } from '@/types'

type ReviewWithImages = Review & { review_images?: ReviewImage[] }

export default function ReviewForm({
  productId,
  user,
  userReview,
}: {
  productId: string
  user: User | null
  userReview: ReviewWithImages | null
}) {
  const [rating, setRating] = useState(userReview?.rating ?? 0)
  const [hoverRating, setHoverRating] = useState(0)
  const [comment, setComment] = useState(userReview?.comment ?? '')
  const [newPhotos, setNewPhotos] = useState<File[]>([])
  const [newPreviews, setNewPreviews] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const existingImages = userReview?.review_images ?? []
  const totalPhotos = existingImages.length + newPhotos.length

  function handleSignIn() {
    const supabase = createClient()
    supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/api/auth/callback?next=${encodeURIComponent(window.location.pathname)}`,
      },
    })
  }

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    const remaining = 3 - totalPhotos
    const toAdd = files.slice(0, remaining)
    setNewPhotos(prev => [...prev, ...toAdd])
    setNewPreviews(prev => [...prev, ...toAdd.map(f => URL.createObjectURL(f))])
    e.target.value = ''
  }

  function removeNewPhoto(index: number) {
    setNewPhotos(prev => prev.filter((_, i) => i !== index))
    setNewPreviews(prev => {
      URL.revokeObjectURL(prev[index])
      return prev.filter((_, i) => i !== index)
    })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!user || rating === 0) return
    setLoading(true)
    setError('')

    const supabase = createClient()
    try {
      const { data: review, error: reviewError } = await supabase
        .from('reviews')
        .upsert(
          {
            ...(userReview ? { id: userReview.id } : {}),
            product_id: productId,
            user_id: user.id,
            rating,
            comment: comment.trim() || null,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'product_id,user_id' }
        )
        .select()
        .single()

      if (reviewError) throw reviewError

      for (const photo of newPhotos) {
        const ext = photo.name.split('.').pop() ?? 'jpg'
        const fileName = `${user.id}/${review.id}/${Date.now()}.${ext}`

        const { error: uploadError } = await supabase.storage
          .from('review-images')
          .upload(fileName, photo)
        if (uploadError) throw uploadError

        const { data: { publicUrl } } = supabase.storage
          .from('review-images')
          .getPublicUrl(fileName)

        await supabase.from('review_images').insert({
          review_id: review.id,
          url: publicUrl,
        })
      }

      setSuccess(true)
      setNewPhotos([])
      setNewPreviews([])
      router.refresh()
    } catch (err) {
      console.error(err)
      setError('Hata oluştu, tekrar deneyin.')
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="mb-8 p-6 rounded-2xl bg-slate-50 border border-slate-100 text-center">
        <p className="text-slate-500 text-sm mb-4">
          Bu ürün için yorum yapmak istiyorsanız Gmail hesabınızla giriş yapın.
        </p>
        <Button
          onClick={handleSignIn}
          className="gap-2 bg-[#102A43] hover:bg-[#0d2236] text-white rounded-xl shadow-md"
        >
          <LogIn className="h-4 w-4" />
          Gmail ile Giriş Yap
        </Button>
      </div>
    )
  }

  if (success) {
    return (
      <div className="mb-8 p-6 rounded-2xl bg-green-50 border border-green-100 text-center">
        <p className="text-green-700 font-semibold text-sm">✓ Yorumunuz eklendi, teşekkürler!</p>
        <button
          onClick={() => setSuccess(false)}
          className="text-xs text-slate-400 mt-1 hover:text-slate-600 transition-colors"
        >
          Düzenle
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="mb-8 p-6 rounded-2xl bg-slate-50 border border-slate-100">
      <h3 className="font-semibold text-slate-900 mb-5 text-sm">
        {userReview ? 'Yorumunuzu Düzenleyin' : 'Yorum Yazın'}
      </h3>

      {/* Yıldız puanı */}
      <div className="mb-4">
        <p className="text-xs font-medium text-slate-500 mb-2 uppercase tracking-wide">Puanınız *</p>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map(star => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              className="p-0.5"
            >
              <Star
                className={`h-8 w-8 transition-colors ${
                  star <= (hoverRating || rating)
                    ? 'fill-[#C7A06F] text-[#C7A06F]'
                    : 'text-slate-200 hover:text-slate-300'
                }`}
              />
            </button>
          ))}
        </div>
      </div>

      {/* Yorum */}
      <div className="mb-4">
        <p className="text-xs font-medium text-slate-500 mb-2 uppercase tracking-wide">
          Yorumunuz (isteğe bağlı)
        </p>
        <textarea
          value={comment}
          onChange={e => setComment(e.target.value)}
          placeholder="Ürün hakkında düşüncelerinizi paylaşın..."
          rows={3}
          className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#C7A06F]/30 focus:border-[#C7A06F] resize-none bg-white transition-colors"
        />
      </div>

      {/* Fotoğraflar */}
      <div className="mb-5">
        <p className="text-xs font-medium text-slate-500 mb-2 uppercase tracking-wide">
          Fotoğraf ({totalPhotos}/3)
        </p>
        <div className="flex gap-2 flex-wrap">
          {/* Mevcut fotoğraflar */}
          {existingImages.map(img => (
            <div key={img.id} className="relative w-20 h-20 rounded-xl overflow-hidden border border-slate-200">
              <Image src={img.url} alt="" fill className="object-cover" />
            </div>
          ))}
          {/* Yeni fotoğraflar */}
          {newPreviews.map((src, i) => (
            <div key={src} className="relative w-20 h-20 rounded-xl overflow-hidden border border-slate-200">
              <Image src={src} alt="" fill className="object-cover" unoptimized />
              <button
                type="button"
                onClick={() => removeNewPhoto(i)}
                className="absolute top-0.5 right-0.5 w-5 h-5 bg-black/60 rounded-full flex items-center justify-center"
              >
                <X className="h-3 w-3 text-white" />
              </button>
            </div>
          ))}
          {/* Ekle butonu */}
          {totalPhotos < 3 && (
            <label className="w-20 h-20 rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center cursor-pointer hover:border-[#C7A06F] hover:bg-[#C7A06F]/5 transition-colors">
              <Upload className="h-5 w-5 text-slate-400" />
              <span className="text-[10px] text-slate-400 mt-1">Ekle</span>
              <input
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                multiple
                className="hidden"
                onChange={handlePhotoChange}
              />
            </label>
          )}
        </div>
      </div>

      {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

      <Button
        type="submit"
        disabled={loading || rating === 0}
        className="bg-[#102A43] hover:bg-[#0d2236] text-white rounded-xl px-6 shadow-md disabled:opacity-50"
      >
        {loading ? 'Gönderiliyor...' : 'Yorumu Gönder'}
      </Button>
    </form>
  )
}
