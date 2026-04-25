import { createClient } from '@/lib/supabase/server'
import AdminSidebar from '@/components/admin/AdminSidebar'
import { Package, ShoppingBag, AlertTriangle, TrendingUp, Clock } from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import { ORDER_STATUS } from '@/lib/order-status'
import Link from 'next/link'

export default async function AdminDashboard() {
  const supabase = await createClient()

  const [
    { count: totalProducts },
    { count: totalOrders },
    { count: pendingOrders },
    { data: lowStockProducts },
    { data: recentOrders },
  ] = await Promise.all([
    supabase.from('products').select('*', { count: 'exact', head: true }),
    supabase.from('orders').select('*', { count: 'exact', head: true }),
    supabase.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('products').select('id, name_tr, stock').lte('stock', 3).eq('is_active', true),
    supabase.from('orders').select('*').order('created_at', { ascending: false }).limit(5),
  ])

  const stats = [
    {
      title: 'Toplam Ürün',
      value: totalProducts ?? 0,
      icon: Package,
      bg: 'bg-blue-50',
      iconColor: 'text-blue-600',
      border: 'border-blue-100',
    },
    {
      title: 'Toplam Sipariş',
      value: totalOrders ?? 0,
      icon: ShoppingBag,
      bg: 'bg-green-50',
      iconColor: 'text-green-600',
      border: 'border-green-100',
    },
    {
      title: 'Bekleyen Sipariş',
      value: pendingOrders ?? 0,
      icon: Clock,
      bg: 'bg-amber-50',
      iconColor: 'text-amber-600',
      border: 'border-amber-100',
    },
    {
      title: 'Düşük Stok',
      value: lowStockProducts?.length ?? 0,
      icon: AlertTriangle,
      bg: 'bg-red-50',
      iconColor: 'text-red-600',
      border: 'border-red-100',
    },
  ]

  return (
    <div className="flex min-h-screen bg-slate-50">
      <AdminSidebar />
      <div className="flex-1 p-8">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">Mağazanıza genel bakış</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map(stat => {
            const Icon = stat.icon
            return (
              <div key={stat.title} className={`bg-white rounded-2xl border ${stat.border} p-5 flex items-center gap-4 shadow-sm`}>
                <div className={`w-12 h-12 rounded-xl ${stat.bg} flex items-center justify-center flex-shrink-0`}>
                  <Icon className={`h-6 w-6 ${stat.iconColor}`} />
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500">{stat.title}</p>
                  <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                </div>
              </div>
            )
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent orders */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h2 className="text-sm font-semibold text-slate-900">Son Siparişler</h2>
              <Link href="/yonetim-paneli/orders" className="text-xs text-indigo-600 hover:text-indigo-700 font-medium">
                Tümünü Gör →
              </Link>
            </div>
            {!recentOrders || recentOrders.length === 0 ? (
              <div className="px-6 py-10 text-center text-slate-400 text-sm">Henüz sipariş yok.</div>
            ) : (
              <div className="divide-y divide-slate-50">
                {recentOrders.map(order => {
                  const s = ORDER_STATUS[order.status as keyof typeof ORDER_STATUS] ?? { label: order.status, cls: 'bg-slate-100 text-slate-600' }
                  return (
                    <div key={order.id} className="flex items-center justify-between px-6 py-3.5 hover:bg-slate-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div>
                          <p className="text-sm font-medium text-slate-900 font-mono">{order.order_number}</p>
                          <p className="text-xs text-slate-400">{order.customer_name}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-semibold text-slate-700">{formatPrice(order.total_price)}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${s.cls}`}>{s.label}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Low stock */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="flex items-center gap-2 px-6 py-4 border-b border-slate-100">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              <h2 className="text-sm font-semibold text-slate-900">Düşük Stok</h2>
            </div>
            {!lowStockProducts || lowStockProducts.length === 0 ? (
              <div className="px-6 py-10 text-center text-slate-400 text-sm">Tüm ürünler stokta ✓</div>
            ) : (
              <div className="divide-y divide-slate-50">
                {lowStockProducts.map(p => (
                  <div key={p.id} className="flex items-center justify-between px-6 py-3.5">
                    <p className="text-sm text-slate-700 truncate pr-2">{p.name_tr}</p>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${
                      p.stock === 0 ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {p.stock === 0 ? 'Tükendi' : `${p.stock} adet`}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}
