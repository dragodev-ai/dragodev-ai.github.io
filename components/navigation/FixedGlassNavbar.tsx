'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { siteConfigContent } from '@/lib/content';
import { useStudioExperience } from '@/lib/audio/studio-audio-context';

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
    return `relative inline-flex items-center whitespace-nowrap px-2.5 py-1.5 font-condensed text-[13px] font-semibold uppercase tracking-[0.22em] transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 rounded-md ${
      active ? 'text-white' : 'text-zinc-300/85 hover:text-white'
    }`;
  };

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-6 sm:pt-4 lg:px-8">
      <nav
        aria-label="Primary Studio Navigation"
        className={`mx-auto flex max-w-7xl items-center justify-between rounded-2xl border px-4 py-3 transition-all duration-300 lg:grid lg:grid-cols-[1fr_auto_1fr] lg:px-7 ${
          scrolled
            ? 'border-white/15 bg-[#070709]/95 shadow-[0_12px_40px_rgba(0,0,0,0.65)] backdrop-blur-xl'
            : 'border-white/15 bg-[#070709]/90 backdrop-blur-xl'
        }`}
      >
        {/* LEFT COLUMN: ABOUT (with subtle Studio Home dot) */}
        <div className="flex items-center gap-4">
          <Link
            href="/"
            onClick={() => playUiTick()}
            aria-label="DEV STUDIO Home"
            className="group inline-flex items-center gap-2 rounded-md px-1 py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500"
          >
            <span className="h-2 w-2 rounded-full bg-amber-400 shadow-[0_0_10px_#f59e0b] transition-transform group-hover:scale-125" />
            <span className="whitespace-nowrap font-mono text-[11px] font-semibold uppercase tracking-[0.22em] text-zinc-300 group-hover:text-white">
              DEV STUDIO
            </span>
          </Link>
          <span className="hidden h-3.5 w-px bg-white/15 lg:inline-block" aria-hidden="true" />
          {siteConfigContent.navigation.left.map((item) => (
            <Link
              key={item.sectionId}
              href={item.href}
              onClick={(e) => handleNavClick(e, item.href, item.sectionId)}
              className={`hidden lg:inline-flex ${navLinkClass(item.sectionId)}`}
            >
              {item.label}
              {activeSection === item.sectionId && (
                <span className="absolute inset-x-2.5 -bottom-0.5 h-[2px] rounded-full bg-purple-400" />
              )}
            </Link>
          ))}
        </div>

        {/* CENTER COLUMN: SERVICES | PRICE | PROJECTS | WORK ARCHIVE */}
        <div className="hidden items-center justify-center gap-1.5 lg:flex xl:gap-2.5">
          {siteConfigContent.navigation.center.map((item, idx) => (
            <React.Fragment key={item.sectionId}>
              {idx > 0 && (
                <span className="select-none text-[11px] text-white/20" aria-hidden="true">
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
                  <span className="absolute inset-x-2.5 -bottom-0.5 h-[2px] rounded-full bg-purple-400" />
                )}
              </Link>
            </React.Fragment>
          ))}
        </div>

        {/* RIGHT COLUMN: CONTACT + Mobile/Tablet Menu Trigger */}
        <div className="flex items-center justify-end gap-2.5">
          {siteConfigContent.navigation.right.map((item) => (
            <Link
              key={item.sectionId}
              href={item.href}
              onClick={(e) => handleNavClick(e, item.href, item.sectionId)}
              className={`hidden whitespace-nowrap sm:inline-flex items-center rounded-full border px-4 py-1.5 font-condensed text-[13px] font-semibold uppercase tracking-[0.22em] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 ${
                activeSection === item.sectionId
                  ? 'border-purple-400/70 bg-purple-600/25 text-white'
                  : 'border-white/15 bg-white/[0.04] text-zinc-200 hover:border-purple-400/50 hover:bg-purple-500/15 hover:text-white'
              }`}
            >
              {item.label}
            </Link>
          ))}

          <button
            type="button"
            aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileOpen}
            aria-controls="mobile-studio-nav"
            onClick={() => {
              playUiTick();
              setMobileOpen((prev) => !prev);
            }}
            className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-white/15 bg-white/5 text-zinc-100 transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 lg:hidden"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile & Tablet Touch Drawer */}
      {mobileOpen && (
        <div
          id="mobile-studio-nav"
          className="mx-auto mt-2 max-w-7xl overflow-hidden rounded-2xl border border-white/15 bg-[#0a0a0f]/95 p-4 shadow-2xl backdrop-blur-2xl sm:p-6 lg:hidden"
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
                className={`flex items-center justify-between border-white/10 py-3.5 font-condensed text-base font-semibold uppercase tracking-[0.22em] sm:border-b ${
                  activeSection === item.sectionId ? 'text-purple-400' : 'text-zinc-100'
                }`}
              >
                <span>{item.label}</span>
                <span className="font-mono text-xs text-zinc-500">→</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
