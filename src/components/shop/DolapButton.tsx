'use client'

const DOLAP_URL = 'https://link.dolap.com/7lp4ce'

export default function DolapButton() {
  return (
    <a
      href={DOLAP_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Dolap'ta mağazamızı ziyaret et"
      className="fixed bottom-24 right-6 z-50 flex items-center gap-2 bg-[#25D6A2] hover:bg-[#1fc090] rounded-full shadow-lg shadow-[#25D6A2]/40 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-[#25D6A2]/50 group"
    >
      {/* Expanded label on hover */}
      <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 ease-in-out whitespace-nowrap pl-0 group-hover:pl-4 text-sm font-semibold text-white">
        Dolap&apos;ta Gör
      </span>

      {/* Dolap logo - beyaz versiyon */}
      <div className="w-14 h-14 flex items-center justify-center flex-shrink-0 p-3">
        <img
          src="/dolap-logo.svg"
          alt="Dolap"
          className="w-full h-full object-contain brightness-0 invert"
        />
      </div>
    </a>
  )
}
