'use client';

import React from 'react';
import { ArrowUpRight, Check, Sparkles } from 'lucide-react';
import { pricingContent } from '@/lib/content';
import { useStudioExperience } from '@/lib/audio/studio-audio-context';
import { GlowCard } from '@/components/ui/spotlight-card';
import { LiquidMetalButton } from '@/components/ui/liquid-metal-button';

export function PricingSection() {
  const { selectServiceForEnquiry, playUiTick } = useStudioExperience();

  return (
    <section
      id="pricing"
      aria-labelledby="pricing-heading"
      className="relative scroll-mt-24 bg-transparent py-phi-4 sm:py-phi-5"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-phi-3 flex flex-col justify-between gap-phi-2 border-b border-white/15 pb-phi-2 sm:mb-phi-4 lg:flex-row lg:items-end">
          <div>
            <span className="mb-2 block font-mono text-phi-xs font-bold uppercase text-amber-300">
              03 · ZERO-FLUFF PARTNERSHIPS
            </span>
            <h2
              id="pricing-heading"
              className="break-words font-display text-phi-xl font-extrabold uppercase text-white"
            >
              {pricingContent.headline}
            </h2>
          </div>
          <p className="max-w-[34ch] font-serif text-xl italic leading-[1.35] text-zinc-100 sm:text-2xl">
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
              className={`flex flex-col justify-between rounded-3xl border p-phi-2 transition-all duration-300 backdrop-blur-2xl sm:p-phi-3 ${
                pkg.featured
                  ? 'border-amber-400/60 bg-[#08122E]/85 shadow-[0_24px_70px_rgba(59,99,255,0.28)]'
                  : 'border-white/20 bg-[#070D22]/80'
              }`}
            >
              <div>
                <div className="mb-3 flex items-center justify-between gap-2">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-mono text-[10px] font-extrabold uppercase tracking-[0.18em] ${
                      pkg.featured
                        ? 'bg-amber-400 text-zinc-950 shadow-[0_0_20px_rgba(251,191,36,0.5)]'
                        : 'border border-white/20 bg-white/10 text-zinc-100'
                    }`}
                  >
                    {pkg.featured && <Sparkles className="h-3 w-3" />}
                    {pkg.badge}
                  </span>
                </div>

                <h3 className="font-display text-2xl font-extrabold uppercase tracking-tight text-white sm:text-3xl">
                  {pkg.title}
                </h3>
                <p className="mt-2 max-w-[42ch] text-phi-sm font-medium text-zinc-100">
                  {pkg.shortDescription}
                </p>

                {/* Verified Non-Fabricated Custom Quote Display */}
                <div className="my-5 rounded-2xl border border-amber-400/30 bg-[#040817]/85 px-4 py-3.5 backdrop-blur-md">
                  <p className="font-serif text-lg italic text-amber-300 sm:text-xl">
                    {pkg.price}
                  </p>
                </div>

                <ul className="space-y-2.5">
                  {pkg.deliverables.map((del) => (
                    <li key={del} className="flex items-start gap-2.5 text-sm font-medium text-white">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" />
                      <span>{del}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                type="button"
                data-glow-btn=""
                data-cta-gold={pkg.featured ? '' : undefined}
                data-testid={`pricing-cta-${pkg.id}`}
                onClick={() => {
                  playUiTick();
                  selectServiceForEnquiry(pkg.serviceSelection);
                }}
                className={`mt-7 inline-flex w-full items-center justify-center gap-2 rounded-2xl border px-6 py-3.5 font-condensed text-sm font-extrabold uppercase tracking-[0.22em] transition active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 ${
                  pkg.featured
                    ? 'btn-cta-gold'
                    : 'border-white/40 bg-white text-zinc-950 shadow-[0_10px_28px_rgba(255,255,255,0.18)] hover:bg-amber-300'
                }`}
              >
                {pkg.featured ? 'HIRE ME — CLAIM CUSTOM QUOTE' : 'CLAIM YOUR CUSTOM QUOTE'}
                <ArrowUpRight className="h-4 w-4" />
              </button>
            </GlowCard>
          ))}
        </div>

        {/* Individual Project Quote Strip */}
        <GlowCard
          customSize
          glowColor="blue"
          className="mt-phi-2 flex flex-col items-start justify-between gap-4 rounded-2xl border border-white/20 bg-[#070D22]/85 p-5 sm:flex-row sm:items-center sm:px-6"
        >
          <p className="text-sm font-semibold text-white">{pricingContent.individualProjectNote}</p>
          <LiquidMetalButton
            variant="cta"
            label="SINGLE PROJECT QUOTE →"
            width={234}
            height={44}
            onClick={() => selectServiceForEnquiry('Individual Project Quote')}
          />
        </GlowCard>
      </div>
    </section>
  );
}
