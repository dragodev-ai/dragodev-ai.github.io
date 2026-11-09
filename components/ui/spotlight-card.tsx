'use client';

import React, { useEffect, useRef, type CSSProperties, type HTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

export interface GlowCardProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
  className?: string;
  glowColor?: 'blue' | 'purple' | 'green' | 'red' | 'orange';
  size?: 'sm' | 'md' | 'lg';
  width?: string | number;
  height?: string | number;
  customSize?: boolean; // When true, ignores size prop and uses width/height or className
}

const glowColorMap = {
  // Tuned to DEV STUDIO's signature cobalt-to-electric-ice blue palette (#3B63FF -> #7C9BFF)
  blue: { base: 222, spread: 22 },
  purple: { base: 272, spread: 36 },
  green: { base: 145, spread: 32 },
  red: { base: 0, spread: 28 },
  orange: { base: 30, spread: 28 },
} as const;

const sizeMap = {
  sm: 'w-48 h-64',
  md: 'w-64 h-80',
  lg: 'w-80 h-96',
} as const;

type GlowVarsStyle = CSSProperties & Record<`--${string}`, string | number>;

/**
 * Single shared RAF-throttled pointer & scroll coordinator that powers both:
 * 1. `[data-glow]` spotlight cards (`GlowCard`)
 * 2. `[data-glow-btn]` cobalt-blue border-glow buttons across the website
 *
 * Uses element-local coordinates (`--gx`, `--gy`) so the radial border spotlight
 * stays 100% locked under the cursor even inside scrolled, sticky, transformed,
 * or backdrop-blurred containers.
 */
export function SpotlightGlobalTracker() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    document.documentElement.setAttribute('data-spotlight-tracker-mounted', 'true');
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return () => document.documentElement.removeAttribute('data-spotlight-tracker-mounted');
    }

    let lastClientX = -9999;
    let lastClientY = -9999;
    let rafId = 0;

    const flushPointer = () => {
      rafId = 0;
      if (lastClientX < -1000 && lastClientY < -1000) return;

      const xp = (lastClientX / Math.max(1, window.innerWidth)).toFixed(3);
      const yp = (lastClientY / Math.max(1, window.innerHeight)).toFixed(3);

      const nodes = document.querySelectorAll<HTMLElement>('[data-glow], [data-glow-btn]');
      const vh = window.innerHeight;

      for (let i = 0; i < nodes.length; i++) {
        const el = nodes[i];
        const rect = el.getBoundingClientRect();
        // Skip off-screen elements outside a 180px buffer for near-zero CPU cost
        if (rect.bottom < -180 || rect.top > vh + 180) continue;

        const gx = lastClientX - rect.left;
        const gy = lastClientY - rect.top;

        el.style.setProperty('--gx', `${gx.toFixed(1)}px`);
        el.style.setProperty('--gy', `${gy.toFixed(1)}px`);
        el.style.setProperty('--xp', xp);
        el.style.setProperty('--yp', yp);

        // Compute distance to element box so border glows smoothly as cursor nears border
        const dx = Math.max(rect.left - lastClientX, 0, lastClientX - rect.right);
        const dy = Math.max(rect.top - lastClientY, 0, lastClientY - rect.bottom);
        const dist = Math.hypot(dx, dy);
        const reach = el.hasAttribute('data-glow-btn') ? 76 : 140;
        const alpha = dist < reach ? (1 - dist / reach).toFixed(3) : '0';
        el.style.setProperty('--glow-alpha', alpha);
      }
    };

    const scheduleUpdate = () => {
      if (!rafId) {
        rafId = window.requestAnimationFrame(flushPointer);
      }
    };

    const onPointerMove = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return;
      lastClientX = e.clientX;
      lastClientY = e.clientY;
      scheduleUpdate();
    };

    const onScroll = () => {
      if (lastClientX > -1000) {
        scheduleUpdate();
      }
    };

    // Global delegated liquid-metal click ripple + 2.4x speed surge on all [data-glow-btn] buttons
    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as HTMLElement | null;
      const btn = target?.closest?.('[data-glow-btn]') as HTMLElement | null;
      if (!btn) return;

      btn.setAttribute('data-liquid-surge', 'true');
      window.setTimeout(() => {
        if (btn.isConnected) {
          btn.removeAttribute('data-liquid-surge');
        }
      }, 320);

      const rect = btn.getBoundingClientRect();
      const x = e.clientX > 0 ? e.clientX - rect.left : rect.width / 2;
      const y = e.clientY > 0 ? e.clientY - rect.top : rect.height / 2;

      let host = btn.querySelector<HTMLElement>(':scope > .liquid-btn-ripple-host');
      if (!host) {
        host = document.createElement('span');
        host.className = 'liquid-btn-ripple-host';
        host.setAttribute('aria-hidden', 'true');
        btn.appendChild(host);
      }

      const ripple = document.createElement('span');
      ripple.className = 'liquid-btn-ripple';
      ripple.style.left = `${x.toFixed(1)}px`;
      ripple.style.top = `${y.toFixed(1)}px`;
      host.appendChild(ripple);

      window.setTimeout(() => {
        ripple.remove();
        if (host && host.childElementCount === 0 && host.isConnected) {
          host.remove();
        }
      }, 620);
    };

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('pointerdown', onPointerDown, { passive: true });
    return () => {
      document.documentElement.removeAttribute('data-spotlight-tracker-mounted');
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('pointerdown', onPointerDown);
      if (rafId) window.cancelAnimationFrame(rafId);
    };
  }, []);

  return null;
}

const GlowCard = React.forwardRef<HTMLDivElement, GlowCardProps>(
  (
    {
      children,
      className = '',
      glowColor = 'blue',
      size = 'md',
      width,
      height,
      customSize = false,
      style,
      ...rest
    },
    forwardedRef
  ) => {
    const localRef = useRef<HTMLDivElement | null>(null);
    const innerRef = useRef<HTMLDivElement | null>(null);

    const setRefs = (node: HTMLDivElement | null) => {
      localRef.current = node;
      if (typeof forwardedRef === 'function') {
        forwardedRef(node);
      } else if (forwardedRef) {
        forwardedRef.current = node;
      }
    };

    // Fallback self-contained pointer listener when rendered standalone (e.g. in isolated demos)
    useEffect(() => {
      if (typeof document === 'undefined') return;
      if (document.documentElement.hasAttribute('data-spotlight-tracker-mounted')) return;

      const syncPointer = (e: PointerEvent) => {
        const el = localRef.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const gx = e.clientX - rect.left;
        const gy = e.clientY - rect.top;
        el.style.setProperty('--gx', `${gx.toFixed(1)}px`);
        el.style.setProperty('--gy', `${gy.toFixed(1)}px`);
        el.style.setProperty('--xp', (e.clientX / Math.max(1, window.innerWidth)).toFixed(3));
        el.style.setProperty('--yp', (e.clientY / Math.max(1, window.innerHeight)).toFixed(3));
        el.style.setProperty('--glow-alpha', '1');
      };

      document.addEventListener('pointermove', syncPointer, { passive: true });
      return () => document.removeEventListener('pointermove', syncPointer);
    }, []);

    const { base, spread } = glowColorMap[glowColor];

    const inlineStyles: GlowVarsStyle = {
      '--base': base,
      '--spread': spread,
      '--border': customSize ? 1.5 : 2,
      '--size': customSize ? 260 : 210,
      '--hue': 'calc(var(--base, 222) + (var(--xp, 0) * var(--spread, 22)))',
      ...(width !== undefined ? { width: typeof width === 'number' ? `${width}px` : width } : {}),
      ...(height !== undefined
        ? { height: typeof height === 'number' ? `${height}px` : height }
        : {}),
      ...style,
    };

    return (
      <div
        ref={setRefs}
        data-glow=""
        style={inlineStyles}
        className={cn(
          'relative rounded-2xl border border-white/20 bg-[#070D22]/80 shadow-[0_1rem_2rem_-1rem_rgba(0,0,0,0.85)] backdrop-blur-xl transition-colors duration-300',
          !customSize && [sizeMap[size], 'aspect-[3/4] grid grid-rows-[1fr_auto] gap-4 p-4'],
          className
        )}
        {...rest}
      >
        <div ref={innerRef} data-glow-aura="" aria-hidden="true" />
        {children}
      </div>
    );
  }
);

GlowCard.displayName = 'GlowCard';

export { GlowCard };
