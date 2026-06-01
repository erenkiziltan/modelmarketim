'use client'
// CART_DISABLED: Sepet sistemi ileride aktif edilecek. Şimdilik Dolap'a yönlendiriliyor.
import { useEffect } from 'react'
import { useParams } from 'next/navigation'
import { useRouter } from 'next/navigation'

export default function CartPage() {
  const { locale } = useParams()
  const router = useRouter()

  useEffect(() => {
    window.open('https://link.dolap.com/7lp4ce', '_blank')
    router.replace(`/${locale}/products`)
  }, [])

  return null
}
