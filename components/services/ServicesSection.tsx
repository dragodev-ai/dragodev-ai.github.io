'use client';

import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowUpRight, ChevronDown, Play } from 'lucide-react';
import type { PortfolioProject } from '@/lib/content/types';
import {
  getFallbackPosterDataUri,
  getProjectThumbnailUrl,
  servicesContent,
} from '@/lib/content';
import { useStudioExperience } from '@/lib/audio/studio-audio-context';
import { warmProjectMedia } from '@/lib/google-drive/client-warm';

export function ServicesSection({ allProjects }: { allProjects: PortfolioProject[] }) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const [expandedId, setExpandedId] = useState<string>(
    servicesContent.primaryGroups[0]?.id || 'video-editing'
  );
  const { openProject, selectServiceForEnquiry, playUiTick } = useStudioExperience();

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      if (!sheetRef.current) return;
      gsap.fromTo(
        sheetRef.current,
        { y: 72 },
        {
          y: 0,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: sheetRef.current,
            start: 'top 92%',
            end: 'top 38%',
            scrub: 0.6,
          },
        }
      );
    }, sheetRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="services"
      aria-labelledby="services-heading"
      className="relative z-20 -mt-6 scroll-mt-20 bg-transparent pt-6"
    >
      {/* Deep Frosted Sapphire-Obsidian Glass Editorial Sheet — WCAG AAA High-Contrast Readability */}
      <div
        ref={sheetRef}
        data-glow=""
        data-testid="services-editorial-sheet"
        className="rounded-[36px] border border-white/20 bg-[#060B1E]/85 px-4 py-phi-4 text-white shadow-[0_-28px_80px_rgba(0,0,0,0.72),inset_0_1px_0_rgba(255,255,255,0.22)] backdrop-blur-2xl sm:rounded-[52px] sm:px-8 sm:py-phi-5"
      >
        <div className="mx-auto max-w-7xl px-0 sm:px-2 lg:px-4">
          {/* Golden Ratio Editorial Header */}
          <div className="mb-phi-3 flex flex-col justify-between gap-phi-2 border-b border-white/15 pb-phi-2 sm:mb-phi-4 lg:flex-row lg:items-end">
            <div>
              <span className="mb-2 block font-mono text-phi-xs font-bold uppercase text-amber-300">
                02 · RESULT-PROVEN ARSENAL
              </span>
              <h2
                id="services-heading"
                className="font-display text-phi-xl font-extrabold uppercase text-white"
              >
                {servicesContent.headline}
              </h2>
            </div>
            <p className="max-w-[30ch] font-serif text-xl italic leading-[1.3] text-amber-200 sm:text-2xl">
              {servicesContent.subheadline}
            </p>
          </div>

          {/* Expandable Service Rows (01 - 04) */}
          <div className="divide-y divide-white/15 border-b border-white/15">
            {servicesContent.primaryGroups.map((group) => {
              const isOpen = expandedId === group.id;
              const matchingProjects = allProjects
                .filter((p) => group.driveCategories.includes(p.category))
                .slice(0, 3);

              return (
                <div key={group.id} className="py-6 sm:py-7">
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={`service-panel-${group.id}`}
                    data-testid={`service-row-btn-${group.id}`}
                    onClick={() => {
                      playUiTick();
                      setExpandedId(isOpen ? '' : group.id);
                    }}
                    className="group flex w-full items-center justify-between gap-4 rounded-xl text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
                  >
                    <div className="flex min-w-0 flex-col gap-1 sm:flex-row sm:items-baseline sm:gap-6 lg:gap-8">
                      <span className="font-mono text-sm font-bold text-amber-400 sm:text-base">
                        {group.number}
                      </span>
                      <div className="min-w-0">
                        <h3 className="break-words font-display text-phi-lg font-extrabold uppercase text-white transition-all duration-200 group-hover:translate-x-1 group-hover:text-amber-200">
                          {group.title}
                        </h3>
                        <p className="mt-1.5 text-xs font-semibold text-[#93C5FD] sm:text-sm">
                          {group.tagline}
                        </p>
                      </div>
                    </div>

                    <span
                      data-glow-btn=""
                      className={`inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border transition-all duration-300 ${
                        isOpen
                          ? 'rotate-180 border-amber-300 bg-amber-400 text-zinc-950 shadow-[0_0_24px_rgba(251,191,36,0.55)]'
                          : 'border-white/25 bg-white/10 text-white group-hover:border-amber-300 group-hover:bg-amber-400 group-hover:text-zinc-950'
                      }`}
                    >
                      <ChevronDown className="h-5 w-5" />
                    </span>
                  </button>

                  {isOpen && (
                    <div
                      id={`service-panel-${group.id}`}
                      data-testid={`service-panel-${group.id}`}
                      className="mt-7 grid gap-phi-3 pl-0 sm:pl-12 lg:grid-cols-[1fr_1.618fr] lg:items-center"
                    >
                      <div className="space-y-4">
                        <p className="max-w-[44ch] text-phi-sm font-medium text-zinc-100 sm:text-base">
                          {group.shortDescription}
                        </p>
                        <ul className="grid gap-2.5">
                          {group.capabilities.map((cap) => (
                            <li
                              key={cap}
                              className="flex items-center gap-2.5 text-sm font-semibold text-white"
                            >
                              <span className="h-2 w-2 shrink-0 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]" />
                              <span>{cap}</span>
                            </li>
                          ))}
                        </ul>

                        <div className="pt-2">
                          <button
                            type="button"
                            data-glow-btn=""
                            data-cta-gold=""
                            onClick={() => selectServiceForEnquiry(group.enquiryServiceValue)}
                            className="btn-cta-gold inline-flex items-center gap-2 rounded-full border px-6 py-3.5 font-condensed text-xs font-extrabold uppercase tracking-[0.22em] transition active:scale-[0.98]"
                          >
                            HIRE ME FOR {group.title}
                            <ArrowUpRight className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      {/* 61.8% Golden Column: Live Client Proof Samples */}
                      <div>
                        <p className="mb-2.5 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-amber-300">
                          WATCH LIVE PROOF — TAP ANY FRAME
                        </p>
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                          {matchingProjects.map((proj) => (
                            <button
                              key={proj.id}
                              type="button"
                              data-glow-btn=""
                              onClick={() => openProject(proj)}
                              onMouseEnter={() => void warmProjectMedia(proj)}
                              onTouchStart={() => void warmProjectMedia(proj)}
                              className="group/item overflow-hidden rounded-2xl border border-white/20 bg-[#0B132B]/90 text-left shadow-lg transition hover:-translate-y-1 hover:border-amber-300/70 hover:shadow-[0_14px_30px_rgba(59,99,255,0.3)] active:scale-[0.98]"
                            >
                              <div className="relative aspect-video w-full overflow-hidden bg-zinc-950">
                                <img
                                  src={getProjectThumbnailUrl(proj, 'w480')}
                                  alt={proj.title}
                                  loading="lazy"
                                  referrerPolicy="no-referrer"
                                  onError={(e) => {
                                    e.currentTarget.onerror = null;
                                    e.currentTarget.src = getFallbackPosterDataUri(
                                      proj.title,
                                      proj.category
                                    );
                                  }}
                                  className="h-full w-full object-cover transition-transform duration-300 group-hover/item:scale-105"
                                />
                                {proj.mediaType === 'video' && (
                                  <span className="absolute bottom-2 right-2 flex h-7 w-7 items-center justify-center rounded-full border border-white/25 bg-black/80 text-white transition group-hover/item:border-amber-300 group-hover/item:bg-amber-400 group-hover/item:text-zinc-950">
                                    <Play className="h-3 w-3 fill-current" />
                                  </span>
                                )}
                              </div>
                              <div className="p-3">
                                <p className="line-clamp-1 text-xs font-bold text-white group-hover/item:text-amber-200">
                                  {proj.title}
                                </p>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Compact Specialty Strip */}
          <div className="mt-phi-2 flex flex-wrap items-center justify-between gap-3">
            <span className="font-mono text-phi-xs font-bold uppercase text-amber-300">
              DIRECT BOOKING FOR:
            </span>
            <div className="flex flex-wrap gap-2">
              {servicesContent.additionalDisciplines.map((disc) => (
                <button
                  key={disc}
                  type="button"
                  data-glow-btn=""
                  onClick={() => selectServiceForEnquiry(disc)}
                  className="rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-xs font-bold text-white transition hover:border-amber-300 hover:bg-amber-400 hover:text-zinc-950 active:scale-[0.97]"
                >
                  {disc}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
