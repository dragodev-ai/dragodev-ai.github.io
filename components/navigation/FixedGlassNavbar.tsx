'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { siteConfigContent } from '@/lib/content';
import { useStudioExperience } from '@/lib/audio/studio-audio-context';
import { LiquidMetalButton } from '@/components/ui/liquid-metal-button';

export function FixedGlassNavbar() {
  const pathname = usePathname();
  const { playUiTick } = useStudioExperience();
  const [activeSection, setActiveSection] = useState<string>('hero');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    if (pathname === '/work') {
      setActiveSection('work');
      return;
    }

    const sectionIds = ['hero', 'about', 'services', 'pricing', 'projects', 'contact'];
    const handleScroll = () => {
      setScrolled(window.scrollY > 24);
      const scrollMarker = window.scrollY + window.innerHeight * 0.34;
      let current = 'hero';
      for (const id of sectionIds) {
        const el = document.getElementById(id);
        if (el && el.offsetTop <= scrollMarker) {
          current = id;
        }
      }
      setActiveSection(current);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [pathname]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const handleNavClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string,
    sectionId: string
  ) => {
    playUiTick();
    setMobileOpen(false);
    if (pathname === '/' && href.startsWith('/#')) {
      e.preventDefault();
      const target = document.getElementById(sectionId);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        window.history.replaceState(null, '', href);
      }
    }
  };

  const navLinkClass = (sectionId: string) => {
    const active = activeSection === sectionId;
    return `relative inline-flex items-center whitespace-nowrap px-2.5 py-1.5 font-condensed text-[13px] font-bold uppercase tracking-[0.22em] transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3B63FF] rounded-md ${
      active ? 'text-white' : 'text-zinc-100 hover:text-amber-300'
    }`;
  };

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-6 sm:pt-4 lg:px-8">
      <nav
        aria-label="Primary Studio Navigation"
        data-glow=""
        className={`mx-auto flex max-w-7xl items-center justify-between rounded-2xl border px-4 py-3 transition-all duration-300 lg:grid lg:grid-cols-[1fr_auto_1fr] lg:px-7 ${
          scrolled
            ? 'border-white/25 bg-[#050918]/90 shadow-[0_16px_44px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.22)] backdrop-blur-2xl backdrop-saturate-150'
            : 'border-white/20 bg-[#060B1D]/80 shadow-[0_12px_34px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.18)] backdrop-blur-2xl backdrop-saturate-150'
        }`}
      >
        {/* LEFT COLUMN: ABOUT (with subtle Studio Home dot) */}
        <div className="flex items-center gap-4">
          <Link
            href="/"
            onClick={() => playUiTick()}
            aria-label="DEV STUDIO Home"
            className="group inline-flex items-center gap-2 rounded-md px-1 py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3B63FF]"
          >
            <span className="h-2.5 w-2.5 rounded-full bg-amber-400 shadow-[0_0_12px_#fbbf24] transition-transform group-hover:scale-125" />
            <span className="whitespace-nowrap font-mono text-[11px] font-bold uppercase tracking-[0.22em] text-white group-hover:text-amber-200">
              DEV STUDIO
            </span>
          </Link>
          <span className="hidden h-3.5 w-px bg-white/25 lg:inline-block" aria-hidden="true" />
          {siteConfigContent.navigation.left.map((item) => (
            <Link
              key={item.sectionId}
              href={item.href}
              onClick={(e) => handleNavClick(e, item.href, item.sectionId)}
              className={`hidden lg:inline-flex ${navLinkClass(item.sectionId)}`}
            >
              {item.label}
              {activeSection === item.sectionId && (
                <span className="absolute inset-x-2.5 -bottom-0.5 h-[2px] rounded-full bg-amber-400 shadow-[0_0_8px_#fbbf24]" />
              )}
            </Link>
          ))}
        </div>

        {/* CENTER COLUMN: SERVICES | PRICE | PROJECTS | WORK ARCHIVE */}
        <div className="hidden items-center justify-center gap-1.5 lg:flex xl:gap-2.5">
          {siteConfigContent.navigation.center.map((item, idx) => (
            <React.Fragment key={item.sectionId}>
              {idx > 0 && (
                <span className="select-none text-[11px] text-white/35" aria-hidden="true">
                  |
                </span>
              )}
              <Link
                href={item.href}
                onClick={(e) => handleNavClick(e, item.href, item.sectionId)}
                className={navLinkClass(item.sectionId)}
              >
                {item.label}
                {activeSection === item.sectionId && (
                  <span className="absolute inset-x-2.5 -bottom-0.5 h-[2px] rounded-full bg-amber-400 shadow-[0_0_8px_#fbbf24]" />
                )}
              </Link>
            </React.Fragment>
          ))}
        </div>

        {/* RIGHT COLUMN: HIGH-CONTRAST CONTACT US CTA + Mobile Quick-Hire & Menu Trigger */}
        <div className="flex items-center justify-end gap-2 sm:gap-2.5">
          <Link
            href="/#contact"
            data-glow-btn=""
            data-cta-gold=""
            onClick={(e) => handleNavClick(e, '/#contact', 'contact')}
            className="btn-cta-gold inline-flex h-9 items-center justify-center rounded-full border px-3.5 font-condensed text-[11px] font-extrabold uppercase tracking-[0.16em] transition active:scale-[0.98] sm:hidden"
          >
            HIRE ME
          </Link>

          {siteConfigContent.navigation.right.map((item) => (
            <LiquidMetalButton
              key={item.sectionId}
              variant="cta"
              label={item.label}
              href={item.href}
              width={142}
              height={40}
              onClick={(e) =>
                handleNavClick(e as React.MouseEvent<HTMLAnchorElement>, item.href, item.sectionId)
              }
              className="hidden sm:inline-block"
            />
          ))}

          <button
            type="button"
            data-glow-btn=""
            aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileOpen}
            aria-controls="mobile-studio-nav"
            onClick={() => {
              playUiTick();
              setMobileOpen((prev) => !prev);
            }}
            className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-white/25 bg-white/10 text-white transition hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3B63FF] lg:hidden"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile & Tablet Touch Drawer */}
      {mobileOpen && (
        <div
          id="mobile-studio-nav"
          className="mx-auto mt-2 max-w-7xl overflow-hidden rounded-2xl border border-white/20 bg-[#050918]/95 p-4 shadow-2xl backdrop-blur-2xl sm:p-6 lg:hidden"
        >
          <div className="grid grid-cols-1 divide-y divide-white/10 sm:grid-cols-2 sm:gap-x-8 sm:divide-y-0">
            {[
              ...siteConfigContent.navigation.left,
              ...siteConfigContent.navigation.center,
              ...siteConfigContent.navigation.right,
            ].map((item) => (
              <Link
                key={item.sectionId}
                href={item.href}
                onClick={(e) => handleNavClick(e, item.href, item.sectionId)}
                className={`flex items-center justify-between border-white/10 py-3.5 font-condensed text-base font-bold uppercase tracking-[0.22em] sm:border-b ${
                  activeSection === item.sectionId ? 'text-amber-300' : 'text-white'
                }`}
              >
                <span>{item.label}</span>
                <span className="font-mono text-xs text-amber-300">→</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
