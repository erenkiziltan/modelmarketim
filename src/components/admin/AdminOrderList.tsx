'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Order, OrderStatus } from '@/types'
import { formatPrice } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { toast } from 'sonner'

const statusLabels: Record<OrderStatus, string> = {
  pending: 'Bekliyor',
  confirmed: 'Onaylandı',
  shipped: 'Kargoda',
  delivered: 'Teslim Edildi',
  cancelled: 'İptal',
}

const statusColors: Record<OrderStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-blue-100 text-blue-700',
  shipped: 'bg-purple-100 text-purple-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
}

export default function AdminOrderList({ orders }: { orders: Order[] }) {
  const router = useRouter()
  const [selected, setSelected] = useState<Order | null>(null)

  async function handleStatusChange(orderId: string, status: OrderStatus) {
    const supabase = createClient()
    const { error } = await supabase.from('orders').update({ status }).eq('id', orderId)
    if (error) { toast.error('Güncelleme başarısız.'); return }
    toast.success('Sipariş durumu güncellendi.')
    router.refresh()
    if (selected?.id === orderId) setSelected(prev => prev ? { ...prev, status } : null)
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-zinc-900 mb-6">Siparişler</h1>

      {orders.length === 0 ? (
        <p className="text-center py-16 text-zinc-400">Henüz sipariş yok.</p>
      ) : (
        <div className="bg-white rounded-lg border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Sipariş No</TableHead>
                <TableHead>Müşteri</TableHead>
                <TableHead>Tarih</TableHead>
                <TableHead>Toplam</TableHead>
                <TableHead>Durum</TableHead>
                <TableHead>İşlem</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map(order => (
                <TableRow key={order.id} className="cursor-pointer hover:bg-zinc-50" onClick={() => setSelected(order)}>
                  <TableCell className="font-mono text-sm font-medium">{order.order_number}</TableCell>
                  <TableCell>
                    <div className="font-medium text-sm">{order.customer_name}</div>
                    <div className="text-xs text-zinc-400">{order.customer_email}</div>
                  </TableCell>
                  <TableCell className="text-sm text-zinc-500">
                    {new Date(order.created_at).toLocaleDateString('tr-TR')}
                  </TableCell>
                  <TableCell className="font-medium">{formatPrice(order.total_price)}</TableCell>
                  <TableCell onClick={e => e.stopPropagation()}>
                    <Select
                      value={order.status}
                      onValueChange={val => handleStatusChange(order.id, val as OrderStatus)}
                    >
                      <SelectTrigger className="w-36 h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(statusLabels).map(([val, label]) => (
                          <SelectItem key={val} value={val} className="text-xs">{label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <button
                      className="text-xs text-blue-600 hover:underline"
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
      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Sipariş: {selected?.order_number}</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="flex flex-col gap-4 text-sm">
              <div className="grid grid-cols-2 gap-2">
                <div><span className="text-zinc-500">Müşteri:</span> {selected.customer_name}</div>
                <div><span className="text-zinc-500">Telefon:</span> {selected.customer_phone}</div>
                <div className="col-span-2"><span className="text-zinc-500">E-posta:</span> {selected.customer_email}</div>
              </div>
              <div className="border rounded p-3 bg-zinc-50">
                <p className="text-zinc-500 text-xs mb-1 font-medium">TESLİMAT ADRESİ</p>
                <p>{selected.shipping_address.street}</p>
                <p>{selected.shipping_address.district} / {selected.shipping_address.city}</p>
                <p>{selected.shipping_address.zip_code}</p>
              </div>
              <div>
                <p className="text-zinc-500 text-xs font-medium mb-2">ÜRÜNLER</p>
                <div className="flex flex-col gap-1">
                  {selected.items.map((item, i) => (
                    <div key={i} className="flex justify-between">
                      <span>{item.product_name} {item.variant ? `(${item.variant})` : ''} × {item.quantity}</span>
                      <span className="font-medium">{formatPrice(item.unit_price * item.quantity)}</span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between font-bold mt-2 pt-2 border-t">
                  <span>Toplam</span>
                  <span>{formatPrice(selected.total_price)}</span>
                </div>
              </div>
              {selected.notes && (
                <div className="text-zinc-500 text-xs">
                  <span className="font-medium">Not:</span> {selected.notes}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
