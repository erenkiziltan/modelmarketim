/**
 * CallMeBot — ücretsiz WhatsApp API (sahip bildirimleri için)
 *
 * Aktivasyon: WhatsApp'tan +34 644 44 00 71 numarasına
 * "I allow callmebot to send me messages" yazın.
 * API key'i .env.local içindeki CALLMEBOT_APIKEY'e ekleyin.
 */

export async function sendOwnerWhatsApp(message: string): Promise<void> {
  const phone = process.env.CALLMEBOT_PHONE
  const apikey = process.env.CALLMEBOT_APIKEY

  // API key yoksa sessizce atla (henüz aktivasyon yapılmamış)
  if (!phone || !apikey) return

  try {
    const text = encodeURIComponent(message)
    const url = `https://api.callmebot.com/whatsapp.php?phone=${phone}&text=${text}&apikey=${apikey}`
    await fetch(url)
  } catch {
    // WP hatası bildirimleri engellemez
  }
}

export function buildNewOrderMessage(params: {
  order_number: string
  customer_name: string
  customer_phone: string
  city: string
  district: string
  total_price: number
  items: Array<{ product_name: string; quantity: number }>
}): string {
  const price = new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(
    params.total_price
  )
  const itemsList = params.items.map(i => `• ${i.product_name} x${i.quantity}`).join('\n')

  return [
    '🛍️ *YENİ SİPARİŞ*',
    `━━━━━━━━━━━━━━━`,
    `📋 No: ${params.order_number}`,
    `👤 ${params.customer_name}`,
    `📞 ${params.customer_phone}`,
    `📍 ${params.district} / ${params.city}`,
    `━━━━━━━━━━━━━━━`,
    itemsList,
    `━━━━━━━━━━━━━━━`,
    `💰 Toplam: ${price}`,
  ].join('\n')
}

export function buildStatusUpdateMessage(params: {
  order_number: string
  customer_name: string
  new_status: string
}): string {
  const statusEmoji: Record<string, string> = {
    pending: '⏳',
    processing: '⚙️',
    shipped: '🚚',
    delivered: '✅',
    cancelled: '❌',
  }
  const emoji = statusEmoji[params.new_status] ?? '📦'

  return [
    `${emoji} *SİPARİŞ GÜNCELLEME*`,
    `━━━━━━━━━━━━━━━`,
    `📋 No: ${params.order_number}`,
    `👤 ${params.customer_name}`,
    `Durum: ${params.new_status.toUpperCase()}`,
  ].join('\n')
}
