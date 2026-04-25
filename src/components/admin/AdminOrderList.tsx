'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Order, OrderStatus } from '@/types'
import { formatPrice } from '@/lib/utils'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { MapPin, Phone, Mail, Package, StickyNote } from 'lucide-react'
import { ORDER_STATUS } from '@/lib/order-status'

export default function AdminOrderList({ orders }: { orders: Order[] }) {
  const router = useRouter()
  const [selected, setSelected] = useState<Order | null>(null)
  const [trackingNumber, setTrackingNumber] = useState('')

  async function handleStatusChange(order: Order, status: OrderStatus) {
    const supabase = createClient()
    const { error } = await supabase.from('orders').update({ status }).eq('id', order.id)
    if (error) { toast.error('Güncelleme başarısız.'); return }

    toast.success('Sipariş durumu güncellendi.')
    router.refresh()
    if (selected?.id === order.id) setSelected(prev => prev ? { ...prev, status } : null)

    // Müşteriye ve sahibine bildirim gönder
    try {
      await fetch('/api/notifications/status-update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_email: order.customer_email,
          customer_name: order.customer_name,
          order_number: order.order_number,
          new_status: status,
          tracking_number: status === 'shipped' ? trackingNumber || undefined : undefined,
        }),
      })
    } catch {
      // bildirim hatası kritik değil
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Siparişler</h1>
        <p className="text-sm text-slate-500 mt-1">{orders.length} sipariş</p>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-20 text-slate-400">
          <Package className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p>Henüz sipariş yok.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead className="font-semibold text-slate-600">Sipariş No</TableHead>
                <TableHead className="font-semibold text-slate-600">Müşteri</TableHead>
                <TableHead className="font-semibold text-slate-600">Tarih</TableHead>
                <TableHead className="font-semibold text-slate-600">Toplam</TableHead>
                <TableHead className="font-semibold text-slate-600">Durum</TableHead>
                <TableHead className="font-semibold text-slate-600">İşlem</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map(order => (
                <TableRow
                  key={order.id}
                  className="cursor-pointer hover:bg-slate-50 transition-colors"
                  onClick={() => setSelected(order)}
                >
                  <TableCell className="font-mono text-sm font-semibold text-indigo-600">
                    {order.order_number}
                  </TableCell>
                  <TableCell>
                    <div className="font-medium text-sm text-slate-900">{order.customer_name}</div>
                    <div className="text-xs text-slate-400">{order.customer_email}</div>
                  </TableCell>
                  <TableCell className="text-sm text-slate-500">
                    {new Date(order.created_at).toLocaleDateString('tr-TR')}
                  </TableCell>
                  <TableCell className="font-semibold text-slate-900">
                    {formatPrice(order.total_price)}
                  </TableCell>
                  <TableCell onClick={e => e.stopPropagation()}>
                    <Select
                      value={order.status}
                      onValueChange={val => handleStatusChange(order, val as OrderStatus)}
                    >
                      <SelectTrigger className="w-36 h-8 text-xs border-slate-200">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(ORDER_STATUS).map(([val, { label }]) => (
                          <SelectItem key={val} value={val} className="text-xs">{label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <button
                      className="text-xs text-indigo-600 hover:text-indigo-700 font-medium"
                      onClick={e => { e.stopPropagation(); setSelected(order) }}
                    >
                      Detay
                    </button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Order detail dialog */}
      <Dialog open={!!selected} onOpenChange={() => { setSelected(null); setTrackingNumber('') }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span className="font-mono text-indigo-600">{selected?.order_number}</span>
              {selected && (
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${ORDER_STATUS[selected.status].cls}`}>
                  {ORDER_STATUS[selected.status].label}
                </span>
              )}
            </DialogTitle>
          </DialogHeader>

          {selected && (
            <div className="flex flex-col gap-4 text-sm">
              {/* Customer info */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-start gap-2">
                  <Phone className="h-3.5 w-3.5 text-slate-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-slate-400">Telefon</p>
                    <p className="font-medium text-slate-900">{selected.customer_phone}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Mail className="h-3.5 w-3.5 text-slate-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-slate-400">E-posta</p>
                    <p className="font-medium text-slate-900 text-xs">{selected.customer_email}</p>
                  </div>
                </div>
              </div>

              {/* Address */}
              <div className="flex items-start gap-2 bg-slate-50 rounded-xl p-3">
                <MapPin className="h-3.5 w-3.5 text-slate-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-slate-400 mb-0.5 font-medium uppercase tracking-wide">Teslimat Adresi</p>
                  <p className="text-slate-700">{selected.shipping_address.street}</p>
                  <p className="text-slate-700">{selected.shipping_address.district} / {selected.shipping_address.city}</p>
                  {selected.shipping_address.zip_code && (
                    <p className="text-slate-500 text-xs">{selected.shipping_address.zip_code}</p>
                  )}
                </div>
              </div>

              {/* Items */}
              <div>
                <p className="text-xs text-slate-400 font-medium uppercase tracking-wide mb-2">Ürünler</p>
                <div className="flex flex-col gap-1.5">
                  {selected.items.map((item, i) => (
                    <div key={i} className="flex justify-between items-center py-1.5 border-b border-slate-50 last:border-0">
                      <span className="text-slate-700">
                        {item.product_name}
                        {item.variant && <span className="text-slate-400 text-xs ml-1">({item.variant})</span>}
                        <span className="text-slate-400 text-xs ml-1">× {item.quantity}</span>
                      </span>
                      <span className="font-semibold text-slate-900">{formatPrice(item.unit_price * item.quantity)}</span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between font-bold mt-3 pt-2 border-t border-slate-100">
                  <span className="text-slate-700">Toplam</span>
                  <span className="text-indigo-600">{formatPrice(selected.total_price)}</span>
                </div>
              </div>

              {/* Notes */}
              {selected.notes && (
                <div className="flex items-start gap-2 bg-amber-50 rounded-xl p-3">
                  <StickyNote className="h-3.5 w-3.5 text-amber-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-amber-600 font-medium mb-0.5">Sipariş Notu</p>
                    <p className="text-slate-700">{selected.notes}</p>
                  </div>
                </div>
              )}

              {/* Tracking number for shipped */}
              <div>
                <Label className="text-xs text-slate-500 font-medium uppercase tracking-wide">
                  Kargo Takip No (kargoya verirken girin)
                </Label>
                <Input
                  className="mt-1.5 h-9 text-sm border-slate-200"
                  placeholder="Ör: 1234567890"
                  value={trackingNumber}
                  onChange={e => setTrackingNumber(e.target.value)}
                />
              </div>

              {/* Status change */}
              <div>
                <Label className="text-xs text-slate-500 font-medium uppercase tracking-wide">
                  Durumu Güncelle
                </Label>
                <Select
                  value={selected.status}
                  onValueChange={val => handleStatusChange(selected, val as OrderStatus)}
                >
                  <SelectTrigger className="mt-1.5 h-9 border-slate-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(ORDER_STATUS).map(([val, { label }]) => (
                      <SelectItem key={val} value={val}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
