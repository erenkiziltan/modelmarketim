import { NextRequest, NextResponse } from 'next/server'
import { sendStatusUpdateEmail } from '@/lib/notifications/email'
import { sendOwnerWhatsApp, buildStatusUpdateMessage } from '@/lib/notifications/whatsapp'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { customer_email, customer_name, order_number, new_status, tracking_number } = body

    await Promise.allSettled([
      sendStatusUpdateEmail({ customer_email, customer_name, order_number, new_status, tracking_number }),
      sendOwnerWhatsApp(buildStatusUpdateMessage({ order_number, customer_name, new_status })),
    ])

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[status-update notification]', err)
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
