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
      className="relative z-20 -mt-6 scroll-mt-20 bg-[#070709] pt-6"
    >
      {/* Premium White Editorial Sheet Sliding Upward Over Dark Studio */}
      <div
        ref={sheetRef}
        data-testid="services-editorial-sheet"
        className="rounded-t-[40px] bg-[#F7F6F2] px-4 py-phi-4 text-[#0A0A0C] shadow-[0_-28px_80px_rgba(0,0,0,0.75)] sm:rounded-t-[56px] sm:px-8 sm:py-phi-5"
      >
        <div className="mx-auto max-w-7xl px-0 sm:px-2 lg:px-4">
          {/* Golden Ratio Editorial Header */}
          <div className="mb-phi-3 flex flex-col justify-between gap-phi-2 border-b border-black/15 pb-phi-2 sm:mb-phi-4 lg:flex-row lg:items-end">
            <div>
              <span className="mb-2 block font-mono text-phi-xs font-semibold uppercase text-[#3B63FF]">
                02 · RESULT-PROVEN ARSENAL
              </span>
              <h2
                id="services-heading"
                className="font-display text-phi-xl font-extrabold uppercase text-[#0A0A0C]"
              >
                {servicesContent.headline}
              </h2>
            </div>
            <p className="max-w-[30ch] font-serif text-xl italic leading-[1.3] text-zinc-800 sm:text-2xl">
              {servicesContent.subheadline}
            </p>
          </div>

          {/* Expandable Service Rows (01 - 04) */}
          <div className="divide-y divide-black/15 border-b border-black/15">
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
                    className="group flex w-full items-center justify-between gap-4 rounded-xl text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3B63FF]"
                  >
                    <div className="flex min-w-0 flex-col gap-1 sm:flex-row sm:items-baseline sm:gap-6 lg:gap-8">
                      <span className="font-mono text-sm font-bold text-[#3B63FF] sm:text-base">
                        {group.number}
                      </span>
                      <div className="min-w-0">
                        <h3 className="break-words font-display text-phi-lg font-extrabold uppercase text-[#0A0A0C] transition-transform duration-200 group-hover:translate-x-1">
                          {group.title}
                        </h3>
                        <p className="mt-1 text-xs font-semibold text-zinc-700 sm:text-sm">
                          {group.tagline}
                        </p>
                      </div>
                    </div>

                    <span
                      data-glow-btn=""
                      className={`inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-black/20 transition-all duration-300 ${
                        isOpen
                          ? 'rotate-180 border-[#3B63FF] bg-[#3B63FF] text-white shadow-[0_0_20px_rgba(59,99,255,0.45)]'
                          : 'bg-transparent text-[#0A0A0C] group-hover:border-[#3B63FF] group-hover:bg-[#0A0A0C] group-hover:text-white'
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
                        <p className="max-w-[44ch] text-phi-sm font-medium text-zinc-800 sm:text-base">
                          {group.shortDescription}
                        </p>
                        <ul className="grid gap-2">
                          {group.capabilities.map((cap) => (
                            <li
                              key={cap}
                              className="flex items-center gap-2.5 text-sm font-semibold text-zinc-900"
                            >
                              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#3B63FF]" />
                              <span>{cap}</span>
                            </li>
                          ))}
                        </ul>

                        <div className="pt-1">
                          <button
                            type="button"
                            data-glow-btn=""
                            onClick={() => selectServiceForEnquiry(group.enquiryServiceValue)}
                            className="inline-flex items-center gap-2 rounded-full border border-black/15 bg-[#0A0A0C] px-6 py-3 font-condensed text-xs font-bold uppercase tracking-[0.22em] text-white transition hover:bg-[#3B63FF] active:scale-[0.98]"
                          >
                            HIRE DEV FOR {group.title}
                            <ArrowUpRight className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      {/* 61.8% Golden Column: Live Client Proof Samples */}
                      <div>
                        <p className="mb-2.5 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">
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
                              className="group/item overflow-hidden rounded-2xl border border-black/12 bg-white text-left shadow-sm transition hover:-translate-y-1 hover:border-[#3B63FF] hover:shadow-md active:scale-[0.98]"
                            >
                              <div className="relative aspect-video w-full overflow-hidden bg-zinc-900">
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
                                  <span className="absolute bottom-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/75 text-white transition group-hover/item:bg-[#3B63FF]">
                                    <Play className="h-3 w-3 fill-current" />
                                  </span>
                                )}
                              </div>
                              <div className="p-2.5">
                                <p className="line-clamp-1 text-xs font-bold text-zinc-900">
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
            <span className="font-mono text-phi-xs font-bold uppercase text-zinc-600">
              DIRECT BOOKING FOR:
            </span>
            <div className="flex flex-wrap gap-2">
              {servicesContent.additionalDisciplines.map((disc) => (
                <button
                  key={disc}
                  type="button"
                  data-glow-btn=""
                  onClick={() => selectServiceForEnquiry(disc)}
                  className="rounded-full border border-black/15 bg-[#0A0A0C]/[0.05] px-3.5 py-1.5 text-xs font-semibold text-zinc-900 transition hover:border-[#3B63FF] hover:bg-[#0A0A0C] hover:text-white active:scale-[0.97]"
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
