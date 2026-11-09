'use client';

import React, { useState } from 'react';

export interface ClientBrandLogo {
  id: string;
  name: string;
  renderLogo: () => React.ReactNode;
}

const ROW_1_BRANDS: ClientBrandLogo[] = [
  {
    id: 'chaayos',
    name: 'Chaayos',
    renderLogo: () => (
      <div className="flex items-center gap-2.5">
        <svg viewBox="0 0 32 32" fill="none" aria-hidden="true" className="h-7 w-7 shrink-0 sm:h-8 sm:w-8">
          <path
            d="M8 13.5h13.5l-1.6 11.2a3 3 0 0 1-2.97 2.55h-4.36a3 3 0 0 1-2.97-2.55L8 13.5Z"
            stroke="currentColor"
            strokeWidth="1.9"
            strokeLinejoin="round"
          />
          <path
            d="M21.2 15.5h2.3a2.75 2.75 0 0 1 0 5.5h-2.9"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <path
            d="M12.2 9.5c0-1.6 1.5-2.2 1.5-3.8M16.8 9.8c0-1.8 1.7-2.5 1.7-4.3"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
          />
        </svg>
        <span className="font-sans text-lg font-extrabold tracking-[-0.03em] sm:text-[21px]">
          Chaayos
        </span>
      </div>
    ),
  },
  {
    id: 'mahanagar-times',
    name: 'Mahanagar Times',
    renderLogo: () => (
      <div className="flex items-center gap-2.5">
        <svg viewBox="0 0 32 32" fill="none" aria-hidden="true" className="h-7 w-7 shrink-0 sm:h-8 sm:w-8">
          <rect x="4.5" y="6" width="23" height="20" rx="2.5" stroke="currentColor" strokeWidth="1.8" />
          <path d="M8.5 11h15M8.5 15.5h9M8.5 19.5h9M20.5 15.5h3v5h-3z" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        </svg>
        <div className="flex flex-col leading-none">
          <span className="font-serif text-xl tracking-[0.03em] sm:text-[23px]">
            Mahanagar Times
          </span>
          <span className="mt-0.5 font-mono text-[8px] uppercase tracking-[0.26em] opacity-65">
            BROADCAST &amp; PRINT
          </span>
        </div>
      </div>
    ),
  },
  {
    id: 'amity-university',
    name: 'Amity University',
    renderLogo: () => (
      <div className="flex items-center gap-2.5">
        <svg viewBox="0 0 32 32" fill="none" aria-hidden="true" className="h-7 w-7 shrink-0 sm:h-8 sm:w-8">
          <path
            d="M6.5 6.5h19v10.2c0 5.8-4.2 9.5-9.5 11.3-5.3-1.8-9.5-5.5-9.5-11.3V6.5Z"
            stroke="currentColor"
            strokeWidth="1.85"
            strokeLinejoin="round"
          />
          <path d="M10 11.5l12 8M10 16.5l8.5 5.6M13.5 9.5l8.5 5.6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
        <div className="flex flex-col leading-none">
          <span className="font-condensed text-base font-bold uppercase tracking-[0.16em] sm:text-lg">
            AMITY
          </span>
          <span className="mt-0.5 font-mono text-[8.5px] uppercase tracking-[0.24em] opacity-70">
            UNIVERSITY
          </span>
        </div>
      </div>
    ),
  },
  {
    id: 'alice-blue',
    name: 'Alice Blue',
    renderLogo: () => (
      <div className="flex items-center gap-2.5">
        <svg viewBox="0 0 32 32" fill="none" aria-hidden="true" className="h-7 w-7 shrink-0 sm:h-8 sm:w-8">
          <path
            d="M16 5.5L26.5 24.5H19.8L16 17.2L12.2 24.5H5.5L16 5.5Z"
            stroke="currentColor"
            strokeWidth="1.85"
            strokeLinejoin="round"
          />
          <circle cx="16" cy="23.5" r="2" fill="currentColor" />
        </svg>
        <span className="font-display text-base font-extrabold uppercase tracking-[0.08em] sm:text-lg">
          ALICE BLUE
        </span>
      </div>
    ),
  },
  {
    id: 'livanto',
    name: 'Livanto Green Infra',
    renderLogo: () => (
      <div className="flex items-center gap-2.5">
        <svg viewBox="0 0 32 32" fill="none" aria-hidden="true" className="h-7 w-7 shrink-0 sm:h-8 sm:w-8">
          <path d="M7.5 25.5V9.5l6.5-3v19M18 25.5V13.5l6.5-2.5v14.5" stroke="currentColor" strokeWidth="1.85" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M5.5 25.5h21" stroke="currentColor" strokeWidth="1.85" strokeLinecap="round" />
        </svg>
        <div className="flex flex-col leading-none">
          <span className="font-display text-base font-extrabold uppercase tracking-[0.1em] sm:text-lg">
            LIVANTO
          </span>
          <span className="mt-0.5 font-mono text-[8px] uppercase tracking-[0.24em] opacity-65">
            GREEN INFRA
          </span>
        </div>
      </div>
    ),
  },
  {
    id: 'jp-vijayaa-foods',
    name: 'JP Vijayaa Foods',
    renderLogo: () => (
      <div className="flex items-center gap-2.5">
        <svg viewBox="0 0 32 32" fill="none" aria-hidden="true" className="h-7 w-7 shrink-0 sm:h-8 sm:w-8">
          <circle cx="16" cy="16" r="10.5" stroke="currentColor" strokeWidth="1.75" />
          <path
            d="M16 9.5c2.6 2.5 3.6 5.4 0 9.5-3.6-4.1-2.6-7 0-9.5Z"
            stroke="currentColor"
            strokeWidth="1.65"
            strokeLinejoin="round"
          />
          <path d="M11 21.2c3.2-1.2 6.8-1.2 10 0" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" />
        </svg>
        <div className="flex flex-col leading-none">
          <span className="font-serif text-lg tracking-[0.05em] sm:text-xl">
            JP Vijayaa
          </span>
          <span className="mt-0.5 font-mono text-[8px] uppercase tracking-[0.28em] opacity-65">
            FOODS
          </span>
        </div>
      </div>
    ),
  },
  {
    id: 'taash',
    name: 'Taash Indian Restaurant & Bar',
    renderLogo: () => (
      <div className="flex items-center gap-2.5">
        <svg viewBox="0 0 32 32" fill="none" aria-hidden="true" className="h-7 w-7 shrink-0 sm:h-8 sm:w-8">
          <path
            d="M16 5.5L25.5 16L16 26.5L6.5 16L16 5.5Z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
          <path d="M16 11.5L20.5 16L16 20.5L11.5 16L16 11.5Z" fill="currentColor" fillOpacity="0.8" />
        </svg>
        <div className="flex flex-col leading-none">
          <span className="font-serif text-xl tracking-[0.14em] sm:text-[22px]">
            TAASH
          </span>
          <span className="mt-0.5 font-mono text-[7.5px] uppercase tracking-[0.22em] opacity-65">
            KITCHEN &amp; BAR
          </span>
        </div>
      </div>
    ),
  },
  {
    id: 'malingo',
    name: 'Malingo',
    renderLogo: () => (
      <div className="flex items-center gap-2.5">
        <svg viewBox="0 0 32 32" fill="none" aria-hidden="true" className="h-7 w-7 shrink-0 sm:h-8 sm:w-8">
          <circle cx="14.5" cy="16" r="8.5" stroke="currentColor" strokeWidth="1.85" />
          <circle cx="19.5" cy="13.5" r="5.5" stroke="currentColor" strokeWidth="1.65" />
          <circle cx="24" cy="8.5" r="1.6" fill="currentColor" />
        </svg>
        <span className="font-sans text-xl font-extrabold tracking-[-0.04em] sm:text-[22px]">
          malingo
        </span>
      </div>
    ),
  },
  {
    id: 'sign-o',
    name: 'Sign O',
    renderLogo: () => (
      <div className="flex items-center gap-2.5">
        <svg viewBox="0 0 32 32" fill="none" aria-hidden="true" className="h-7 w-7 shrink-0 sm:h-8 sm:w-8">
          <circle cx="16" cy="16" r="10" stroke="currentColor" strokeWidth="2.1" />
          <circle cx="16" cy="16" r="4.2" stroke="currentColor" strokeWidth="1.8" />
        </svg>
        <span className="font-condensed text-lg font-bold uppercase tracking-[0.22em] sm:text-xl">
          SIGN O
        </span>
      </div>
    ),
  },
  {
    id: 'jdh-immigration',
    name: 'JDH Immigration Consultancy',
    renderLogo: () => (
      <div className="flex items-center gap-2.5">
        <svg viewBox="0 0 32 32" fill="none" aria-hidden="true" className="h-7 w-7 shrink-0 sm:h-8 sm:w-8">
          <circle cx="16" cy="16" r="10" stroke="currentColor" strokeWidth="1.75" />
          <ellipse cx="16" cy="16" rx="4.6" ry="10" stroke="currentColor" strokeWidth="1.5" />
          <path d="M6.5 16h19" stroke="currentColor" strokeWidth="1.5" />
        </svg>
        <div className="flex flex-col leading-none">
          <span className="font-display text-base font-extrabold uppercase tracking-[0.1em] sm:text-lg">
            JDH
          </span>
          <span className="mt-0.5 font-mono text-[8px] uppercase tracking-[0.22em] opacity-65">
            IMMIGRATION
          </span>
        </div>
      </div>
    ),
  },
];

const ROW_2_BRANDS: ClientBrandLogo[] = [
  {
    id: 'drdermx',
    name: 'DrDermX',
    renderLogo: () => (
      <div className="flex items-center gap-2.5">
        <svg viewBox="0 0 32 32" fill="none" aria-hidden="true" className="h-7 w-7 shrink-0 sm:h-8 sm:w-8">
          <path
            d="M16 5L25.5 10.5V21.5L16 27L6.5 21.5V10.5L16 5Z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
          <path d="M16 11.5v9M11.5 16h9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
        <span className="font-sans text-lg font-bold tracking-[-0.02em] sm:text-xl">
          DrDerm<span className="font-extrabold">X</span>
        </span>
      </div>
    ),
  },
  {
    id: 'ratnaya-organics',
    name: 'Ratnaya Organics',
    renderLogo: () => (
      <div className="flex items-center gap-2.5">
        <svg viewBox="0 0 32 32" fill="none" aria-hidden="true" className="h-7 w-7 shrink-0 sm:h-8 sm:w-8">
          <path
            d="M16 6.5c4.5 4.2 6.8 8.4 6.8 12.2a6.8 6.8 0 1 1-13.6 0c0-3.8 2.3-8 6.8-12.2Z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
          <path d="M16 13v10.5M16 18.5l3.2-2.6M16 20.5l-3-2.4" stroke="currentColor" strokeWidth="1.55" strokeLinecap="round" />
        </svg>
        <div className="flex flex-col leading-none">
          <span className="font-serif text-lg tracking-[0.06em] sm:text-xl">
            Ratnaya
          </span>
          <span className="mt-0.5 font-mono text-[8px] uppercase tracking-[0.26em] opacity-65">
            ORGANICS
          </span>
        </div>
      </div>
    ),
  },
  {
    id: 'pure-plus',
    name: 'Pure+',
    renderLogo: () => (
      <div className="flex items-center gap-2">
        <svg viewBox="0 0 32 32" fill="none" aria-hidden="true" className="h-7 w-7 shrink-0 sm:h-8 sm:w-8">
          <rect x="6" y="6" width="20" height="20" rx="6" stroke="currentColor" strokeWidth="1.85" />
          <path d="M16 11.5v9M11.5 16h9" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" />
        </svg>
        <span className="font-display text-lg font-extrabold uppercase tracking-[0.1em] sm:text-xl">
          PURE+
        </span>
      </div>
    ),
  },
  {
    id: 'assist-myday',
    name: 'Assist MyDay',
    renderLogo: () => (
      <div className="flex items-center gap-2.5">
        <svg viewBox="0 0 32 32" fill="none" aria-hidden="true" className="h-7 w-7 shrink-0 sm:h-8 sm:w-8">
          <circle cx="16" cy="16" r="10" stroke="currentColor" strokeWidth="1.8" />
          <path d="M11.8 16.4l2.9 2.9 6-6.2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span className="font-sans text-base font-bold tracking-[-0.02em] sm:text-lg">
          Assist <span className="font-extrabold">MyDay</span>
        </span>
      </div>
    ),
  },
  {
    id: 'sufiwood',
    name: 'Sufiwood',
    renderLogo: () => (
      <div className="flex items-center gap-2.5">
        <svg viewBox="0 0 32 32" fill="none" aria-hidden="true" className="h-7 w-7 shrink-0 sm:h-8 sm:w-8">
          <rect x="6" y="6" width="20" height="20" rx="2" stroke="currentColor" strokeWidth="1.8" />
          <rect x="10.5" y="10.5" width="11" height="11" rx="1" stroke="currentColor" strokeWidth="1.6" />
          <path d="M16 6v4.5M16 21.5V26" stroke="currentColor" strokeWidth="1.6" />
        </svg>
        <span className="font-condensed text-lg font-semibold uppercase tracking-[0.24em] sm:text-xl">
          SUFIWOOD
        </span>
      </div>
    ),
  },
  {
    id: 'unova-socks',
    name: 'Unova Socks',
    renderLogo: () => (
      <div className="flex items-center gap-2.5">
        <svg viewBox="0 0 32 32" fill="none" aria-hidden="true" className="h-7 w-7 shrink-0 sm:h-8 sm:w-8">
          <path
            d="M9.5 7.5v9.5a6.5 6.5 0 0 0 13 0V7.5"
            stroke="currentColor"
            strokeWidth="2.1"
            strokeLinecap="round"
          />
          <path d="M13 11.5l3 3 3-3" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <div className="flex flex-col leading-none">
          <span className="font-display text-base font-extrabold uppercase tracking-[0.12em] sm:text-lg">
            UNOVA
          </span>
          <span className="mt-0.5 font-mono text-[8px] uppercase tracking-[0.28em] opacity-65">
            SOCKS
          </span>
        </div>
      </div>
    ),
  },
  {
    id: 'privintal-green',
    name: 'Privintal Green',
    renderLogo: () => (
      <div className="flex items-center gap-2.5">
        <svg viewBox="0 0 32 32" fill="none" aria-hidden="true" className="h-7 w-7 shrink-0 sm:h-8 sm:w-8">
          <path
            d="M16 5.5l9.5 5.5v10L16 26.5 6.5 21V11L16 5.5Z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
          <path d="M11.5 19.5c1.5-4.5 4.5-6.8 9-7.5-.7 4.5-3 7.5-7.5 9" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <div className="flex flex-col leading-none">
          <span className="font-condensed text-base font-bold uppercase tracking-[0.16em] sm:text-lg">
            PRIVINTAL
          </span>
          <span className="mt-0.5 font-mono text-[8px] uppercase tracking-[0.26em] opacity-65">
            GREEN
          </span>
        </div>
      </div>
    ),
  },
  {
    id: 'krishaz',
    name: 'Krishaz',
    renderLogo: () => (
      <div className="flex items-center gap-2.5">
        <svg viewBox="0 0 32 32" fill="none" aria-hidden="true" className="h-7 w-7 shrink-0 sm:h-8 sm:w-8">
          <path d="M6.5 21.5L9 11l7 5.5L23 11l2.5 10.5H6.5Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
          <path d="M8 24.5h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
        <span className="font-serif text-xl uppercase tracking-[0.14em] sm:text-[22px]">
          KRISHAZ
        </span>
      </div>
    ),
  },
  {
    id: 'savji-pro',
    name: 'Savji Pro',
    renderLogo: () => (
      <div className="flex items-center gap-2.5">
        <svg viewBox="0 0 32 32" fill="none" aria-hidden="true" className="h-7 w-7 shrink-0 sm:h-8 sm:w-8">
          <rect x="5.5" y="5.5" width="21" height="21" rx="5" stroke="currentColor" strokeWidth="1.8" />
          <path d="M19.5 11.5h-5.2a2.3 2.3 0 0 0 0 4.6h3.4a2.3 2.3 0 0 1 0 4.6h-5.2" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
        </svg>
        <div className="flex items-center gap-1.5">
          <span className="font-display text-base font-extrabold uppercase tracking-[0.08em] sm:text-lg">
            SAVJI
          </span>
          <span className="rounded border border-current/35 px-1.5 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-[0.14em]">
            PRO
          </span>
        </div>
      </div>
    ),
  },
  {
    id: 'iwsm',
    name: 'IWSM',
    renderLogo: () => (
      <div className="flex items-center gap-2.5">
        <svg viewBox="0 0 32 32" fill="none" aria-hidden="true" className="h-7 w-7 shrink-0 sm:h-8 sm:w-8">
          <circle cx="16" cy="16" r="10" stroke="currentColor" strokeWidth="1.75" />
          <path d="M11 11.5v9M16 9.5v13M21 11.5v9" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
        </svg>
        <span className="font-condensed text-xl font-bold uppercase tracking-[0.26em] sm:text-[22px]">
          IWSM
        </span>
      </div>
    ),
  },
];

function BrandLogoLockup({ brand }: { brand: ClientBrandLogo }) {
  return (
    <div
      data-testid="brand-logo-item"
      aria-label={brand.name}
      className="group/logo flex shrink-0 select-none items-center gap-10 text-zinc-100/95 transition-colors duration-300 hover:text-amber-200 sm:gap-14"
    >
      <div className="transition-transform duration-300 group-hover/logo:scale-[1.04]">
        {brand.renderLogo()}
      </div>
      <span
        aria-hidden="true"
        className="h-1.5 w-1.5 shrink-0 rounded-full bg-amber-300/40"
      />
    </div>
  );
}

export function PortfolioMarquee() {
  const [pausedRow1, setPausedRow1] = useState(false);
  const [pausedRow2, setPausedRow2] = useState(false);

  // Duplicate each track 2x so -50% <-> 0% loops seamlessly with zero jump
  const track1 = [...ROW_1_BRANDS, ...ROW_1_BRANDS];
  const track2 = [...ROW_2_BRANDS, ...ROW_2_BRANDS];

  return (
    <section
      aria-label="Brands and Organizations Worked With"
      data-testid="portfolio-marquee-section"
      className="relative overflow-hidden border-y border-white/15 bg-[#060B1D]/65 py-phi-3 backdrop-blur-xl"
    >
      <div className="mx-auto mb-phi-2 flex max-w-7xl items-center justify-between px-4 sm:px-8">
        <div className="flex items-center gap-3">
          <span className="h-2 w-2 rounded-full bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.9)]" />
          <span className="font-mono text-phi-xs font-bold uppercase text-white">
            BRANDS &amp; ORGANIZATIONS I&apos;VE WORKED WITH
          </span>
        </div>
        <span className="hidden font-mono text-phi-xs font-semibold uppercase text-amber-300 sm:inline">
          20+ VERIFIED CLIENTS · INDIA &amp; GLOBAL
        </span>
      </div>

      <div className="space-y-6 [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)] [-webkit-mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
        {/* Row 1: Left -> Right continuous brand logo marquee */}
        <div
          data-testid="marquee-row-ltr"
          onMouseEnter={() => setPausedRow1(true)}
          onMouseLeave={() => setPausedRow1(false)}
          className="flex overflow-hidden py-1"
        >
          <div
            style={{ animationPlayState: pausedRow1 ? 'paused' : 'running' }}
            className="flex w-max animate-marquee-ltr items-center gap-10 pr-10 motion-reduce:animate-none sm:gap-14 sm:pr-14"
          >
            {track1.map((brand, idx) => (
              <BrandLogoLockup key={`r1-${brand.id}-${idx}`} brand={brand} />
            ))}
          </div>
        </div>

        {/* Row 2: Right -> Left continuous brand logo marquee */}
        <div
          data-testid="marquee-row-rtl"
          onMouseEnter={() => setPausedRow2(true)}
          onMouseLeave={() => setPausedRow2(false)}
          className="flex overflow-hidden py-1"
        >
          <div
            style={{ animationPlayState: pausedRow2 ? 'paused' : 'running' }}
            className="flex w-max animate-marquee-rtl items-center gap-10 pr-10 motion-reduce:animate-none sm:gap-14 sm:pr-14"
          >
            {track2.map((brand, idx) => (
              <BrandLogoLockup key={`r2-${brand.id}-${idx}`} brand={brand} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
