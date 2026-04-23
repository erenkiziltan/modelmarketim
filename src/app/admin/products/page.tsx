import { createClient } from '@/lib/supabase/server'
import AdminSidebar from '@/components/admin/AdminSidebar'
import AdminProductList from '@/components/admin/AdminProductList'

export default async function AdminProducts() {
  const supabase = await createClient()
  const { data: products } = await supabase
    .from('products')
    .select('*, product_images(url, is_cover)')
    .order('created_at', { ascending: false })

  return (
    <div className="flex min-h-screen bg-slate-50">
      <AdminSidebar />
      <div className="flex-1 p-8">
        <AdminProductList products={products ?? []} />
      </div>
    </div>
  )
}
