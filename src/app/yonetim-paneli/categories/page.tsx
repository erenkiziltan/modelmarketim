import { createClient } from '@/lib/supabase/server'
import AdminSidebar from '@/components/admin/AdminSidebar'
import AdminCategoryList from '@/components/admin/AdminCategoryList'

export default async function AdminCategoriesPage() {
  const supabase = await createClient()
  const { data: categories } = await supabase
    .from('categories')
    .select('*, products(count)')
    .order('sort_order', { ascending: true })

  return (
    <div className="flex min-h-screen bg-slate-50">
      <AdminSidebar />
      <div className="flex-1 p-8">
        <AdminCategoryList categories={categories ?? []} />
      </div>
    </div>
  )
}
