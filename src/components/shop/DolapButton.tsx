'use client'

const DOLAP_URL = 'https://link.dolap.com/7lp4ce'

export default function DolapButton() {
  return (
    <a
      href={DOLAP_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Dolap'ta mağazamızı ziyaret et"
      className="fixed bottom-24 right-6 z-50 flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white rounded-full shadow-lg shadow-orange-500/30 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-orange-500/40 group"
    >
      {/* Expanded label on hover */}
      <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 ease-in-out whitespace-nowrap pl-0 group-hover:pl-4 text-sm font-semibold">
        Dolap'ta Gör
      </span>

      {/* Dolap icon — shopping bag */}
      <div className="w-14 h-14 flex items-center justify-center flex-shrink-0 flex-col gap-0.5">
        <svg viewBox="0 0 24 24" className="h-6 w-6 fill-white" xmlns="http://www.w3.org/2000/svg">
          <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4zM3.5 6h17M16 10a4 4 0 0 1-8 0" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        </svg>
        <span className="text-[9px] font-bold leading-none tracking-wide">DOLAP</span>
      </div>
    </a>
  )
}
