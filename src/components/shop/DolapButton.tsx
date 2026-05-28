'use client'

const DOLAP_URL = 'https://link.dolap.com/7lp4ce'

export default function DolapButton() {
  return (
    <a
      href={DOLAP_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Dolap'ta mağazamızı ziyaret et"
      className="fixed bottom-24 right-6 z-50 flex items-center gap-2 bg-white hover:bg-slate-50 rounded-full shadow-lg shadow-black/10 border border-slate-100 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-black/15 group"
    >
      {/* Expanded label on hover */}
      <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 ease-in-out whitespace-nowrap pl-0 group-hover:pl-4 text-sm font-semibold text-[#25D6A2]">
        Dolap&apos;ta Gör
      </span>

      {/* Dolap logo */}
      <div className="w-14 h-14 flex items-center justify-center flex-shrink-0 p-3">
        <img
          src="/dolap-logo.svg"
          alt="Dolap"
          className="w-full h-full object-contain"
        />
      </div>
    </a>
  )
}
