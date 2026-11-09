'use client';

import React, { useEffect, useRef, useState } from 'react';

interface ClickSpreadWave {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  alpha: number;
}

interface TrailNode {
  x: number;
  y: number;
}

const INTERACTIVE_SELECTOR =
  'a, button, [role="button"], input, select, textarea, summary, label, video, [data-glow-btn]';

function createFilmGrainDataUrl(): string {
  const size = 160;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  const img = ctx.createImageData(size, size);
  const data = img.data;
  // Deterministic PRNG so grain is organic and crisp without flicker
  let seed = 1337;
  const rand = () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };

  for (let i = 0; i < data.length; i += 4) {
    const v = Math.floor(rand() * 255);
    data[i] = v;
    data[i + 1] = v;
    data[i + 2] = v;
    data[i + 3] = 42;
  }

  ctx.putImageData(img, 0, 0);
  return canvas.toDataURL('image/png');
}

export function InteractiveGlassAtmosphere() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cursorLensRef = useRef<HTMLDivElement>(null);
  const cursorDotRef = useRef<HTMLDivElement>(null);

  const [grainUrl, setGrainUrl] = useState<string>('');
  const [finePointerActive, setFinePointerActive] = useState(false);
  const [isHoveringInteractive, setIsHoveringInteractive] = useState(false);
  const [isPointerPressed, setIsPointerPressed] = useState(false);

  useEffect(() => {
    setGrainUrl(createFilmGrainDataUrl());
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const finePointerQuery = window.matchMedia('(pointer: fine)');

    // Render at ~0.36x viewport resolution and let GPU upscale smoothly for velvety zero-banding gradients at 60fps
    const RENDER_SCALE = 0.36;
    let vw = window.innerWidth;
    let vh = window.innerHeight;
    let cw = Math.max(320, Math.round(vw * RENDER_SCALE));
    let ch = Math.max(200, Math.round(vh * RENDER_SCALE));

    const syncCanvasSize = () => {
      vw = window.innerWidth;
      vh = window.innerHeight;
      cw = Math.max(320, Math.round(vw * RENDER_SCALE));
      ch = Math.max(200, Math.round(vh * RENDER_SCALE));
      canvas.width = cw;
      canvas.height = ch;
    };
    syncCanvasSize();

    // Pointer physics state (in viewport px)
    let rawX = vw * 0.28;
    let rawY = vh * 0.32;
    let prevRawX = rawX;
    let prevRawY = rawY;
    let smoothX = rawX;
    let smoothY = rawY;
    let lensX = rawX;
    let lensY = rawY;
    let vx = 0;
    let vy = 0;
    let smoothAngle = 0;
    let spreadBoost = 0;
    let targetSpreadBoost = 0;
    let pointerSeen = false;

    const trail: TrailNode[] = Array.from({ length: 6 }, () => ({ x: rawX, y: rawY }));
    const waves: ClickSpreadWave[] = [];

    const enableCustomCursor = (initX: number, initY: number) => {
      if (!pointerSeen && finePointerQuery.matches && !reducedMotionQuery.matches) {
        pointerSeen = true;
        prevRawX = initX;
        prevRawY = initY;
        lensX = initX;
        lensY = initY;
        smoothX = initX;
        smoothY = initY;
        trail.forEach((node) => {
          node.x = initX;
          node.y = initY;
        });
        setFinePointerActive(true);
        document.documentElement.classList.add('has-glass-cursor');
      }
    };

    const onPointerMove = (e: PointerEvent) => {
      if (e.pointerType === 'mouse' || e.pointerType === 'pen') {
        enableCustomCursor(e.clientX, e.clientY);
      }
      rawX = e.clientX;
      rawY = e.clientY;

      const dx = rawX - prevRawX;
      const dy = rawY - prevRawY;
      prevRawX = rawX;
      prevRawY = rawY;

      vx = vx * 0.76 + dx * 0.24;
      vy = vy * 0.76 + dy * 0.24;

      const target = e.target as Element | null;
      const interactive = Boolean(target?.closest?.(INTERACTIVE_SELECTOR));
      setIsHoveringInteractive((prev) => (prev === interactive ? prev : interactive));
      targetSpreadBoost = interactive ? 0.42 : 0;

      if (cursorDotRef.current) {
        cursorDotRef.current.style.transform = `translate3d(${rawX}px, ${rawY}px, 0) translate(-50%, -50%)`;
      }
    };

    const onPointerDown = (e: PointerEvent) => {
      setIsPointerPressed(true);
      spreadBoost = Math.min(1.05, spreadBoost + 0.55);
      waves.push({
        x: e.clientX,
        y: e.clientY,
        radius: 24,
        maxRadius: Math.max(vw, vh) * 0.52,
        alpha: 0.34,
      });
      if (waves.length > 4) waves.shift();
    };

    const onPointerUp = () => {
      setIsPointerPressed(false);
    };

    const drawEllipticalLobe = (
      x: number,
      y: number,
      rx: number,
      ry: number,
      rotation: number,
      innerColor: string,
      midColor: string,
      outerColor = 'rgba(4, 6, 16, 0)'
    ) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rotation);
      ctx.scale(1, ry / Math.max(1, rx));
      const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, rx);
      grad.addColorStop(0, innerColor);
      grad.addColorStop(0.46, midColor);
      grad.addColorStop(1, outerColor);
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(0, 0, rx, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    };

    let rafId = 0;
    const startTime = performance.now();

    const renderFrame = (now: number) => {
      const t = (now - startTime) * 0.001;

      // Spring interpolation for background fluid & snappy glass lens
      smoothX += (rawX - smoothX) * 0.11;
      smoothY += (rawY - smoothY) * 0.11;
      lensX += (rawX - lensX) * 0.52;
      lensY += (rawY - lensY) * 0.52;

      vx *= 0.91;
      vy *= 0.91;
      const speed = Math.hypot(vx, vy);
      if (speed > 0.35) {
        const targetAngle = Math.atan2(vy, vx);
        // Shortest angular interpolation
        const diff = Math.atan2(Math.sin(targetAngle - smoothAngle), Math.cos(targetAngle - smoothAngle));
        smoothAngle += diff * 0.24;
      }

      const velocitySpread = Math.min(0.48, speed * 0.014);
      spreadBoost += (targetSpreadBoost + velocitySpread - spreadBoost) * 0.09;

      // Update elastic comet trail nodes
      trail.forEach((node, idx) => {
        const leaderX = idx === 0 ? smoothX : trail[idx - 1].x;
        const leaderY = idx === 0 ? smoothY : trail[idx - 1].y;
        const spring = Math.max(0.08, 0.26 - idx * 0.032);
        node.x += (leaderX - node.x) * spring;
        node.y += (leaderY - node.y) * spring;
      });

      // Update Glassmorphism Cursor Lens & Pinpoint Dot transforms
      if (pointerSeen) {
        if (cursorDotRef.current) {
          cursorDotRef.current.style.transform = `translate3d(${rawX}px, ${rawY}px, 0) translate(-50%, -50%)`;
        }
        if (cursorLensRef.current) {
          const lensStretchX = 1 + Math.min(speed * 0.009, 0.2);
          const lensStretchY = Math.max(0.84, 1 / Math.sqrt(lensStretchX));
          cursorLensRef.current.style.transform = `translate3d(${lensX.toFixed(1)}px, ${lensY.toFixed(
            1
          )}px, 0) translate(-50%, -50%) rotate(${smoothAngle.toFixed(3)}rad) scale(${lensStretchX.toFixed(
            3
          )}, ${lensStretchY.toFixed(3)})`;
        }
      }

      // 1. Base Deep Studio Obsidian Canvas
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = '#04060E';
      ctx.fillRect(0, 0, cw, ch);

      const diag = Math.hypot(cw, ch);
      const sx = smoothX * RENDER_SCALE;
      const sy = smoothY * RENDER_SCALE;

      // Helper for magnetic cursor pull on autonomous background lobes
      const magneticOffset = (bx: number, by: number, strength: number) => {
        const dx = sx - bx;
        const dy = sy - by;
        const dist = Math.hypot(dx, dy) + 1;
        const factor = Math.min(1, (diag * 0.45) / dist) * strength;
        return { ox: dx * factor, oy: dy * factor };
      };

      ctx.globalCompositeOperation = 'screen';

      // Lobe 1: Top-Left Luminous Ice-Pearl & Silver-Sky Highlight (matches reference image top-left glow)
      const b1x = cw * (0.16 + Math.sin(t * 0.27) * 0.05);
      const b1y = ch * (0.22 + Math.cos(t * 0.21) * 0.06);
      const m1 = magneticOffset(b1x, b1y, 0.22);
      drawEllipticalLobe(
        b1x + m1.ox,
        b1y + m1.oy,
        diag * (0.48 + spreadBoost * 0.06),
        diag * 0.39,
        -0.38 + Math.sin(t * 0.18) * 0.12,
        'rgba(224, 238, 255, 0.34)',
        'rgba(124, 155, 255, 0.16)'
      );

      // Lobe 2: Right-Side Saturated Electric Cobalt & Sapphire Field (matches reference image right field)
      const b2x = cw * (0.84 + Math.cos(t * 0.23) * 0.06);
      const b2y = ch * (0.36 + Math.sin(t * 0.29) * 0.07);
      const m2 = magneticOffset(b2x, b2y, 0.24);
      drawEllipticalLobe(
        b2x + m2.ox,
        b2y + m2.oy,
        diag * (0.58 + spreadBoost * 0.08),
        diag * 0.46,
        0.42 + Math.cos(t * 0.15) * 0.14,
        'rgba(43, 95, 255, 0.44)',
        'rgba(29, 58, 192, 0.21)'
      );

      // Lobe 3: Bottom-Left Cyan-Indigo & Royal Violet Sweep (matches reference image bottom-left sweep)
      const b3x = cw * (0.22 + Math.cos(t * 0.19) * 0.06);
      const b3y = ch * (0.84 + Math.sin(t * 0.24) * 0.05);
      const m3 = magneticOffset(b3x, b3y, 0.2);
      drawEllipticalLobe(
        b3x + m3.ox,
        b3y + m3.oy,
        diag * 0.52,
        diag * 0.38,
        0.28 + Math.sin(t * 0.2) * 0.1,
        'rgba(56, 189, 248, 0.22)',
        'rgba(109, 40, 217, 0.24)'
      );

      // Lobe 4: Subtle Warm Studio Amber Accent Pocket (ties into Dev Studio amber badges)
      const b4x = cw * (0.72 + Math.sin(t * 0.17) * 0.05);
      const b4y = ch * (0.86 + Math.cos(t * 0.22) * 0.05);
      drawEllipticalLobe(
        b4x,
        b4y,
        diag * 0.36,
        diag * 0.28,
        -0.25,
        'rgba(245, 158, 11, 0.09)',
        'rgba(59, 99, 255, 0.08)'
      );

      // 2. Cursor-Reactive Elastic STRETCH & SPREAD Plasma Field
      const stretchFactor = 1 + Math.min(speed * 0.058, 1.55);
      const squashFactor = Math.max(0.54, 1 / Math.sqrt(stretchFactor));
      const baseCursorRadius = diag * (0.23 + spreadBoost * 0.14);

      // Elastic trailing ribbon behind fast cursor sweeps
      for (let i = trail.length - 1; i >= 1; i--) {
        const node = trail[i];
        const ratio = 1 - i / trail.length;
        drawEllipticalLobe(
          node.x * RENDER_SCALE,
          node.y * RENDER_SCALE,
          baseCursorRadius * (0.48 + ratio * 0.42) * stretchFactor * 0.85,
          baseCursorRadius * (0.42 + ratio * 0.35) * squashFactor,
          smoothAngle,
          `rgba(96, 165, 250, ${(0.085 * ratio).toFixed(3)})`,
          `rgba(59, 99, 255, ${(0.045 * ratio).toFixed(3)})`
        );
      }

      // Primary Cursor-Stretched Luminous Core (stretches along cursor direction & spreads on hover/click)
      drawEllipticalLobe(
        sx,
        sy,
        baseCursorRadius * stretchFactor,
        baseCursorRadius * squashFactor,
        smoothAngle,
        `rgba(219, 234, 254, ${(0.22 + spreadBoost * 0.12).toFixed(3)})`,
        `rgba(59, 99, 255, ${(0.2 + spreadBoost * 0.1).toFixed(3)})`
      );

      // 3. Click / Tap Radial Spread Shockwaves
      for (let i = waves.length - 1; i >= 0; i--) {
        const w = waves[i];
        w.radius += (w.maxRadius - w.radius) * 0.075 + 5;
        w.alpha *= 0.94;
        if (w.alpha < 0.012 || w.radius >= w.maxRadius) {
          waves.splice(i, 1);
          continue;
        }
        const wr = w.radius * RENDER_SCALE;
        const wx = w.x * RENDER_SCALE;
        const wy = w.y * RENDER_SCALE;
        const ringGrad = ctx.createRadialGradient(wx, wy, wr * 0.25, wx, wy, wr);
        ringGrad.addColorStop(0, `rgba(59, 99, 255, ${(w.alpha * 0.35).toFixed(3)})`);
        ringGrad.addColorStop(0.68, `rgba(186, 230, 253, ${(w.alpha * 0.65).toFixed(3)})`);
        ringGrad.addColorStop(1, 'rgba(4, 6, 16, 0)');
        ctx.fillStyle = ringGrad;
        ctx.beginPath();
        ctx.arc(wx, wy, wr, 0, Math.PI * 2);
        ctx.fill();
      }

      if (!reducedMotionQuery.matches) {
        rafId = window.requestAnimationFrame(renderFrame);
      }
    };

    renderFrame(performance.now());

    window.addEventListener('resize', syncCanvasSize, { passive: true });
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('pointerdown', onPointerDown, { passive: true });
    window.addEventListener('pointerup', onPointerUp, { passive: true });

    return () => {
      if (rafId) window.cancelAnimationFrame(rafId);
      document.documentElement.classList.remove('has-glass-cursor');
      window.removeEventListener('resize', syncCanvasSize);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointerup', onPointerUp);
    };
  }, []);

  return (
    <>
      {/* Fixed GPU-Accelerated Cursor-Reactive Mesh Gradient + Analog Film Grain */}
      <div
        aria-hidden="true"
        data-testid="interactive-ambient-background"
        className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
      >
        <canvas
          ref={canvasRef}
          className="h-full w-full scale-[1.03] object-cover opacity-95 will-change-transform"
        />
        {/* Analog Stippled Film Grain Matching Reference Aesthetic */}
        {grainUrl && (
          <div
            data-testid="ambient-grain-layer"
            style={{ backgroundImage: `url(${grainUrl})` }}
            className="absolute inset-0 bg-repeat opacity-[0.22] mix-blend-overlay"
          />
        )}
        {/* Subtle Vignette Anchor for Razor-Sharp Typography Legibility */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_38%,rgba(3,5,14,0.52)_100%)]" />
      </div>

      {/* Refractive Glassmorphism Cursor (Desktop Fine-Pointer Devices Only) */}
      {finePointerActive && (
        <div
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 z-[9999] overflow-hidden"
        >
          {/* Frosted Refractive Glass Lens Orb */}
          <div
            ref={cursorLensRef}
            data-testid="glassmorphism-cursor"
            style={{
              width: isHoveringInteractive ? 56 : 36,
              height: isHoveringInteractive ? 56 : 36,
              backdropFilter: isHoveringInteractive
                ? 'blur(6px) saturate(200%) brightness(1.22)'
                : 'blur(9px) saturate(185%) brightness(1.15)',
              WebkitBackdropFilter: isHoveringInteractive
                ? 'blur(6px) saturate(200%) brightness(1.22)'
                : 'blur(9px) saturate(185%) brightness(1.15)',
              background: isHoveringInteractive
                ? 'radial-gradient(circle at 28% 28%, rgba(255,255,255,0.34) 0%, rgba(124,155,255,0.18) 52%, rgba(59,99,255,0.10) 100%)'
                : 'radial-gradient(circle at 28% 28%, rgba(255,255,255,0.28) 0%, rgba(147,197,253,0.12) 52%, rgba(59,99,255,0.06) 100%)',
              borderColor: isHoveringInteractive
                ? 'rgba(191, 219, 254, 0.72)'
                : 'rgba(255, 255, 255, 0.42)',
              boxShadow: isPointerPressed
                ? 'inset 0 1px 3px rgba(255,255,255,0.85), 0 0 28px rgba(96,165,250,0.55)'
                : 'inset 0 1.5px 2px rgba(255,255,255,0.65), inset 0 -1.5px 3px rgba(59,99,255,0.35), 0 10px 28px rgba(4,8,24,0.42), 0 0 20px rgba(96,165,250,0.22)',
            }}
            className={`fixed left-0 top-0 rounded-full border transition-[width,height,border-color,box-shadow] duration-200 ease-out will-change-transform ${
              isPointerPressed ? 'scale-90' : ''
            }`}
          >
            {/* Top-Left Glass Specular Glint */}
            <span className="absolute left-[19%] top-[17%] h-[22%] w-[32%] -rotate-[28deg] rounded-full bg-white/30 blur-[2px]" />
          </div>

          {/* Zero-Latency Precision Center Pinpoint */}
          <div
            ref={cursorDotRef}
            className={`fixed left-0 top-0 rounded-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.95),0_0_18px_rgba(59,99,255,0.85)] transition-[width,height,opacity] duration-150 will-change-transform ${
              isHoveringInteractive ? 'h-1.5 w-1.5 opacity-95' : 'h-[5px] w-[5px] opacity-90'
            }`}
          />
        </div>
      )}
    </>
  );
}

