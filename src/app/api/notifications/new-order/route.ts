import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import {
  sendCustomerConfirmationEmail,
  sendOwnerNewOrderEmail,
  type OrderEmailData,
} from '@/lib/notifications/email'
import { sendOwnerWhatsApp, buildNewOrderMessage } from '@/lib/notifications/whatsapp'

export async function POST(req: NextRequest) {
  try {
    const order: OrderEmailData = await req.json()

    // Siparişin gerçekten DB'de mevcut olduğunu doğrula (spam / abuse önleme)
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    const { data: existing } = await supabase
      .from('orders')
      .select('order_number')
      .eq('order_number', order.order_number)
      .single()

    if (!existing) {
      return NextResponse.json({ ok: false }, { status: 403 })
    }

    // Paralel gönder — biri hata verirse diğeri etkilenmesin
    await Promise.allSettled([
      sendCustomerConfirmationEmail(order),
      sendOwnerNewOrderEmail(order),
      sendOwnerWhatsApp(
        buildNewOrderMessage({
          order_number: order.order_number,
          customer_name: order.customer_name,
          customer_phone: order.customer_phone,
          city: order.city,
          district: order.district,
          total_price: order.total_price,
          items: order.items,
        })
      ),
    ])

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[new-order notification]', err)
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
