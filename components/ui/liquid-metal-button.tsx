'use client';

import { liquidMetalFragmentShader, ShaderMount } from '@paper-design/shaders';
import { Sparkles } from 'lucide-react';
import Link from 'next/link';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

export interface LiquidMetalButtonProps {
  label?: string;
  onClick?: (e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => void;
  viewMode?: 'text' | 'icon';
  variant?: 'cta' | 'obsidian';
  href?: string;
  target?: string;
  rel?: string;
  icon?: React.ReactNode;
  width?: number;
  height?: number;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  'aria-label'?: string;
  'data-testid'?: string;
}

export function LiquidMetalButton({
  label = 'Get Started',
  onClick,
  viewMode = 'text',
  variant = 'cta',
  href,
  target,
  rel,
  icon,
  width: customWidth,
  height: customHeight,
  className,
  type = 'button',
  disabled = false,
  'aria-label': ariaLabel,
  'data-testid': dataTestId,
}: LiquidMetalButtonProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const [ripples, setRipples] = useState<Array<{ x: number; y: number; id: number }>>([]);

  const shaderRef = useRef<HTMLDivElement>(null);
  const shaderMount = useRef<ShaderMount | null>(null);
  const triggerRef = useRef<HTMLButtonElement | HTMLAnchorElement | null>(null);
  const rippleId = useRef(0);

  const dimensions = useMemo(() => {
    const h = customHeight ?? 44;
    if (viewMode === 'icon') {
      const w = customWidth ?? 46;
      return {
        width: w,
        height: customHeight ?? 46,
        innerWidth: w - 4,
        innerHeight: (customHeight ?? 46) - 4,
        shaderWidth: w,
        shaderHeight: customHeight ?? 46,
      };
    }
    const estimatedLabelWidth = Math.max(132, Math.round(label.length * 8.6 + 44));
    const w = customWidth ?? (label === 'Get Started' ? 142 : estimatedLabelWidth);
    const finalH = label === 'Get Started' && customHeight === undefined ? 46 : h;
    return {
      width: w,
      height: finalH,
      innerWidth: w - 4,
      innerHeight: finalH - 4,
      shaderWidth: w,
      shaderHeight: finalH,
    };
  }, [viewMode, customWidth, customHeight, label]);

  useEffect(() => {
    if (typeof document === 'undefined') return;

    const styleId = 'shader-canvas-style-exploded';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = `
        .shader-container-exploded canvas {
          width: 100% !important;
          height: 100% !important;
          display: block !important;
          position: absolute !important;
          top: 0 !important;
          left: 0 !important;
          border-radius: 100px !important;
        }
        @keyframes ripple-animation {
          0% {
            transform: translate(-50%, -50%) scale(0);
            opacity: 0.65;
          }
          100% {
            transform: translate(-50%, -50%) scale(4);
            opacity: 0;
          }
        }
      `;
      document.head.appendChild(style);
    }

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    try {
      if (shaderRef.current) {
        shaderMount.current?.dispose?.();

        shaderMount.current = new ShaderMount(
          shaderRef.current,
          liquidMetalFragmentShader,
          {
            u_repetition: 4,
            u_softness: 0.5,
            u_shiftRed: 0.24,
            u_shiftBlue: 0.42,
            u_distortion: 0.06,
            u_contour: 0.18,
            u_angle: 45,
            u_scale: 8,
            u_shape: 1,
            u_offsetX: 0.1,
            u_offsetY: -0.1,
            u_originX: 0.5,
            u_originY: 0.5,
            u_worldWidth: 0,
            u_worldHeight: 0,
            u_fit: 0,
            u_rotation: 0,
            u_isImage: false,
            u_colorBack: variant === 'cta' ? [0.22, 0.14, 0.02, 1] : [0.04, 0.06, 0.14, 1],
            u_colorTint: variant === 'cta' ? [1.0, 0.78, 0.22, 0.48] : [0.23, 0.39, 1.0, 0.22],
          },
          undefined,
          reducedMotion ? 0 : 0.6,
          0,
          1.5,
          160000
        );
      }
    } catch {
      // Fallback liquid-chrome CSS gradient on shaderRef handles environments without WebGL2
    }

    return () => {
      if (shaderMount.current) {
        shaderMount.current.dispose?.();
        shaderMount.current = null;
      }
    };
  }, [variant]);

  const handleMouseEnter = () => {
    setIsHovered(true);
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      shaderMount.current?.setSpeed?.(1);
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setIsPressed(false);
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      shaderMount.current?.setSpeed?.(0.6);
    }
  };

  const triggerInteraction = (e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => {
    if (disabled) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!reducedMotion && shaderMount.current?.setSpeed) {
      shaderMount.current.setSpeed(2.4);
      window.setTimeout(() => {
        shaderMount.current?.setSpeed?.(isHovered ? 1 : 0.6);
      }, 300);
    }

    if (triggerRef.current && !reducedMotion) {
      const rect = triggerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const ripple = { x, y, id: rippleId.current++ };

      setRipples((prev) => [...prev, ripple]);
      window.setTimeout(() => {
        setRipples((prev) => prev.filter((r) => r.id !== ripple.id));
      }, 600);
    }

    onClick?.(e);
  };

  const interactiveStyle: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: `${dimensions.width}px`,
    height: `${dimensions.height}px`,
    background: 'transparent',
    border: 'none',
    cursor: disabled ? 'not-allowed' : 'pointer',
    outline: 'none',
    zIndex: 40,
    transformStyle: 'preserve-3d',
    transform: 'translateZ(25px)',
    transition: 'all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1), width 0.4s ease, height 0.4s ease',
    overflow: 'hidden',
    borderRadius: '100px',
    display: 'block',
  };

  const rippleNodes = ripples.map((ripple) => (
    <span
      key={ripple.id}
      style={{
        position: 'absolute',
        left: `${ripple.x}px`,
        top: `${ripple.y}px`,
        width: '22px',
        height: '22px',
        borderRadius: '50%',
        background:
          'radial-gradient(circle, rgba(255, 255, 255, 0.55) 0%, rgba(124, 155, 255, 0.3) 45%, rgba(255, 255, 255, 0) 72%)',
        pointerEvents: 'none',
        animation: 'ripple-animation 0.6s ease-out',
      }}
    />
  ));

  return (
    <div className={cn('relative inline-block shrink-0 select-none', className)}>
      <div
        style={{
          perspective: '1000px',
          perspectiveOrigin: '50% 50%',
        }}
      >
        <div
          style={{
            position: 'relative',
            width: `${dimensions.width}px`,
            height: `${dimensions.height}px`,
            transformStyle: 'preserve-3d',
            transition:
              'all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1), width 0.4s ease, height 0.4s ease',
            transform: 'none',
          }}
        >
          {/* Foreground Label / Icon Layer */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: `${dimensions.width}px`,
              height: `${dimensions.height}px`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              transformStyle: 'preserve-3d',
              transition:
                'all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1), width 0.4s ease, height 0.4s ease, gap 0.4s ease',
              transform: `translateZ(20px) ${isPressed ? 'translateY(1px) scale(0.98)' : 'scale(1)'}`,
              zIndex: 30,
              pointerEvents: 'none',
            }}
          >
            {viewMode === 'icon' ? (
              icon || (
                <Sparkles
                  size={16}
                  style={{
                    color: isHovered ? '#FFFFFF' : '#D8E2FF',
                    filter: 'drop-shadow(0px 1px 2px rgba(0, 0, 0, 0.65))',
                    transition: 'all 0.3s ease',
                  }}
                />
              )
            ) : (
              <>
                {icon}
                <span
                  className="font-condensed uppercase tracking-[0.18em]"
                  style={{
                    fontSize: '12.5px',
                    color:
                      variant === 'cta'
                        ? '#040712'
                        : isHovered
                        ? '#FFFFFF'
                        : '#F1F5F9',
                    fontWeight: 800,
                    textShadow:
                      variant === 'cta'
                        ? '0px 1px 0px rgba(255, 255, 255, 0.45)'
                        : '0px 1px 3px rgba(0, 0, 0, 0.85)',
                    transition: 'color 0.25s ease',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {label}
                </span>
              </>
            )}
          </div>

          {/* Inner Core Pill (High-Contrast Solar Gold for Primary CTAs vs Metallic Obsidian) */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: `${dimensions.width}px`,
              height: `${dimensions.height}px`,
              transformStyle: 'preserve-3d',
              transition:
                'all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1), width 0.4s ease, height 0.4s ease',
              transform: `translateZ(10px) ${
                isPressed ? 'translateY(1px) scale(0.98)' : 'translateY(0) scale(1)'
              }`,
              zIndex: 20,
            }}
          >
            <div
              style={{
                width: `${dimensions.innerWidth}px`,
                height: `${dimensions.innerHeight}px`,
                margin: '2px',
                borderRadius: '100px',
                background:
                  variant === 'cta'
                    ? isHovered
                      ? 'linear-gradient(180deg, #FEF9C3 0%, #FCD34D 48%, #FBBF24 100%)'
                      : 'linear-gradient(180deg, #FEF08A 0%, #FBBF24 48%, #F59E0B 100%)'
                    : isHovered
                    ? 'linear-gradient(180deg, #1a2342 0%, #070913 100%)'
                    : 'linear-gradient(180deg, #1d1e26 0%, #060609 100%)',
                boxShadow: isPressed
                  ? 'inset 0px 2px 4px rgba(0, 0, 0, 0.45)'
                  : variant === 'cta'
                  ? 'inset 0px 1.5px 0px rgba(255, 255, 255, 0.82), inset 0px -1px 0px rgba(180, 83, 9, 0.45)'
                  : 'inset 0px 1px 0px rgba(255, 255, 255, 0.16)',
                transition:
                  'all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1), width 0.4s ease, height 0.4s ease, box-shadow 0.15s ease, background 0.25s ease',
              }}
            />
          </div>

          {/* Outer @paper-design/shaders WebGL Liquid Metal Ring */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: `${dimensions.width}px`,
              height: `${dimensions.height}px`,
              transformStyle: 'preserve-3d',
              transition:
                'all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1), width 0.4s ease, height 0.4s ease',
              transform: `translateZ(0px) ${
                isPressed ? 'translateY(1px) scale(0.98)' : 'translateY(0) scale(1)'
              }`,
              zIndex: 10,
            }}
          >
            <div
              style={{
                height: `${dimensions.height}px`,
                width: `${dimensions.width}px`,
                borderRadius: '100px',
                boxShadow:
                  variant === 'cta'
                    ? isPressed
                      ? '0px 0px 16px rgba(251, 191, 36, 0.45), 0px 2px 6px rgba(0, 0, 0, 0.5)'
                      : isHovered
                      ? '0px 0px 34px rgba(251, 191, 36, 0.78), 0px 10px 24px rgba(0, 0, 0, 0.5)'
                      : '0px 0px 24px rgba(251, 191, 36, 0.46), 0px 8px 20px rgba(0, 0, 0, 0.48)'
                    : isPressed
                    ? '0px 0px 0px 1px rgba(59, 99, 255, 0.45), 0px 1px 3px 0px rgba(0, 0, 0, 0.45)'
                    : isHovered
                    ? '0px 0px 24px -2px rgba(59, 99, 255, 0.65), 0px 8px 16px rgba(0, 0, 0, 0.35)'
                    : '0px 0px 0px 1px rgba(255, 255, 255, 0.14), 0px 10px 20px rgba(0, 0, 0, 0.35)',
                transition:
                  'all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1), width 0.4s ease, height 0.4s ease, box-shadow 0.2s ease',
                background:
                  variant === 'cta'
                    ? 'conic-gradient(from 45deg, #ffffff, #fef08a, #f59e0b, #ffffff, #fbbf24, #fde047, #ffffff)'
                    : 'conic-gradient(from 45deg, #f8fafc, #3b63ff, #0f172a, #93c5fd, #e2e8f0, #1e3a8a, #f8fafc)',
              }}
            >
              <div
                ref={shaderRef}
                className="shader-container-exploded"
                style={{
                  borderRadius: '100px',
                  overflow: 'hidden',
                  position: 'relative',
                  width: `${dimensions.shaderWidth}px`,
                  maxWidth: `${dimensions.shaderWidth}px`,
                  height: `${dimensions.shaderHeight}px`,
                  transition: 'width 0.4s ease, height 0.4s ease',
                }}
              />
            </div>
          </div>

          {/* Interactive Hit Layer (Link or Button) */}
          {href ? (
            <Link
              href={href}
              target={target}
              rel={rel}
              ref={(node) => {
                triggerRef.current = node;
              }}
              onClick={triggerInteraction}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              onMouseDown={() => setIsPressed(true)}
              onMouseUp={() => setIsPressed(false)}
              style={interactiveStyle}
              aria-label={ariaLabel || label}
              data-testid={dataTestId}
              className="focus-visible:ring-2 focus-visible:ring-[#3B63FF]"
            >
              <span className="sr-only">{label}</span>
              {rippleNodes}
            </Link>
          ) : (
            <button
              ref={(node) => {
                triggerRef.current = node;
              }}
              type={type}
              disabled={disabled}
              onClick={triggerInteraction}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              onMouseDown={() => setIsPressed(true)}
              onMouseUp={() => setIsPressed(false)}
              style={interactiveStyle}
              aria-label={ariaLabel || label}
              data-testid={dataTestId}
              className="focus-visible:ring-2 focus-visible:ring-[#3B63FF]"
            >
              <span className="sr-only">{label}</span>
              {rippleNodes}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

