import { createClient } from '@/lib/supabase/server'
import AdminSidebar from '@/components/admin/AdminSidebar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Package, ShoppingBag, AlertTriangle, TrendingUp } from 'lucide-react'

export default async function AdminDashboard() {
  const supabase = await createClient()

  const [
    { count: totalProducts },
    { count: totalOrders },
    { count: pendingOrders },
    { data: lowStockProducts },
  ] = await Promise.all([
    supabase.from('products').select('*', { count: 'exact', head: true }),
    supabase.from('orders').select('*', { count: 'exact', head: true }),
    supabase.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('products').select('id, name_tr, stock').lte('stock', 3).eq('is_active', true),
  ])

  const stats = [
    { title: 'Toplam Ürün', value: totalProducts ?? 0, icon: Package, color: 'text-blue-500' },
    { title: 'Toplam Sipariş', value: totalOrders ?? 0, icon: ShoppingBag, color: 'text-green-500' },
    { title: 'Bekleyen Sipariş', value: pendingOrders ?? 0, icon: TrendingUp, color: 'text-orange-500' },
    { title: 'Düşük Stok', value: lowStockProducts?.length ?? 0, icon: AlertTriangle, color: 'text-red-500' },
  ]

  return (
    <div className="flex min-h-screen bg-zinc-50">
      <AdminSidebar />
      <div className="flex-1 p-8">
        <h1 className="text-2xl font-bold text-zinc-900 mb-8">Dashboard</h1>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map(stat => {
            const Icon = stat.icon
            return (
              <Card key={stat.title}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-zinc-500">{stat.title}</CardTitle>
                </CardHeader>
                <CardContent className="flex items-center justify-between">
                  <span className="text-3xl font-bold text-zinc-900">{stat.value}</span>
                  <Icon className={`h-8 w-8 ${stat.color}`} />
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Low stock warning */}
        {lowStockProducts && lowStockProducts.length > 0 && (
          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-red-700 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Düşük Stok Uyarısı
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="flex flex-col gap-1">
                {lowStockProducts.map(p => (
                  <li key={p.id} className="text-sm text-red-600">
                    {p.name_tr} — <strong>{p.stock} adet</strong>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
