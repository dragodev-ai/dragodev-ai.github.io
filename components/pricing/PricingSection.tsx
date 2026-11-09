'use client';

import React from 'react';
import { ArrowUpRight, Check, Sparkles } from 'lucide-react';
import { pricingContent } from '@/lib/content';
import { useStudioExperience } from '@/lib/audio/studio-audio-context';
import { GlowCard } from '@/components/ui/spotlight-card';

export function PricingSection() {
  const { selectServiceForEnquiry, playUiTick } = useStudioExperience();

  return (
    <section
      id="pricing"
      aria-labelledby="pricing-heading"
      className="relative scroll-mt-24 bg-[#070709] py-phi-4 sm:py-phi-5"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-phi-3 flex flex-col justify-between gap-phi-2 border-b border-white/10 pb-phi-2 sm:mb-phi-4 lg:flex-row lg:items-end">
          <div>
            <span className="mb-2 block font-mono text-phi-xs font-semibold uppercase text-amber-400">
              03 · ZERO-FLUFF PARTNERSHIPS
            </span>
            <h2
              id="pricing-heading"
              className="break-words font-display text-phi-xl font-extrabold uppercase text-white"
            >
              {pricingContent.headline}
            </h2>
          </div>
          <p className="max-w-[34ch] font-serif text-xl italic leading-[1.35] text-zinc-300 sm:text-2xl">
            {pricingContent.subheadline}
          </p>
        </div>

        <div className="grid gap-phi-2 md:grid-cols-2">
          {pricingContent.packages.map((pkg) => (
            <GlowCard
              key={pkg.id}
              customSize
              glowColor="blue"
              data-testid={`pricing-card-${pkg.id}`}
              className={`flex flex-col justify-between rounded-3xl border p-phi-2 transition-all duration-300 sm:p-phi-3 ${
                pkg.featured
                  ? 'border-[#3B63FF]/60 bg-gradient-to-b from-[#0C142E] to-[#0E1019] shadow-[0_24px_60px_rgba(59,99,255,0.20)]'
                  : 'border-white/10 bg-[#111116]'
              }`}
            >
              <div>
                <div className="mb-3 flex items-center justify-between gap-2">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.18em] ${
                      pkg.featured
                        ? 'bg-[#3B63FF] text-white shadow-[0_0_20px_rgba(59,99,255,0.45)]'
                        : 'border border-white/12 bg-white/[0.04] text-zinc-300'
                    }`}
                  >
                    {pkg.featured && <Sparkles className="h-3 w-3" />}
                    {pkg.badge}
                  </span>
                </div>

                <h3 className="font-display text-2xl font-extrabold uppercase tracking-tight text-white sm:text-3xl">
                  {pkg.title}
                </h3>
                <p className="mt-2 max-w-[42ch] text-phi-sm text-zinc-300">
                  {pkg.shortDescription}
                </p>

                {/* Verified Non-Fabricated Custom Quote Display */}
                <div className="my-5 rounded-2xl border border-white/10 bg-[#09090e] px-4 py-3.5">
                  <p className="font-serif text-lg italic text-amber-300 sm:text-xl">
                    {pkg.price}
                  </p>
                </div>

                <ul className="space-y-2">
                  {pkg.deliverables.map((del) => (
                    <li key={del} className="flex items-start gap-2.5 text-sm text-zinc-200">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#7C9BFF]" />
                      <span>{del}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                type="button"
                data-glow-btn=""
                data-testid={`pricing-cta-${pkg.id}`}
                onClick={() => {
                  playUiTick();
                  selectServiceForEnquiry(pkg.serviceSelection);
                }}
                className={`mt-7 inline-flex w-full items-center justify-center gap-2 rounded-2xl border px-6 py-3.5 font-condensed text-sm font-bold uppercase tracking-[0.22em] transition active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3B63FF] ${
                  pkg.featured
                    ? 'border-[#7C9BFF]/50 bg-[#3B63FF] text-white hover:bg-[#4F75FF]'
                    : 'border-white/30 bg-white text-zinc-950 hover:bg-blue-50'
                }`}
              >
                CLAIM YOUR CUSTOM QUOTE
                <ArrowUpRight className="h-4 w-4" />
              </button>
            </GlowCard>
          ))}
        </div>

        {/* Individual Project Quote Strip */}
        <GlowCard
          customSize
          glowColor="blue"
          className="mt-phi-2 flex flex-col items-start justify-between gap-4 rounded-2xl border border-white/10 bg-[#111116]/85 p-5 sm:flex-row sm:items-center sm:px-6"
        >
          <p className="text-sm font-medium text-zinc-200">{pricingContent.individualProjectNote}</p>
          <button
            type="button"
            data-glow-btn=""
            onClick={() => selectServiceForEnquiry('Individual Project Quote')}
            className="shrink-0 rounded-full border border-[#3B63FF]/55 bg-[#3B63FF]/15 px-5 py-2.5 font-condensed text-xs font-bold uppercase tracking-[0.2em] text-blue-200 transition hover:bg-[#3B63FF] hover:text-white active:scale-[0.98]"
          >
            SINGLE PROJECT QUOTE →
          </button>
        </GlowCard>
      </div>
    </section>
  );
}
