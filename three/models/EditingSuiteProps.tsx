'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { PortfolioProject } from '@/lib/content/types';

interface EditingSuitePropsConfig {
  monitorProjects: PortfolioProject[];
  onSelectProject: (project: PortfolioProject) => void;
  reducedMotion: boolean;
}

/**
 * Generates a live animated NLE Video Editing Timeline + Color Grading Scopes CanvasTexture
 * for the Ultrawide Main Studio Monitor, compositing real portfolio project metadata & playhead!
 */
function useNleTimelineTexture(activeTitle: string, reducedMotion: boolean) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const texture = useMemo(() => {
    if (typeof document === 'undefined') return null;
    const c = document.createElement('canvas');
    c.width = 1024;
    c.height = 440;
    canvasRef.current = c;
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }, []);

  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    const vid = document.createElement('video');
    vid.src = '/api/drive/stream/15pG7_-tCMWDAEhK7Xb5SPhJVAiRJwR0A';
    vid.crossOrigin = 'anonymous';
    vid.muted = true;
    vid.loop = true;
    vid.playsInline = true;
    vid.preload = 'metadata';
    vid.play().catch(() => undefined);
    videoRef.current = vid;
    return () => {
      vid.pause();
      vid.removeAttribute('src');
    };
  }, []);

  useFrame((state) => {
    const canvas = canvasRef.current;
    if (!canvas || !texture) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const t = reducedMotion ? 2.4 : state.clock.getElapsedTime();
    ctx.fillStyle = '#0b0c12';
    ctx.fillRect(0, 0, 1024, 440);

    // Top NLE Header Bar
    ctx.fillStyle = '#141620';
    ctx.fillRect(0, 0, 1024, 34);
    ctx.fillStyle = '#a855f7';
    ctx.font = 'bold 13px monospace';
    ctx.fillText('DEV STUDIO NLE · SEQUENCE 01 // MASTER CUT 4K', 18, 22);
    ctx.fillStyle = '#f59e0b';
    const tcSec = Math.floor(t % 60)
      .toString()
      .padStart(2, '0');
    const tcFrm = Math.floor((t * 24) % 24)
      .toString()
      .padStart(2, '0');
    ctx.fillText(`01:08:${tcSec}:${tcFrm}`, 900, 22);

    // Left Panel: Lumetri / Color Wheels & Scopes
    ctx.fillStyle = '#10121a';
    ctx.fillRect(14, 44, 270, 195);
    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    ctx.strokeRect(14, 44, 270, 195);
    ctx.fillStyle = '#9ca3af';
    ctx.font = '11px monospace';
    ctx.fillText('COLOR GRADE · REC.709', 26, 64);

    const wheels = [
      { x: 68, y: 128, col: '#6366f1', lbl: 'LIFT' },
      { x: 148, y: 128, col: '#a855f7', lbl: 'GAMMA' },
      { x: 228, y: 128, col: '#f59e0b', lbl: 'GAIN' },
    ];
    wheels.forEach((w, idx) => {
      ctx.beginPath();
      ctx.arc(w.x, w.y, 28, 0, Math.PI * 2);
      ctx.strokeStyle = w.col;
      ctx.lineWidth = 2.5;
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(w.x + Math.sin(t + idx) * 4, w.y + Math.cos(t + idx) * 4, 4, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      ctx.fillStyle = '#6b7280';
      ctx.fillText(w.lbl, w.x - 16, 174);
    });

    // Center Program Monitor Window: Real Google Drive Video Feed!
    ctx.fillStyle = '#050508';
    ctx.fillRect(296, 44, 430, 195);
    const vid = videoRef.current;
    if (vid && vid.readyState >= 2) {
      try {
        ctx.drawImage(vid, 296, 44, 430, 195);
      } catch {
        // Fallback gradient if frame not yet decoded
      }
    } else {
      const grad = ctx.createLinearGradient(296, 44, 726, 239);
      grad.addColorStop(0, '#1e1b4b');
      grad.addColorStop(0.5, '#3b0764');
      grad.addColorStop(1, '#451a03');
      ctx.fillStyle = grad;
      ctx.fillRect(296, 44, 430, 195);
    }
    ctx.strokeStyle = 'rgba(168,85,247,0.45)';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(296, 44, 430, 195);
    ctx.fillStyle = 'rgba(7,7,9,0.72)';
    ctx.fillRect(306, 206, 410, 24);
    ctx.fillStyle = '#f3f4f6';
    ctx.font = 'bold 12px sans-serif';
    ctx.fillText(`LIVE MONITOR · ${activeTitle.slice(0, 38)}`, 316, 222);

    // Right Panel: Audio Meters
    ctx.fillStyle = '#10121a';
    ctx.fillRect(738, 44, 272, 195);
    ctx.fillStyle = '#9ca3af';
    ctx.font = '11px monospace';
    ctx.fillText('MASTER BUS · STEREO', 752, 64);
    for (let ch = 0; ch < 6; ch++) {
      const level = 40 + Math.abs(Math.sin(t * (2.4 + ch * 0.5) + ch)) * 125;
      const bx = 762 + ch * 38;
      ctx.fillStyle = '#1f2433';
      ctx.fillRect(bx, 80, 20, 140);
      const barGrad = ctx.createLinearGradient(bx, 220, bx, 80);
      barGrad.addColorStop(0, '#10b981');
      barGrad.addColorStop(0.75, '#f59e0b');
      barGrad.addColorStop(1, '#ef4444');
      ctx.fillStyle = barGrad;
      ctx.fillRect(bx, 220 - level, 20, level);
    }

    // Bottom Multi-Track Editing Timeline
    ctx.fillStyle = '#0f1119';
    ctx.fillRect(14, 250, 996, 176);
    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    ctx.strokeRect(14, 250, 996, 176);

    const tracks = [
      { y: 266, col: '#7c3aed', blocks: [[80, 190], [285, 220], [520, 165], [700, 260]], name: 'V3 · VFX' },
      { y: 304, col: '#4f46e5', blocks: [[80, 310], [400, 290], [700, 285]], name: 'V2 · GRADE' },
      { y: 342, col: '#0ea5e9', blocks: [[80, 240], [330, 180], [520, 465]], name: 'V1 · CAM A' },
      { y: 380, col: '#d97706', blocks: [[80, 905]], name: 'A1 · VOICE' },
    ];

    tracks.forEach((tr) => {
      ctx.fillStyle = '#6b7280';
      ctx.font = '10px monospace';
      ctx.fillText(tr.name, 22, tr.y + 18);
      tr.blocks.forEach(([bx, bw]) => {
        ctx.fillStyle = tr.col;
        ctx.globalAlpha = 0.82;
        ctx.fillRect(bx, tr.y, bw, 26);
        ctx.globalAlpha = 1;
        ctx.strokeStyle = 'rgba(255,255,255,0.22)';
        ctx.strokeRect(bx, tr.y, bw, 26);
      });
    });

    // Moving Red NLE Playhead
    const playheadX = 85 + (((t * 48) % 890) + 890) % 890;
    ctx.strokeStyle = '#f43f5e';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(playheadX, 252);
    ctx.lineTo(playheadX, 424);
    ctx.stroke();

    texture.needsUpdate = true;
  });

  return texture;
}

export function EditingSuiteProps({
  monitorProjects,
  onSelectProject,
  reducedMotion,
}: EditingSuitePropsConfig) {
  const [secondaryIdx, setSecondaryIdx] = useState(0);
  const [hoveredScreen, setHoveredScreen] = useState<'main' | 'secondary' | null>(null);
  const secondaryTexRef = useRef<THREE.Texture | null>(null);
  const [, setTexTick] = useState(0);

  const activeMainProject = monitorProjects[0];
  const activeSecondaryProject = monitorProjects[secondaryIdx % Math.max(1, monitorProjects.length)];

  const nleTexture = useNleTimelineTexture(
    activeMainProject?.title || 'The Show Reel — Dev Kumawat',
    reducedMotion
  );

  // Cycle secondary studio monitor preview every 6 seconds across real Drive projects
  useEffect(() => {
    if (monitorProjects.length <= 1) return;
    const id = window.setInterval(() => {
      setSecondaryIdx((prev) => (prev + 1) % monitorProjects.length);
    }, 6000);
    return () => window.clearInterval(id);
  }, [monitorProjects.length]);

  useEffect(() => {
    if (!activeSecondaryProject) return;
    const loader = new THREE.TextureLoader();
    loader.load(
      `${activeSecondaryProject.thumbnail}?sz=w640`,
      (tex) => {
        tex.colorSpace = THREE.SRGBColorSpace;
        secondaryTexRef.current = tex;
        setTexTick((x) => x + 1);
      },
      undefined,
      () => undefined
    );
  }, [activeSecondaryProject]);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    document.body.style.cursor = hoveredScreen ? 'pointer' : '';
    return () => {
      document.body.style.cursor = '';
    };
  }, [hoveredScreen]);

  // Pre-computed acoustic wall slat positions (instanced-feel clean array)
  const slatOffsets = useMemo(() => {
    const arr: number[] = [];
    for (let i = -14; i <= 14; i++) {
      arr.push(i * 0.24);
    }
    return arr;
  }, []);

  return (
    <group name="EditingStudioEnvironment">
      {/* 1. Studio Floor (Dark Charcoal Matte Architectural Floor) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[14, 12]} />
        <meshStandardMaterial color="#0b0b10" roughness={0.62} metalness={0.18} />
      </mesh>

      {/* Studio Woven Dark Area Rug beneath Desk & Character */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.004, 0.25]} receiveShadow>
        <planeGeometry args={[3.8, 2.5]} />
        <meshStandardMaterial color="#13121a" roughness={0.92} metalness={0.02} />
      </mesh>

      {/* 2. Rear Studio Wall + Vertical Walnut Acoustic Slat Panels */}
      <mesh position={[0, 2.2, -2.15]} receiveShadow>
        <planeGeometry args={[14, 5.2]} />
        <meshStandardMaterial color="#0d0d13" roughness={0.88} metalness={0.05} />
      </mesh>

      <group position={[0, 1.95, -2.08]}>
        {slatOffsets.map((xPos, idx) => (
          <mesh key={idx} position={[xPos, 0, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.09, 3.5, 0.045]} />
            <meshStandardMaterial
              color={idx % 2 === 0 ? '#2b1d14' : '#231710'}
              roughness={0.68}
              metalness={0.06}
            />
          </mesh>
        ))}
      </group>

      {/* Subtle LED Rim Light Bar along Acoustic Wall */}
      <mesh position={[0, 2.88, -2.02]}>
        <boxGeometry args={[4.4, 0.025, 0.03]} />
        <meshStandardMaterial
          color="#a855f7"
          emissive="#9333ea"
          emissiveIntensity={2.2}
          roughness={0.2}
        />
      </mesh>

      {/* Acoustic Foam Treatment Panels on Upper Wall */}
      {[-1.55, 1.55].map((xp, i) => (
        <mesh key={i} position={[xp, 2.15, -2.02]} castShadow>
          <boxGeometry args={[0.72, 0.72, 0.06]} />
          <meshStandardMaterial color="#171720" roughness={0.95} metalness={0.04} />
        </mesh>
      ))}

      {/* 3. Creative Wall Shelf with Prime Cinema Lenses & Film Clapperboard */}
      <group position={[-1.55, 1.78, -1.88]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[0.92, 0.035, 0.24]} />
          <meshStandardMaterial color="#3b2618" roughness={0.52} metalness={0.08} />
        </mesh>
        {/* 3 Cinema Prime Lenses (35mm, 50mm, 85mm) */}
        {[-0.26, -0.08, 0.10].map((lx, li) => (
          <group key={li} position={[lx, 0.08, 0]}>
            <mesh castShadow>
              <cylinderGeometry args={[0.042, 0.045, 0.12 + li * 0.02, 20]} />
              <meshStandardMaterial color="#18181f" roughness={0.34} metalness={0.72} />
            </mesh>
            <mesh position={[0, 0.02, 0]}>
              <cylinderGeometry args={[0.044, 0.044, 0.012, 20]} />
              <meshStandardMaterial color="#f59e0b" roughness={0.3} metalness={0.6} />
            </mesh>
          </group>
        ))}
        {/* Studio Clapperboard Slate */}
        <mesh position={[0.30, 0.09, 0]} rotation={[0, -0.18, 0.06]} castShadow>
          <boxGeometry args={[0.16, 0.13, 0.018]} />
          <meshStandardMaterial color="#141418" roughness={0.6} />
        </mesh>
      </group>

      {/* 4. Professional Video Editing Desk (Positioned at Z = -0.82 behind Dev!) */}
      <group position={[0, 0, -0.82]}>
        {/* Dark Walnut Desktop Slab */}
        <mesh position={[0, 0.76, 0]} castShadow receiveShadow>
          <boxGeometry args={[2.55, 0.055, 0.92]} />
          <meshStandardMaterial color="#362216" roughness={0.44} metalness={0.08} />
        </mesh>
        {/* Matte Black Steel Desk Legs & Crossbar */}
        {[-1.14, 1.14].map((lx, idx) => (
          <group key={idx} position={[lx, 0.37, 0]}>
            <mesh castShadow>
              <boxGeometry args={[0.06, 0.74, 0.76]} />
              <meshStandardMaterial color="#121217" roughness={0.4} metalness={0.75} />
            </mesh>
          </group>
        ))}

        {/* Desk Leather Mat, Backlit Mechanical Keyboard, Mouse & Colorist Trackball */}
        <mesh position={[0, 0.79, 0.16]} receiveShadow>
          <boxGeometry args={[0.98, 0.006, 0.36]} />
          <meshStandardMaterial color="#14141a" roughness={0.85} />
        </mesh>
        {/* Keyboard */}
        <mesh position={[-0.08, 0.802, 0.18]} castShadow>
          <boxGeometry args={[0.42, 0.02, 0.14]} />
          <meshStandardMaterial
            color="#1c1c24"
            emissive="#7c3aed"
            emissiveIntensity={0.22}
            roughness={0.4}
            metalness={0.5}
          />
        </mesh>
        {/* Precision Mouse */}
        <mesh position={[0.24, 0.802, 0.19]} castShadow>
          <boxGeometry args={[0.065, 0.024, 0.11]} />
          <meshStandardMaterial color="#1d1d26" roughness={0.35} metalness={0.45} />
        </mesh>
        {/* Color Grading Control Panel (Left of Keyboard) */}
        <group position={[-0.52, 0.802, 0.16]} rotation={[0, 0.22, 0]}>
          <mesh castShadow>
            <boxGeometry args={[0.28, 0.022, 0.18]} />
            <meshStandardMaterial color="#181820" roughness={0.38} metalness={0.65} />
          </mesh>
          {[-0.08, 0, 0.08].map((wx, wi) => (
            <mesh key={wi} position={[wx, 0.018, 0]}>
              <sphereGeometry args={[0.022, 16, 12]} />
              <meshStandardMaterial color="#7c3aed" roughness={0.25} metalness={0.6} />
            </mesh>
          ))}
        </group>

        {/* Studio Reference Nearfield Speakers (Left & Right on Isolation Stands) */}
        {[-1.06, 1.06].map((sx, si) => (
          <group key={si} position={[sx, 1.02, -0.14]} rotation={[0, si === 0 ? 0.28 : -0.28, 0]}>
            <mesh position={[0, -0.12, 0]} castShadow>
              <cylinderGeometry args={[0.035, 0.055, 0.22, 16]} />
              <meshStandardMaterial color="#16161d" roughness={0.4} metalness={0.75} />
            </mesh>
            <mesh castShadow>
              <boxGeometry args={[0.20, 0.30, 0.22]} />
              <meshStandardMaterial color="#14141b" roughness={0.52} metalness={0.32} />
            </mesh>
            {/* Amber/Kevlar Woofer Cone */}
            <mesh position={[0, -0.04, 0.112]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.062, 0.062, 0.008, 24]} />
              <meshStandardMaterial color="#d97706" roughness={0.45} metalness={0.2} />
            </mesh>
            {/* Dome Tweeter */}
            <mesh position={[0, 0.075, 0.112]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.026, 0.026, 0.008, 18]} />
              <meshStandardMaterial color="#272732" roughness={0.3} metalness={0.7} />
            </mesh>
          </group>
        ))}

        {/* Studio Headphones on Aluminum Stand */}
        <group position={[0.78, 0.79, 0.18]}>
          <mesh position={[0, 0.12, 0]} castShadow>
            <cylinderGeometry args={[0.01, 0.04, 0.24, 14]} />
            <meshStandardMaterial color="#52525b" roughness={0.28} metalness={0.85} />
          </mesh>
          <mesh position={[0, 0.22, 0]} rotation={[0, 0, 0]}>
            <torusGeometry args={[0.075, 0.012, 12, 24, Math.PI]} />
            <meshStandardMaterial color="#18181b" roughness={0.5} />
          </mesh>
          {[-0.075, 0.075].map((hx, hi) => (
            <mesh key={hi} position={[hx, 0.15, 0]}>
              <boxGeometry args={[0.028, 0.075, 0.062]} />
              <meshStandardMaterial color="#1f1f28" roughness={0.45} metalness={0.4} />
            </mesh>
          ))}
        </group>

        {/* Warm Practical Architect Desk Lamp (Left Rear Corner) */}
        <group position={[-0.86, 0.79, -0.22]}>
          <mesh position={[0, 0.015, 0]}>
            <cylinderGeometry args={[0.07, 0.08, 0.03, 20]} />
            <meshStandardMaterial color="#181820" roughness={0.35} metalness={0.8} />
          </mesh>
          <mesh position={[0.04, 0.24, 0.02]} rotation={[0, 0, -0.2]}>
            <cylinderGeometry args={[0.01, 0.01, 0.46, 12]} />
            <meshStandardMaterial color="#272730" roughness={0.35} metalness={0.8} />
          </mesh>
          <mesh position={[0.14, 0.44, 0.06]} rotation={[0.35, 0, -0.55]}>
            <coneGeometry args={[0.085, 0.14, 20, 1, true]} />
            <meshStandardMaterial color="#1c1c24" roughness={0.4} metalness={0.7} side={THREE.DoubleSide} />
          </mesh>
          <mesh position={[0.15, 0.40, 0.07]}>
            <sphereGeometry args={[0.032, 14, 12]} />
            <meshStandardMaterial color="#fef3c7" emissive="#f59e0b" emissiveIntensity={3.2} />
          </mesh>
        </group>

        {/* 5. MAIN ULTRAWIDE EDITING MONITOR (Timeline + Live Portfolio Video — Clickable!) */}
        <group position={[-0.18, 1.18, -0.18]}>
          {/* Monitor Arm */}
          <mesh position={[0, -0.22, -0.08]} castShadow>
            <boxGeometry args={[0.07, 0.36, 0.06]} />
            <meshStandardMaterial color="#181820" roughness={0.35} metalness={0.8} />
          </mesh>
          {/* Bezel Chassis */}
          <mesh castShadow>
            <boxGeometry args={[1.18, 0.52, 0.035]} />
            <meshStandardMaterial color="#0f0f15" roughness={0.32} metalness={0.65} />
          </mesh>
          {/* Active NLE Screen Surface */}
          <mesh
            position={[0, 0, 0.019]}
            onPointerOver={() => setHoveredScreen('main')}
            onPointerOut={() => setHoveredScreen(null)}
            onClick={(e) => {
              e.stopPropagation();
              if (activeMainProject) onSelectProject(activeMainProject);
            }}
          >
            <planeGeometry args={[1.13, 0.48]} />
            <meshBasicMaterial map={nleTexture || undefined} color="#ffffff" />
          </mesh>
        </group>

        {/* 6. SECONDARY STUDIO PREVIEW MONITOR (Angled Right — Displays Real Drive Previews!) */}
        <group position={[0.72, 1.16, -0.06]} rotation={[0, -0.36, 0]}>
          <mesh position={[0, -0.20, -0.06]} castShadow>
            <boxGeometry args={[0.055, 0.34, 0.05]} />
            <meshStandardMaterial color="#181820" roughness={0.35} metalness={0.8} />
          </mesh>
          <mesh castShadow>
            <boxGeometry args={[0.68, 0.42, 0.03]} />
            <meshStandardMaterial color="#101017" roughness={0.32} metalness={0.65} />
          </mesh>
          <mesh
            position={[0, 0, 0.017]}
            onPointerOver={() => setHoveredScreen('secondary')}
            onPointerOut={() => setHoveredScreen(null)}
            onClick={(e) => {
              e.stopPropagation();
              if (activeSecondaryProject) onSelectProject(activeSecondaryProject);
            }}
          >
            <planeGeometry args={[0.64, 0.38]} />
            {secondaryTexRef.current ? (
              <meshBasicMaterial map={secondaryTexRef.current} />
            ) : (
              <meshStandardMaterial
                color="#1e1b4b"
                emissive="#4c1d95"
                emissiveIntensity={0.6}
              />
            )}
          </mesh>
        </group>
      </group>

      {/* 7. Premium Ergonomic Leather Studio Chair (Angled beside editing station) */}
      <group position={[-0.92, 0, 0.08]} rotation={[0, 0.62, 0]}>
        {/* 5-Star Base & Pedestal */}
        <mesh position={[0, 0.24, 0]} castShadow>
          <cylinderGeometry args={[0.032, 0.04, 0.42, 16]} />
          <meshStandardMaterial color="#1c1c24" roughness={0.3} metalness={0.85} />
        </mesh>
        {[0, 1, 2, 3, 4].map((leg) => (
          <mesh
            key={leg}
            position={[0, 0.05, 0]}
            rotation={[0, (leg * Math.PI * 2) / 5, 0]}
            castShadow
          >
            <boxGeometry args={[0.035, 0.025, 0.52]} />
            <meshStandardMaterial color="#1f1f29" roughness={0.35} metalness={0.8} />
          </mesh>
        ))}
        {/* Leather Seat Cushion */}
        <mesh position={[0, 0.47, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.50, 0.075, 0.48]} />
          <meshStandardMaterial color="#15151c" roughness={0.52} metalness={0.12} />
        </mesh>
        {/* Sculpted Backrest & Headrest */}
        <mesh position={[0, 0.84, -0.21]} rotation={[-0.08, 0, 0]} castShadow>
          <boxGeometry args={[0.46, 0.68, 0.07]} />
          <meshStandardMaterial color="#14141b" roughness={0.50} metalness={0.12} />
        </mesh>
        <mesh position={[0, 1.24, -0.24]} castShadow>
          <boxGeometry args={[0.28, 0.14, 0.065]} />
          <meshStandardMaterial color="#181820" roughness={0.48} metalness={0.12} />
        </mesh>
        {/* Armrests */}
        {[-0.25, 0.25].map((ax, ai) => (
          <mesh key={ai} position={[ax, 0.64, -0.02]} castShadow>
            <boxGeometry args={[0.05, 0.03, 0.30]} />
            <meshStandardMaterial color="#1c1c25" roughness={0.45} metalness={0.4} />
          </mesh>
        ))}
      </group>

      {/* 8. Cinema Camera Rig on Fluid-Head Tripod (Right Foreground/Midground) */}
      <group position={[1.48, 0, 0.28]} rotation={[0, -0.52, 0]}>
        {/* Tripod Legs */}
        {[-0.22, 0, 0.22].map((ang, li) => (
          <mesh
            key={li}
            position={[Math.sin(li * 2.1) * 0.16, 0.58, Math.cos(li * 2.1) * 0.16]}
            rotation={[Math.cos(li * 2.1) * 0.16, 0, -Math.sin(li * 2.1) * 0.16]}
            castShadow
          >
            <cylinderGeometry args={[0.016, 0.012, 1.18, 12]} />
            <meshStandardMaterial color="#181820" roughness={0.35} metalness={0.82} />
          </mesh>
        ))}
        {/* Camera Body + Matte Box + Cinema Lens + Red Tally LED */}
        <group position={[0, 1.18, 0]}>
          <mesh castShadow>
            <boxGeometry args={[0.18, 0.17, 0.24]} />
            <meshStandardMaterial color="#14141a" roughness={0.38} metalness={0.72} />
          </mesh>
          <mesh position={[0, 0, 0.17]} rotation={[Math.PI / 2, 0, 0]} castShadow>
            <cylinderGeometry args={[0.062, 0.058, 0.14, 24]} />
            <meshStandardMaterial color="#1c1c25" roughness={0.28} metalness={0.85} />
          </mesh>
          {/* Matte Box */}
          <mesh position={[0, 0, 0.25]} castShadow>
            <boxGeometry args={[0.19, 0.15, 0.04]} />
            <meshStandardMaterial color="#0f0f14" roughness={0.55} metalness={0.4} />
          </mesh>
          {/* Live Red Recording Tally Light */}
          <mesh position={[0.065, 0.075, 0.12]}>
            <sphereGeometry args={[0.01, 10, 10]} />
            <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={3.5} />
          </mesh>
        </group>
      </group>

      {/* 9. Professional Studio Softbox Key Light Stand (Left Side) */}
      <group position={[-1.78, 0, 0.42]} rotation={[0, 0.58, 0]}>
        <mesh position={[0, 0.85, 0]} castShadow>
          <cylinderGeometry args={[0.018, 0.022, 1.7, 14]} />
          <meshStandardMaterial color="#181820" roughness={0.35} metalness={0.82} />
        </mesh>
        <group position={[0, 1.72, 0]} rotation={[0.18, 0, 0]}>
          <mesh castShadow>
            <boxGeometry args={[0.56, 0.42, 0.20]} />
            <meshStandardMaterial color="#111116" roughness={0.75} />
          </mesh>
          <mesh position={[0, 0, 0.102]}>
            <planeGeometry args={[0.50, 0.36]} />
            <meshStandardMaterial
              color="#fffbeb"
              emissive="#fbbf24"
              emissiveIntensity={1.65}
              roughness={0.25}
            />
          </mesh>
        </group>
      </group>
    </group>
  );
}
