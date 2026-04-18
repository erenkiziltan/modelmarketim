'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Product } from '@/types'
import { formatPrice } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Plus, Pencil, Trash2, Eye, EyeOff } from 'lucide-react'
import { toast } from 'sonner'

export default function AdminProductList({ products }: { products: (Product & { product_images?: { url: string; is_cover: boolean }[] })[] }) {
  const router = useRouter()
  const [deleting, setDeleting] = useState<string | null>(null)

  async function handleDelete(id: string, name: string) {
    if (!confirm(`"${name}" ürününü silmek istediğinize emin misiniz?`)) return
    setDeleting(id)
    const supabase = createClient()
    const { error } = await supabase.from('products').delete().eq('id', id)
    if (error) {
      toast.error('Silme işlemi başarısız.')
    } else {
      toast.success('Ürün silindi.')
      router.refresh()
    }
    setDeleting(null)
  }

  async function toggleActive(id: string, current: boolean) {
    const supabase = createClient()
    const { error } = await supabase.from('products').update({ is_active: !current }).eq('id', id)
    if (error) {
      toast.error('Güncelleme başarısız.')
    } else {
      toast.success(current ? 'Ürün gizlendi.' : 'Ürün yayına alındı.')
      router.refresh()
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-zinc-900">Ürünler</h1>
        <Link href="/admin/products/new">
          <Button className="bg-orange-500 hover:bg-orange-600 gap-2">
            <Plus className="h-4 w-4" />
            Yeni Ürün
          </Button>
        </Link>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-16 text-zinc-400">
          <p className="mb-4">Henüz ürün yok.</p>
          <Link href="/admin/products/new">
            <Button className="bg-orange-500 hover:bg-orange-600">İlk Ürünü Ekle</Button>
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-lg border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">Görsel</TableHead>
                <TableHead>Ürün Adı</TableHead>
                <TableHead>Fiyat</TableHead>
                <TableHead>Stok</TableHead>
                <TableHead>Durum</TableHead>
                <TableHead className="text-right">İşlemler</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map(product => {
                const cover = product.product_images?.find(i => i.is_cover) ?? product.product_images?.[0]
                return (
                  <TableRow key={product.id}>
                    <TableCell>
                      {cover ? (
                        <Image
                          src={cover.url}
                          alt={product.name_tr}
                          width={48}
                          height={48}
                          className="rounded object-cover h-12 w-12"
                        />
                      ) : (
                        <div className="h-12 w-12 rounded bg-zinc-100 flex items-center justify-center text-zinc-400 text-xs">
                          Yok
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-zinc-900">{product.name_tr}</div>
                      <div className="text-xs text-zinc-400">{product.name_en}</div>
                    </TableCell>
                    <TableCell className="font-medium">{formatPrice(product.price)}</TableCell>
                    <TableCell>
                      <span className={product.stock <= 3 ? 'text-red-500 font-medium' : ''}>
                        {product.stock}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant={product.is_active ? 'default' : 'secondary'} className={product.is_active ? 'bg-green-500' : ''}>
                        {product.is_active ? 'Yayında' : 'Gizli'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => toggleActive(product.id, product.is_active)}
                          className="p-1.5 text-zinc-400 hover:text-zinc-700 transition-colors"
                          title={product.is_active ? 'Gizle' : 'Yayına Al'}
                        >
                          {product.is_active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                        <Link href={`/admin/products/${product.id}/edit`}>
                          <button className="p-1.5 text-zinc-400 hover:text-blue-600 transition-colors">
                            <Pencil className="h-4 w-4" />
                          </button>
                        </Link>
                        <button
                          onClick={() => handleDelete(product.id, product.name_tr)}
                          disabled={deleting === product.id}
                          className="p-1.5 text-zinc-400 hover:text-red-600 transition-colors disabled:opacity-40"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
