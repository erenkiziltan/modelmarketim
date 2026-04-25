import { OrderStatus } from '@/types'

export const ORDER_STATUS: Record<OrderStatus, { label: string; cls: string }> = {
  pending:   { label: 'Bekliyor',      cls: 'bg-amber-100 text-amber-700' },
  confirmed: { label: 'Onaylandı',     cls: 'bg-blue-100 text-blue-700' },
  shipped:   { label: 'Kargoda',       cls: 'bg-purple-100 text-purple-700' },
  delivered: { label: 'Teslim Edildi', cls: 'bg-green-100 text-green-700' },
  cancelled: { label: 'İptal',         cls: 'bg-red-100 text-red-700' },
}
