'use client';

import React from 'react';
import { ArrowUpRight, Check, Sparkles } from 'lucide-react';
import { pricingContent } from '@/lib/content';
import { useStudioExperience } from '@/lib/audio/studio-audio-context';

export function PricingSection() {
  const { selectServiceForEnquiry, playUiTick } = useStudioExperience();

  return (
    <section
      id="pricing"
      aria-labelledby="pricing-heading"
      className="relative bg-[#070709] py-24 sm:py-32"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-8">
        <div className="mb-14 flex flex-col justify-between gap-6 border-b border-white/10 pb-10 lg:flex-row lg:items-end">
          <div>
            <span className="mb-3 block font-mono text-xs uppercase tracking-[0.28em] text-amber-400">
              03 · CONFIGURABLE ENGAGEMENTS
            </span>
            <h2
              id="pricing-heading"
              className="break-words font-display text-3xl font-extrabold uppercase tracking-tight text-white sm:text-7xl"
            >
              {pricingContent.headline}
            </h2>
          </div>
          <p className="max-w-md text-sm leading-relaxed text-zinc-400 sm:text-base">
            {pricingContent.subheadline}
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {pricingContent.packages.map((pkg) => (
            <article
              key={pkg.id}
              data-testid={`pricing-card-${pkg.id}`}
              className={`relative flex flex-col justify-between rounded-3xl border p-7 transition-all duration-300 sm:p-8 ${
                pkg.featured
                  ? 'border-purple-500/60 bg-gradient-to-b from-[#171326] to-[#101017] shadow-[0_24px_60px_rgba(124,58,237,0.18)]'
                  : 'border-white/10 bg-[#111116] hover:border-white/25'
              }`}
            >
              <div>
                <div className="mb-4 flex items-center justify-between gap-2">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.2em] ${
                      pkg.featured
                        ? 'bg-purple-600 text-white'
                        : 'border border-white/12 bg-white/[0.04] text-zinc-300'
                    }`}
                  >
                    {pkg.featured && <Sparkles className="h-3 w-3" />}
                    {pkg.badge}
                  </span>
                </div>

                <h3 className="font-display text-2xl font-bold uppercase text-white sm:text-3xl">
                  {pkg.title}
                </h3>
                <p className="mt-2.5 text-sm leading-relaxed text-zinc-300">
                  {pkg.shortDescription}
                </p>

                {/* Verified Non-Fabricated Custom Quote Display */}
                <div className="my-6 rounded-2xl border border-white/10 bg-[#09090e] px-4 py-4">
                  <span className="block font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-400">
                    INVESTMENT
                  </span>
                  <p className="mt-1 font-sans text-lg font-bold text-amber-300 sm:text-xl">
                    {pkg.price}
                  </p>
                </div>

                <ul className="space-y-2.5">
                  {pkg.deliverables.map((del) => (
                    <li key={del} className="flex items-start gap-2.5 text-sm text-zinc-200">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-purple-400" />
                      <span>{del}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                type="button"
                data-testid={`pricing-cta-${pkg.id}`}
                onClick={() => {
                  playUiTick();
                  selectServiceForEnquiry(pkg.serviceSelection);
                }}
                className={`mt-8 inline-flex w-full items-center justify-center gap-2 rounded-2xl px-6 py-3.5 font-condensed text-sm font-bold uppercase tracking-[0.22em] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 ${
                  pkg.featured
                    ? 'bg-purple-600 text-white hover:bg-purple-500'
                    : 'bg-white text-zinc-950 hover:bg-zinc-200'
                }`}
              >
                REQUEST QUOTE FOR THIS PACKAGE
                <ArrowUpRight className="h-4 w-4" />
              </button>
            </article>
          ))}
        </div>

        {/* Individual Project Quote Strip */}
        <div className="mt-8 flex flex-col items-start justify-between gap-4 rounded-2xl border border-white/10 bg-[#111116]/75 p-6 sm:flex-row sm:items-center">
          <p className="text-sm text-zinc-300">{pricingContent.individualProjectNote}</p>
          <button
            type="button"
            onClick={() => selectServiceForEnquiry('Individual Project Quote')}
            className="shrink-0 rounded-full border border-purple-400/50 bg-purple-600/15 px-5 py-2.5 font-condensed text-xs font-bold uppercase tracking-[0.2em] text-purple-200 transition hover:bg-purple-600 hover:text-white"
          >
            SINGLE PROJECT ENQUIRY →
          </button>
        </div>
      </div>
    </section>
  );
}
