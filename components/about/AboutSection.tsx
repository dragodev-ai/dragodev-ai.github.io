'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { Download, ExternalLink, GraduationCap, MapPin } from 'lucide-react';
import { profileContent } from '@/lib/content';

const AboutArtifactsScene = dynamic(
  () => import('@/three/scenes/AboutArtifactsScene').then((m) => m.AboutArtifactsScene),
  { ssr: false }
);

export function AboutSection() {
  return (
    <section
      id="about"
      aria-labelledby="about-heading"
      className="relative overflow-hidden bg-[#070709] py-24 sm:py-32"
    >
      {/* Floating Reactive 3D Studio Objects (Crescent Moon, 3D Smiley, Arrow, Creative Brick, Metallic Form) */}
      <AboutArtifactsScene />

      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-8">
        {/* Section Eyebrow & Massive Editorial Headline */}
        <div className="mb-14 flex flex-col justify-between gap-6 border-b border-white/10 pb-10 lg:flex-row lg:items-end">
          <div>
            <span className="mb-3 block font-mono text-xs uppercase tracking-[0.28em] text-purple-400">
              01 · STORY &amp; CREDENTIALS
            </span>
            <h2
              id="about-heading"
              className="font-display text-3xl font-extrabold uppercase tracking-tight text-white sm:text-7xl"
            >
              ABOUT ME
            </h2>
          </div>

          {/* Verified Resume PDF Download & View CTA */}
          <div className="flex flex-wrap items-center gap-3">
            <a
              href={profileContent.resume.primaryPdfUrl}
              download={profileContent.resume.downloadFileName}
              data-testid="resume-download-btn"
              className="inline-flex items-center gap-2.5 rounded-full bg-white px-6 py-3 font-condensed text-sm font-bold uppercase tracking-[0.22em] text-zinc-950 shadow-lg transition hover:bg-purple-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400"
            >
              <Download className="h-4 w-4" />
              RESUME (PDF)
            </a>
            <a
              href={profileContent.resume.portfolioOverviewPdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-5 py-3 font-condensed text-xs font-semibold uppercase tracking-[0.2em] text-zinc-200 transition hover:border-purple-400 hover:text-white"
            >
              PORTFOLIO SHEET
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>

        {/* Main Editorial Narrative + Studio Portrait Card */}
        <div className="grid gap-12 lg:grid-cols-12 lg:items-start">
          <div className="space-y-6 lg:col-span-7">
            <p className="font-sans text-xl font-medium leading-relaxed text-zinc-100 sm:text-2xl">
              {profileContent.bio.lead}
            </p>

            {profileContent.bio.paragraphs.map((para, idx) => (
              <p key={idx} className="text-base leading-relaxed text-zinc-300/90">
                {para}
              </p>
            ))}

            {/* Verified Metrics Grid */}
            <div className="grid grid-cols-2 gap-4 pt-4 sm:grid-cols-4">
              {profileContent.stats.map((st) => (
                <div
                  key={st.label}
                  className="rounded-2xl border border-white/10 bg-[#111116]/90 p-4 backdrop-blur-md"
                >
                  <span className="block font-display text-3xl font-extrabold text-white sm:text-4xl">
                    {st.value}
                  </span>
                  <span className="mt-1 block font-mono text-[11px] uppercase tracking-wider text-zinc-400">
                    {st.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Original Studio Portrait + Education & Software Suite */}
          <div className="space-y-6 lg:col-span-5">
            <div className="overflow-hidden rounded-3xl border border-white/12 bg-[#111116] p-3 shadow-2xl">
              <div className="relative aspect-[4/4.4] overflow-hidden rounded-2xl bg-[#0a0a0f]">
                <img
                  src={profileContent.portraitUrl}
                  alt="Dev Kumawat — Creative Director, Video Editor and Photographer"
                  loading="lazy"
                  className="h-full w-full object-cover object-top"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#070709] via-[#070709]/60 to-transparent p-5">
                  <p className="font-display text-xl font-bold uppercase text-white">
                    {profileContent.name}
                  </p>
                  <p className="mt-0.5 flex items-center gap-1.5 font-mono text-xs text-amber-300">
                    <MapPin className="h-3.5 w-3.5" />
                    {profileContent.location.display}
                  </p>
                </div>
              </div>
            </div>

            {/* Verified Education Card */}
            <div className="rounded-2xl border border-white/10 bg-[#111116]/90 p-5">
              <div className="mb-2 flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-purple-400">
                <GraduationCap className="h-4 w-4" />
                EDUCATION
              </div>
              <h3 className="text-base font-bold text-white">
                {profileContent.education.degree} — {profileContent.education.institution}
              </h3>
              <p className="font-mono text-xs text-zinc-400">{profileContent.education.period}</p>
              <p className="mt-2 text-xs leading-relaxed text-zinc-300">
                {profileContent.education.notes}
              </p>
            </div>
          </div>
        </div>

        {/* 3 Verified Career Pillars (Mahanagar Times, MLA Dr. Gopal Sharma, Brand Campaigns) */}
        <div className="mt-14 grid gap-5 md:grid-cols-3">
          {profileContent.highlights.map((hl) => (
            <div
              key={hl.number}
              className="rounded-3xl border border-white/10 bg-[#111116]/85 p-6 transition hover:border-purple-500/40"
            >
              <div className="mb-3 flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-amber-400">{hl.number}</span>
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-400">
                  {hl.category}
                </span>
              </div>
              <h3 className="font-sans text-lg font-bold text-white">{hl.title}</h3>
              <p className="mt-0.5 font-mono text-xs text-purple-300">{hl.subtitle}</p>
              <p className="mt-3 text-sm leading-relaxed text-zinc-300">{hl.detail}</p>
            </div>
          ))}
        </div>

        {/* Verified Tools & Collaborated Brands Strip */}
        <div className="mt-12 rounded-3xl border border-white/10 bg-[#0e0e14] p-6 sm:p-8">
          <div className="grid gap-8 md:grid-cols-2">
            <div>
              <p className="mb-3 font-mono text-xs uppercase tracking-[0.22em] text-zinc-400">
                PRODUCTION TOOLKIT &amp; DISCIPLINES
              </p>
              <div className="flex flex-wrap gap-2">
                {[...profileContent.software, ...profileContent.disciplines].map((item) => (
                  <span
                    key={item}
                    className="rounded-full border border-white/12 bg-white/[0.04] px-3.5 py-1.5 text-xs font-medium text-zinc-200"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-3 font-mono text-xs uppercase tracking-[0.22em] text-zinc-400">
                COLLABORATED BRANDS, AGENCIES &amp; PUBLIC FIGURES
              </p>
              <div className="flex flex-wrap gap-2">
                {profileContent.collaboratedBrands.map((brand) => (
                  <span
                    key={brand}
                    className="rounded-full border border-purple-500/20 bg-purple-500/[0.07] px-3 py-1 font-mono text-[11px] text-purple-200"
                  >
                    {brand}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
