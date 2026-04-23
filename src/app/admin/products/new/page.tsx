import AdminSidebar from '@/components/admin/AdminSidebar'
import AdminProductForm from '@/components/admin/AdminProductForm'

export default function NewProduct() {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <AdminSidebar />
      <div className="flex-1 p-8 max-w-3xl">
        <h1 className="text-2xl font-bold text-slate-900 mb-8">Yeni Ürün Ekle</h1>
        <AdminProductForm />
      </div>
    </div>
  )
}
