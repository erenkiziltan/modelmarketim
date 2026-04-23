import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendOwnerWhatsApp } from '@/lib/notifications/whatsapp'
import { Resend } from 'resend'

/**
 * Cloudflare Cron Trigger tarafından her sabah çağrılır.
 * Stok ≤ 3 olan aktif ürünleri kontrol eder,
 * WhatsApp ve e-posta ile bildirim gönderir.
 *
 * Cloudflare Dashboard → Workers → modelmarketim → Settings → Trigger Events → Add Cron
 * Cron: 0 7 * * *   (her sabah 07:00 UTC = 10:00 Türkiye)
 */

function getResend() {
  return new Resend(process.env.RESEND_API_KEY ?? 'placeholder')
}

export async function GET(req: NextRequest) {
  // Basit güvenlik: Cloudflare Cron kendi isteğinde bu header'ı gönderir
  // Dilerseniz CRON_SECRET env var ile de koruyabilirsiniz
  const isCloudflare = req.headers.get('cf-worker') !== null
    || req.headers.get('user-agent')?.includes('cloudflare') === true

  // Supabase Service Role ile direkt DB erişimi
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: lowStock, error } = await supabase
    .from('products')
    .select('id, name_tr, stock')
    .lte('stock', 3)
    .eq('is_active', true)
    .order('stock', { ascending: true })

  if (error) {
    console.error('[stock-check cron]', error)
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
  }

  if (!lowStock || lowStock.length === 0) {
    return NextResponse.json({ ok: true, message: 'Tüm ürünler stokta' })
  }

  // Mesaj oluştur
  const lines = lowStock.map(p =>
    p.stock === 0
      ? `❌ ${p.name_tr} — TÜKENDI`
      : `⚠️ ${p.name_tr} — ${p.stock} adet kaldı`
  )

  const wpMessage = [
    '📦 *SABAH STOK RAPORU*',
    `━━━━━━━━━━━━━━━`,
    ...lines,
    `━━━━━━━━━━━━━━━`,
    `${new Date().toLocaleDateString('tr-TR')} — Modelmarketim`,
  ].join('\n')

  const ownerEmail = process.env.OWNER_EMAIL

  await Promise.allSettled([
    sendOwnerWhatsApp(wpMessage),
    ownerEmail ? getResend().emails.send({
      from: 'PolyForge Stok <onboarding@resend.dev>',
      to: ownerEmail,
      subject: `📦 Stok Uyarısı — ${lowStock.length} ürün düşük stokta`,
      html: `
        <div style="font-family:'Segoe UI',sans-serif;max-width:480px;margin:0 auto;">
          <div style="background:#ef4444;padding:20px 28px;border-radius:12px 12px 0 0;">
            <h2 style="color:#fff;margin:0;font-size:18px;">📦 Stok Uyarısı</h2>
            <p style="color:#fecaca;margin:4px 0 0;font-size:13px;">${new Date().toLocaleDateString('tr-TR')}</p>
          </div>
          <div style="background:#fff;padding:24px 28px;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 12px 12px;">
            <p style="color:#64748b;font-size:14px;margin:0 0 16px;">Aşağıdaki ürünlerin stoku kritik seviyede:</p>
            <table width="100%" style="font-size:14px;border-collapse:collapse;">
              ${lowStock.map(p => `
                <tr>
                  <td style="padding:8px 0;color:#1e293b;border-bottom:1px solid #f1f5f9;">${p.name_tr}</td>
                  <td style="padding:8px 0;text-align:right;border-bottom:1px solid #f1f5f9;">
                    <span style="font-weight:700;color:${p.stock === 0 ? '#dc2626' : '#d97706'};">
                      ${p.stock === 0 ? 'TÜKENDI' : `${p.stock} adet`}
                    </span>
                  </td>
                </tr>
              `).join('')}
            </table>
            <div style="margin-top:20px;">
              <a href="https://modelmarketim.com/admin/products" style="display:inline-block;background:#4f46e5;color:#fff;padding:10px 20px;border-radius:8px;text-decoration:none;font-size:14px;font-weight:600;">
                Stokları Güncelle →
              </a>
            </div>
          </div>
        </div>
      `,
    }) : Promise.resolve(),
  ])

  return NextResponse.json({ ok: true, lowStockCount: lowStock.length, products: lowStock })
}
