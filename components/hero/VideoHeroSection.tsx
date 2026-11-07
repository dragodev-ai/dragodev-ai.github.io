'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import {
  ArrowDownRight,
  Maximize2,
  Pause,
  Play,
  RotateCcw,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { useStudioExperience } from '@/lib/audio/studio-audio-context';

function formatTimecode(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return '00:00';
  const whole = Math.floor(seconds);
  const mins = Math.floor(whole / 60);
  const secs = whole % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export function VideoHeroSection() {
  const { activeProject } = useStudioExperience();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);

  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(52);
  const wasPlayingBeforeModalRef = useRef(false);
  const userPausedRef = useRef(false);
  const userMutedRef = useRef(false);
  const activeProjectRef = useRef(activeProject);
  activeProjectRef.current = activeProject;

  // Pause hero video automatically when CinemaVideoPlayerModal opens so audio never overlaps
  useEffect(() => {
    const vid = videoRef.current;
    if (!vid) return;

    if (activeProject) {
      wasPlayingBeforeModalRef.current = !vid.paused;
      if (!vid.paused) {
        vid.pause();
      }
    } else if (wasPlayingBeforeModalRef.current && !userPausedRef.current) {
      vid.play().catch(() => undefined);
      wasPlayingBeforeModalRef.current = false;
    }
  }, [activeProject]);

  // Default Audio + Video Autoplay ON, with automatic first-interaction audio unlock if browser policy defers sound,
  // plus off-screen IntersectionObserver auto-pause for smooth scrolling.
  useEffect(() => {
    const vid = videoRef.current;
    const stage = stageRef.current;
    if (!vid) return;

    let cleanupUnlock: (() => void) | null = null;
    const events = ['pointerdown', 'mousedown', 'touchstart', 'keydown', 'click'] as const;

    const attachInstantAudioUnlock = () => {
      if (cleanupUnlock) return;

      const unlockAudio = (e: Event) => {
        const target = e.target as Element | null;
        if (target?.closest?.('[data-testid="hero-sound-toggle"]')) {
          cleanupUnlock?.();
          return;
        }
        const v = videoRef.current;
        if (!v || userMutedRef.current) {
          cleanupUnlock?.();
          return;
        }
        v.muted = false;
        v.volume = 0.92;
        setIsMuted(false);
        if (v.paused && !userPausedRef.current && !activeProjectRef.current) {
          v.play().catch(() => undefined);
        }
        cleanupUnlock?.();
      };

      events.forEach((evt) =>
        window.addEventListener(evt, unlockAudio, { capture: true, passive: true })
      );
      cleanupUnlock = () => {
        events.forEach((evt) => window.removeEventListener(evt, unlockAudio, { capture: true }));
        cleanupUnlock = null;
      };
    };

    const startWithSoundByDefault = async () => {
      vid.volume = 0.92;
      vid.muted = false;
      try {
        await vid.play();
        setIsPlaying(true);
        setIsMuted(false);
      } catch {
        // Fallback when strict browser policy temporarily blocks unmuted autoplay before sticky activation:
        // keep video playing immediately and auto-enable audio on any touch/click/keypress anywhere on the page.
        vid.muted = true;
        setIsMuted(true);
        attachInstantAudioUnlock();
        try {
          await vid.play();
          setIsPlaying(true);
        } catch {
          setIsPlaying(false);
        }
      }
    };

    void startWithSoundByDefault();

    if (!stage || typeof IntersectionObserver === 'undefined') {
      return () => {
        cleanupUnlock?.();
      };
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return;
        if (!entry.isIntersecting) {
          if (!vid.paused) {
            vid.pause();
          }
        } else if (vid.paused && !userPausedRef.current && !activeProjectRef.current) {
          vid.play().catch(() => undefined);
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(stage);
    return () => {
      observer.disconnect();
      cleanupUnlock?.();
    };
  }, []);

  const toggleSound = useCallback(() => {
    const vid = videoRef.current;
    if (!vid) return;
    const nextMuted = !vid.muted;
    userMutedRef.current = nextMuted;
    vid.muted = nextMuted;
    if (!nextMuted) {
      vid.volume = 0.92;
      userPausedRef.current = false;
      if (vid.paused) {
        vid.play().catch(() => undefined);
      }
    }
    setIsMuted(nextMuted);
  }, []);

  const togglePlay = useCallback(() => {
    const vid = videoRef.current;
    if (!vid) return;
    if (vid.paused) {
      userPausedRef.current = false;
      vid.play().catch(() => undefined);
    } else {
      userPausedRef.current = true;
      vid.pause();
    }
  }, []);

  const restartWithSound = useCallback(() => {
    const vid = videoRef.current;
    if (!vid) return;
    userPausedRef.current = false;
    userMutedRef.current = false;
    vid.currentTime = 0;
    vid.muted = false;
    vid.volume = 0.92;
    setIsMuted(false);
    vid.play().catch(() => undefined);
  }, []);

  const handleVideoSurfaceClick = useCallback(() => {
    const vid = videoRef.current;
    if (!vid) return;
    if (vid.muted) {
      userPausedRef.current = false;
      userMutedRef.current = false;
      vid.muted = false;
      vid.volume = 0.92;
      setIsMuted(false);
      if (vid.paused) {
        vid.play().catch(() => undefined);
      }
      return;
    }
    if (vid.paused) {
      userPausedRef.current = false;
      vid.play().catch(() => undefined);
    } else {
      userPausedRef.current = true;
      vid.pause();
    }
  }, []);

  const handleScrub = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const vid = videoRef.current;
    const nextTime = Number(e.target.value);
    setCurrentTime(nextTime);
    if (vid && Number.isFinite(nextTime)) {
      vid.currentTime = nextTime;
    }
  }, []);

  const handleFullscreen = useCallback(() => {
    const target = stageRef.current || videoRef.current;
    if (!target) return;
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => undefined);
    } else if (target.requestFullscreen) {
      target.requestFullscreen().catch(() => undefined);
    }
  }, []);

  const progressPercent = duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0;

  return (
    <section
      id="hero"
      aria-label="Dev Kumawat Creative Portfolio Showcase Film"
      className="relative w-full overflow-hidden bg-gradient-to-b from-[#04071A] via-[#060919] to-[#070709] pb-8 pt-[4.75rem] sm:pb-10 sm:pt-[5.25rem]"
    >
      {/* Screen-reader & SEO primary heading without overlaying baked-in film typography */}
      <h1 className="sr-only">
        Dev Kumawat — Video Editor, Graphic Designer, Photographer, Creative Director &amp; AI
        Creative Specialist
      </h1>

      {/* Ambient Cobalt Studio Glow Matching Film Palette */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_42%,rgba(59,99,255,0.20),transparent_70%)]"
      />

      <div className="relative z-10 mx-auto flex w-full max-w-[1640px] flex-col items-center px-3 sm:px-6 lg:px-8">
        {/* Unobstructed 16:9 Full-HD Cinema Showcase Viewport — scales seamlessly from 320px phones to 4K monitors */}
        <div
          ref={stageRef}
          data-testid="hero-video-stage"
          className="group relative aspect-video w-full max-w-full overflow-hidden rounded-2xl border border-white/10 bg-[#04071A] shadow-[0_28px_90px_rgba(0,0,0,0.85),0_0_70px_rgba(59,99,255,0.14)] sm:rounded-3xl lg:max-h-[calc(100svh-12rem)] lg:w-auto"
        >
          <video
            ref={videoRef}
            data-testid="hero-showcase-video"
            src="/videos/DEV_KUMAWAT_SAAS_WEB.mp4"
            poster="/videos/dev-kumawat-hero-poster.jpg"
            autoPlay
            loop
            playsInline
            preload="auto"
            onClick={handleVideoSurfaceClick}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onLoadedMetadata={(e) => {
              const dur = e.currentTarget.duration;
              if (Number.isFinite(dur) && dur > 0) setDuration(dur);
            }}
            onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
            className="h-full w-full cursor-pointer bg-[#04071A] object-contain"
          />
        </div>

        {/* Sleek Cinema Control & Action Bar Below Video (Centered & Symmetrical Across Mobile, Tablet & Desktop) */}
        <div className="mt-3 w-full max-w-[1040px] rounded-2xl border border-white/10 bg-[#090C1C]/90 px-3.5 py-3 shadow-[0_16px_45px_rgba(0,0,0,0.55)] backdrop-blur-xl sm:px-5 lg:max-w-[840px] xl:max-w-[900px] 2xl:max-w-[1040px]">
          {/* Interactive Timeline Scrubber with 24px Touch Hit Area */}
          <div className="relative mb-2.5 flex h-5 items-center">
            <div className="pointer-events-none relative h-1.5 w-full overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#3B63FF] to-[#7C9BFF] transition-[width] duration-100"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <input
              type="range"
              suppressHydrationWarning
              aria-label="Seek showcase video timeline"
              min={0}
              max={duration || 52}
              step={0.1}
              value={currentTime}
              onChange={handleScrub}
              className="absolute inset-0 h-5 w-full cursor-pointer opacity-0"
            />
          </div>

          <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
            {/* Left Transport & Sound Controls */}
            <div className="flex flex-wrap items-center justify-between gap-2 sm:justify-start">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <button
                  type="button"
                  data-testid="hero-sound-toggle"
                  onClick={toggleSound}
                  className={`inline-flex min-h-[38px] items-center gap-2 whitespace-nowrap rounded-full px-3.5 py-2 font-mono text-[11px] font-semibold uppercase tracking-[0.13em] transition sm:px-4 sm:text-xs ${
                    isMuted
                      ? 'bg-[#3B63FF] text-white shadow-[0_0_24px_rgba(59,99,255,0.5)] hover:bg-[#5277FF]'
                      : 'border border-emerald-400/40 bg-emerald-500/15 text-emerald-200 hover:bg-emerald-500/25'
                  }`}
                >
                  {isMuted ? (
                    <>
                      <VolumeX className="h-3.5 w-3.5 shrink-0" />
                      <span>Enable Sound</span>
                    </>
                  ) : (
                    <>
                      <Volume2 className="h-3.5 w-3.5 shrink-0" />
                      <span>Sound On</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  data-testid="hero-play-toggle"
                  onClick={togglePlay}
                  aria-label={isPlaying ? 'Pause showcase video' : 'Play showcase video'}
                  className="inline-flex min-h-[38px] min-w-[38px] items-center justify-center gap-1.5 whitespace-nowrap rounded-full border border-white/15 bg-white/5 px-3 py-2 font-mono text-xs uppercase tracking-[0.14em] text-zinc-200 transition hover:border-white/30 hover:bg-white/10"
                >
                  {isPlaying ? (
                    <>
                      <Pause className="h-3.5 w-3.5 shrink-0" />
                      <span className="hidden lg:inline">Pause</span>
                    </>
                  ) : (
                    <>
                      <Play className="h-3.5 w-3.5 shrink-0 fill-current" />
                      <span className="hidden lg:inline">Play</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  data-testid="hero-restart-button"
                  onClick={restartWithSound}
                  aria-label="Replay showcase video from 0:00 with sound"
                  className="inline-flex min-h-[38px] min-w-[38px] items-center justify-center gap-1.5 whitespace-nowrap rounded-full border border-white/15 bg-white/5 px-3 py-2 font-mono text-xs uppercase tracking-[0.14em] text-zinc-200 transition hover:border-white/30 hover:bg-white/10"
                >
                  <RotateCcw className="h-3.5 w-3.5 shrink-0" />
                  <span className="hidden lg:inline">Replay 0:00</span>
                </button>

                <button
                  type="button"
                  onClick={handleFullscreen}
                  aria-label="Fullscreen video"
                  className="inline-flex min-h-[38px] min-w-[38px] items-center justify-center rounded-full border border-white/15 bg-white/5 p-2 text-zinc-200 transition hover:border-white/30 hover:bg-white/10"
                >
                  <Maximize2 className="h-3.5 w-3.5" />
                </button>
              </div>

              <span className="font-mono text-[11px] tabular-nums text-zinc-400">
                {formatTimecode(currentTime)} / {formatTimecode(duration)}
              </span>
            </div>

            {/* Right Quick Portfolio & Contact CTAs — symmetrical 2-col on mobile, inline on sm+ */}
            <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center">
              <Link
                href="/work"
                className="inline-flex min-h-[38px] items-center justify-center gap-1.5 whitespace-nowrap rounded-full border border-white/15 bg-white/5 px-4 py-2 font-condensed text-xs font-semibold uppercase tracking-[0.18em] text-zinc-100 transition hover:border-[#3B63FF] hover:bg-[#3B63FF]/20"
              >
                <span>All Work</span>
                <ArrowDownRight className="h-3.5 w-3.5 shrink-0" />
              </Link>
              <a
                href="#contact"
                className="inline-flex min-h-[38px] items-center justify-center gap-1.5 whitespace-nowrap rounded-full bg-white px-4 py-2 font-condensed text-xs font-bold uppercase tracking-[0.18em] text-zinc-950 transition hover:bg-zinc-200"
              >
                <span>Get In Touch</span>
                <ArrowDownRight className="h-3.5 w-3.5 shrink-0" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
