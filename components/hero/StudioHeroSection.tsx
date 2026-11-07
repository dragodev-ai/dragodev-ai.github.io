'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { ArrowDownRight, Play, Sparkles } from 'lucide-react';
import type { PortfolioProject } from '@/lib/content/types';
import { profileContent } from '@/lib/content';
import { useStudioExperience } from '@/lib/audio/studio-audio-context';
import { StudioAudioGateAndControls } from '@/components/audio/StudioAudioControls';

const EditingStudioScene = dynamic(
  () => import('@/three/scenes/EditingStudioScene').then((m) => m.EditingStudioScene),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center bg-[#070709]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-9 w-9 animate-spin rounded-full border-2 border-purple-500/30 border-t-purple-400" />
          <span className="font-mono text-xs uppercase tracking-[0.26em] text-zinc-400">
            INITIALIZING 3D EDITING SUITE...
          </span>
        </div>
      </div>
    ),
  }
);

export function StudioHeroSection({
  monitorProjects,
  showreelProject,
}: {
  monitorProjects: PortfolioProject[];
  showreelProject?: PortfolioProject;
}) {
  const { openProject, hasEnteredStudio } = useStudioExperience();

  return (
    <section
      id="hero"
      aria-label="Dev Kumawat Live 3D Creative Studio"
      className="relative min-h-[100svh] w-full overflow-hidden bg-[#070709] pt-20"
    >
      {/* Live Interactive 3D Editing Studio & Rigged Character */}
      <EditingStudioScene monitorProjects={monitorProjects} />

      {/* Subtle Vignette Framing so Typography & 3D Character Both Read Cleanly */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_42%,transparent_30%,rgba(7,7,9,0.68)_88%),linear-gradient(to_bottom,rgba(7,7,9,0.55)_0%,transparent_24%,transparent_72%,#070709_100%)]"
      />

      {/* Editorial Studio HUD Overlay */}
      <div className="pointer-events-none relative z-20 mx-auto flex min-h-[calc(100svh-5rem)] max-w-7xl flex-col justify-between px-4 pb-8 pt-4 sm:px-8">
        {/* Top Row: Studio Metadata & Massive Editorial Display Header */}
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-start">
          <div className="max-w-xl">
            <div className="mb-3 inline-flex items-center gap-2.5 rounded-full border border-white/10 bg-[#0b0b12]/75 px-3.5 py-1.5 backdrop-blur-md">
              <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
              <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-zinc-200">
                {profileContent.location.display} · {profileContent.location.availability}
              </span>
            </div>

            <h1 className="font-display text-4xl font-extrabold uppercase leading-[0.94] tracking-tight text-white sm:text-6xl lg:text-7xl">
              DEV KUMAWAT
              <span className="mt-1.5 block font-condensed text-lg font-semibold tracking-[0.26em] text-purple-300 sm:text-xl">
                IMMERSIVE CREATIVE &amp; POST-PRODUCTION STUDIO
              </span>
            </h1>
          </div>

          {/* Right Studio Role Spec Card (Desktop / Tablet) */}
          <div className="pointer-events-auto hidden max-w-xs rounded-2xl border border-white/10 bg-[#0b0b12]/72 p-4 backdrop-blur-xl lg:block">
            <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.24em] text-amber-400">
              MULTIDISCIPLINARY DIRECTION
            </p>
            <p className="text-xs leading-relaxed text-zinc-300">
              Video Editing · Motion Graphics · Graphic Design · Commercial Photography &amp; Shoots · AI Production &amp; Prompt Engineering
            </p>
            <div className="mt-3 flex items-center gap-2 border-t border-white/10 pt-3">
              {showreelProject && (
                <button
                  type="button"
                  onClick={() => openProject(showreelProject)}
                  className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-3 py-1.5 font-condensed text-xs font-semibold uppercase tracking-[0.18em] text-white transition hover:bg-purple-600"
                >
                  <Play className="h-3.5 w-3.5 fill-current" />
                  WATCH SHOWREEL
                </button>
              )}
              <Link
                href="/work"
                className="inline-flex items-center gap-1 rounded-xl border border-white/15 px-3 py-1.5 font-condensed text-xs font-semibold uppercase tracking-[0.18em] text-zinc-200 transition hover:border-purple-400 hover:text-white"
              >
                ALL WORK
                <ArrowDownRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Left/Right Quick Conversion Bar (visible once visitor enters studio) */}
        {hasEnteredStudio && (
          <div className="pointer-events-auto mt-auto flex flex-wrap items-end justify-between gap-4 pt-12">
            <div className="hidden items-center gap-2 rounded-full border border-white/10 bg-[#0b0b12]/75 px-4 py-2 font-mono text-[11px] text-zinc-300 backdrop-blur-md md:inline-flex">
              <Sparkles className="h-3.5 w-3.5 text-amber-400" />
              MOVE CURSOR TO INTERACT WITH DEV &amp; CLICK STUDIO MONITORS TO PLAY REELS
            </div>

            <div className="ml-auto flex flex-wrap items-center gap-3">
              {showreelProject && (
                <button
                  type="button"
                  onClick={() => openProject(showreelProject)}
                  className="inline-flex items-center gap-2 rounded-full border border-purple-400/40 bg-purple-600/25 px-5 py-2.5 font-condensed text-xs font-bold uppercase tracking-[0.22em] text-white backdrop-blur-md transition hover:bg-purple-600/45"
                >
                  <Play className="h-3.5 w-3.5 fill-current" />
                  PLAY SHOWREEL
                </button>
              )}
              <a
                href="#contact"
                className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 font-condensed text-xs font-bold uppercase tracking-[0.22em] text-zinc-950 transition hover:bg-zinc-200"
              >
                START A PROJECT
                <ArrowDownRight className="h-4 w-4" />
              </a>
            </div>
          </div>
        )}
      </div>

      {/* Audio Gate + Persistent Mute / Volume / Captions / Transcript Dock */}
      <StudioAudioGateAndControls />
    </section>
  );
}
