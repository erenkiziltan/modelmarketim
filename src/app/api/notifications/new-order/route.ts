import { NextRequest, NextResponse } from 'next/server'
import {
  sendCustomerConfirmationEmail,
  sendOwnerNewOrderEmail,
  type OrderEmailData,
} from '@/lib/notifications/email'
import { sendOwnerWhatsApp, buildNewOrderMessage } from '@/lib/notifications/whatsapp'

export async function POST(req: NextRequest) {
  try {
    const order: OrderEmailData = await req.json()

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
