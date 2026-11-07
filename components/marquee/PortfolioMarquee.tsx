'use client';

import React, { useEffect, useState } from 'react';
import { Play, Image as ImageIcon } from 'lucide-react';
import type { PortfolioProject } from '@/lib/content/types';
import { useStudioExperience } from '@/lib/audio/studio-audio-context';
import { warmProjectMedia } from '@/lib/google-drive/client-warm';

function MarqueeCard({
  project,
  onSelect,
}: {
  project: PortfolioProject;
  onSelect: (project: PortfolioProject) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(project)}
      onMouseEnter={() => void warmProjectMedia(project)}
      onFocus={() => void warmProjectMedia(project)}
      onTouchStart={() => void warmProjectMedia(project)}
      aria-label={`Open ${project.title} (${project.category})`}
      className="group/card relative w-[275px] shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-[#111116] text-left transition-all duration-300 hover:-translate-y-1.5 hover:scale-[1.03] hover:border-purple-500/70 hover:shadow-[0_18px_44px_rgba(124,58,237,0.28)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 sm:w-[330px]"
    >
      <div className="relative aspect-video w-full overflow-hidden bg-[#0a0a0f]">
        <img
          src={`${project.thumbnail}?sz=w640`}
          alt={`${project.title} — ${project.category}`}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover transition-transform duration-500 group-hover/card:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#070709] via-[#070709]/25 to-transparent opacity-85 transition-opacity group-hover/card:opacity-95" />

        {/* Category + Year Pill */}
        <div className="absolute left-3 top-3 flex items-center gap-1.5">
          <span className="rounded-full border border-white/15 bg-[#070709]/80 px-2.5 py-0.5 font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-zinc-200 backdrop-blur-md">
            {project.category}
          </span>
          {project.year && (
            <span className="rounded-full bg-purple-600/30 px-2 py-0.5 font-mono text-[10px] text-purple-200 backdrop-blur-md">
              {project.year}
            </span>
          )}
        </div>

        {/* Play / View Indicator */}
        <div className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-[#070709]/75 text-white transition group-hover/card:border-purple-400 group-hover/card:bg-purple-600">
          {project.mediaType === 'video' ? (
            <Play className="h-3.5 w-3.5 fill-current" />
          ) : (
            <ImageIcon className="h-3.5 w-3.5" />
          )}
        </div>

        {/* Bottom Title Reveal */}
        <div className="absolute inset-x-3 bottom-3">
          <p className="line-clamp-1 font-sans text-sm font-semibold text-white transition-colors group-hover/card:text-purple-200">
            {project.title}
          </p>
        </div>
      </div>
    </button>
  );
}

export function PortfolioMarquee({
  row1,
  row2,
}: {
  row1: PortfolioProject[];
  row2: PortfolioProject[];
}) {
  const { openProject, playUiTick } = useStudioExperience();
  const [pausedRow1, setPausedRow1] = useState(false);
  const [pausedRow2, setPausedRow2] = useState(false);

  // Idle pre-warm top featured marquee videos after initial paint so first click/tap plays instantly
  useEffect(() => {
    const timer = window.setTimeout(() => {
      row1.slice(0, 5).forEach((proj) => {
        void warmProjectMedia(proj);
      });
    }, 1200);
    return () => window.clearTimeout(timer);
  }, [row1]);

  const handleSelect = (p: PortfolioProject) => {
    playUiTick();
    openProject(p);
  };

  // Duplicate track exactly 2x so -50% -> 0% and 0% -> -50% loop seamlessly with zero jump
  const track1 = [...row1, ...row1];
  const track2 = [...row2, ...row2];

  return (
    <section
      aria-label="Featured Portfolio Reel Wall"
      data-testid="portfolio-marquee-section"
      className="relative overflow-hidden border-y border-white/[0.07] bg-[#08080c] py-12 sm:py-16"
    >
      <div className="mx-auto mb-7 flex max-w-7xl items-center justify-between px-4 sm:px-8">
        <div className="flex items-center gap-3">
          <span className="h-2 w-2 rounded-full bg-purple-500" />
          <span className="font-mono text-xs uppercase tracking-[0.26em] text-zinc-400">
            LIVE GOOGLE DRIVE ARCHIVE · CLICK ANY FRAME TO WATCH
          </span>
        </div>
        <span className="hidden font-mono text-xs text-zinc-500 sm:inline">
          HOVER TO PAUSE REEL
        </span>
      </div>

      {/* Row 1: Left -> Right continuous seamless marquee */}
      <div
        data-testid="marquee-row-ltr"
        onMouseEnter={() => setPausedRow1(true)}
        onMouseLeave={() => setPausedRow1(false)}
        onPointerDown={() => setPausedRow1(true)}
        onFocusCapture={() => setPausedRow1(true)}
        onBlurCapture={() => setPausedRow1(false)}
        className="mb-5 flex overflow-hidden"
      >
        <div
          style={{ animationPlayState: pausedRow1 ? 'paused' : 'running' }}
          className="flex w-max animate-marquee-ltr gap-5 pr-5 motion-reduce:animate-none"
        >
          {track1.map((project, idx) => (
            <MarqueeCard
              key={`r1-${project.id}-${idx}`}
              project={project}
              onSelect={handleSelect}
            />
          ))}
        </div>
      </div>

      {/* Row 2: Right -> Left continuous seamless marquee */}
      <div
        data-testid="marquee-row-rtl"
        onMouseEnter={() => setPausedRow2(true)}
        onMouseLeave={() => setPausedRow2(false)}
        className="flex overflow-hidden"
      >
        <div
          style={{ animationPlayState: pausedRow2 ? 'paused' : 'running' }}
          className="flex w-max animate-marquee-rtl gap-5 pr-5 motion-reduce:animate-none"
        >
          {track2.map((project, idx) => (
            <MarqueeCard
              key={`r2-${project.id}-${idx}`}
              project={project}
              onSelect={handleSelect}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
