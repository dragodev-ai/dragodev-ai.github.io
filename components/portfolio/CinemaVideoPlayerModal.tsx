'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ExternalLink,
  Loader2,
  Maximize,
  Minimize,
  Pause,
  Play,
  RefreshCw,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react';
import type { PortfolioProject } from '@/lib/content/types';
import { useStudioExperience } from '@/lib/audio/studio-audio-context';
import { getKnownFaststartStatus, warmProjectMedia } from '@/lib/google-drive/client-warm';

function formatTime(sec: number): string {
  if (!Number.isFinite(sec) || sec < 0) return '0:00';
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60)
    .toString()
    .padStart(2, '0');
  return `${m}:${s}`;
}

export function CinemaVideoPlayerModal({ allProjects }: { allProjects: PortfolioProject[] }) {
  const { activeProject, closeProject, openProject, selectServiceForEnquiry } =
    useStudioExperience();

  const videoRef = useRef<HTMLVideoElement>(null);
  const playerShellRef = useRef<HTMLDivElement>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isBuffering, setIsBuffering] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playerVolume, setPlayerVolume] = useState(0.9);
  const [playerMuted, setPlayerMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [useDrivePreviewFallback, setUseDrivePreviewFallback] = useState(false);
  const [retryKey, setRetryKey] = useState(0);
  const stallTimerRef = useRef<number | null>(null);

  const clearStallTimer = useCallback(() => {
    if (stallTimerRef.current !== null) {
      window.clearTimeout(stallTimerRef.current);
      stallTimerRef.current = null;
    }
  }, []);

  // Reset player state whenever active project changes + smart adaptive routing for massive uncached 4K masters
  useEffect(() => {
    clearStallTimer();
    if (!activeProject) return;

    let cancelled = false;
    setIsPlaying(false);
    setIsBuffering(true);
    setCurrentTime(0);
    setDuration(0);

    const isQuicktime = activeProject.mimeType === 'video/quicktime';
    const isHeavy4KMaster = (activeProject.sizeBytes || 0) > 85 * 1024 * 1024;
    const knownFast = getKnownFaststartStatus(activeProject.id);

    if (isQuicktime || (isHeavy4KMaster && knownFast === false)) {
      setUseDrivePreviewFallback(true);
    } else {
      setUseDrivePreviewFallback(false);
      if (isHeavy4KMaster && knownFast === undefined) {
        void warmProjectMedia(activeProject).then((fastReady) => {
          if (!cancelled && !fastReady) {
            setUseDrivePreviewFallback(true);
          }
        });
      }
    }

    setRetryKey((k) => k + 1);
    return () => {
      cancelled = true;
      clearStallTimer();
    };
  }, [activeProject, clearStallTimer]);

  // Escape key + body scroll lock
  useEffect(() => {
    if (!activeProject) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeProject();
      if (e.key === ' ' && activeProject.mediaType === 'video' && !useDrivePreviewFallback) {
        if ((e.target as HTMLElement)?.tagName !== 'BUTTON') {
          e.preventDefault();
          togglePlay();
        }
      }
    };
    const onFsChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };

    window.addEventListener('keydown', onKey);
    document.addEventListener('fullscreenchange', onFsChange);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKey);
      document.removeEventListener('fullscreenchange', onFsChange);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeProject, closeProject, useDrivePreviewFallback]);

  const togglePlay = useCallback(() => {
    const vid = videoRef.current;
    if (!vid) return;
    if (vid.paused) {
      vid.play().catch(() => setUseDrivePreviewFallback(true));
    } else {
      vid.pause();
    }
  }, []);

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const vid = videoRef.current;
    const targetTime = Number(e.target.value);
    setCurrentTime(targetTime);
    if (vid && Number.isFinite(vid.duration)) {
      vid.currentTime = targetTime;
    }
  };

  const handleVolume = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setPlayerVolume(val);
    setPlayerMuted(val === 0);
    if (videoRef.current) {
      videoRef.current.volume = val;
      videoRef.current.muted = val === 0;
    }
  };

  const togglePlayerMute = () => {
    const next = !playerMuted;
    setPlayerMuted(next);
    if (videoRef.current) {
      videoRef.current.muted = next;
    }
  };

  const toggleFullscreen = async () => {
    const el = playerShellRef.current;
    if (!el) return;
    try {
      if (!document.fullscreenElement) {
        await el.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch {
      // Ignore fullscreen permission error in restricted browsers
    }
  };

  const relatedProjects = useMemo(() => {
    if (!activeProject) return [];
    return allProjects
      .filter((p) => p.id !== activeProject.id && p.category === activeProject.category)
      .slice(0, 4);
  }, [activeProject, allProjects]);

  // Pre-warm related videos while modal is open so next click plays in 0ms
  useEffect(() => {
    if (!activeProject) return;
    relatedProjects.forEach((rel) => {
      void warmProjectMedia(rel);
    });
  }, [activeProject, relatedProjects]);

  if (!activeProject) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${activeProject.title} — Cinema Player`}
      data-testid="cinema-player-modal"
      className="fixed inset-0 z-[70] flex items-center justify-center overflow-y-auto bg-black/88 p-3 backdrop-blur-xl sm:p-6"
      onClick={closeProject}
    >
      <div
        className="relative my-auto w-full max-w-5xl overflow-hidden rounded-3xl border border-white/15 bg-[#0b0b12] shadow-[0_30px_100px_rgba(0,0,0,0.9)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Modal Header */}
        <div className="flex items-center justify-between gap-4 border-b border-white/10 px-5 py-3.5 sm:px-7">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-purple-400">
                {activeProject.category}
                {activeProject.subcategory ? ` / ${activeProject.subcategory}` : ''}
              </span>
              {activeProject.verifiedLabel && (
                <span className="rounded-full border border-amber-400/30 bg-amber-500/10 px-2 py-0.5 font-mono text-[10px] text-amber-300">
                  {activeProject.verifiedLabel}
                </span>
              )}
            </div>
            <h2 className="truncate font-sans text-base font-bold text-white sm:text-lg">
              {activeProject.title}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={activeProject.driveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden items-center gap-1.5 rounded-xl border border-white/15 bg-white/[0.04] px-3 py-1.5 font-mono text-[11px] text-zinc-200 transition hover:border-purple-400 hover:text-white sm:inline-flex"
            >
              ORIGINAL DRIVE FILE
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
            <button
              type="button"
              aria-label="Close player"
              data-testid="cinema-player-close"
              onClick={closeProject}
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/15 bg-white/5 text-zinc-200 transition hover:bg-white/15 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Primary Media Stage */}
        <div
          ref={playerShellRef}
          className="relative aspect-video w-full bg-black"
        >
          {activeProject.mediaType === 'image' ? (
            <img
              src={`${activeProject.thumbnail}?sz=w1200`}
              alt={activeProject.title}
              className="h-full w-full object-contain"
            />
          ) : useDrivePreviewFallback ? (
            <iframe
              key={`iframe-${activeProject.id}-${retryKey}`}
              src={activeProject.previewUrl}
              title={activeProject.title}
              allow="autoplay; fullscreen"
              allowFullScreen
              className="h-full w-full border-0"
            />
          ) : (
            <>
              <video
                key={`video-${activeProject.id}-${retryKey}`}
                ref={videoRef}
                data-testid="cinema-html5-video"
                src={activeProject.streamUrl || undefined}
                poster={`${activeProject.thumbnail}?sz=w800`}
                playsInline
                autoPlay
                preload="auto"
                onClick={togglePlay}
                onPlay={() => {
                  clearStallTimer();
                  setIsPlaying(true);
                  setIsBuffering(false);
                }}
                onPlaying={() => {
                  clearStallTimer();
                  setIsBuffering(false);
                }}
                onPause={() => {
                  clearStallTimer();
                  setIsPlaying(false);
                }}
                onWaiting={() => {
                  setIsBuffering(true);
                  clearStallTimer();
                  stallTimerRef.current = window.setTimeout(() => {
                    setIsBuffering(false);
                    setUseDrivePreviewFallback(true);
                  }, 4500);
                }}
                onCanPlay={() => {
                  clearStallTimer();
                  setIsBuffering(false);
                }}
                onLoadedMetadata={(e) => {
                  clearStallTimer();
                  setDuration(e.currentTarget.duration || 0);
                  setIsBuffering(false);
                }}
                onTimeUpdate={(e) => {
                  clearStallTimer();
                  setCurrentTime(e.currentTarget.currentTime);
                }}
                onError={() => {
                  clearStallTimer();
                  setIsBuffering(false);
                  setUseDrivePreviewFallback(true);
                }}
                className="h-full w-full cursor-pointer object-contain"
              />

              {/* Loading / Buffering Indicator */}
              {isBuffering && (
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/35">
                  <Loader2 className="h-10 w-10 animate-spin text-purple-400" />
                </div>
              )}

              {/* Minimal Bottom Cinema Transport Bar */}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/55 to-transparent px-4 pb-3.5 pt-8">
                {/* Seek Bar */}
                <input
                  type="range"
                  min={0}
                  max={duration > 0 ? duration : 100}
                  step={0.1}
                  value={currentTime}
                  aria-label="Seek video timeline"
                  data-testid="cinema-seek-slider"
                  onChange={handleSeek}
                  className="mb-2.5 h-1.5 w-full cursor-pointer accent-purple-500"
                />

                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <button
                      type="button"
                      onClick={togglePlay}
                      aria-label={isPlaying ? 'Pause video' : 'Play video'}
                      data-testid="cinema-play-toggle"
                      className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-white transition hover:bg-purple-600"
                    >
                      {isPlaying ? (
                        <Pause className="h-4 w-4" />
                      ) : (
                        <Play className="h-4 w-4 fill-current" />
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={togglePlayerMute}
                      aria-label={playerMuted ? 'Unmute video' : 'Mute video'}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-white transition hover:bg-white/20"
                    >
                      {playerMuted || playerVolume === 0 ? (
                        <VolumeX className="h-4 w-4" />
                      ) : (
                        <Volume2 className="h-4 w-4" />
                      )}
                    </button>

                    <input
                      type="range"
                      min={0}
                      max={1}
                      step={0.05}
                      value={playerMuted ? 0 : playerVolume}
                      aria-label="Video volume"
                      onChange={handleVolume}
                      className="hidden h-1 w-20 cursor-pointer accent-purple-500 sm:block"
                    />

                    <span className="font-mono text-xs text-zinc-300">
                      {formatTime(currentTime)} / {formatTime(duration)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setIsBuffering(true);
                        setRetryKey((k) => k + 1);
                      }}
                      title="Reload stream"
                      aria-label="Reload video stream"
                      className="inline-flex h-8 items-center gap-1 rounded-lg bg-white/10 px-2.5 font-mono text-[11px] text-zinc-200 transition hover:bg-white/20"
                    >
                      <RefreshCw className="h-3.5 w-3.5" />
                      <span className="hidden md:inline">RETRY</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setUseDrivePreviewFallback(true)}
                      className="hidden rounded-lg bg-white/10 px-2.5 py-1.5 font-mono text-[11px] text-zinc-300 transition hover:bg-white/20 sm:inline-block"
                    >
                      DRIVE PLAYER
                    </button>

                    <button
                      type="button"
                      onClick={toggleFullscreen}
                      aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
                      data-testid="cinema-fullscreen-btn"
                      className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-white transition hover:bg-purple-600"
                    >
                      {isFullscreen ? (
                        <Minimize className="h-4 w-4" />
                      ) : (
                        <Maximize className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer Details + Enquiry Action + Related Projects */}
        <div className="space-y-5 p-5 sm:p-7">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <p className="max-w-2xl text-sm leading-relaxed text-zinc-300">
              {activeProject.description}
            </p>
            <button
              type="button"
              onClick={() => {
                const svc =
                  activeProject.serviceTag === 'ai-production'
                    ? 'AI-Powered Creative Production'
                    : activeProject.serviceTag === 'motion-design'
                    ? 'Motion Graphics & VFX'
                    : activeProject.serviceTag === 'graphic-design'
                    ? 'Graphic Design & Branding'
                    : 'Video Editing & Post-Production';
                closeProject();
                selectServiceForEnquiry(svc);
              }}
              className="shrink-0 rounded-full bg-purple-600 px-5 py-2.5 font-condensed text-xs font-bold uppercase tracking-[0.2em] text-white transition hover:bg-purple-500"
            >
              ENQUIRE ABOUT SIMILAR WORK
            </button>
          </div>

          {relatedProjects.length > 0 && (
            <div className="border-t border-white/10 pt-4">
              <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.22em] text-zinc-400">
                MORE IN {activeProject.category}
              </p>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {relatedProjects.map((rel) => (
                  <button
                    key={rel.id}
                    type="button"
                    onClick={() => openProject(rel)}
                    className="group overflow-hidden rounded-xl border border-white/10 bg-[#12121a] text-left transition hover:border-purple-500/60"
                  >
                    <div className="aspect-video w-full overflow-hidden bg-black">
                      <img
                        src={`${rel.thumbnail}?sz=w480`}
                        alt={rel.title}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                    <p className=" truncate px-2.5 py-2 text-xs font-medium text-zinc-200 group-hover:text-purple-300">
                      {rel.title}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

