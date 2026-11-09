'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { ArrowUpRight, Download, ExternalLink, GraduationCap, MapPin } from 'lucide-react';
import { profileContent } from '@/lib/content';
import { GlowCard } from '@/components/ui/spotlight-card';

const AboutArtifactsScene = dynamic(
  () => import('@/three/scenes/AboutArtifactsScene').then((m) => m.AboutArtifactsScene),
  { ssr: false }
);

export function AboutSection() {
  return (
    <section
      id="about"
      aria-labelledby="about-heading"
      className="relative scroll-mt-24 overflow-hidden bg-transparent py-phi-4 sm:py-phi-5"
    >
      {/* Floating Reactive 3D Studio Objects */}
      <AboutArtifactsScene />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Golden Ratio Section Header */}
        <div className="mb-phi-3 flex flex-col justify-between gap-phi-2 border-b border-white/15 pb-phi-2 sm:mb-phi-4 lg:flex-row lg:items-end">
          <div>
            <span className="mb-2 block font-mono text-phi-xs font-bold uppercase text-amber-300">
              01 · WHY BRANDS &amp; LEADERS HIRE DEV
            </span>
            <h2
              id="about-heading"
              className="font-display text-phi-xl font-extrabold uppercase text-white"
            >
              ABOUT ME
            </h2>
          </div>

          {/* Primary Selling "HIRE ME" CTA + Verified Resume PDF & Portfolio Sheet */}
          <div className="flex flex-wrap items-center gap-3">
            <a
              href="#contact"
              data-glow-btn=""
              data-cta-gold=""
              className="btn-cta-gold inline-flex items-center gap-2 rounded-full border px-6 py-3 font-condensed text-xs font-extrabold uppercase tracking-[0.22em] transition active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
            >
              HIRE ME
              <ArrowUpRight className="h-4 w-4" />
            </a>
            <a
              href={profileContent.resume.primaryPdfUrl}
              download={profileContent.resume.downloadFileName}
              data-glow-btn=""
              data-testid="resume-download-btn"
              className="inline-flex items-center gap-2.5 rounded-full border border-white/40 bg-white px-6 py-3 font-condensed text-xs font-extrabold uppercase tracking-[0.22em] text-zinc-950 shadow-lg transition hover:bg-blue-50 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3B63FF]"
            >
              <Download className="h-4 w-4" />
              RESUME (PDF)
            </a>
            <a
              href={profileContent.resume.portfolioOverviewPdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              data-glow-btn=""
              className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-5 py-3 font-condensed text-xs font-bold uppercase tracking-[0.2em] text-white transition hover:bg-[#3B63FF]/30 active:scale-[0.98]"
            >
              PORTFOLIO SHEET
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>

        {/* Golden Ratio Split: 1.618fr (61.8% Authority & Proof) : 1fr (38.2% Portrait & Credentials) */}
        <div className="grid gap-phi-3 lg:grid-cols-[1.618fr_1fr] lg:items-start">
          <div className="space-y-phi-2">
            <p className="max-w-[24ch] font-sans text-3xl font-extrabold leading-[1.1] tracking-[-0.03em] text-white sm:text-4xl lg:text-[2.618rem]">
              Viewers decide in 1.7 seconds.{' '}
              <span className="font-serif text-[1.08em] italic font-normal tracking-normal text-amber-300">
                I make sure they stay &amp; buy.
              </span>
            </p>

            <p className="max-w-[52ch] text-phi-base font-medium text-zinc-100">
              {profileContent.bio.paragraphs[0]}
            </p>

            {/* 4 Verified Hard-Number Proof Blocks (Spotlight GlowCards) */}
            <div className="grid grid-cols-2 gap-3 pt-2 sm:grid-cols-4">
              {profileContent.stats.map((st) => (
                <GlowCard
                  key={st.label}
                  customSize
                  glowColor="blue"
                  className="rounded-2xl border border-white/20 bg-[#070D22]/80 p-4 backdrop-blur-xl"
                >
                  <span className="block font-sans text-3xl font-extrabold tabular-nums tracking-[-0.03em] text-amber-300 sm:text-4xl">
                    {st.value}
                  </span>
                  <span className="mt-1 block font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-100">
                    {st.label}
                  </span>
                </GlowCard>
              ))}
            </div>

            {/* 3 Streamlined Result-Proven Track-Record Rows */}
            <GlowCard
              customSize
              glowColor="blue"
              className="divide-y divide-white/10 rounded-3xl border border-white/20 bg-[#070D22]/80 px-5 py-2 backdrop-blur-xl sm:px-6"
            >
              {profileContent.highlights.map((hl) => (
                <div
                  key={hl.number}
                  className="flex flex-col gap-1.5 py-4 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6"
                >
                  <div className="flex items-baseline gap-3">
                    <span className="font-mono text-xs font-bold text-amber-400">{hl.number}</span>
                    <div>
                      <h3 className="font-sans text-sm font-bold text-white sm:text-base">
                        {hl.title}
                      </h3>
                      <p className="font-mono text-[11px] font-medium text-[#93C5FD]">{hl.subtitle}</p>
                    </div>
                  </div>
                  <p className="max-w-[36ch] text-xs font-medium leading-[1.618] text-zinc-200 sm:text-right">
                    {hl.detail}
                  </p>
                </div>
              ))}
            </GlowCard>
          </div>

          {/* Right 38.2% Golden Column: Studio Portrait + Compact Credential & Toolkit */}
          <div className="space-y-phi-2">
            <GlowCard
              customSize
              glowColor="blue"
              className="overflow-hidden rounded-3xl border border-white/20 bg-[#070D22]/80 p-2.5 shadow-2xl backdrop-blur-xl"
            >
              <div className="relative aspect-[1/1.18] overflow-hidden rounded-2xl bg-[#0a0a0f]">
                <img
                  src={profileContent.portraitUrl}
                  alt="Dev Kumawat — Creative Director, Video Editor and Photographer"
                  loading="lazy"
                  className="h-full w-full object-cover object-top"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#050814] via-[#050814]/80 to-transparent p-5">
                  <p className="font-display text-xl font-bold uppercase tracking-tight text-white">
                    {profileContent.name}
                  </p>
                  <p className="mt-0.5 flex items-center gap-1.5 font-mono text-xs font-semibold text-amber-300">
                    <MapPin className="h-3.5 w-3.5" />
                    {profileContent.location.display} · Worldwide
                  </p>
                </div>
              </div>
            </GlowCard>

            {/* Compact Verified Credential & Studio Arsenal Card */}
            <GlowCard
              customSize
              glowColor="blue"
              className="rounded-2xl border border-white/20 bg-[#070D22]/80 p-5 backdrop-blur-xl"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-amber-300">
                  <GraduationCap className="h-3.5 w-3.5" />
                  VERIFIED CREDENTIAL
                </span>
                <span className="font-mono text-[11px] font-medium text-zinc-200">
                  {profileContent.education.period}
                </span>
              </div>
              <h3 className="mt-1.5 text-sm font-bold text-white">
                {profileContent.education.degree} — {profileContent.education.institution}
              </h3>
              <div className="mt-3.5 flex flex-wrap gap-1.5 border-t border-white/10 pt-3.5">
                {profileContent.software.map((tool) => (
                  <span
                    key={tool}
                    className="rounded-full border border-white/20 bg-white/10 px-2.5 py-1 font-mono text-[10px] font-medium text-zinc-100"
                  >
                    {tool}
                  </span>
                ))}
              </div>
            </GlowCard>
          </div>
        </div>

        {/* Single Clean Trusted-By Brand Proof Strip */}
        <div className="mt-phi-3 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-white/15 pt-phi-2">
          <span className="font-mono text-phi-xs font-bold uppercase text-amber-300">
            PROVEN ACROSS 21+ BRANDS:
          </span>
          {profileContent.collaboratedBrands.slice(0, 10).map((brand) => (
            <span key={brand} className="font-mono text-xs font-medium text-zinc-100">
              {brand}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
