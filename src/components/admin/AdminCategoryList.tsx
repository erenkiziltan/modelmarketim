'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Plus, Pencil, Trash2, Check, X, GripVertical } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useRouter } from 'next/navigation'

type Category = {
  id: string
  slug: string
  name_tr: string
  name_en: string
  sort_order: number
  products?: { count: number }[]
}

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's')
    .replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ç/g, 'c')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export default function AdminCategoryList({ categories: initial }: { categories: Category[] }) {
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>(initial)
  const [adding, setAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  // Yeni kategori form state
  const [newTr, setNewTr] = useState('')
  const [newEn, setNewEn] = useState('')
  const [newSlug, setNewSlug] = useState('')

  // Düzenleme form state
  const [editTr, setEditTr] = useState('')
  const [editEn, setEditEn] = useState('')
  const [editSlug, setEditSlug] = useState('')

  const supabase = createClient()

  // --- EKLE ---
  async function handleAdd() {
    if (!newTr.trim() || !newEn.trim()) {
      toast.error('Türkçe ve İngilizce ad zorunludur.')
      return
    }
    const slug = newSlug || slugify(newTr)
    const sort_order = categories.length + 1

    const { data, error } = await supabase
      .from('categories')
      .insert({ slug, name_tr: newTr.trim(), name_en: newEn.trim(), sort_order })
      .select()
      .single()

    if (error) {
      toast.error('Hata: ' + (error.message.includes('unique') ? 'Bu slug zaten var.' : error.message))
      return
    }

    setCategories(prev => [...prev, data])
    setNewTr(''); setNewEn(''); setNewSlug('')
    setAdding(false)
    toast.success('Kategori eklendi.')
    router.refresh()
  }

  // --- DÜZENLE ---
  function startEdit(cat: Category) {
    setEditingId(cat.id)
    setEditTr(cat.name_tr)
    setEditEn(cat.name_en)
    setEditSlug(cat.slug)
  }

  async function handleUpdate(id: string) {
    if (!editTr.trim() || !editEn.trim()) {
      toast.error('Türkçe ve İngilizce ad zorunludur.')
      return
    }

    const { error } = await supabase
      .from('categories')
      .update({ name_tr: editTr.trim(), name_en: editEn.trim(), slug: editSlug.trim() })
      .eq('id', id)

    if (error) {
      toast.error('Hata: ' + error.message)
      return
    }

    setCategories(prev => prev.map(c =>
      c.id === id ? { ...c, name_tr: editTr.trim(), name_en: editEn.trim(), slug: editSlug.trim() } : c
    ))
    setEditingId(null)
    toast.success('Kategori güncellendi.')
    router.refresh()
  }

  // --- SİL ---
  async function handleDelete(id: string, name: string) {
    if (!confirm(`"${name}" kategorisini silmek istediğine emin misin?\nBu kategorideki ürünler kategorisiz kalacak.`)) return

    // Ürünlerin category_id'sini null yap
    await supabase.from('products').update({ category_id: null }).eq('category_id', id)

    const { error } = await supabase.from('categories').delete().eq('id', id)
    if (error) { toast.error('Silinemedi: ' + error.message); return }

    setCategories(prev => prev.filter(c => c.id !== id))
    toast.success('Kategori silindi.')
    router.refresh()
  }

  const productCount = (cat: Category) => cat.products?.[0]?.count ?? 0

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Kategoriler</h1>
          <p className="text-sm text-slate-500 mt-0.5">{categories.length} kategori</p>
        </div>
        {!adding && (
          <Button onClick={() => setAdding(true)} className="bg-indigo-600 hover:bg-indigo-700 gap-2">
            <Plus className="h-4 w-4" /> Yeni Kategori
          </Button>
        )}
      </div>

      {/* Yeni kategori formu */}
      {adding && (
        <div className="bg-white rounded-xl border border-indigo-100 shadow-sm p-5 mb-5">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">Yeni Kategori</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-slate-600">Ad (TR) *</label>
              <Input
                value={newTr}
                onChange={e => { setNewTr(e.target.value); setNewSlug(slugify(e.target.value)) }}
                placeholder="ör: Aksiyon Figürleri"
                autoFocus
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-slate-600">Ad (EN) *</label>
              <Input
                value={newEn}
                onChange={e => setNewEn(e.target.value)}
                placeholder="e.g.: Action Figures"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-slate-600">URL Slug (otomatik)</label>
              <Input
                value={newSlug}
                onChange={e => setNewSlug(e.target.value)}
                placeholder="aksiyon-figurler"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleAdd} className="bg-indigo-600 hover:bg-indigo-700 gap-1.5">
              <Check className="h-4 w-4" /> Kaydet
            </Button>
            <Button variant="outline" onClick={() => { setAdding(false); setNewTr(''); setNewEn(''); setNewSlug('') }}>
              <X className="h-4 w-4 mr-1.5" /> İptal
            </Button>
          </div>
        </div>
      )}

      {/* Kategori listesi */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        {categories.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <p className="text-sm">Henüz kategori yok.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide w-8"></th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Ad (TR)</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Ad (EN)</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Slug</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Ürün</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {categories.map(cat => (
                <tr key={cat.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-5 py-3.5 text-slate-300">
                    <GripVertical className="h-4 w-4" />
                  </td>

                  {editingId === cat.id ? (
                    <>
                      <td className="px-5 py-2.5">
                        <Input value={editTr} onChange={e => setEditTr(e.target.value)} className="h-8 text-sm" autoFocus />
                      </td>
                      <td className="px-5 py-2.5">
                        <Input value={editEn} onChange={e => setEditEn(e.target.value)} className="h-8 text-sm" />
                      </td>
                      <td className="px-5 py-2.5">
                        <Input value={editSlug} onChange={e => setEditSlug(e.target.value)} className="h-8 text-sm" />
                      </td>
                      <td className="px-5 py-3.5 text-slate-400">{productCount(cat)}</td>
                      <td className="px-5 py-2.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleUpdate(cat.id)}
                            className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white transition-colors"
                          >
                            <Check className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="p-1.5 rounded-lg bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-5 py-3.5 font-medium text-slate-800">{cat.name_tr}</td>
                      <td className="px-5 py-3.5 text-slate-500">{cat.name_en}</td>
                      <td className="px-5 py-3.5">
                        <span className="font-mono text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                          {cat.slug}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-500">
                          <span className="w-5 h-5 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs">
                            {productCount(cat)}
                          </span>
                          ürün
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => startEdit(cat)}
                            className="p-1.5 rounded-lg text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(cat.id, cat.name_tr)}
                            className="p-1.5 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <p className="text-xs text-slate-400 mt-4">
        💡 Oluşturduğun kategoriler anında ürünler sayfasında ve ürün ekleme formunda görünür.
      </p>
    </div>
  )
}
