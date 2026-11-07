'use client';

import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowUpRight, ChevronDown, Play } from 'lucide-react';
import type { PortfolioProject } from '@/lib/content/types';
import { servicesContent } from '@/lib/content';
import { useStudioExperience } from '@/lib/audio/studio-audio-context';

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
      className="relative z-20 -mt-6 bg-[#070709] pt-6"
    >
      {/* Premium White Editorial Sheet Sliding Upward Over Dark Studio */}
      <div
        ref={sheetRef}
        data-testid="services-editorial-sheet"
        className="rounded-t-[40px] bg-[#F7F6F2] px-4 py-20 text-[#0A0A0C] shadow-[0_-28px_80px_rgba(0,0,0,0.75)] sm:rounded-t-[56px] sm:px-8 sm:py-28"
      >
        <div className="mx-auto max-w-7xl px-0 sm:px-2 lg:px-4">
          {/* Editorial Header */}
          <div className="mb-14 flex flex-col justify-between gap-6 border-b border-black/15 pb-10 lg:flex-row lg:items-end">
            <div>
              <span className="mb-3 block font-mono text-xs font-semibold uppercase tracking-[0.28em] text-purple-700">
                02 · CAPABILITIES &amp; CRAFT
              </span>
              <h2
                id="services-heading"
                className="font-display text-3xl font-extrabold uppercase leading-[0.95] tracking-tight text-[#0A0A0C] sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl"
              >
                {servicesContent.headline}
              </h2>
            </div>
            <p className="max-w-md text-sm leading-relaxed text-zinc-700 sm:text-base">
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
                <div key={group.id} className="py-6 sm:py-8">
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={`service-panel-${group.id}`}
                    data-testid={`service-row-btn-${group.id}`}
                    onClick={() => {
                      playUiTick();
                      setExpandedId(isOpen ? '' : group.id);
                    }}
                    className="group flex w-full items-center justify-between gap-4 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-700 rounded-xl"
                  >
                    <div className="flex min-w-0 flex-col gap-1 sm:flex-row sm:items-baseline sm:gap-6 lg:gap-8">
                      <span className="font-mono text-sm font-bold text-purple-700 sm:text-base">
                        {group.number}
                      </span>
                      <div className="min-w-0">
                        <h3 className="break-words font-display text-lg font-extrabold uppercase tracking-tight text-[#0A0A0C] transition-transform duration-200 group-hover:translate-x-1 sm:text-2xl md:text-3xl lg:text-[2.1rem] xl:text-4xl">
                          {group.title}
                        </h3>
                        <p className="mt-1 text-xs font-medium text-zinc-600 sm:text-sm">
                          {group.tagline}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-black/20 transition-all duration-300 ${
                        isOpen
                          ? 'rotate-180 border-purple-700 bg-purple-700 text-white'
                          : 'bg-transparent text-[#0A0A0C] group-hover:bg-black group-hover:text-white'
                      }`}
                    >
                      <ChevronDown className="h-5 w-5" />
                    </span>
                  </button>

                  {isOpen && (
                    <div
                      id={`service-panel-${group.id}`}
                      data-testid={`service-panel-${group.id}`}
                      className="mt-8 grid gap-8 pl-0 sm:pl-14 lg:grid-cols-12"
                    >
                      <div className="space-y-5 lg:col-span-6">
                        <p className="text-base leading-relaxed text-zinc-800">
                          {group.shortDescription}
                        </p>
                        <div>
                          <p className="mb-2.5 font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-500">
                            DELIVERABLES &amp; SPECIALIZATIONS
                          </p>
                          <ul className="grid gap-2 sm:grid-cols-2">
                            {group.capabilities.map((cap) => (
                              <li
                                key={cap}
                                className="flex items-start gap-2 text-sm font-medium text-zinc-900"
                              >
                                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-purple-700" />
                                <span>{cap}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <button
                          type="button"
                          onClick={() => selectServiceForEnquiry(group.enquiryServiceValue)}
                          className="inline-flex items-center gap-2 rounded-full bg-[#0A0A0C] px-6 py-3 font-condensed text-xs font-bold uppercase tracking-[0.22em] text-white transition hover:bg-purple-700"
                        >
                          ENQUIRE FOR {group.title}
                          <ArrowUpRight className="h-4 w-4" />
                        </button>
                      </div>

                      {/* Relevant Real Google Drive Portfolio Samples */}
                      <div className="lg:col-span-6">
                        <p className="mb-3 font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-500">
                          SELECTED DRIVE WORK ({group.driveCategories.join(' · ')})
                        </p>
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                          {matchingProjects.map((proj) => (
                            <button
                              key={proj.id}
                              type="button"
                              onClick={() => openProject(proj)}
                              className="group/item overflow-hidden rounded-2xl border border-black/12 bg-white text-left shadow-sm transition hover:-translate-y-1 hover:border-purple-700 hover:shadow-md"
                            >
                              <div className="relative aspect-video w-full overflow-hidden bg-zinc-900">
                                <img
                                  src={`${proj.thumbnail}?sz=w480`}
                                  alt={proj.title}
                                  loading="lazy"
                                  className="h-full w-full object-cover transition-transform duration-300 group-hover/item:scale-105"
                                />
                                {proj.mediaType === 'video' && (
                                  <span className="absolute bottom-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/75 text-white">
                                    <Play className="h-3 w-3 fill-current" />
                                  </span>
                                )}
                              </div>
                              <div className="p-2.5">
                                <p className="line-clamp-1 text-xs font-bold text-zinc-900">
                                  {proj.title}
                                </p>
                                <p className="font-mono text-[10px] text-zinc-500">
                                  {proj.category}
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

          {/* Additional Creative Disciplines Strip */}
          <div className="mt-10 flex flex-wrap items-center justify-between gap-4">
            <span className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-zinc-600">
              ALSO AVAILABLE FOR:
            </span>
            <div className="flex flex-wrap gap-2">
              {servicesContent.additionalDisciplines.map((disc) => (
                <button
                  key={disc}
                  type="button"
                  onClick={() => selectServiceForEnquiry(disc)}
                  className="rounded-full border border-black/15 bg-black/[0.04] px-4 py-1.5 text-xs font-semibold text-zinc-900 transition hover:border-purple-700 hover:bg-purple-700 hover:text-white"
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
