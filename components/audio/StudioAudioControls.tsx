'use client';

import React, { useState } from 'react';
import { Captions, RotateCcw, Volume2, VolumeX, Radio, FileText } from 'lucide-react';
import { useStudioExperience } from '@/lib/audio/studio-audio-context';
import { profileContent } from '@/lib/content';

export function StudioAudioGateAndControls() {
  const {
    hasEnteredStudio,
    isMuted,
    volume,
    isSpeaking,
    captionsEnabled,
    activeCaption,
    enterStudio,
    toggleMute,
    setVolume,
    setCaptionsEnabled,
    replayIntro,
  } = useStudioExperience();

  const [transcriptOpen, setTranscriptOpen] = useState(false);

  return (
    <>
      {/* 1. Browser-Safe "ENTER STUDIO / ENABLE SOUND" Interactive Gate */}
      {!hasEnteredStudio && (
        <div
          data-testid="studio-entry-gate"
          role="dialog"
          aria-modal="false"
          aria-label="Enter Dev Kumawat's 3D Creative Studio"
          className="pointer-events-auto absolute inset-x-0 bottom-8 z-30 mx-auto flex max-w-xl flex-col items-center px-4"
        >
          <div className="w-full rounded-3xl border border-white/15 bg-[#09090f]/88 p-5 shadow-[0_24px_80px_rgba(0,0,0,0.85)] backdrop-blur-2xl sm:p-6">
            <div className="mb-3 flex items-center justify-between gap-2">
              <span className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.22em] text-amber-400">
                <span className="h-2 w-2 animate-pulse rounded-full bg-amber-400" />
                LIVE 3D EDITING SUITE · JAIPUR
              </span>
              <span className="font-mono text-[11px] text-zinc-400">VOICE + STUDIO AMBIENCE</span>
            </div>

            <p className="mb-4 text-sm leading-relaxed text-zinc-200">
              Step inside Dev Kumawat&apos;s interactive 3D creative workspace and hear his spoken introduction.
            </p>

            <div className="flex flex-col gap-2.5 sm:flex-row">
              <button
                type="button"
                data-testid="enter-studio-sound-btn"
                onClick={() => enterStudio(true)}
                className="inline-flex flex-1 items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-purple-600 via-violet-600 to-fuchsia-600 px-5 py-3.5 font-condensed text-sm font-bold uppercase tracking-[0.2em] text-white shadow-[0_8px_30px_rgba(147,51,234,0.45)] transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400"
              >
                <Volume2 className="h-4 w-4" />
                ENTER STUDIO / ENABLE SOUND
              </button>

              <button
                type="button"
                data-testid="enter-studio-muted-btn"
                onClick={() => enterStudio(false)}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/[0.04] px-4 py-3.5 font-condensed text-xs font-semibold uppercase tracking-[0.2em] text-zinc-300 transition hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
              >
                <VolumeX className="h-4 w-4" />
                ENTER MUTED
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Synchronized Spoken Captions Bar */}
      {hasEnteredStudio && captionsEnabled && isSpeaking && activeCaption && (
        <div
          data-testid="studio-live-captions"
          aria-live="polite"
          className="pointer-events-none fixed inset-x-0 bottom-20 z-40 mx-auto max-w-2xl px-4 sm:bottom-8"
        >
          <div className="rounded-2xl border border-purple-400/25 bg-[#070709]/88 px-5 py-3 text-center shadow-2xl backdrop-blur-xl">
            <span className="mb-1 block font-mono text-[10px] uppercase tracking-[0.24em] text-purple-300">
              DEV KUMAWAT · STUDIO VOICEOVER
            </span>
            <p className="text-sm font-medium leading-relaxed text-zinc-100 sm:text-[15px]">
              &ldquo;{activeCaption}&rdquo;
            </p>
          </div>
        </div>
      )}

      {/* 3. Persistent Visitor Audio Control Dock (Bottom-Left) */}
      {hasEnteredStudio && (
        <div
          data-testid="studio-audio-controls"
          className="fixed bottom-4 left-4 z-40 flex items-center gap-2 rounded-2xl border border-white/12 bg-[#0b0b12]/88 px-3 py-2 shadow-2xl backdrop-blur-xl"
        >
          <button
            type="button"
            onClick={toggleMute}
            aria-label={isMuted ? 'Unmute studio audio' : 'Mute studio audio'}
            data-testid="audio-mute-toggle"
            className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-white/5 text-zinc-200 transition hover:bg-purple-600/25 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500"
          >
            {isMuted || volume === 0 ? (
              <VolumeX className="h-4 w-4 text-zinc-400" />
            ) : (
              <Volume2 className="h-4 w-4 text-purple-400" />
            )}
          </button>

          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={isMuted ? 0 : volume}
            aria-label="Studio audio volume"
            data-testid="audio-volume-slider"
            onChange={(e) => setVolume(Number(e.target.value))}
            className="hidden h-1.5 w-20 cursor-pointer accent-purple-500 sm:block"
          />

          <button
            type="button"
            onClick={replayIntro}
            aria-label="Replay Dev's spoken introduction"
            title="Replay introduction"
            className="inline-flex h-8 items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.03] px-2.5 font-mono text-[11px] uppercase tracking-wider text-zinc-300 transition hover:border-purple-400/40 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500"
          >
            {isSpeaking ? (
              <Radio className="h-3.5 w-3.5 animate-pulse text-amber-400" />
            ) : (
              <RotateCcw className="h-3.5 w-3.5" />
            )}
            <span className="hidden md:inline">{isSpeaking ? 'SPEAKING' : 'INTRO'}</span>
          </button>

          <button
            type="button"
            onClick={() => setCaptionsEnabled(!captionsEnabled)}
            aria-pressed={captionsEnabled}
            aria-label="Toggle voiceover captions"
            title="Toggle captions"
            className={`inline-flex h-8 w-8 items-center justify-center rounded-xl transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 ${
              captionsEnabled ? 'bg-purple-600/25 text-purple-300' : 'bg-white/5 text-zinc-400'
            }`}
          >
            <Captions className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={() => setTranscriptOpen((prev) => !prev)}
            aria-expanded={transcriptOpen}
            aria-label="Read full introduction transcript"
            title="Read transcript"
            className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-white/5 text-zinc-300 transition hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500"
          >
            <FileText className="h-4 w-4" />
          </button>

          {transcriptOpen && (
            <div className="absolute bottom-12 left-0 w-80 rounded-2xl border border-white/15 bg-[#0b0b12]/95 p-4 text-xs leading-relaxed text-zinc-200 shadow-2xl backdrop-blur-2xl sm:w-96">
              <div className="mb-2 flex items-center justify-between">
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-purple-400">
                  INTRODUCTION TRANSCRIPT
                </span>
                <button
                  type="button"
                  onClick={() => setTranscriptOpen(false)}
                  className="text-zinc-400 hover:text-white"
                >
                  Close
                </button>
              </div>
              <p>{profileContent.introScript.fullText}</p>
            </div>
          )}
        </div>
      )}
    </>
  );
}
