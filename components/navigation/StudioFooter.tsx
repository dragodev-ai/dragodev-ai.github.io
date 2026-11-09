import React from 'react';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { profileContent, socialLinksContent } from '@/lib/content';

export function StudioFooter() {
  return (
    <footer className="relative border-t border-white/20 bg-[#040714]/85 pb-24 pt-14 text-zinc-200 backdrop-blur-2xl sm:pb-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Final Golden-Ratio Conversion Climax Banner */}
        <div className="mb-12 flex flex-col items-start justify-between gap-4 rounded-3xl border border-amber-400/35 bg-[#070E26]/90 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.6)] sm:flex-row sm:items-center sm:px-8">
          <div>
            <span className="font-mono text-[11px] font-bold uppercase tracking-[0.22em] text-amber-300">
              READY TO TURN VIEWS INTO REVENUE?
            </span>
            <p className="mt-1 font-display text-xl font-extrabold uppercase tracking-tight text-white sm:text-2xl">
              LET&apos;S SHIP YOUR NEXT HIGH-PERFORMING CAMPAIGN.
            </p>
          </div>
          <Link
            href="/#contact"
            data-glow-btn=""
            data-cta-gold=""
            className="btn-cta-gold inline-flex shrink-0 items-center gap-2 rounded-full border px-7 py-3.5 font-condensed text-xs font-extrabold uppercase tracking-[0.22em] transition active:scale-[0.98]"
          >
            CONTACT US — HIRE DEV
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="sm:col-span-2">
            <p className="font-display text-2xl font-extrabold uppercase tracking-tight text-white">
              {profileContent.studioName}
            </p>
            <p className="mt-2 max-w-[38ch] text-sm font-medium leading-[1.618] text-zinc-200">
              8+ years &amp; 500+ proven cuts from {profileContent.location.display}. Built for
              brands, creators, and leaders who refuse to blend in.
            </p>
          </div>

          <div>
            <p className="mb-3 font-mono text-xs font-bold uppercase tracking-[0.2em] text-amber-300">
              NAVIGATION
            </p>
            <ul className="space-y-2 text-sm font-medium text-zinc-100">
              <li>
                <Link href="/#about" className="transition hover:text-amber-300">
                  About &amp; Resume
                </Link>
              </li>
              <li>
                <Link href="/#services" className="transition hover:text-amber-300">
                  Services
                </Link>
              </li>
              <li>
                <Link href="/#pricing" className="transition hover:text-amber-300">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="/work" className="transition hover:text-amber-300">
                  Full Portfolio Archive
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="mb-3 font-mono text-xs font-bold uppercase tracking-[0.2em] text-amber-300">
              CONNECT
            </p>
            <ul className="space-y-2 text-sm font-medium text-zinc-100">
              <li>
                <a href={socialLinksContent.mailtoUrl} className="transition hover:text-amber-300">
                  {socialLinksContent.email}
                </a>
              </li>
              <li>
                <a href={socialLinksContent.telUrl} className="transition hover:text-amber-300">
                  {socialLinksContent.phoneDisplay}
                </a>
              </li>
              {socialLinksContent.socials.map((soc) => (
                <li key={soc.id}>
                  <a
                    href={soc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="transition hover:text-amber-300"
                  >
                    {soc.platform} ({soc.handle})
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col justify-between gap-3 border-t border-white/15 pt-6 font-mono text-xs font-medium text-zinc-300 sm:flex-row">
          <span suppressHydrationWarning>
            © {new Date().getFullYear()} Dev Kumawat · DEV STUDIO. All rights reserved.
          </span>
          <span>JAIPUR, RAJASTHAN, INDIA · IST (UTC+05:30)</span>
        </div>
      </div>
    </footer>
  );
}

