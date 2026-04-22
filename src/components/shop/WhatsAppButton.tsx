'use client'

import { MessageCircle } from 'lucide-react'

// WhatsApp Business numaran hazır olunca buraya yaz (başında 90 ile, boşluksuz)
const WP_NUMBER = '905374826673'
const WP_MESSAGE = 'Merhaba! Ürünleriniz hakkında bilgi almak istiyorum.'

export default function WhatsAppButton() {
  const url = `https://wa.me/${WP_NUMBER}?text=${encodeURIComponent(WP_MESSAGE)}`

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="WhatsApp ile iletişime geç"
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white rounded-full shadow-lg shadow-green-500/30 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-green-500/40 group"
    >
      {/* Expanded label on hover */}
      <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 ease-in-out whitespace-nowrap pl-0 group-hover:pl-4 text-sm font-semibold">
        WhatsApp ile Sipariş Ver
      </span>

      {/* Icon */}
      <div className="w-14 h-14 flex items-center justify-center flex-shrink-0">
        <MessageCircle className="h-6 w-6 fill-white" />
      </div>

      {/* Pulse ring */}
      <span className="absolute inset-0 rounded-full animate-ping bg-green-400 opacity-20 pointer-events-none" />
    </a>
  )
}
