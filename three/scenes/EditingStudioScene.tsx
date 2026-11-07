'use client';

import React, { Suspense, useEffect, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import type { PortfolioProject } from '@/lib/content/types';
import { useStudioExperience } from '@/lib/audio/studio-audio-context';
import { StudioLighting } from '@/three/lighting/StudioLighting';
import { DevCharacterModel } from '@/three/models/DevCharacterModel';
import { EditingSuiteProps } from '@/three/models/EditingSuiteProps';

interface CameraDirectorProps {
  pointerRef: React.MutableRefObject<{ x: number; y: number; active: boolean }>;
  hasEntered: boolean;
  isMobile: boolean;
  reducedMotion: boolean;
}

function StudioCameraDirector({
  pointerRef,
  hasEntered,
  isMobile,
  reducedMotion,
}: CameraDirectorProps) {
  const { camera } = useThree();
  const introProgress = useRef(0);
  const lookAtTarget = useRef(new THREE.Vector3(0, 1.32, 0.1));

  useEffect(() => {
    camera.position.set(0, 1.72, isMobile ? 4.25 : 3.95);
    camera.lookAt(0, 1.32, 0.0);
  }, [camera, isMobile]);

  useFrame((_, delta) => {
    // Cinematic camera entrance dolly: starts wider at the studio doorway, settles onto Dev & his desk
    const targetProgress = hasEntered ? 1 : 0.32;
    introProgress.current = THREE.MathUtils.lerp(
      introProgress.current,
      targetProgress,
      reducedMotion ? 0.25 : Math.min(1, delta * 1.65)
    );

    const p = introProgress.current;
    const baseZ = isMobile
      ? THREE.MathUtils.lerp(4.15, 2.95, p)
      : THREE.MathUtils.lerp(3.95, 2.38, p);
    const baseY = isMobile
      ? THREE.MathUtils.lerp(1.64, 1.38, p)
      : THREE.MathUtils.lerp(1.70, 1.40, p);

    // Subtle interactive studio parallax without motion sickness
    const ptr = pointerRef.current;
    const parallaxX = !isMobile && ptr.active && !reducedMotion ? ptr.x * 0.22 : 0;
    const parallaxY = !isMobile && ptr.active && !reducedMotion ? ptr.y * 0.09 : 0;

    camera.position.x = THREE.MathUtils.lerp(camera.position.x, parallaxX, 0.06);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, baseY + parallaxY, 0.06);
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, baseZ, 0.06);

    const targetLookY = isMobile ? 1.28 : 1.33;
    lookAtTarget.current.x = THREE.MathUtils.lerp(lookAtTarget.current.x, parallaxX * 0.28, 0.08);
    lookAtTarget.current.y = THREE.MathUtils.lerp(lookAtTarget.current.y, targetLookY, 0.08);
    lookAtTarget.current.z = 0.12;
    camera.lookAt(lookAtTarget.current);
  });

  return null;
}

class StudioWebGLErrorBoundary extends React.Component<
  { fallback: React.ReactNode; children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { fallback: React.ReactNode; children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    if (this.state.hasError) return this.props.fallback;
    return this.props.children;
  }
}

export function EditingStudioScene({
  monitorProjects,
}: {
  monitorProjects: PortfolioProject[];
}) {
  const { hasEnteredStudio, speechFrameRef, openProject } = useStudioExperience();
  const containerRef = useRef<HTMLDivElement>(null);
  const pointerRef = useRef({ x: 0, y: 0, active: false });

  const [webglAvailable, setWebglAvailable] = useState(true);
  const [isVisible, setIsVisible] = useState(true);
  const [isTabHidden, setIsTabHidden] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Detect WebGL capability safely
    try {
      const testCanvas = document.createElement('canvas');
      const gl =
        testCanvas.getContext('webgl2') ||
        testCanvas.getContext('webgl') ||
        testCanvas.getContext('experimental-webgl');
      if (!gl) setWebglAvailable(false);
    } catch {
      setWebglAvailable(false);
    }

    const mqMobile = window.matchMedia('(max-width: 768px)');
    const mqTouch = window.matchMedia('(pointer: coarse)');
    const mqReduce = window.matchMedia('(prefers-reduced-motion: reduce)');

    const syncMedia = () => {
      setIsMobile(mqMobile.matches);
      setIsTouchDevice(mqTouch.matches);
      setReducedMotion(mqReduce.matches);
    };
    syncMedia();

    mqMobile.addEventListener('change', syncMedia);
    mqReduce.addEventListener('change', syncMedia);

    const onVisChange = () => setIsTabHidden(document.hidden);
    document.addEventListener('visibilitychange', onVisChange);

    // Pause WebGL render loop when hero scrolls out of viewport (Phase 15 performance rule)
    let observer: IntersectionObserver | null = null;
    if (containerRef.current && 'IntersectionObserver' in window) {
      observer = new IntersectionObserver(
        (entries) => {
          setIsVisible(entries[0]?.isIntersecting ?? true);
        },
        { threshold: 0.05 }
      );
      observer.observe(containerRef.current);
    }

    const onPointerMove = (e: PointerEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      if (e.clientY > rect.bottom + 80) {
        pointerRef.current.active = false;
        return;
      }
      const nx = ((e.clientX - rect.left) / Math.max(1, rect.width)) * 2 - 1;
      const ny = ((e.clientY - rect.top) / Math.max(1, rect.height)) * 2 - 1;
      pointerRef.current.x = THREE.MathUtils.clamp(nx, -1, 1);
      pointerRef.current.y = THREE.MathUtils.clamp(ny, -1, 1);
      pointerRef.current.active = true;
    };

    const onPointerLeave = () => {
      pointerRef.current.active = false;
    };

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('pointerleave', onPointerLeave);

    return () => {
      mqMobile.removeEventListener('change', syncMedia);
      mqReduce.removeEventListener('change', syncMedia);
      document.removeEventListener('visibilitychange', onVisChange);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerleave', onPointerLeave);
      observer?.disconnect();
    };
  }, []);

  const fallbackView = (
    <div
      data-testid="studio-webgl-fallback"
      className="relative flex h-full w-full items-center justify-center overflow-hidden bg-gradient-to-b from-[#0b0a12] via-[#09090d] to-[#070709]"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_35%_30%,rgba(245,158,11,0.14),transparent_45%),radial-gradient(circle_at_72%_40%,rgba(147,51,234,0.18),transparent_50%)]" />
      <img
        src="/assets/dev-studio-portrait.jpg"
        alt="Dev Kumawat in his creative studio"
        className="h-[68%] max-h-[520px] w-auto rounded-2xl border border-white/10 object-cover shadow-2xl"
      />
    </div>
  );

  if (!webglAvailable) {
    return (
      <div ref={containerRef} className="absolute inset-0 h-full w-full">
        {fallbackView}
      </div>
    );
  }

  const activeFrameloop = isVisible && !isTabHidden ? 'always' : 'never';

  return (
    <div
      ref={containerRef}
      data-testid="studio-3d-canvas-container"
      className="absolute inset-0 h-full w-full"
    >
      <StudioWebGLErrorBoundary fallback={fallbackView}>
        <Canvas
          shadows={!isMobile}
          dpr={isMobile ? [1, 1.15] : [1, 1.5]}
          frameloop={activeFrameloop}
          camera={{ fov: isMobile ? 46 : 38, near: 0.1, far: 30 }}
          gl={{
            antialias: true,
            powerPreference: 'high-performance',
            toneMapping: THREE.ACESFilmicToneMapping,
            toneMappingExposure: 1.12,
          }}
        >
          <color attach="background" args={['#070709']} />
          <fog attach="fog" args={['#070709', 4.6, 10.5]} />
          <StudioCameraDirector
            pointerRef={pointerRef}
            hasEntered={hasEnteredStudio}
            isMobile={isMobile}
            reducedMotion={reducedMotion}
          />
          <StudioLighting />
          <Suspense fallback={null}>
            <EditingSuiteProps
              monitorProjects={monitorProjects}
              onSelectProject={openProject}
              reducedMotion={reducedMotion}
            />
            <DevCharacterModel
              pointerRef={pointerRef}
              speechFrameRef={speechFrameRef}
              isTouchDevice={isTouchDevice}
              reducedMotion={reducedMotion}
            />
          </Suspense>
        </Canvas>
      </StudioWebGLErrorBoundary>
    </div>
  );
}
