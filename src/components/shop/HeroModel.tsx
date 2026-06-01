'use client'

import { motion } from 'framer-motion'

const particles = [
  { x: -150, y: -80,  delay: 0,   size: 8,  color: '#C7A06F' },
  { x:  140, y: -100, delay: 1.2, size: 6,  color: '#334E68' },
  { x:  160, y:  80,  delay: 0.6, size: 8,  color: '#C7A06F' },
  { x: -130, y:  100, delay: 1.8, size: 5,  color: '#D9E2EC' },
  { x:   80, y:  140, delay: 0.9, size: 6,  color: '#334E68' },
  { x:  -80, y: -130, delay: 2.1, size: 5,  color: '#C7A06F' },
  { x:  170, y:  -40, delay: 0.3, size: 4,  color: '#D9E2EC' },
  { x:  -20, y: -160, delay: 1.5, size: 7,  color: '#334E68' },
]

export default function HeroModel() {
  return (
    <div className="relative flex items-center justify-center w-full h-full min-h-[480px]">

      {/* Ambient glow */}
      <div className="absolute w-[420px] h-[420px] rounded-full blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle, #102A4325 0%, transparent 70%)' }} />
      <div className="absolute w-[280px] h-[280px] rounded-full blur-2xl pointer-events-none translate-x-16 translate-y-8"
        style={{ background: 'radial-gradient(circle, #C7A06F18 0%, transparent 70%)' }} />

      {/* Outer orbit ring */}
      <motion.div
        animate={{ rotateZ: 360 }}
        transition={{ duration: 28, repeat: Infinity, ease: 'linear' }}
        className="absolute w-[380px] h-[380px] rounded-full pointer-events-none"
        style={{ border: '1px dashed #334E6830' }}
      />

      {/* Inner orbit ring */}
      <motion.div
        animate={{ rotateZ: -360 }}
        transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
        className="absolute w-[280px] h-[280px] rounded-full pointer-events-none"
        style={{ border: '1px solid #C7A06F25' }}
      >
        <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full"
          style={{ background: '#C7A06F', boxShadow: '0 0 10px #C7A06FAA' }} />
        <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full"
          style={{ background: '#334E68', boxShadow: '0 0 8px #334E68AA' }} />
        <div className="absolute top-1/2 -left-1.5 -translate-y-1/2 w-2 h-2 rounded-full"
          style={{ background: '#C7A06F80' }} />
        <div className="absolute top-1/2 -right-1.5 -translate-y-1/2 w-2 h-2 rounded-full"
          style={{ background: '#334E6880' }} />
      </motion.div>

      {/* Logo — float + slow rotate */}
      <motion.div
        animate={{ y: [0, -18, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        className="relative z-10"
      >
        <motion.div
          animate={{ rotateY: [0, 8, 0, -8, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          style={{ perspective: '800px' }}
        >
          {/* Glow ring arkada */}
          <div className="absolute inset-0 rounded-full blur-2xl -z-10"
            style={{ background: 'radial-gradient(circle, #C7A06F30 0%, transparent 65%)', transform: 'scale(1.3)' }} />

          {/* Logo ikon — alt yazı kırpılmış */}
          <div style={{ position: 'relative', overflow: 'hidden', width: '260px', height: '166px' }}>
            <img
              src="/logo.png"
              alt="Model Marketim"
              style={{ position: 'absolute', top: 0, left: 0, height: '254px', width: 'auto' }}
            />
          </div>
        </motion.div>
      </motion.div>

      {/* Gölge */}
      <motion.div
        animate={{ scaleX: [1, 0.8, 1], opacity: [0.15, 0.07, 0.15] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute bottom-8 w-48 h-6 rounded-full blur-xl"
        style={{ background: '#102A43' }}
      />

      {/* Floating particles */}
      {particles.map((p, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: p.size, height: p.size,
            left: `calc(50% + ${p.x}px)`,
            top:  `calc(50% + ${p.y}px)`,
            background: p.color,
          }}
          animate={{ y: [0, -14, 0], opacity: [0.35, 0.85, 0.35] }}
          transition={{ duration: 2.8 + i * 0.3, repeat: Infinity, ease: 'easeInOut', delay: p.delay }}
        />
      ))}
    </div>
  )
}
