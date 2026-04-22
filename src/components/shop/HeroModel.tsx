'use client'

import { motion } from 'framer-motion'

const innerFaces = [
  { t: 'translateZ(40px)', c: 'from-indigo-400 to-indigo-600' },
  { t: 'rotateY(180deg) translateZ(40px)', c: 'from-indigo-700 to-violet-900' },
  { t: 'rotateY(90deg) translateZ(40px)', c: 'from-violet-500 to-violet-700' },
  { t: 'rotateY(-90deg) translateZ(40px)', c: 'from-indigo-500 to-violet-600' },
  { t: 'rotateX(90deg) translateZ(40px)', c: 'from-indigo-300 to-indigo-500' },
  { t: 'rotateX(-90deg) translateZ(40px)', c: 'from-indigo-800 to-violet-950' },
]

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
  { x: -130, y: -70,  delay: 0,   size: 'w-2 h-2',     color: 'bg-indigo-400' },
  { x:  120, y: -90,  delay: 1.2, size: 'w-1.5 h-1.5', color: 'bg-violet-400' },
  { x:  140, y:  70,  delay: 0.6, size: 'w-2 h-2',     color: 'bg-indigo-300' },
  { x: -110, y:  90,  delay: 1.8, size: 'w-1 h-1',     color: 'bg-violet-500' },
  { x:   70, y:  125, delay: 0.9, size: 'w-1.5 h-1.5', color: 'bg-indigo-500' },
  { x:  -70, y: -110, delay: 2.1, size: 'w-1 h-1',     color: 'bg-violet-300' },
  { x:  155, y:  -35, delay: 0.3, size: 'w-1 h-1',     color: 'bg-indigo-300' },
  { x:  -10, y: -145, delay: 1.5, size: 'w-2 h-2',     color: 'bg-violet-400' },
]

export default function HeroModel() {
  return (
    <div className="relative flex items-center justify-center w-full h-full min-h-[480px]">

      {/* Ambient glow */}
      <div className="absolute w-96 h-96 bg-indigo-400/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute w-64 h-64 bg-violet-400/15 rounded-full blur-2xl pointer-events-none translate-x-16 translate-y-8" />

      {/* Outer orbit ring */}
      <motion.div
        animate={{ rotateZ: 360 }}
        transition={{ duration: 22, repeat: Infinity, ease: 'linear' }}
        className="absolute w-80 h-80 rounded-full border border-indigo-200/30"
        style={{ borderStyle: 'dashed' }}
      />

      {/* Inner orbit ring with dots */}
      <motion.div
        animate={{ rotateZ: -360 }}
        transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
        className="absolute w-60 h-60 rounded-full border border-violet-300/25"
      >
        <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-indigo-500 rounded-full shadow-lg shadow-indigo-400/60" />
        <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-2 h-2 bg-violet-500 rounded-full shadow-md shadow-violet-400/60" />
      </motion.div>

      {/* Float wrapper */}
      <motion.div
        animate={{ y: [0, -14, 0] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
        className="relative z-10"
      >
        <div style={{ perspective: '900px' }}>
          <div className="relative" style={{ width: 200, height: 200 }}>

            {/* ── Outer wireframe cube (200 px) ── */}
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
                  style={{ transform: t }}
                  className="absolute inset-0 border border-indigo-300/35 rounded-2xl"
                />
              ))}
            </motion.div>

            {/* ── Middle glass cube (140 px) ── */}
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
                  style={{ transform: t }}
                  className="absolute inset-0 border border-violet-400/30 bg-gradient-to-br from-indigo-500/10 to-violet-600/10 rounded-xl"
                />
              ))}
            </motion.div>

            {/* ── Inner solid cube (80 px) ── */}
            <motion.div
              className="absolute"
              style={{
                top: '50%', left: '50%',
                width: 80, height: 80,
                marginTop: -40, marginLeft: -40,
                transformStyle: 'preserve-3d',
                rotateZ: 30,
              }}
              animate={{ rotateY: [0, 360] }}
              transition={{ duration: 7, repeat: Infinity, ease: 'linear' }}
            >
              {innerFaces.map((face, i) => (
                <div
                  key={i}
                  style={{ transform: face.t }}
                  className={`absolute inset-0 bg-gradient-to-br ${face.c} rounded-xl border border-white/20 opacity-90`}
                />
              ))}
            </motion.div>

          </div>
        </div>
      </motion.div>

      {/* Shadow */}
      <motion.div
        animate={{ scaleX: [1, 0.82, 1], opacity: [0.22, 0.12, 0.22] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute bottom-10 w-36 h-5 bg-indigo-900/25 rounded-full blur-md"
      />

      {/* Floating particles */}
      {particles.map((p, i) => (
        <motion.div
          key={i}
          className={`absolute ${p.size} ${p.color} rounded-full`}
          style={{ left: `calc(50% + ${p.x}px)`, top: `calc(50% + ${p.y}px)` }}
          animate={{ y: [0, -12, 0], opacity: [0.4, 0.9, 0.4] }}
          transition={{ duration: 2.5 + i * 0.3, repeat: Infinity, ease: 'easeInOut', delay: p.delay }}
        />
      ))}
    </div>
  )
}
