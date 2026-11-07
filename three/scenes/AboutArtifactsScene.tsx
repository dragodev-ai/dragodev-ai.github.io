'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface PointerVec {
  x: number;
  y: number;
}

function CrescentMoonArtifact({ pointer, reducedMotion }: { pointer: React.MutableRefObject<PointerVec>; reducedMotion: boolean }) {
  const ref = useRef<THREE.Group>(null);
  const crescentGeo = useMemo(() => {
    const shape = new THREE.Shape();
    shape.absarc(0, 0, 0.48, -Math.PI * 0.72, Math.PI * 0.72, false);
    shape.absarc(0.19, 0.04, 0.39, Math.PI * 0.66, -Math.PI * 0.66, true);
    shape.closePath();
    return new THREE.ExtrudeGeometry(shape, {
      depth: 0.14,
      bevelEnabled: true,
      bevelThickness: 0.045,
      bevelSize: 0.035,
      bevelSegments: 5,
      curveSegments: 32,
    });
  }, []);

  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.getElapsedTime();
    const floatY = reducedMotion ? 0 : Math.sin(t * 1.15) * 0.09;
    ref.current.position.x = THREE.MathUtils.lerp(ref.current.position.x, -2.55 + pointer.current.x * 0.24, 0.06);
    ref.current.position.y = THREE.MathUtils.lerp(ref.current.position.y, 1.18 + floatY - pointer.current.y * 0.16, 0.06);
    if (!reducedMotion) {
      ref.current.rotation.y = 0.35 + Math.sin(t * 0.6) * 0.28 + pointer.current.x * 0.25;
      ref.current.rotation.z = -0.28 + Math.cos(t * 0.45) * 0.08;
    }
  });

  return (
    <group ref={ref} position={[-2.55, 1.18, -0.35]}>
      <mesh geometry={crescentGeo}>
        <meshStandardMaterial color="#f59e0b" metalness={0.82} roughness={0.22} />
      </mesh>
    </group>
  );
}

function SmileyBadgeArtifact({ pointer, reducedMotion }: { pointer: React.MutableRefObject<PointerVec>; reducedMotion: boolean }) {
  const ref = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.getElapsedTime();
    const floatY = reducedMotion ? 0 : Math.cos(t * 1.35 + 1.1) * 0.08;
    ref.current.position.x = THREE.MathUtils.lerp(ref.current.position.x, 2.48 + pointer.current.x * 0.32, 0.07);
    ref.current.position.y = THREE.MathUtils.lerp(ref.current.position.y, 1.08 + floatY - pointer.current.y * 0.22, 0.07);
    if (!reducedMotion) {
      ref.current.rotation.y = -0.32 + pointer.current.x * 0.35 + Math.sin(t * 0.7) * 0.18;
      ref.current.rotation.x = pointer.current.y * 0.2;
    }
  });

  return (
    <group ref={ref} position={[2.48, 1.08, 0.15]}>
      {/* Warm Matte-Gloss Disc */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.38, 0.38, 0.14, 36]} />
        <meshStandardMaterial color="#eab308" metalness={0.35} roughness={0.28} />
      </mesh>
      {/* Eyes */}
      {[-0.12, 0.12].map((ex, i) => (
        <mesh key={i} position={[ex, 0.08, 0.075]}>
          <sphereGeometry args={[0.042, 16, 12]} />
          <meshStandardMaterial color="#111116" roughness={0.3} />
        </mesh>
      ))}
      {/* Curved Smile Arc */}
      <mesh position={[0, -0.04, 0.075]} rotation={[0, 0, Math.PI]}>
        <torusGeometry args={[0.14, 0.024, 12, 24, Math.PI]} />
        <meshStandardMaterial color="#111116" roughness={0.3} />
      </mesh>
    </group>
  );
}

function GeometricArrowArtifact({ pointer, reducedMotion }: { pointer: React.MutableRefObject<PointerVec>; reducedMotion: boolean }) {
  const ref = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.getElapsedTime();
    const floatY = reducedMotion ? 0 : Math.sin(t * 0.95 + 2.4) * 0.10;
    ref.current.position.x = THREE.MathUtils.lerp(ref.current.position.x, -2.35 + pointer.current.x * 0.15, 0.05);
    ref.current.position.y = THREE.MathUtils.lerp(ref.current.position.y, -1.05 + floatY - pointer.current.y * 0.12, 0.05);
    if (!reducedMotion) {
      ref.current.rotation.z = -0.65 + Math.sin(t * 0.5) * 0.12;
      ref.current.rotation.y = t * 0.35 + pointer.current.x * 0.25;
    }
  });

  return (
    <group ref={ref} position={[-2.35, -1.05, -0.55]}>
      <mesh position={[0, -0.14, 0]}>
        <cylinderGeometry args={[0.075, 0.075, 0.44, 20]} />
        <meshStandardMaterial color="#8b5cf6" metalness={0.78} roughness={0.24} />
      </mesh>
      <mesh position={[0, 0.20, 0]}>
        <coneGeometry args={[0.21, 0.34, 24]} />
        <meshStandardMaterial color="#a855f7" metalness={0.82} roughness={0.2} />
      </mesh>
    </group>
  );
}

function CreativeBrickArtifact({ pointer, reducedMotion }: { pointer: React.MutableRefObject<PointerVec>; reducedMotion: boolean }) {
  const ref = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.getElapsedTime();
    const floatY = reducedMotion ? 0 : Math.cos(t * 1.1 + 0.6) * 0.085;
    ref.current.position.x = THREE.MathUtils.lerp(ref.current.position.x, 2.32 + pointer.current.x * 0.26, 0.06);
    ref.current.position.y = THREE.MathUtils.lerp(ref.current.position.y, -1.02 + floatY - pointer.current.y * 0.18, 0.06);
    if (!reducedMotion) {
      ref.current.rotation.x = 0.42 + Math.sin(t * 0.65) * 0.18;
      ref.current.rotation.y = -0.48 + Math.cos(t * 0.52) * 0.22 + pointer.current.x * 0.2;
    }
  });

  const studs: Array<[number, number]> = [
    [-0.14, -0.09],
    [0.14, -0.09],
    [-0.14, 0.09],
    [0.14, 0.09],
  ];

  return (
    <group ref={ref} position={[2.32, -1.02, 0.05]}>
      <mesh>
        <boxGeometry args={[0.58, 0.26, 0.38]} />
        <meshStandardMaterial color="#c026d3" metalness={0.35} roughness={0.32} />
      </mesh>
      {studs.map(([sx, sz], i) => (
        <mesh key={i} position={[sx, 0.165, sz]}>
          <cylinderGeometry args={[0.065, 0.065, 0.07, 20]} />
          <meshStandardMaterial color="#d946ef" metalness={0.38} roughness={0.28} />
        </mesh>
      ))}
    </group>
  );
}

function AbstractMetallicForm({ pointer, reducedMotion }: { pointer: React.MutableRefObject<PointerVec>; reducedMotion: boolean }) {
  const ref = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.getElapsedTime();
    ref.current.position.x = THREE.MathUtils.lerp(ref.current.position.x, 0.15 + pointer.current.x * 0.12, 0.04);
    ref.current.position.y = THREE.MathUtils.lerp(ref.current.position.y, 1.45 - pointer.current.y * 0.1, 0.04);
    if (!reducedMotion) {
      ref.current.rotation.x = t * 0.24;
      ref.current.rotation.y = t * 0.32;
    }
  });

  return (
    <mesh ref={ref} position={[0.15, 1.45, -1.1]}>
      <torusKnotGeometry args={[0.24, 0.068, 96, 16]} />
      <meshStandardMaterial color="#d4d4d8" metalness={0.94} roughness={0.14} />
    </mesh>
  );
}

export function AboutArtifactsScene() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const pointer = useRef<PointerVec>({ x: 0, y: 0 });
  const [visible, setVisible] = useState(false);
  const [webglOk, setWebglOk] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const c = document.createElement('canvas');
      if (!(c.getContext('webgl2') || c.getContext('webgl'))) setWebglOk(false);
    } catch {
      setWebglOk(false);
    }

    setReducedMotion(window.matchMedia('(prefers-reduced-motion: reduce)').matches);

    let obs: IntersectionObserver | null = null;
    if (wrapRef.current && 'IntersectionObserver' in window) {
      obs = new IntersectionObserver(
        (entries) => setVisible(entries[0]?.isIntersecting ?? false),
        { threshold: 0.05 }
      );
      obs.observe(wrapRef.current);
    }

    const onMove = (e: PointerEvent) => {
      if (!wrapRef.current) return;
      const r = wrapRef.current.getBoundingClientRect();
      if (e.clientY < r.top - 120 || e.clientY > r.bottom + 120) return;
      pointer.current.x = THREE.MathUtils.clamp(((e.clientX - r.left) / Math.max(1, r.width)) * 2 - 1, -1, 1);
      pointer.current.y = THREE.MathUtils.clamp(((e.clientY - r.top) / Math.max(1, r.height)) * 2 - 1, -1, 1);
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => {
      window.removeEventListener('pointermove', onMove);
      obs?.disconnect();
    };
  }, []);

  if (!webglOk) {
    return <div ref={wrapRef} className="pointer-events-none absolute inset-0" aria-hidden="true" />;
  }

  return (
    <div
      ref={wrapRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 hidden opacity-90 lg:block"
    >
      <Canvas
        dpr={[1, 1.4]}
        frameloop={visible ? 'always' : 'never'}
        camera={{ position: [0, 0, 4.4], fov: 40 }}
        gl={{ alpha: true, antialias: true }}
      >
        <ambientLight intensity={0.65} />
        <directionalLight position={[3, 4, 5]} intensity={2.2} color="#fff7ed" />
        <pointLight position={[-3, -2, 3]} intensity={3.5} color="#a855f7" />
        <CrescentMoonArtifact pointer={pointer} reducedMotion={reducedMotion} />
        <SmileyBadgeArtifact pointer={pointer} reducedMotion={reducedMotion} />
        <GeometricArrowArtifact pointer={pointer} reducedMotion={reducedMotion} />
        <CreativeBrickArtifact pointer={pointer} reducedMotion={reducedMotion} />
        <AbstractMetallicForm pointer={pointer} reducedMotion={reducedMotion} />
      </Canvas>
    </div>
  );
}
