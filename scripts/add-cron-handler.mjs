/**
 * Build sonrası çalışır.
 * OpenNext'in ürettiği worker.js'e Cloudflare Cron scheduled handler ekler.
 *
 * Kritik: HTTP subrequest kullanmıyor — doğrudan Supabase + Resend + CallMeBot API çağırır.
 * Bu yaklaşım çok daha güvenilir: Worker kendi kendine istek atmaz, env değişkenlerine doğrudan erişir.
 */
import { writeFileSync } from 'fs'

const content = `import worker from './worker.js'

async function runStockCheck(env) {
  const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL
  const SUPABASE_KEY = env.SUPABASE_SERVICE_ROLE_KEY
  const RESEND_KEY = env.RESEND_API_KEY
  const OWNER_EMAIL = env.OWNER_EMAIL
  const CALLMEBOT_PHONE = env.CALLMEBOT_PHONE
  const CALLMEBOT_APIKEY = env.CALLMEBOT_APIKEY

  if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('[cron] SUPABASE env vars eksik — kontrol et')
    return
  }

  // 1. Supabase REST API ile düşük stoklu ürünleri çek
  const res = await fetch(
    SUPABASE_URL + '/rest/v1/products?select=id,name_tr,stock&stock=lte.3&is_active=eq.true&order=stock.asc',
    {
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': 'Bearer ' + SUPABASE_KEY,
        'Content-Type': 'application/json',
      },
    }
  )

  if (!res.ok) {
    const errText = await res.text()
    console.error('[cron] Supabase sorgu hatası:', res.status, errText)
    return
  }

  const lowStock = await res.json()

  if (!lowStock || lowStock.length === 0) {
    console.log('[cron] Tüm ürünler stokta, bildirim gönderilmedi.')
    return
  }

  console.log('[cron] Düşük stoklu ürün sayısı:', lowStock.length)

  const dateStr = new Date().toLocaleDateString('tr-TR')

  // 2. WhatsApp bildirimi
  if (CALLMEBOT_PHONE && CALLMEBOT_APIKEY) {
    const lines = lowStock.map(p =>
      p.stock === 0
        ? '❌ ' + p.name_tr + ' — TÜKENDI'
        : '⚠️ ' + p.name_tr + ' — ' + p.stock + ' adet kaldı'
    )
    const wpText = [
      '📦 *SABAH STOK RAPORU*',
      '━━━━━━━━━━━━━━━',
      ...lines,
      '━━━━━━━━━━━━━━━',
      dateStr + ' — Modelmarketim',
    ].join('\\n')

    await fetch(
      'https://api.callmebot.com/whatsapp.php?phone=' + CALLMEBOT_PHONE +
      '&text=' + encodeURIComponent(wpText) +
      '&apikey=' + CALLMEBOT_APIKEY
    ).then(r => console.log('[cron] WhatsApp status:', r.status))
     .catch(err => console.error('[cron] WhatsApp hatası:', err))
  }

  // 3. E-posta bildirimi (Resend REST API)
  if (RESEND_KEY && OWNER_EMAIL) {
    const rows = lowStock.map(p =>
      '<tr>' +
        '<td style="padding:8px 0;color:#1e293b;border-bottom:1px solid #f1f5f9;">' + p.name_tr + '</td>' +
        '<td style="padding:8px 0;text-align:right;border-bottom:1px solid #f1f5f9;">' +
          '<span style="font-weight:700;color:' + (p.stock === 0 ? '#dc2626' : '#d97706') + ';">' +
            (p.stock === 0 ? 'TÜKENDI' : p.stock + ' adet') +
          '</span>' +
        '</td>' +
      '</tr>'
    ).join('')

    const html =
      '<div style="font-family:sans-serif;max-width:480px;margin:0 auto;">' +
        '<div style="background:#ef4444;padding:20px 28px;border-radius:12px 12px 0 0;">' +
          '<h2 style="color:#fff;margin:0;font-size:18px;">📦 Stok Uyarısı</h2>' +
          '<p style="color:#fecaca;margin:4px 0 0;font-size:13px;">' + dateStr + '</p>' +
        '</div>' +
        '<div style="background:#fff;padding:24px 28px;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 12px 12px;">' +
          '<p style="color:#64748b;font-size:14px;margin:0 0 16px;">Aşağıdaki ürünlerin stoku kritik seviyede:</p>' +
          '<table width="100%" style="font-size:14px;border-collapse:collapse;">' + rows + '</table>' +
          '<div style="margin-top:20px;">' +
            '<a href="https://modelmarketim.com/yonetim-paneli/products" ' +
               'style="display:inline-block;background:#4f46e5;color:#fff;padding:10px 20px;border-radius:8px;text-decoration:none;font-size:14px;font-weight:600;">' +
              'Stokları Güncelle →' +
            '</a>' +
          '</div>' +
        '</div>' +
      '</div>'

    const emailRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + RESEND_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Modelmarketim Stok <noreply@modelmarketim.com>',
        to: OWNER_EMAIL,
        subject: '📦 Stok Uyarısı — ' + lowStock.length + ' ürün düşük stokta',
        html: html,
      }),
    })

    const emailData = await emailRes.json()
    if (emailRes.ok) {
      console.log('[cron] E-posta gönderildi, id:', emailData.id)
    } else {
      console.error('[cron] Resend hatası:', JSON.stringify(emailData))
    }
  } else {
    console.error('[cron] RESEND_KEY veya OWNER_EMAIL eksik')
  }
}

export default {
  ...worker,
  scheduled(event, env, ctx) {
    ctx.waitUntil(
      runStockCheck(env).catch(err => console.error('[cron] Fatal hata:', err))
    )
  },
}
`

writeFileSync('.open-next/worker-with-cron.js', content)
console.log('✅ Cron scheduled handler eklendi: .open-next/worker-with-cron.js')
