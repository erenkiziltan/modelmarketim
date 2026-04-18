import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import AdminSidebar from '@/components/admin/AdminSidebar'
import AdminProductForm from '@/components/admin/AdminProductForm'

export default async function EditProduct({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: product } = await supabase
    .from('products')
    .select('*, product_images(*), product_variants(*)')
    .eq('id', id)
    .single()

  if (!product) notFound()

  return (
    <div className="flex min-h-screen bg-zinc-50">
      <AdminSidebar />
      <div className="flex-1 p-8 max-w-3xl">
        <h1 className="text-2xl font-bold text-zinc-900 mb-8">Ürünü Düzenle</h1>
        <AdminProductForm product={product} />
      </div>
    </div>
  )
}
