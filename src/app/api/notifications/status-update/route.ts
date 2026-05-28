import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendStatusUpdateEmail, sendOwnerStatusUpdateEmail } from '@/lib/notifications/email'
import { sendOwnerWhatsApp, buildStatusUpdateMessage } from '@/lib/notifications/whatsapp'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { customer_email, customer_name, order_number, new_status, tracking_number } = body

    // Siparişin gerçekten DB'de mevcut olduğunu doğrula
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    const { data: existing } = await supabase
      .from('orders')
      .select('order_number')
      .eq('order_number', order_number)
      .single()

    if (!existing) {
      return NextResponse.json({ ok: false }, { status: 403 })
    }

    await Promise.allSettled([
      sendStatusUpdateEmail({ customer_email, customer_name, order_number, new_status, tracking_number }),
      sendOwnerStatusUpdateEmail({ customer_name, customer_email, order_number, new_status, tracking_number }),
      sendOwnerWhatsApp(buildStatusUpdateMessage({ order_number, customer_name, new_status })),
    ])

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[status-update notification]', err)
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
