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
import { Plus, Pencil, Trash2, Eye, EyeOff, Package } from 'lucide-react'
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
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Ürünler</h1>
          <p className="text-sm text-slate-500 mt-1">{products.length} ürün</p>
        </div>
        <Link href="/yonetim-paneli/products/new">
          <Button className="bg-indigo-600 hover:bg-indigo-700 gap-2 rounded-xl shadow-sm shadow-indigo-200">
            <Plus className="h-4 w-4" />
            Yeni Ürün
          </Button>
        </Link>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-20 text-slate-400">
          <Package className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p className="mb-4">Henüz ürün yok.</p>
          <Link href="/yonetim-paneli/products/new">
            <Button className="bg-indigo-600 hover:bg-indigo-700">İlk Ürünü Ekle</Button>
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead className="w-16 font-semibold text-slate-600">Görsel</TableHead>
                <TableHead className="font-semibold text-slate-600">Ürün Adı</TableHead>
                <TableHead className="font-semibold text-slate-600">Fiyat</TableHead>
                <TableHead className="font-semibold text-slate-600">Stok</TableHead>
                <TableHead className="font-semibold text-slate-600">Durum</TableHead>
                <TableHead className="text-right font-semibold text-slate-600">İşlemler</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map(product => {
                const cover = product.product_images?.find(i => i.is_cover) ?? product.product_images?.[0]
                return (
                  <TableRow key={product.id} className="hover:bg-slate-50 transition-colors">
                    <TableCell>
                      {cover ? (
                        <Image
                          src={cover.url}
                          alt={product.name_tr}
                          width={48}
                          height={48}
                          className="rounded-lg object-cover h-12 w-12"
                        />
                      ) : (
                        <div className="h-12 w-12 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 text-xs">
                          Yok
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-slate-900">{product.name_tr}</div>
                      <div className="text-xs text-slate-400">{product.name_en}</div>
                    </TableCell>
                    <TableCell className="font-semibold text-slate-900">{formatPrice(product.price)}</TableCell>
                    <TableCell>
                      <span className={`font-medium text-sm ${
                        product.stock === 0
                          ? 'text-red-600'
                          : product.stock <= 3
                            ? 'text-amber-600'
                            : 'text-slate-700'
                      }`}>
                        {product.stock}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={product.is_active ? 'default' : 'secondary'}
                        className={product.is_active
                          ? 'bg-green-100 text-green-700 hover:bg-green-100'
                          : 'bg-slate-100 text-slate-600'
                        }
                      >
                        {product.is_active ? 'Yayında' : 'Gizli'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => toggleActive(product.id, product.is_active)}
                          className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                          title={product.is_active ? 'Gizle' : 'Yayına Al'}
                        >
                          {product.is_active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                        <Link href={`/yonetim-paneli/products/${product.id}/edit`}>
                          <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                            <Pencil className="h-4 w-4" />
                          </button>
                        </Link>
                        <button
                          onClick={() => handleDelete(product.id, product.name_tr)}
                          disabled={deleting === product.id}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-40"
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
