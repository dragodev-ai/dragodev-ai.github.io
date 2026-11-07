'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowUpRight, ExternalLink, Play } from 'lucide-react';
import type { PortfolioProject } from '@/lib/content/types';
import { useStudioExperience } from '@/lib/audio/studio-audio-context';

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
    const ctx = gsap.context(() => {
      const cards = cardsRef.current.filter(Boolean) as HTMLElement[];
      cards.forEach((card, index) => {
        if (index === cards.length - 1) return;
        const nextCard = cards[index + 1];
        gsap.to(card, {
          scale: 0.94 - index * 0.006,
          filter: 'brightness(0.68)',
          ease: 'none',
          scrollTrigger: {
            trigger: nextCard,
            start: 'top 82%',
            end: 'top 18%',
            scrub: true,
          },
        });
      });
    }, containerRef);

    return () => ctx.revert();
  }, [featuredProjects.length]);

  return (
    <section
      id="projects"
      aria-labelledby="projects-heading"
      ref={containerRef}
      className="relative bg-[#070709] py-24 sm:py-32"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-8">
        {/* Section Header */}
        <div className="mb-16 flex flex-col justify-between gap-6 border-b border-white/10 pb-10 lg:flex-row lg:items-end">
          <div>
            <span className="mb-3 block font-mono text-xs uppercase tracking-[0.28em] text-purple-400">
              04 · SELECTED PRODUCTIONS
            </span>
            <h2
              id="projects-heading"
              className="font-display text-5xl font-extrabold uppercase tracking-tight text-white sm:text-7xl"
            >
              PROJECTS
            </h2>
          </div>

          <Link
            href="/work"
            onClick={() => playUiTick()}
            className="inline-flex items-center gap-2 self-start rounded-full border border-purple-400/50 bg-purple-600/20 px-6 py-3 font-condensed text-xs font-bold uppercase tracking-[0.22em] text-white transition hover:bg-purple-600 lg:self-auto"
          >
            OPEN COMPLETE PORTFOLIO ({allProjects.length} WORKS)
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Sticky Stacked Cards */}
        <div className="space-y-10 pb-8">
          {featuredProjects.map((project, idx) => {
            const detailThumbs = allProjects
              .filter((p) => p.id !== project.id && p.category === project.category)
              .slice(0, 2);

            return (
              <article
                key={project.id}
                ref={(el) => {
                  cardsRef.current[idx] = el;
                }}
                style={{ top: `${88 + idx * 18}px` }}
                data-testid={`stacked-project-card-${idx}`}
                className="sticky overflow-hidden rounded-[32px] border border-white/15 bg-[#111118] p-5 shadow-[0_28px_90px_rgba(0,0,0,0.85)] will-change-transform sm:p-8"
              >
                <div className="grid gap-7 lg:grid-cols-12 lg:items-center">
                  {/* Left: Project Metadata & Actions */}
                  <div className="flex flex-col justify-between space-y-5 lg:col-span-5">
                    <div>
                      <div className="mb-3 flex flex-wrap items-center gap-2.5">
                        <span className="font-mono text-sm font-bold text-amber-400">
                          {String(idx + 1).padStart(2, '0')}
                        </span>
                        <span className="rounded-full border border-white/15 bg-white/[0.04] px-3 py-0.5 font-mono text-[11px] uppercase tracking-wider text-zinc-200">
                          {project.category}
                        </span>
                        {project.verifiedLabel && (
                          <span className="rounded-full bg-purple-600/25 px-3 py-0.5 font-mono text-[11px] text-purple-200">
                            {project.verifiedLabel}
                          </span>
                        )}
                      </div>

                      <h3 className="font-display text-2xl font-extrabold uppercase leading-tight text-white sm:text-3xl">
                        {project.title}
                      </h3>

                      <p className="mt-3 text-sm leading-relaxed text-zinc-300">
                        {project.description}
                      </p>
                    </div>

                    {/* Secondary Category Detail Thumbnails */}
                    {detailThumbs.length > 0 && (
                      <div>
                        <span className="mb-2 block font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">
                          RELATED {project.category} FRAMES
                        </span>
                        <div className="grid grid-cols-2 gap-2.5">
                          {detailThumbs.map((dt) => (
                            <button
                              key={dt.id}
                              type="button"
                              onClick={() => openProject(dt)}
                              aria-label={`Open related project ${dt.title}`}
                              className="group overflow-hidden rounded-xl border border-white/10 bg-black"
                            >
                              <img
                                src={`${dt.thumbnail}?sz=w480`}
                                alt={dt.title}
                                loading="lazy"
                                className="aspect-video w-full object-cover opacity-85 transition duration-300 group-hover:scale-105 group-hover:opacity-100"
                              />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex flex-wrap items-center gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          playUiTick();
                          openProject(project);
                        }}
                        className="inline-flex items-center gap-2 rounded-full bg-purple-600 px-5 py-2.5 font-condensed text-xs font-bold uppercase tracking-[0.2em] text-white transition hover:bg-purple-500"
                      >
                        <Play className="h-3.5 w-3.5 fill-current" />
                        VIEW PROJECT
                      </button>

                      <a
                        href={project.driveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/[0.04] px-4 py-2.5 font-condensed text-xs font-semibold uppercase tracking-[0.18em] text-zinc-200 transition hover:border-white/35 hover:text-white"
                      >
                        DRIVE SOURCE
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    </div>
                  </div>

                  {/* Right: Main Interactive Project Stage */}
                  <div className="lg:col-span-7">
                    <button
                      type="button"
                      onClick={() => openProject(project)}
                      aria-label={`Play ${project.title}`}
                      className="group relative block aspect-video w-full overflow-hidden rounded-2xl border border-white/12 bg-black text-left"
                    >
                      <img
                        src={`${project.thumbnail}?sz=w800`}
                        alt={project.title}
                        loading="lazy"
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
            );
          })}
        </div>
      </div>
    </section>
  );
}
