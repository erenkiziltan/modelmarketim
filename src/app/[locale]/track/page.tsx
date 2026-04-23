'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Order, OrderStatus } from '@/types'
import { formatPrice } from '@/lib/utils'
import { Search, Package, Truck, CheckCircle, Clock, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const statusSteps: { key: OrderStatus; label: string; icon: React.ElementType }[] = [
  { key: 'pending', label: 'Sipariş Alındı', icon: Clock },
  { key: 'confirmed', label: 'Onaylandı', icon: CheckCircle },
  { key: 'shipped', label: 'Kargoya Verildi', icon: Truck },
  { key: 'delivered', label: 'Teslim Edildi', icon: Package },
]

const statusIndex: Record<string, number> = {
  pending: 0, confirmed: 1, shipped: 2, delivered: 3, cancelled: -1,
}

export default function TrackPage() {
  const [orderNumber, setOrderNumber] = useState('')
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (!orderNumber.trim()) return
    setLoading(true)
    setError('')
    setOrder(null)

    const supabase = createClient()
    const { data } = await supabase
      .from('orders')
      .select('*')
      .eq('order_number', orderNumber.trim().toUpperCase())
      .single()

    if (!data) {
      setError('Sipariş bulunamadı. Sipariş numaranızı kontrol edin.')
    } else {
      setOrder(data as Order)
    }
    setLoading(false)
  }

  const currentStep = order ? statusIndex[order.status] : -1
  const isCancelled = order?.status === 'cancelled'

  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      {/* Header */}
      <div className="text-center mb-10">
        <p className="text-xs font-semibold uppercase tracking-widest text-indigo-600 mb-2">Sipariş Takip</p>
        <h1 className="text-3xl font-bold text-slate-900 mb-3">Siparişini Takip Et</h1>
        <p className="text-slate-500 text-sm">Sipariş numaranı girerek durumunu öğren.</p>
      </div>

      {/* Search form */}
      <form onSubmit={handleSearch} className="flex gap-2 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            value={orderNumber}
            onChange={e => setOrderNumber(e.target.value)}
            placeholder="PF260418XXXX"
            className="pl-10 h-12 rounded-xl border-slate-200 font-mono text-sm"
          />
        </div>
        <Button
          type="submit"
          disabled={loading}
          className="h-12 px-6 bg-indigo-600 hover:bg-indigo-700 rounded-xl"
        >
          {loading ? 'Aranıyor...' : 'Sorgula'}
        </Button>
      </form>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-100 rounded-2xl p-4 text-center">
          <XCircle className="h-8 w-8 text-red-400 mx-auto mb-2" />
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Order result */}
      {order && (
        <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
          {/* Order header */}
          <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 mb-0.5">Sipariş Numarası</p>
              <p className="font-mono font-bold text-slate-900">{order.order_number}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-500 mb-0.5">Tarih</p>
              <p className="text-sm font-medium text-slate-700">
                {new Date(order.created_at).toLocaleDateString('tr-TR')}
              </p>
            </div>
          </div>

          {/* Status tracker */}
          <div className="px-6 py-8">
            {isCancelled ? (
              <div className="text-center py-4">
                <XCircle className="h-12 w-12 text-red-400 mx-auto mb-2" />
                <p className="font-semibold text-red-600">Sipariş İptal Edildi</p>
              </div>
            ) : (
              <div className="relative">
                {/* Progress line */}
                <div className="absolute top-5 left-0 right-0 h-0.5 bg-slate-100 mx-10" />
                <div
                  className="absolute top-5 left-0 h-0.5 bg-indigo-600 mx-10 transition-all duration-700"
                  style={{ width: `${(currentStep / 3) * 100}%` }}
                />

                <div className="relative flex justify-between">
                  {statusSteps.map((step, idx) => {
                    const Icon = step.icon
                    const done = idx <= currentStep
                    const active = idx === currentStep
                    return (
                      <div key={step.key} className="flex flex-col items-center gap-2 w-1/4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center z-10 transition-all ${
                          done
                            ? active
                              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200'
                              : 'bg-indigo-100 text-indigo-600'
                            : 'bg-slate-100 text-slate-300'
                        }`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <p className={`text-xs font-medium text-center leading-tight ${done ? 'text-slate-700' : 'text-slate-300'}`}>
                          {step.label}
                        </p>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Customer info */}
          <div className="px-6 pb-6 grid grid-cols-2 gap-4 border-t border-slate-100 pt-4">
            <div>
              <p className="text-xs text-slate-400 mb-0.5">Müşteri</p>
              <p className="text-sm font-medium text-slate-900">{order.customer_name}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 mb-0.5">Toplam</p>
              <p className="text-sm font-bold text-indigo-600">{formatPrice(order.total_price)}</p>
            </div>
            <div className="col-span-2">
              <p className="text-xs text-slate-400 mb-0.5">Teslimat Adresi</p>
              <p className="text-sm text-slate-700">
                {order.shipping_address.district} / {order.shipping_address.city}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
