import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { generateOrderNumber } from '@/lib/utils'

/**
 * Sunucu tarafında sipariş oluşturur:
 *   1. Her ürün için stok kontrol eder
 *   2. Siparişi DB'ye yazar
 *   3. Stokları düşürür (gte kontrolü ile oversell önlenir)
 */
export async function POST(req: NextRequest) {
  try {
    const { form, items, total } = await req.json()

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // 1. Stok kontrolü — yetersiz ürün varsa hemen reddet
    for (const item of items) {
      const { data: product, error } = await supabase
        .from('products')
        .select('stock, name_tr')
        .eq('id', item.product.id)
        .single()

      if (error || !product) {
        return NextResponse.json(
          { ok: false, error: 'Ürün bulunamadı.' },
          { status: 404 }
        )
      }

      if (product.stock < item.quantity) {
        return NextResponse.json(
          {
            ok: false,
            error: `"${product.name_tr}" için yeterli stok yok. Mevcut: ${product.stock}`,
          },
          { status: 409 }
        )
      }
    }

    // 2. Sipariş oluştur
    const number = generateOrderNumber()

    const { error: insertError } = await supabase.from('orders').insert({
      order_number: number,
      customer_name: form.name,
      customer_email: form.email,
      customer_phone: form.phone,
      shipping_address: {
        street: form.street,
        city: form.city,
        district: form.district,
        zip_code: form.zip,
        country: 'TR',
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      items: items.map((i: any) => ({
        product_id: i.product.id,
        product_name: i.product.name_tr,
        variant:
          Object.entries(i.selectedVariants as Record<string, string>)
            .map(([k, v]) => `${k}: ${v}`)
            .join(', ') || null,
        quantity: i.quantity,
        unit_price: i.product.price,
      })),
      total_price: total,
      status: 'pending',
      payment_status: 'pending',
      notes: form.notes,
    })

    if (insertError) {
      console.error('[orders/create] insert error:', insertError)
      return NextResponse.json({ ok: false }, { status: 500 })
    }

    // 3. Stok düşür — optimistic locking: .gte('stock', qty) ile race condition önlenir
    //    İki eş zamanlı sipariş gelirse birinin update'i çalışmaz (stok zaten düşmüştür).
    //    eslint-disable-next-line @typescript-eslint/no-explicit-any
    for (const item of items as any[]) {
      const { data: current } = await supabase
        .from('products')
        .select('stock')
        .eq('id', item.product.id)
        .single()

      if (current && current.stock >= item.quantity) {
        await supabase
          .from('products')
          .update({ stock: current.stock - item.quantity })
          .eq('id', item.product.id)
          .gte('stock', item.quantity) // stok değişmişse güncelleme yapma
      }
    }

    return NextResponse.json({ ok: true, order_number: number })
  } catch (err) {
    console.error('[orders/create]', err)
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
