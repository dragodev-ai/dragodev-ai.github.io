'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowUpRight, ExternalLink, Play } from 'lucide-react';
import type { PortfolioProject } from '@/lib/content/types';
import { getFallbackPosterDataUri, getProjectThumbnailUrl } from '@/lib/content';
import { useStudioExperience } from '@/lib/audio/studio-audio-context';
import { warmProjectMedia } from '@/lib/google-drive/client-warm';

export function StackedProjectsSection({
  featuredProjects,
  allProjects,
}: {
  featuredProjects: PortfolioProject[];
  allProjects: PortfolioProject[];
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<Array<HTMLElement | null>>([]);
  const { openProject, playUiTick } = useStudioExperience();

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    gsap.registerPlugin(ScrollTrigger);
    const mm = gsap.matchMedia();

    mm.add('(min-width: 1024px)', () => {
      const cards = cardsRef.current.filter(Boolean) as HTMLElement[];
      cards.forEach((card, index) => {
        if (index === cards.length - 1) return;
        const nextCard = cards[index + 1];
        gsap.to(card, {
          scale: 0.96 - index * 0.005,
          filter: 'brightness(0.78)',
          ease: 'none',
          scrollTrigger: {
            trigger: nextCard,
            start: 'top 48%',
            end: 'top 14%',
            scrub: true,
          },
        });
      });
    });

    return () => mm.revert();
  }, [featuredProjects.length]);

  return (
    <section
      id="projects"
      aria-labelledby="projects-heading"
      ref={containerRef}
      className="relative scroll-mt-24 bg-[#070709] py-phi-4 sm:py-phi-5"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Golden Ratio Section Header */}
        <div className="mb-phi-3 flex flex-col justify-between gap-phi-2 border-b border-white/10 pb-phi-2 sm:mb-phi-4 lg:flex-row lg:items-end">
          <div>
            <span className="mb-2 block font-mono text-phi-xs font-semibold uppercase text-purple-400">
              04 · DON&apos;T TAKE MY WORD FOR IT — WATCH WHAT SHIPPED
            </span>
            <h2
              id="projects-heading"
              className="font-display text-phi-xl font-extrabold uppercase text-white"
            >
              PROVEN PROJECTS
            </h2>
          </div>

          <Link
            href="/work"
            onClick={() => playUiTick()}
            className="inline-flex items-center gap-2 self-start rounded-full border border-purple-400/50 bg-purple-600/20 px-6 py-3 font-condensed text-xs font-bold uppercase tracking-[0.22em] text-white transition hover:bg-purple-600 active:scale-[0.98] lg:self-auto"
          >
            WATCH ALL {allProjects.length} PROOFS
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Sticky Stacked Cards on Desktop (lg+), Natural Flowing Cards on Mobile/Tablet */}
        <div className="space-y-8 pb-8 lg:space-y-10">
          {featuredProjects.map((project, idx) => (
            <article
              key={project.id}
              ref={(el) => {
                cardsRef.current[idx] = el;
              }}
              onMouseEnter={() => void warmProjectMedia(project)}
              onTouchStart={() => void warmProjectMedia(project)}
              style={{ top: `${88 + idx * 18}px` }}
              data-testid={`stacked-project-card-${idx}`}
              className="relative overflow-hidden rounded-[28px] border border-white/15 bg-[#111118] p-5 shadow-[0_28px_90px_rgba(0,0,0,0.85)] will-change-transform sm:rounded-[32px] sm:p-phi-3 lg:sticky"
            >
              {/* Golden Ratio Split: 1fr (38.2% Crisp Hook Copy) : 1.618fr (61.8% Cinema Frame) */}
              <div className="grid gap-phi-2 lg:grid-cols-[1fr_1.618fr] lg:items-center lg:gap-phi-3">
                {/* Left 38.2%: Sharp Proof Headline & Actions */}
                <div className="flex flex-col justify-between space-y-phi-2">
                  <div>
                    <div className="mb-3 flex flex-wrap items-center gap-2">
                      <span className="font-mono text-sm font-bold text-amber-400">
                        {String(idx + 1).padStart(2, '0')}
                      </span>
                      <span className="rounded-full border border-white/15 bg-white/[0.04] px-3 py-0.5 font-mono text-[10px] uppercase tracking-wider text-zinc-200">
                        {project.category}
                      </span>
                      {project.verifiedLabel && (
                        <span className="rounded-full bg-purple-600/25 px-3 py-0.5 font-mono text-[10px] text-purple-200">
                          {project.verifiedLabel}
                        </span>
                      )}
                    </div>

                    <h3 className="break-words font-sans text-xl font-extrabold leading-[1.15] tracking-[-0.025em] text-white sm:text-2xl lg:text-[1.85rem]">
                      {project.title}
                    </h3>

                    <p className="mt-3 max-w-[38ch] text-phi-base text-zinc-300">
                      {project.description}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        playUiTick();
                        openProject(project);
                      }}
                      className="inline-flex items-center gap-2 rounded-full bg-purple-600 px-6 py-3 font-condensed text-xs font-bold uppercase tracking-[0.2em] text-white transition hover:bg-purple-500 active:scale-[0.98]"
                    >
                      <Play className="h-3.5 w-3.5 fill-current" />
                      WATCH PROOF
                    </button>

                    <a
                      href={project.driveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/[0.04] px-4 py-3 font-condensed text-xs font-semibold uppercase tracking-[0.18em] text-zinc-200 transition hover:border-white/35 hover:text-white active:scale-[0.98]"
                    >
                      RAW SOURCE
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </div>
                </div>

                {/* Right 61.8%: Unobstructed 16:9 Interactive Cinema Stage */}
                <div>
                  <button
                    type="button"
                    onClick={() => openProject(project)}
                    aria-label={`Play ${project.title}`}
                    className="group relative block aspect-video w-full overflow-hidden rounded-2xl border border-white/12 bg-black text-left"
                  >
                    <img
                      src={getProjectThumbnailUrl(project, 'w800')}
                      alt={project.title}
                      loading="lazy"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = getFallbackPosterDataUri(
                          project.title,
                          project.category
                        );
                      }}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="flex h-16 w-16 items-center justify-center rounded-full border border-white/30 bg-black/65 text-white shadow-2xl backdrop-blur-md transition-transform duration-300 group-hover:scale-110 group-hover:border-purple-400 group-hover:bg-purple-600">
                        <Play className="ml-0.5 h-6 w-6 fill-current" />
                      </span>
                    </div>
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
