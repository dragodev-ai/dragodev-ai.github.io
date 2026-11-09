'use client';

import React from 'react';
import { ArrowUpRight, Film, Sparkles, Wand2 } from 'lucide-react';
import { GlowCard } from '@/components/ui/spotlight-card';

export function Default() {
  const demoItems = [
    {
      icon: Film,
      badge: '01 · RETENTION CUTS',
      title: 'Commercial Video Editing',
      cta: 'Watch Reels',
    },
    {
      icon: Wand2,
      badge: '02 · 3D MOTION',
      title: 'After Effects & VFX',
      cta: 'Inspect Motion',
    },
    {
      icon: Sparkles,
      badge: '03 · AI PRODUCTION',
      title: 'Cinema AI Brand Films',
      cta: 'Start Project',
    },
  ];

  return (
    <div className="flex min-h-screen w-full flex-wrap items-center justify-center gap-10 bg-[#070709] p-8">
      {demoItems.map((item) => {
        const Icon = item.icon;
        return (
          <GlowCard key={item.title} glowColor="blue" className="justify-between p-6">
            <div className="space-y-3">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[#3B63FF]/35 bg-[#3B63FF]/15 text-[#7C9BFF]">
                <Icon className="h-5 w-5" />
              </span>
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#7C9BFF]">
                {item.badge}
              </p>
              <h3 className="font-display text-xl font-extrabold uppercase text-white">
                {item.title}
              </h3>
            </div>
            <button
              type="button"
              data-glow-btn=""
              className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2.5 font-condensed text-xs font-bold uppercase tracking-[0.2em] text-white"
            >
              <span>{item.cta}</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </button>
          </GlowCard>
        );
      })}
    </div>
  );
}

