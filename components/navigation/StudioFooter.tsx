import React from 'react';
import Link from 'next/link';
import { profileContent, socialLinksContent } from '@/lib/content';

export function StudioFooter() {
  return (
    <footer className="border-t border-white/10 bg-[#050507] pb-24 pt-14 text-zinc-400 sm:pb-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="sm:col-span-2">
            <p className="font-display text-2xl font-extrabold uppercase tracking-tight text-white">
              {profileContent.studioName}
            </p>
            <p className="mt-2 max-w-[38ch] text-sm leading-[1.618] text-zinc-400">
              8+ years &amp; 500+ proven cuts from {profileContent.location.display}. Built for
              brands, creators, and leaders who refuse to blend in.
            </p>
          </div>

          <div>
            <p className="mb-3 font-mono text-xs uppercase tracking-[0.2em] text-zinc-300">
              NAVIGATION
            </p>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/#about" className="hover:text-white">
                  About &amp; Resume
                </Link>
              </li>
              <li>
                <Link href="/#services" className="hover:text-white">
                  Services
                </Link>
              </li>
              <li>
                <Link href="/#pricing" className="hover:text-white">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="/work" className="hover:text-white">
                  Full Portfolio Archive
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="mb-3 font-mono text-xs uppercase tracking-[0.2em] text-zinc-300">
              CONNECT
            </p>
            <ul className="space-y-2 text-sm">
              <li>
                <a href={socialLinksContent.mailtoUrl} className="hover:text-white">
                  {socialLinksContent.email}
                </a>
              </li>
              <li>
                <a href={socialLinksContent.telUrl} className="hover:text-white">
                  {socialLinksContent.phoneDisplay}
                </a>
              </li>
              {socialLinksContent.socials.map((soc) => (
                <li key={soc.id}>
                  <a
                    href={soc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-white"
                  >
                    {soc.platform} ({soc.handle})
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col justify-between gap-3 border-t border-white/[0.07] pt-6 font-mono text-xs text-zinc-500 sm:flex-row">
          <span suppressHydrationWarning>
            © {new Date().getFullYear()} Dev Kumawat · DEV STUDIO. All rights reserved.
          </span>
          <span>JAIPUR, RAJASTHAN, INDIA · IST (UTC+05:30)</span>
        </div>
      </div>
    </footer>
  );
}

