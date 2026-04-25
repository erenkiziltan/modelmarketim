'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useCart } from '@/components/shop/CartProvider'
import { generateOrderNumber } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatPrice } from '@/lib/utils'
import { toast } from 'sonner'
import { CheckCircle, Shield } from 'lucide-react'
import Link from 'next/link'

export default function CheckoutPage() {
  const t = useTranslations('checkout')
  const { locale } = useParams()
  const { items, total, clearCart } = useCart()
  const [loading, setLoading] = useState(false)
  const [orderNumber, setOrderNumber] = useState<string | null>(null)

  const [form, setForm] = useState({
    name: '', email: '', phone: '',
    street: '', city: '', district: '', zip: '', notes: '',
  })

  function update(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (items.length === 0) { toast.error(t('cart_empty')); return }
    setLoading(true)

    const supabase = createClient()
    const number = generateOrderNumber()

    const { error } = await supabase.from('orders').insert({
      order_number: number,
      customer_name: form.name,
      customer_email: form.email,
      customer_phone: form.phone,
      shipping_address: {
        street: form.street,
        city: form.city,
        district: form.district,
        zip_code: form.zip,
        country: 'TR',
      },
      items: items.map(i => ({
        product_id: i.product.id,
        product_name: i.product.name_tr,
        variant: Object.entries(i.selectedVariants).map(([k, v]) => `${k}: ${v}`).join(', ') || null,
        quantity: i.quantity,
        unit_price: i.product.price,
      })),
      total_price: total,
      status: 'pending',
      payment_status: 'pending',
      notes: form.notes,
    })

    if (error) {
      toast.error(t('order_error'))
      setLoading(false)
      return
    }

    try {
      await fetch('/api/notifications/new-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order_number: number,
          customer_name: form.name,
          customer_email: form.email,
          customer_phone: form.phone,
          address: form.street,
          city: form.city,
          district: form.district,
          total_price: total,
          notes: form.notes,
          items: items.map(i => ({
            product_name: i.product.name_tr,
            quantity: i.quantity,
            unit_price: i.product.price,
          })),
        }),
      })
    } catch {
      // notification errors don't affect the order
    }

    clearCart()
    setOrderNumber(number)
    setLoading(false)
  }

  if (orderNumber) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-slate-900 mb-3">{t('success_title')}</h1>
        <p className="text-slate-600 mb-2">{t('success_message', { orderNumber })}</p>
        <p className="text-2xl font-mono font-bold text-indigo-600 mb-8">{orderNumber}</p>
        <Link href={`/${locale}/products`}>
          <Button className="bg-indigo-600 hover:bg-indigo-700">{t('continue_shopping')}</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-xl font-bold text-slate-900 mb-3">{t('title')}</h1>

      {/* Trust banner */}
      <div className="flex items-center gap-3 bg-green-50 border border-green-100 rounded-xl px-4 py-2.5 mb-6">
        <div className="w-7 h-7 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
          <Shield className="h-3.5 w-3.5 text-green-600" />
        </div>
        <p className="text-sm text-green-700 font-medium">{t('trust_ssl')}</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col lg:flex-row gap-8">
        {/* Form */}
        <div className="flex-1 flex flex-col gap-6">
          <Card>
            <CardHeader><CardTitle className="text-base">{t('personal_info')}</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5 sm:col-span-2">
                <Label>{t('name')} *</Label>
                <Input value={form.name} onChange={e => update('name', e.target.value)} required />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>{t('email')} *</Label>
                <Input type="email" value={form.email} onChange={e => update('email', e.target.value)} required />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>{t('phone')} *</Label>
                <Input type="tel" value={form.phone} onChange={e => update('phone', e.target.value)} required placeholder="05xx xxx xx xx" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">{t('delivery_address')}</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5 sm:col-span-2">
                <Label>{t('address')} *</Label>
                <Textarea value={form.street} onChange={e => update('street', e.target.value)} required rows={2} placeholder="Mahalle, cadde, sokak, kapı no..." />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>{t('district')} *</Label>
                <Input value={form.district} onChange={e => update('district', e.target.value)} required />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>{t('city')} *</Label>
                <Input value={form.city} onChange={e => update('city', e.target.value)} required />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>{t('zip')}</Label>
                <Input value={form.zip} onChange={e => update('zip', e.target.value)} placeholder="34000" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">{t('notes')}</CardTitle></CardHeader>
            <CardContent>
              <Textarea value={form.notes} onChange={e => update('notes', e.target.value)} rows={3} />
            </CardContent>
          </Card>
        </div>

        {/* Order summary */}
        <div className="lg:w-80">
          <Card className="sticky top-24">
            <CardHeader><CardTitle className="text-base">{t('order_summary')}</CardTitle></CardHeader>
            <CardContent className="flex flex-col gap-3">
              {items.map(item => (
                <div key={`${item.product.id}-${JSON.stringify(item.selectedVariants)}`} className="flex justify-between text-sm">
                  <span className="text-slate-600">{item.product.name_tr} × {item.quantity}</span>
                  <span className="font-medium">{formatPrice(item.product.price * item.quantity)}</span>
                </div>
              ))}
              <div className="border-t border-slate-100 pt-3 flex justify-between font-bold">
                <span>{t('total')}</span>
                <span className="text-indigo-600">{formatPrice(total)}</span>
              </div>
              <Button type="submit" disabled={loading} className="w-full bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] mt-2">
                {loading ? t('processing') : t('submit')}
              </Button>
              <p className="text-xs text-slate-400 text-center">{t('payment_info')}</p>
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  )
}
