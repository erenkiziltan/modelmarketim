'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { Product, ProductImage, ProductVariant } from '@/types'
import { slugify } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import { Trash2, Plus, Upload, Star, GripVertical } from 'lucide-react'

type Props = {
  product?: Product & { product_images?: ProductImage[]; product_variants?: ProductVariant[] }
}

export default function AdminProductForm({ product }: Props) {
  const router = useRouter()
  const isEdit = !!product
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [loading, setLoading] = useState(false)
  const [uploadingImages, setUploadingImages] = useState(false)

  // Form state
  const [nameTr, setNameTr] = useState(product?.name_tr ?? '')
  const [nameEn, setNameEn] = useState(product?.name_en ?? '')
  const [descTr, setDescTr] = useState(product?.description_tr ?? '')
  const [descEn, setDescEn] = useState(product?.description_en ?? '')
  const [price, setPrice] = useState(product?.price?.toString() ?? '')
  const [stock, setStock] = useState(product?.stock?.toString() ?? '')
  const [isActive, setIsActive] = useState(product?.is_active ?? true)
  const [slug, setSlug] = useState(product?.slug ?? '')

  // Images state
  const [images, setImages] = useState<ProductImage[]>(product?.product_images ?? [])

  // Variants state
  const [variants, setVariants] = useState<Omit<ProductVariant, 'id' | 'product_id' | 'created_at'>[]>(
    product?.product_variants?.map(v => ({
      name_tr: v.name_tr,
      name_en: v.name_en,
      options: v.options,
      price_modifier: v.price_modifier,
    })) ?? []
  )

  function handleNameTrChange(val: string) {
    setNameTr(val)
    if (!isEdit) setSlug(slugify(val))
  }

  async function handleImageUpload(files: FileList) {
    if (!files.length) return
    setUploadingImages(true)
    const supabase = createClient()

    for (const file of Array.from(files)) {
      const ext = file.name.split('.').pop()
      const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(path, file)

      if (uploadError) {
        toast.error(`Yükleme hatası: ${file.name}`)
        continue
      }

      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(path)

      const newImage: ProductImage = {
        id: `temp-${Date.now()}-${Math.random()}`,
        product_id: product?.id ?? '',
        url: publicUrl,
        sort_order: images.length,
        is_cover: images.length === 0,
      }
      setImages(prev => [...prev, newImage])
    }

    setUploadingImages(false)
  }

  async function handleRemoveImage(img: ProductImage) {
    const supabase = createClient()
    // Supabase storage'dan sil
    const path = img.url.split('/product-images/')[1]
    if (path) await supabase.storage.from('product-images').remove([path])

    // DB'den sil (edit modunda)
    if (isEdit && !img.id.startsWith('temp-')) {
      await supabase.from('product_images').delete().eq('id', img.id)
    }

    setImages(prev => {
      const updated = prev.filter(i => i.id !== img.id)
      // Kapak görseli silindiyse ilkini kapak yap
      if (img.is_cover && updated.length > 0) {
        updated[0] = { ...updated[0], is_cover: true }
      }
      return updated
    })
  }

  function setCover(imgId: string) {
    setImages(prev => prev.map(i => ({ ...i, is_cover: i.id === imgId })))
  }

  function addVariant() {
    setVariants(prev => [...prev, { name_tr: '', name_en: '', options: [], price_modifier: 0 }])
  }

  function removeVariant(idx: number) {
    setVariants(prev => prev.filter((_, i) => i !== idx))
  }

  function updateVariant(idx: number, field: string, value: unknown) {
    setVariants(prev => prev.map((v, i) => i === idx ? { ...v, [field]: value } : v))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!nameTr || !nameEn || !price || !stock || !slug) {
      toast.error('Lütfen zorunlu alanları doldurun.')
      return
    }

    setLoading(true)
    const supabase = createClient()

    const productData = {
      slug,
      name_tr: nameTr,
      name_en: nameEn,
      description_tr: descTr,
      description_en: descEn,
      price: parseFloat(price),
      stock: parseInt(stock),
      is_active: isActive,
    }

    let productId = product?.id

    if (isEdit) {
      const { error } = await supabase.from('products').update(productData).eq('id', productId!)
      if (error) { toast.error('Güncelleme hatası: ' + error.message); setLoading(false); return }
    } else {
      const { data, error } = await supabase.from('products').insert(productData).select().single()
      if (error) { toast.error('Kayıt hatası: ' + error.message); setLoading(false); return }
      productId = data.id
    }

    // Yeni görsel kayıtları oluştur (temp olanlar)
    const tempImages = images.filter(i => i.id.startsWith('temp-'))
    if (tempImages.length > 0) {
      await supabase.from('product_images').insert(
        tempImages.map((img, idx) => ({
          product_id: productId,
          url: img.url,
          sort_order: img.sort_order + idx,
          is_cover: img.is_cover,
        }))
      )
    }

    // Mevcut görsel kapak güncellemesi
    const existingImages = images.filter(i => !i.id.startsWith('temp-'))
    for (const img of existingImages) {
      await supabase.from('product_images').update({ is_cover: img.is_cover }).eq('id', img.id)
    }

    // Varyantlar — önce sil, sonra yeniden ekle
    if (isEdit) {
      await supabase.from('product_variants').delete().eq('product_id', productId!)
    }
    if (variants.length > 0) {
      await supabase.from('product_variants').insert(
        variants.map(v => ({ ...v, product_id: productId }))
      )
    }

    toast.success(isEdit ? 'Ürün güncellendi.' : 'Ürün eklendi.')
    router.push('/admin/products')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      {/* Temel bilgiler */}
      <Card>
        <CardHeader><CardTitle>Temel Bilgiler</CardTitle></CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label>Ürün Adı (TR) *</Label>
              <Input value={nameTr} onChange={e => handleNameTrChange(e.target.value)} required />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Ürün Adı (EN) *</Label>
              <Input value={nameEn} onChange={e => setNameEn(e.target.value)} required />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>URL Slug *</Label>
            <Input value={slug} onChange={e => setSlug(e.target.value)} required placeholder="urun-adi" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label>Açıklama (TR)</Label>
              <Textarea value={descTr} onChange={e => setDescTr(e.target.value)} rows={4} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Açıklama (EN)</Label>
              <Textarea value={descEn} onChange={e => setDescEn(e.target.value)} rows={4} />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label>Fiyat (₺) *</Label>
              <Input type="number" min="0" step="0.01" value={price} onChange={e => setPrice(e.target.value)} required />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Stok *</Label>
              <Input type="number" min="0" value={stock} onChange={e => setStock(e.target.value)} required />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Durum</Label>
              <div className="flex items-center gap-2 h-10">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={isActive}
                  onChange={e => setIsActive(e.target.checked)}
                  className="h-4 w-4 accent-orange-500"
                />
                <label htmlFor="isActive" className="text-sm text-zinc-700">Yayında</label>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Görseller */}
      <Card>
        <CardHeader><CardTitle>Görseller</CardTitle></CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div
            className="border-2 border-dashed border-zinc-200 rounded-lg p-8 text-center cursor-pointer hover:border-orange-400 transition-colors"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="h-8 w-8 text-zinc-400 mx-auto mb-2" />
            <p className="text-sm text-zinc-500">Görsel yüklemek için tıklayın</p>
            <p className="text-xs text-zinc-400 mt-1">JPG, PNG, WEBP — max 5MB</p>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              className="hidden"
              onChange={e => e.target.files && handleImageUpload(e.target.files)}
            />
          </div>

          {uploadingImages && <p className="text-sm text-orange-500">Görseller yükleniyor...</p>}

          {images.length > 0 && (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {images.map(img => (
                <div key={img.id} className="relative group rounded-lg overflow-hidden border">
                  <Image src={img.url} alt="" width={120} height={120} className="w-full h-24 object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => setCover(img.id)}
                      className={`p-1.5 rounded-full ${img.is_cover ? 'bg-orange-500 text-white' : 'bg-white text-zinc-700'}`}
                      title="Kapak yap"
                    >
                      <Star className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(img)}
                      className="p-1.5 rounded-full bg-red-500 text-white"
                      title="Sil"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  {img.is_cover && (
                    <span className="absolute top-1 left-1 bg-orange-500 text-white text-xs px-1.5 py-0.5 rounded">
                      Kapak
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Varyantlar */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Varyantlar</CardTitle>
          <Button type="button" variant="outline" size="sm" onClick={addVariant} className="gap-1">
            <Plus className="h-4 w-4" /> Varyant Ekle
          </Button>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {variants.length === 0 && (
            <p className="text-sm text-zinc-400 text-center py-4">Varyant yok. Renk, boyut gibi seçenekler için ekle.</p>
          )}
          {variants.map((v, idx) => (
            <div key={idx} className="border rounded-lg p-4 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-zinc-700">Varyant {idx + 1}</span>
                <button type="button" onClick={() => removeVariant(idx)} className="text-red-400 hover:text-red-600">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <Label className="text-xs">Adı (TR)</Label>
                  <Input value={v.name_tr} onChange={e => updateVariant(idx, 'name_tr', e.target.value)} placeholder="ör: Renk" />
                </div>
                <div className="flex flex-col gap-1">
                  <Label className="text-xs">Adı (EN)</Label>
                  <Input value={v.name_en} onChange={e => updateVariant(idx, 'name_en', e.target.value)} placeholder="e.g.: Color" />
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <Label className="text-xs">Seçenekler (virgülle ayır)</Label>
                <Input
                  value={v.options.join(', ')}
                  onChange={e => updateVariant(idx, 'options', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                  placeholder="ör: Kırmızı, Mavi, Sarı"
                />
              </div>
              <div className="flex flex-col gap-1">
                <Label className="text-xs">Fiyat Farkı (₺)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={v.price_modifier}
                  onChange={e => updateVariant(idx, 'price_modifier', parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button type="submit" disabled={loading} className="bg-orange-500 hover:bg-orange-600">
          {loading ? 'Kaydediliyor...' : isEdit ? 'Güncelle' : 'Ürünü Kaydet'}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          İptal
        </Button>
      </div>
    </form>
  )
}
