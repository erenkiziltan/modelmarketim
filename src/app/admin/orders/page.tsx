import { createClient } from '@/lib/supabase/server'
import AdminSidebar from '@/components/admin/AdminSidebar'
import AdminOrderList from '@/components/admin/AdminOrderList'

export default async function AdminOrders() {
  const supabase = await createClient()
  const { data: orders } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="flex min-h-screen bg-slate-50">
      <AdminSidebar />
      <div className="flex-1 p-8">
        <AdminOrderList orders={orders ?? []} />
      </div>
    </div>
  )
}
