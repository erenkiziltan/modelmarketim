'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'

// Marka renkleri: #102A43 (koyu mavi), #C7A06F (altın), #334E68 (mavi geçiş), #D9E2EC (açık gri)

const outerTransforms = [
  'translateZ(100px)',
  'rotateY(180deg) translateZ(100px)',
  'rotateY(90deg) translateZ(100px)',
  'rotateY(-90deg) translateZ(100px)',
  'rotateX(90deg) translateZ(100px)',
  'rotateX(-90deg) translateZ(100px)',
]

const middleTransforms = [
  'translateZ(70px)',
  'rotateY(180deg) translateZ(70px)',
  'rotateY(90deg) translateZ(70px)',
  'rotateY(-90deg) translateZ(70px)',
  'rotateX(90deg) translateZ(70px)',
  'rotateX(-90deg) translateZ(70px)',
]

const particles = [
  { x: -130, y: -70,  delay: 0,   size: 'w-2 h-2',     color: '#C7A06F' },
  { x:  120, y: -90,  delay: 1.2, size: 'w-1.5 h-1.5', color: '#334E68' },
  { x:  140, y:  70,  delay: 0.6, size: 'w-2 h-2',     color: '#C7A06F' },
  { x: -110, y:  90,  delay: 1.8, size: 'w-1 h-1',     color: '#D9E2EC' },
  { x:   70, y:  125, delay: 0.9, size: 'w-1.5 h-1.5', color: '#334E68' },
  { x:  -70, y: -110, delay: 2.1, size: 'w-1 h-1',     color: '#C7A06F' },
  { x:  155, y:  -35, delay: 0.3, size: 'w-1 h-1',     color: '#D9E2EC' },
  { x:  -10, y: -145, delay: 1.5, size: 'w-2 h-2',     color: '#334E68' },
]

export default function HeroModel() {
  return (
    <div className="relative flex items-center justify-center w-full h-full min-h-[480px]">

      {/* Ambient glow */}
      <div className="absolute w-96 h-96 rounded-full blur-3xl pointer-events-none" style={{ background: '#102A4320' }} />
      <div className="absolute w-64 h-64 rounded-full blur-2xl pointer-events-none translate-x-16 translate-y-8" style={{ background: '#C7A06F18' }} />

      {/* Outer orbit ring */}
      <motion.div
        animate={{ rotateZ: 360 }}
        transition={{ duration: 22, repeat: Infinity, ease: 'linear' }}
        className="absolute w-80 h-80 rounded-full"
        style={{ border: '1px dashed #334E6840' }}
      />

      {/* Inner orbit ring with dots */}
      <motion.div
        animate={{ rotateZ: -360 }}
        transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
        className="absolute w-60 h-60 rounded-full"
        style={{ border: '1px solid #C7A06F30' }}
      >
        <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full" style={{ background: '#C7A06F', boxShadow: '0 0 8px #C7A06F80' }} />
        <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full" style={{ background: '#334E68', boxShadow: '0 0 6px #334E6880' }} />
      </motion.div>

      {/* Float wrapper */}
      <motion.div
        animate={{ y: [0, -14, 0] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
        className="relative z-10"
      >
        <div style={{ perspective: '900px' }}>
          <div className="relative" style={{ width: 200, height: 200 }}>

            {/* ── Outer wireframe cube ── */}
            <motion.div
              className="absolute"
              style={{
                top: '50%', left: '50%',
                width: 200, height: 200,
                marginTop: -100, marginLeft: -100,
                transformStyle: 'preserve-3d',
                rotateX: 18,
              }}
              animate={{ rotateY: [0, 360] }}
              transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            >
              {outerTransforms.map((t, i) => (
                <div
                  key={i}
                  style={{ transform: t, border: '1px solid #334E6840' }}
                  className="absolute inset-0 rounded-2xl"
                />
              ))}
            </motion.div>

            {/* ── Middle glass cube ── */}
            <motion.div
              className="absolute"
              style={{
                top: '50%', left: '50%',
                width: 140, height: 140,
                marginTop: -70, marginLeft: -70,
                transformStyle: 'preserve-3d',
                rotateX: -22,
              }}
              animate={{ rotateY: [0, -360] }}
              transition={{ duration: 13, repeat: Infinity, ease: 'linear' }}
            >
              {middleTransforms.map((t, i) => (
                <div
                  key={i}
                  style={{ transform: t, border: '1px solid #C7A06F35', background: 'linear-gradient(135deg, #102A4312, #C7A06F10)' }}
                  className="absolute inset-0 rounded-xl"
                />
              ))}
            </motion.div>

            {/* ── Logo kübü (merkez) ── */}
            <motion.div
              className="absolute"
              style={{
                top: '50%', left: '50%',
                width: 90, height: 90,
                marginTop: -45, marginLeft: -45,
                transformStyle: 'preserve-3d',
              }}
              animate={{ rotateY: [0, 360] }}
              transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
            >
              {/* Ön yüz — logo */}
              <div style={{ transform: 'translateZ(45px)', background: '#102A43', borderRadius: 16, border: '1px solid #C7A06F50' }} className="absolute inset-0 flex items-center justify-center overflow-hidden">
                <Image src="/logo.png" alt="Model Marketim" width={70} height={70} className="object-contain p-1" />
              </div>
              {/* Arka yüz */}
              <div style={{ transform: 'rotateY(180deg) translateZ(45px)', background: 'linear-gradient(135deg, #102A43, #334E68)', borderRadius: 16, border: '1px solid #C7A06F40' }} className="absolute inset-0" />
              {/* Sağ */}
              <div style={{ transform: 'rotateY(90deg) translateZ(45px)', background: 'linear-gradient(135deg, #334E68, #C7A06F)', borderRadius: 16, opacity: 0.9 }} className="absolute inset-0" />
              {/* Sol */}
              <div style={{ transform: 'rotateY(-90deg) translateZ(45px)', background: 'linear-gradient(135deg, #102A43, #334E68)', borderRadius: 16, opacity: 0.9 }} className="absolute inset-0" />
              {/* Üst */}
              <div style={{ transform: 'rotateX(90deg) translateZ(45px)', background: 'linear-gradient(135deg, #C7A06F, #102A43)', borderRadius: 16, opacity: 0.85 }} className="absolute inset-0" />
              {/* Alt */}
              <div style={{ transform: 'rotateX(-90deg) translateZ(45px)', background: '#0d2236', borderRadius: 16, opacity: 0.85 }} className="absolute inset-0" />
            </motion.div>

          </div>
        </div>
      </motion.div>

      {/* Shadow */}
      <motion.div
        animate={{ scaleX: [1, 0.82, 1], opacity: [0.18, 0.08, 0.18] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute bottom-10 w-36 h-5 rounded-full blur-md"
        style={{ background: '#102A43' }}
      />

      {/* Floating particles */}
      {particles.map((p, i) => (
        <motion.div
          key={i}
          className={`absolute ${p.size} rounded-full`}
          style={{ left: `calc(50% + ${p.x}px)`, top: `calc(50% + ${p.y}px)`, background: p.color }}
          animate={{ y: [0, -12, 0], opacity: [0.4, 0.9, 0.4] }}
          transition={{ duration: 2.5 + i * 0.3, repeat: Infinity, ease: 'easeInOut', delay: p.delay }}
        />
      ))}
    </div>
  )
}
