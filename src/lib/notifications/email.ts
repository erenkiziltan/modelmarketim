import { Resend } from 'resend'

// Lazy init — build sırasında env var olmadığında hata vermez
function getResend() {
  return new Resend(process.env.RESEND_API_KEY ?? 'placeholder')
}

export interface OrderItem {
  product_name: string
  quantity: number
  unit_price: number
}

export interface OrderEmailData {
  order_number: string
  customer_name: string
  customer_email: string
  customer_phone: string
  city: string
  district: string
  address: string
  total_price: number
  items: OrderItem[]
  notes?: string
}

function formatPrice(price: number) {
  return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(price)
}

/** Sipariş alındığında müşteriye onay maili */
export async function sendCustomerConfirmationEmail(order: OrderEmailData) {
  const itemsHtml = order.items
    .map(
      i => `<tr>
        <td style="padding:8px 12px;border-bottom:1px solid #f1f5f9;">${i.product_name}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #f1f5f9;text-align:center;">${i.quantity}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #f1f5f9;text-align:right;">${formatPrice(i.unit_price * i.quantity)}</td>
      </tr>`
    )
    .join('')

  await getResend().emails.send({
    from: 'PolyForge <onboarding@resend.dev>',
    to: order.customer_email,
    subject: `Siparişiniz Alındı – ${order.order_number}`,
    html: `
      <!DOCTYPE html>
      <html lang="tr">
      <body style="margin:0;padding:0;background:#f8fafc;font-family:'Segoe UI',sans-serif;">
        <div style="max-width:560px;margin:40px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.06);">
          <!-- Header -->
          <div style="background:linear-gradient(135deg,#4f46e5,#7c3aed);padding:32px 40px;text-align:center;">
            <h1 style="color:#fff;margin:0;font-size:24px;font-weight:700;letter-spacing:-0.5px;">PolyForge</h1>
            <p style="color:#c7d2fe;margin:8px 0 0;font-size:13px;">3D Baskı Figürler</p>
          </div>
          <!-- Body -->
          <div style="padding:32px 40px;">
            <h2 style="color:#1e293b;font-size:18px;margin:0 0 8px;">Siparişiniz alındı 🎉</h2>
            <p style="color:#64748b;font-size:14px;margin:0 0 24px;">Merhaba <strong>${order.customer_name}</strong>, siparişiniz başarıyla oluşturuldu. En kısa sürede hazırlanıp kargoya verilecektir.</p>

            <!-- Order number -->
            <div style="background:#f1f5f9;border-radius:10px;padding:16px 20px;margin-bottom:24px;text-align:center;">
              <p style="margin:0;font-size:12px;color:#64748b;text-transform:uppercase;letter-spacing:1px;">Sipariş Numaranız</p>
              <p style="margin:6px 0 0;font-size:22px;font-weight:700;color:#4f46e5;font-family:monospace;">${order.order_number}</p>
            </div>

            <!-- Items table -->
            <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin-bottom:24px;">
              <thead>
                <tr style="background:#f8fafc;">
                  <th style="padding:10px 12px;text-align:left;font-size:12px;color:#64748b;font-weight:600;text-transform:uppercase;letter-spacing:.5px;">Ürün</th>
                  <th style="padding:10px 12px;text-align:center;font-size:12px;color:#64748b;font-weight:600;text-transform:uppercase;letter-spacing:.5px;">Adet</th>
                  <th style="padding:10px 12px;text-align:right;font-size:12px;color:#64748b;font-weight:600;text-transform:uppercase;letter-spacing:.5px;">Tutar</th>
                </tr>
              </thead>
              <tbody>${itemsHtml}</tbody>
              <tfoot>
                <tr>
                  <td colspan="2" style="padding:12px;font-weight:700;color:#1e293b;">Toplam</td>
                  <td style="padding:12px;font-weight:700;color:#4f46e5;text-align:right;">${formatPrice(order.total_price)}</td>
                </tr>
              </tfoot>
            </table>

            <!-- Delivery -->
            <div style="border:1px solid #e2e8f0;border-radius:10px;padding:16px 20px;margin-bottom:24px;">
              <p style="margin:0 0 8px;font-size:13px;font-weight:600;color:#1e293b;">Teslimat Adresi</p>
              <p style="margin:0;font-size:13px;color:#64748b;line-height:1.6;">${order.address}<br>${order.district} / ${order.city}</p>
            </div>

            ${order.notes ? `<div style="background:#fffbeb;border:1px solid #fde68a;border-radius:10px;padding:14px 18px;margin-bottom:24px;"><p style="margin:0;font-size:12px;font-weight:600;color:#92400e;margin-bottom:4px;">Sipariş Notunuz</p><p style="margin:0;font-size:13px;color:#78350f;">${order.notes}</p></div>` : ''}

            <p style="color:#64748b;font-size:13px;margin:0;">Sipariş durumunuzu <a href="https://polyforge.com/tr/track" style="color:#4f46e5;text-decoration:none;font-weight:600;">${order.order_number}</a> numarasıyla takip edebilirsiniz.</p>
          </div>
          <!-- Footer -->
          <div style="background:#f8fafc;padding:20px 40px;text-align:center;border-top:1px solid #f1f5f9;">
            <p style="margin:0;font-size:12px;color:#94a3b8;">© 2025 PolyForge · Tüm hakları saklıdır.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  })
}

/** Yeni sipariş geldiğinde sahibine bildirim maili */
export async function sendOwnerNewOrderEmail(order: OrderEmailData) {
  const ownerEmail = process.env.OWNER_EMAIL
  if (!ownerEmail) return

  const itemsList = order.items
    .map(i => `• ${i.product_name} × ${i.quantity} — ${formatPrice(i.unit_price * i.quantity)}`)
    .join('\n')

  await getResend().emails.send({
    from: 'PolyForge Bildirim <onboarding@resend.dev>',
    to: ownerEmail,
    subject: `🛍️ Yeni Sipariş: ${order.order_number} — ${formatPrice(order.total_price)}`,
    html: `
      <div style="font-family:'Segoe UI',sans-serif;max-width:480px;margin:0 auto;">
        <div style="background:#4f46e5;padding:20px 28px;border-radius:12px 12px 0 0;">
          <h2 style="color:#fff;margin:0;font-size:18px;">🛍️ Yeni Sipariş Geldi!</h2>
        </div>
        <div style="background:#fff;padding:24px 28px;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 12px 12px;">
          <table width="100%" style="font-size:14px;color:#374151;border-collapse:collapse;">
            <tr><td style="padding:6px 0;color:#6b7280;width:140px;">Sipariş No</td><td style="font-weight:700;color:#4f46e5;font-family:monospace;">${order.order_number}</td></tr>
            <tr><td style="padding:6px 0;color:#6b7280;">Müşteri</td><td>${order.customer_name}</td></tr>
            <tr><td style="padding:6px 0;color:#6b7280;">Telefon</td><td>${order.customer_phone}</td></tr>
            <tr><td style="padding:6px 0;color:#6b7280;">E-posta</td><td>${order.customer_email}</td></tr>
            <tr><td style="padding:6px 0;color:#6b7280;">Adres</td><td>${order.district} / ${order.city}</td></tr>
            <tr><td style="padding:6px 0;color:#6b7280;vertical-align:top;">Ürünler</td><td><pre style="margin:0;font-family:inherit;white-space:pre-wrap;">${itemsList}</pre></td></tr>
            <tr><td style="padding:10px 0 0;color:#6b7280;font-weight:700;">TOPLAM</td><td style="padding-top:10px;font-size:18px;font-weight:700;color:#4f46e5;">${formatPrice(order.total_price)}</td></tr>
          </table>
          ${order.notes ? `<div style="margin-top:16px;padding:12px 16px;background:#fffbeb;border-radius:8px;font-size:13px;color:#78350f;"><strong>Not:</strong> ${order.notes}</div>` : ''}
        </div>
      </div>
    `,
  })
}

/** Durum güncellemesinde müşteriye bildirim */
export async function sendStatusUpdateEmail(params: {
  customer_email: string
  customer_name: string
  order_number: string
  new_status: string
  tracking_number?: string
}) {
  const statusLabels: Record<string, string> = {
    pending: 'Onay Bekleniyor',
    processing: 'Hazırlanıyor',
    shipped: 'Kargoya Verildi',
    delivered: 'Teslim Edildi',
    cancelled: 'İptal Edildi',
  }

  const statusLabel = statusLabels[params.new_status] ?? params.new_status
  const isShipped = params.new_status === 'shipped'

  await getResend().emails.send({
    from: 'PolyForge <onboarding@resend.dev>',
    to: params.customer_email,
    subject: `Sipariş Durumu Güncellendi – ${params.order_number}`,
    html: `
      <div style="font-family:'Segoe UI',sans-serif;max-width:480px;margin:0 auto;">
        <div style="background:linear-gradient(135deg,#4f46e5,#7c3aed);padding:24px 32px;border-radius:12px 12px 0 0;">
          <h1 style="color:#fff;margin:0;font-size:20px;">PolyForge</h1>
        </div>
        <div style="background:#fff;padding:28px 32px;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 12px 12px;">
          <h2 style="color:#1e293b;font-size:17px;margin:0 0 16px;">Sipariş Durumu: <span style="color:#4f46e5;">${statusLabel}</span></h2>
          <p style="color:#64748b;font-size:14px;">Merhaba <strong>${params.customer_name}</strong>,</p>
          <p style="color:#64748b;font-size:14px;"><strong>${params.order_number}</strong> numaralı siparişinizin durumu güncellendi.</p>
          ${isShipped && params.tracking_number ? `<div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;padding:16px 20px;margin-top:20px;"><p style="margin:0;font-size:13px;color:#166534;font-weight:600;">Kargo Takip No</p><p style="margin:6px 0 0;font-size:20px;font-weight:700;color:#16a34a;font-family:monospace;">${params.tracking_number}</p></div>` : ''}
        </div>
      </div>
    `,
  })
}
