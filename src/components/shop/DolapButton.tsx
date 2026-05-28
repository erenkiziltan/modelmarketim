'use client'

const DOLAP_URL = 'https://link.dolap.com/7lp4ce'

// Dolap'ın marka rengi ve "d" logosu
export default function DolapButton() {
  return (
    <a
      href={DOLAP_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Dolap'ta mağazamızı ziyaret et"
      className="fixed bottom-24 right-6 z-50 flex items-center gap-2 bg-[#F26522] hover:bg-[#d9561a] text-white rounded-full shadow-lg shadow-orange-500/30 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-orange-500/40 group"
    >
      {/* Expanded label on hover */}
      <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 ease-in-out whitespace-nowrap pl-0 group-hover:pl-4 text-sm font-semibold">
        Dolap&apos;ta Gör
      </span>

      {/* Dolap "d" logo SVG */}
      <div className="w-14 h-14 flex items-center justify-center flex-shrink-0">
        <svg viewBox="0 0 40 40" className="h-8 w-8" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Dolap logosu: kalın "d" harfi */}
          <text
            x="20"
            y="31"
            textAnchor="middle"
            fontFamily="'Georgia', serif"
            fontSize="32"
            fontWeight="bold"
            fontStyle="italic"
            fill="white"
          >d</text>
        </svg>
      </div>

      {/* Pulse ring */}
      <span className="absolute inset-0 rounded-full animate-ping bg-orange-400 opacity-20 pointer-events-none" />
    </a>
  )
}
