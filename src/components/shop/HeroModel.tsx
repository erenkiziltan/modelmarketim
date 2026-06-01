'use client'

import dynamic from 'next/dynamic'

// 3D sahne yalnızca client'ta yüklenir (Three.js/WebGL SSR'de çalışmaz)
const HeroScene = dynamic(() => import('./HeroScene'), {
  ssr: false,
  loading: () => (
    <div className="relative w-full h-full min-h-[480px] flex items-center justify-center">
      <div className="w-32 h-32 rounded-full blur-2xl animate-pulse"
        style={{ background: 'radial-gradient(circle, #102A4330, #C7A06F20, transparent)' }} />
    </div>
  ),
})

export default function HeroModel() {
  return <HeroScene />
}
