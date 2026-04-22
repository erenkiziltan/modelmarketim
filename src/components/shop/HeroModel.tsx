'use client'

import { motion } from 'framer-motion'

export default function HeroModel() {
  return (
    <div className="relative flex items-center justify-center w-full h-full min-h-[480px]">

      {/* Ambient glow */}
      <div className="absolute w-72 h-72 bg-indigo-400/25 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute w-48 h-48 bg-violet-400/20 rounded-full blur-2xl pointer-events-none translate-x-12 translate-y-8" />

      {/* Outer orbit ring */}
      <motion.div
        animate={{ rotateZ: 360 }}
        transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
        className="absolute w-72 h-72 rounded-full border border-indigo-200/40"
        style={{ borderStyle: 'dashed' }}
      />

      {/* Middle orbit ring */}
      <motion.div
        animate={{ rotateZ: -360 }}
        transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
        className="absolute w-52 h-52 rounded-full border border-violet-300/30"
      >
        {/* Orbit dot */}
        <motion.div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-indigo-500 rounded-full shadow-lg shadow-indigo-400/60" />
      </motion.div>

      {/* Small orbit ring */}
      <motion.div
        animate={{ rotateZ: 360 }}
        transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
        className="absolute w-36 h-36 rounded-full border border-indigo-300/25"
      >
        <motion.div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-violet-500 rounded-full shadow-md shadow-violet-400/60" />
      </motion.div>

      {/* 3D Scene */}
      <div style={{ perspective: '700px' }} className="relative z-10">
        <motion.div
          animate={{ rotateY: 360 }}
          transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
          style={{ transformStyle: 'preserve-3d' }}
          className="relative w-36 h-36"
        >
          {/* Floating bob */}
          <motion.div
            animate={{ y: [0, -12, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            style={{ transformStyle: 'preserve-3d' }}
            className="relative w-36 h-36"
          >
            {/* Front face */}
            <div
              style={{ transform: 'translateZ(72px)' }}
              className="absolute inset-0 bg-gradient-to-br from-indigo-400 to-indigo-600 opacity-90 rounded-2xl border border-white/20"
            >
              <div className="absolute inset-2 border border-white/10 rounded-xl" />
              <div className="absolute inset-4 border border-white/5 rounded-lg" />
            </div>

            {/* Back face */}
            <div
              style={{ transform: 'rotateY(180deg) translateZ(72px)' }}
              className="absolute inset-0 bg-gradient-to-br from-indigo-700 to-indigo-900 opacity-90 rounded-2xl border border-white/10"
            />

            {/* Right face */}
            <div
              style={{ transform: 'rotateY(90deg) translateZ(72px)' }}
              className="absolute inset-0 bg-gradient-to-br from-violet-500 to-violet-700 opacity-90 rounded-2xl border border-white/15"
            >
              <div className="absolute inset-3 border border-white/10 rounded-xl" />
            </div>

            {/* Left face */}
            <div
              style={{ transform: 'rotateY(-90deg) translateZ(72px)' }}
              className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-violet-600 opacity-90 rounded-2xl border border-white/10"
            />

            {/* Top face */}
            <div
              style={{ transform: 'rotateX(90deg) translateZ(72px)' }}
              className="absolute inset-0 bg-gradient-to-br from-indigo-300 to-indigo-500 opacity-90 rounded-2xl border border-white/20"
            />

            {/* Bottom face */}
            <div
              style={{ transform: 'rotateX(-90deg) translateZ(72px)' }}
              className="absolute inset-0 bg-gradient-to-br from-indigo-800 to-indigo-950 opacity-90 rounded-2xl border border-white/5"
            />
          </motion.div>
        </motion.div>
      </div>

      {/* Shadow below */}
      <motion.div
        animate={{ scaleX: [1, 0.85, 1], opacity: [0.25, 0.15, 0.25] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute bottom-12 w-28 h-4 bg-indigo-900/30 rounded-full blur-md"
      />

      {/* Floating particles */}
      {[
        { x: -110, y: -60, delay: 0, size: 'w-2 h-2', color: 'bg-indigo-400' },
        { x: 100, y: -80, delay: 1.2, size: 'w-1.5 h-1.5', color: 'bg-violet-400' },
        { x: 120, y: 60, delay: 0.6, size: 'w-2 h-2', color: 'bg-indigo-300' },
        { x: -90, y: 80, delay: 1.8, size: 'w-1 h-1', color: 'bg-violet-500' },
        { x: 60, y: 110, delay: 0.9, size: 'w-1.5 h-1.5', color: 'bg-indigo-500' },
        { x: -60, y: -100, delay: 2.1, size: 'w-1 h-1', color: 'bg-violet-300' },
      ].map((p, i) => (
        <motion.div
          key={i}
          className={`absolute ${p.size} ${p.color} rounded-full opacity-70`}
          style={{ left: `calc(50% + ${p.x}px)`, top: `calc(50% + ${p.y}px)` }}
          animate={{ y: [0, -10, 0], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2.5 + i * 0.3, repeat: Infinity, ease: 'easeInOut', delay: p.delay }}
        />
      ))}
    </div>
  )
}
