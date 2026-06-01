'use client'

import { Suspense, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { useGLTF, Environment, ContactShadows, Center, Bounds } from '@react-three/drei'
import * as THREE from 'three'

// Marka renkleri: #102A43 (koyu mavi), #C7A06F (altın), #334E68 (mavi geçiş), #D9E2EC (açık gri)

function LogoMesh() {
  const ref = useRef<THREE.Group>(null)
  const { scene } = useGLTF('/logo-3d.glb')

  // Yavaş sürekli dönüş
  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.4
  })

  return (
    <group ref={ref}>
      <Center>
        <primitive object={scene} />
      </Center>
    </group>
  )
}

function FloatingParticles() {
  const particles = [
    { x: -2.4, y: 1.2,  z: -1, size: 0.05, color: '#C7A06F' },
    { x:  2.2, y: 1.5,  z: -1, size: 0.04, color: '#334E68' },
    { x:  2.5, y: -1.1, z: -1, size: 0.05, color: '#C7A06F' },
    { x: -2.1, y: -1.4, z: -1, size: 0.03, color: '#D9E2EC' },
    { x:  1.3, y: -2.0, z: -1, size: 0.04, color: '#334E68' },
    { x: -1.3, y: 2.0,  z: -1, size: 0.03, color: '#C7A06F' },
  ]
  const ref = useRef<THREE.Group>(null)
  useFrame((state) => {
    if (ref.current) {
      ref.current.children.forEach((c, i) => {
        c.position.y += Math.sin(state.clock.elapsedTime * 1.5 + i) * 0.002
      })
    }
  })
  return (
    <group ref={ref}>
      {particles.map((p, i) => (
        <mesh key={i} position={[p.x, p.y, p.z]}>
          <sphereGeometry args={[p.size, 16, 16]} />
          <meshStandardMaterial color={p.color} emissive={p.color} emissiveIntensity={0.4} />
        </mesh>
      ))}
    </group>
  )
}

export default function HeroModel() {
  return (
    <div className="relative w-full h-full min-h-[480px]">
      {/* Ambient glow arka plan */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[380px] h-[380px] rounded-full blur-3xl"
          style={{ background: 'radial-gradient(circle, #102A4318 0%, #C7A06F12 50%, transparent 70%)' }} />
      </div>

      <Canvas
        camera={{ position: [0, 0, 6], fov: 40 }}
        gl={{ antialias: true, alpha: true, preserveDrawingBuffer: false }}
        dpr={[1, 2]}
        style={{ background: 'transparent' }}
      >
        <Suspense fallback={null}>
          {/* Işıklandırma — marka renkli */}
          <ambientLight intensity={0.6} />
          <directionalLight position={[5, 5, 5]} intensity={1.2} color="#ffffff" />
          <directionalLight position={[-5, 2, -3]} intensity={0.6} color="#C7A06F" />
          <pointLight position={[0, -3, 2]} intensity={0.4} color="#334E68" />

          <Bounds fit clip observe margin={1.1}>
            <LogoMesh />
          </Bounds>

          <FloatingParticles />

          {/* Zemin gölgesi */}
          <ContactShadows
            position={[0, -2, 0]}
            opacity={0.25}
            scale={8}
            blur={2.5}
            far={4}
            color="#102A43"
          />

          {/* Ortam yansıması — metalik görünüm için */}
          <Environment preset="city" />
        </Suspense>
      </Canvas>
    </div>
  )
}

useGLTF.preload('/logo-3d.glb')
