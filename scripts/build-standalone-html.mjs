import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

const profile = JSON.parse(fs.readFileSync(path.join(rootDir, 'content/profile.json'), 'utf8'));
const services = JSON.parse(fs.readFileSync(path.join(rootDir, 'content/services.json'), 'utf8'));
const pricing = JSON.parse(fs.readFileSync(path.join(rootDir, 'content/pricing.json'), 'utf8'));
const socialLinks = JSON.parse(fs.readFileSync(path.join(rootDir, 'content/social-links.json'), 'utf8'));
const projectsManifest = JSON.parse(fs.readFileSync(path.join(rootDir, 'content/projects.json'), 'utf8'));
const portraitBase64 = fs.readFileSync(path.join(rootDir, 'public/assets/dev-studio-portrait.jpg')).toString('base64');

const publicProjects = projectsManifest.projects.filter((p) => p.visibility !== 'hidden');

const embeddedData = {
  profile,
  services,
  pricing,
  socialLinks,
  categories: projectsManifest.categories,
  rootFolderUrl: projectsManifest.rootFolderUrl,
  projects: publicProjects.map((p) => ({
    id: p.id,
    fileId: p.fileId,
    title: p.title,
    category: p.category,
    subcategory: p.subcategory || '',
    serviceTag: p.serviceTag,
    mediaType: p.mediaType,
    year: p.year || '',
    description: p.description || '',
    verifiedLabel: p.verifiedLabel || p.category,
    featured: Boolean(p.featured),
    inMarquee: Boolean(p.inMarquee),
    previewUrl: p.previewUrl,
    driveUrl: p.driveUrl,
  })),
};

const html = `<!DOCTYPE html>
<html lang="en" class="dark scroll-smooth">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${profile.name} — ${profile.studioName} | Creative Portfolio</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=JetBrains+Mono:wght@400;500;600&family=Plus+Jakarta+Sans:wght@400;500;600;700&family=Syne:wght@600;700;800&display=swap" rel="stylesheet" />
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      theme: {
        extend: {
          fontFamily: {
            display: ['Syne', 'sans-serif'],
            serif: ['Instrument Serif', 'serif'],
            sans: ['Plus Jakarta Sans', 'sans-serif'],
            mono: ['JetBrains Mono', 'monospace'],
          }
        }
      }
    };
  </script>
  <style>
    html, body {
      background: #070709;
      color: #F4F3EF;
      overflow-x: clip;
      max-width: 100vw;
      font-family: 'Plus Jakarta Sans', sans-serif;
    }
    @keyframes marqueeRtl {
      0% { transform: translate3d(0, 0, 0); }
      100% { transform: translate3d(-50%, 0, 0); }
    }
    @keyframes marqueeLtr {
      0% { transform: translate3d(-50%, 0, 0); }
      100% { transform: translate3d(0, 0, 0); }
    }
    .animate-marquee-rtl { animation: marqueeRtl 46s linear infinite; }
    .animate-marquee-ltr { animation: marqueeLtr 50s linear infinite; }
    .marquee-track:hover .animate-marquee-rtl,
    .marquee-track:hover .animate-marquee-ltr {
      animation-play-state: paused;
    }
    @media (prefers-reduced-motion: reduce) {
      .animate-marquee-rtl, .animate-marquee-ltr { animation: none !important; }
    }
    [data-glow] {
      --gx: 50%;
      --gy: 50%;
      --glow-alpha: 0;
      background-image: radial-gradient(250px 250px at var(--gx) var(--gy), rgba(59, 99, 255, calc(0.11 * var(--glow-alpha, 0))), transparent 76%);
    }
    [data-glow]:not(.fixed):not(.absolute):not(.sticky) { position: relative; }
    [data-glow]::before, [data-glow]::after {
      pointer-events: none;
      content: '';
      position: absolute;
      inset: 0;
      border-radius: inherit;
      padding: 1.5px;
      background-origin: border-box;
      -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
      -webkit-mask-composite: xor;
      mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
      mask-composite: exclude;
      opacity: var(--glow-alpha, 0);
      transition: opacity 180ms ease;
      z-index: 2;
    }
    [data-glow]::before {
      background-image: radial-gradient(220px 220px at var(--gx) var(--gy), rgba(59, 99, 255, 0.95), rgba(96, 165, 250, 0.45) 45%, transparent 100%);
    }
    [data-glow]::after {
      background-image: radial-gradient(110px 110px at var(--gx) var(--gy), rgba(239, 246, 255, 0.95), rgba(59, 99, 255, 0.55) 50%, transparent 100%);
    }
    @property --liquid-angle {
      syntax: '<angle>';
      initial-value: 0deg;
      inherits: false;
    }
    @keyframes liquid-metal-spin {
      to { --liquid-angle: 360deg; }
    }
    @keyframes ripple-animation {
      0% { transform: translate(-50%, -50%) scale(0); opacity: 0.65; }
      100% { transform: translate(-50%, -50%) scale(4.2); opacity: 0; }
    }
    [data-glow-btn] {
      --gx: 50%;
      --gy: 50%;
      --glow-alpha: 0;
      transition: transform 420ms cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 220ms ease, border-color 220ms ease, background-color 220ms ease, color 220ms ease;
    }
    [data-glow-btn]:not(.fixed):not(.absolute):not(.sticky) { position: relative; }
    [data-glow-btn]:active { transform: translateY(1px) scale(0.98) !important; }
    [data-glow-btn]::before, [data-glow-btn]::after {
      pointer-events: none;
      content: '';
      position: absolute;
      inset: 0;
      border-radius: inherit;
      padding: 2px;
      background-origin: border-box;
      -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
      -webkit-mask-composite: xor;
      mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
      mask-composite: exclude;
      transition: opacity 180ms ease, filter 220ms ease;
      z-index: 3;
    }
    [data-glow-btn]::before {
      background-image: conic-gradient(from var(--liquid-angle), rgba(248, 250, 252, 0.96) 0deg, rgba(124, 155, 255, 0.92) 52deg, rgba(15, 23, 42, 0.35) 115deg, rgba(59, 99, 255, 0.95) 178deg, rgba(239, 246, 255, 0.98) 224deg, rgba(30, 41, 59, 0.38) 292deg, rgba(147, 197, 253, 0.92) 334deg, rgba(248, 250, 252, 0.96) 360deg);
      opacity: calc(0.56 + 0.44 * var(--glow-alpha, 0));
      animation: liquid-metal-spin 5.4s linear infinite;
    }
    [data-glow-btn]::after {
      background-image: radial-gradient(96px 96px at var(--gx) var(--gy), rgba(255, 255, 255, 1) 0%, rgba(124, 155, 255, 0.98) 38%, rgba(59, 99, 255, 0.62) 68%, transparent 100%);
      opacity: var(--glow-alpha, 0);
    }
    [data-glow-btn]:hover, [data-glow-btn]:focus-visible {
      border-color: rgba(147, 197, 253, 0.78) !important;
      box-shadow: 0 0 26px -3px rgba(59, 99, 255, 0.72), 0 0 12px rgba(226, 232, 240, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.22);
    }
    [data-glow-btn]:hover::before, [data-glow-btn]:focus-visible::before {
      opacity: 1;
      filter: brightness(1.18) contrast(1.08);
      animation-duration: 1.85s;
    }
    [data-glow-btn][data-liquid-surge="true"]::before {
      opacity: 1;
      filter: brightness(1.32);
      animation-duration: 0.65s;
    }
    [data-glow-btn]:hover::after, [data-glow-btn]:focus-visible::after {
      opacity: 1;
    }
    .liquid-btn-ripple-host {
      pointer-events: none;
      position: absolute;
      inset: 0;
      border-radius: inherit;
      overflow: hidden;
      z-index: 4;
    }
    .liquid-btn-ripple {
      pointer-events: none;
      position: absolute;
      width: 24px;
      height: 24px;
      border-radius: 9999px;
      background: radial-gradient(circle, rgba(255, 255, 255, 0.58) 0%, rgba(124, 155, 255, 0.36) 42%, rgba(59, 99, 255, 0) 72%);
      animation: ripple-animation 0.6s ease-out forwards;
    }
  </style>
</head>
<body class="bg-[#070709] text-[#F4F3EF] antialiased selection:bg-[#3B63FF] selection:text-white">

  <!-- Top Live Server Bridge Ribbon -->
  <div class="relative z-[60] border-b border-white/10 bg-[#090B14] px-4 py-2 text-xs text-zinc-300">
    <div class="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2">
      <div class="flex items-center gap-2 font-mono">
        <span id="server-dot" class="inline-block h-2 w-2 rounded-full bg-amber-400"></span>
        <span id="server-status-text">Checking localhost:3000...</span>
      </div>
      <div class="flex flex-wrap items-center gap-2">
        <a href="http://localhost:3000" target="_blank" rel="noopener" class="rounded-full border border-[#3B63FF]/50 bg-[#3B63FF]/20 px-3 py-1 font-mono text-[11px] uppercase tracking-wider text-blue-200 transition hover:bg-[#3B63FF] hover:text-white">
          Open Live Next.js App (localhost:3000) ↗
        </a>
        <a href="http://localhost:3000/work" target="_blank" rel="noopener" class="rounded-full border border-white/15 bg-white/5 px-3 py-1 font-mono text-[11px] uppercase tracking-wider text-zinc-200 transition hover:border-white/35 hover:bg-white/10">
          Full /work Archive ↗
        </a>
      </div>
    </div>
  </div>

  <!-- Fixed 3-Column Glass Navbar -->
  <header class="sticky top-3 z-50 mx-auto mt-3 max-w-7xl px-4 sm:px-6 lg:px-8">
    <nav data-glow="" class="flex items-center justify-between rounded-2xl border border-white/15 bg-[#070709]/95 px-5 py-3 shadow-[0_16px_48px_rgba(0,0,0,0.65)] backdrop-blur-xl lg:grid lg:grid-cols-[1fr_auto_1fr]">
      <div class="flex items-center gap-4">
        <a href="#hero" class="whitespace-nowrap font-display text-sm font-bold tracking-[0.18em] text-white">DEV STUDIO</a>
        <a href="#about" class="hidden whitespace-nowrap font-mono text-xs uppercase tracking-[0.2em] text-zinc-300 transition hover:text-white lg:inline-block">ABOUT</a>
      </div>
      <div class="hidden items-center justify-center gap-5 font-mono text-xs uppercase tracking-[0.18em] text-zinc-300 lg:flex">
        <a href="#services" class="whitespace-nowrap transition hover:text-white">SERVICES</a>
        <a href="#pricing" class="whitespace-nowrap transition hover:text-white">PRICE</a>
        <a href="#projects" class="whitespace-nowrap transition hover:text-white">PROJECTS</a>
        <a href="#archive" class="whitespace-nowrap transition hover:text-white">ARCHIVE</a>
      </div>
      <div class="flex items-center justify-end gap-3">
        <a href="#contact" data-glow-btn="" class="whitespace-nowrap rounded-full border border-[#60A5FA]/50 bg-[#3B63FF] px-4 py-1.5 font-mono text-xs font-semibold uppercase tracking-[0.16em] text-white transition hover:bg-[#4F75FF]">
          CONTACT
        </a>
      </div>
    </nav>
  </header>

  <!-- SHOWCASE VIDEO HERO (DEV_KUMAWAT_SAAS_WEB.mp4) -->
  <section id="hero" class="relative w-full overflow-hidden bg-gradient-to-b from-[#04071A] via-[#060919] to-[#070709] pb-10 pt-6 sm:pb-14 sm:pt-8">
    <h1 class="sr-only">Dev Kumawat — Creative Director, Video Editor, Graphic Designer &amp; AI Creative Specialist</h1>
    <div class="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_42%,rgba(59,99,255,0.20),transparent_70%)]"></div>

    <div class="relative z-10 mx-auto flex w-full max-w-[1440px] flex-col items-center px-3 sm:px-6">
      <div class="mb-3 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-center">
        <span class="rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-amber-300">8+ YEARS · 500+ SHIPPED CUTS</span>
        <p class="text-xs font-medium text-zinc-200 sm:text-sm">Stop losing viewers in 3 seconds — <strong class="text-white">visuals engineered to hold attention &amp; win clients.</strong></p>
      </div>
      <div id="hero-stage" data-glow="" class="relative aspect-video w-full max-w-full overflow-hidden rounded-2xl border border-white/10 bg-[#04071A] shadow-[0_28px_90px_rgba(0,0,0,0.85),0_0_70px_rgba(59,99,255,0.14)] sm:rounded-3xl lg:max-h-[calc(100svh-14rem)] lg:w-auto">
        <video
          id="hero-video"
          src="./public/videos/DEV_KUMAWAT_SAAS_WEB.mp4"
          poster="./public/videos/dev-kumawat-hero-poster.jpg"
          autoplay
          loop
          playsinline
          preload="auto"
          class="h-full w-full cursor-pointer bg-[#04071A] object-contain"
        ></video>
      </div>

      <div data-glow="" class="mt-3 w-full max-w-[1040px] rounded-2xl border border-white/10 bg-[#090C1C]/90 px-4 py-2.5 shadow-2xl backdrop-blur-xl sm:px-5">
        <div class="relative mb-3 flex items-center">
          <div class="pointer-events-none relative h-1.5 w-full overflow-hidden rounded-full bg-white/10">
            <div id="hero-progress-bar" class="h-full w-0 rounded-full bg-gradient-to-r from-[#3B63FF] to-[#7C9BFF]"></div>
          </div>
          <input id="hero-scrubber" type="range" min="0" max="52" step="0.1" value="0" class="absolute inset-0 h-4 w-full cursor-pointer opacity-0" />
        </div>

        <div class="flex flex-wrap items-center justify-between gap-3">
          <div class="flex flex-wrap items-center gap-2">
            <button id="btn-hero-sound" data-glow-btn="" type="button" class="rounded-full border border-emerald-400/40 bg-emerald-500/15 px-4 py-2 font-mono text-xs font-semibold uppercase tracking-wider text-emerald-200 transition hover:bg-emerald-500/25">
              SOUND ON
            </button>
            <button id="btn-hero-play" data-glow-btn="" type="button" class="rounded-full border border-white/15 bg-white/5 px-3.5 py-2 font-mono text-xs uppercase tracking-wider text-zinc-200 transition hover:bg-white/10">
              PAUSE
            </button>
            <button id="btn-hero-restart" data-glow-btn="" type="button" class="rounded-full border border-white/15 bg-white/5 px-3.5 py-2 font-mono text-xs uppercase tracking-wider text-zinc-200 transition hover:bg-white/10">
              REPLAY 0:00
            </button>
            <button id="btn-hero-fullscreen" data-glow-btn="" type="button" class="rounded-full border border-white/15 bg-white/5 px-3.5 py-2 font-mono text-xs uppercase tracking-wider text-zinc-200 transition hover:bg-white/10">
              FULLSCREEN
            </button>
            <span id="hero-timecode" class="ml-1 font-mono text-[11px] tabular-nums text-zinc-400">00:00 / 00:52</span>
          </div>
          <div class="flex flex-wrap items-center gap-2">
            <a href="#archive" data-glow-btn="" class="rounded-full border border-white/15 bg-white/5 px-4 py-2 font-mono text-xs uppercase tracking-wider text-zinc-100 transition hover:border-[#3B63FF]">
              ${publicProjects.length}+ Proofs ↓
            </a>
            <a href="#contact" data-glow-btn="" class="rounded-full border border-[#60A5FA]/50 bg-[#3B63FF] px-4 py-2 font-mono text-xs font-semibold uppercase tracking-wider text-white transition hover:bg-[#4F75FF]">
              Hire Dev
            </a>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- SCROLLING VERIFIED CLIENT BRAND LOGOS MARQUEE -->
  <section class="border-y border-white/10 bg-[#08080c] py-10 overflow-hidden">
    <div class="mx-auto mb-6 flex max-w-7xl items-center justify-between px-5">
      <div class="flex items-center gap-3">
        <span class="inline-block h-2 w-2 rounded-full bg-[#3B63FF] shadow-[0_0_10px_rgba(59,99,255,0.85)]"></span>
        <span class="font-mono text-xs uppercase tracking-[0.22em] text-zinc-300">BRANDS &amp; ORGANIZATIONS I'VE WORKED WITH</span>
      </div>
      <span class="hidden font-mono text-xs uppercase tracking-[0.18em] text-zinc-500 sm:inline">20+ VERIFIED CLIENTS · INDIA &amp; GLOBAL</span>
    </div>
    <div class="marquee-track space-y-6" style="-webkit-mask-image:linear-gradient(to right,transparent,black 10%,black 90%,transparent);mask-image:linear-gradient(to right,transparent,black 10%,black 90%,transparent);">
      <div id="marquee-row-1" class="flex w-max items-center gap-12 animate-marquee-ltr py-1"></div>
      <div id="marquee-row-2" class="flex w-max items-center gap-12 animate-marquee-rtl py-1"></div>
    </div>
  </section>

  <!-- EDITORIAL ABOUT ME SECTION (GOLDEN RATIO 1.618fr : 1fr) -->
  <section id="about" class="mx-auto max-w-7xl px-5 py-24 md:px-8">
    <div class="grid gap-10 lg:grid-cols-[1.618fr_1fr] lg:items-start">
      <div>
        <span class="font-mono text-xs uppercase tracking-[0.24em] text-[#C8A464]">01 · WHY BRANDS &amp; LEADERS HIRE DEV</span>
        <h2 class="mt-3 font-display text-3xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl">
          Viewers decide in 1.7 seconds. <span class="font-serif italic font-normal text-[#C8A464]">I make sure they stay &amp; buy.</span>
        </h2>
        <p class="mt-4 max-w-[50ch] text-base leading-[1.618] text-zinc-300">${profile.bio.paragraphs[0]}</p>

        <div class="mt-7 grid grid-cols-2 gap-4 sm:grid-cols-4">
          ${profile.stats
            .map(
              (s) => `
            <div class="rounded-2xl border border-white/10 bg-[#121216] p-4">
              <div class="font-display text-2xl font-extrabold text-[#C8A464] sm:text-3xl">${s.value}</div>
              <div class="mt-1 font-mono text-[10px] uppercase tracking-wider text-zinc-400">${s.label}</div>
            </div>`
            )
            .join('')}
        </div>

        <div class="mt-7 divide-y divide-white/10 rounded-2xl border border-white/10 bg-[#121216]/85 px-5 py-2">
          ${profile.highlights
            .map(
              (h) => `
            <div class="flex flex-col gap-1 py-3.5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6">
              <div>
                <span class="font-mono text-[10px] uppercase tracking-[0.2em] text-[#C8A464]">${h.number} · ${h.subtitle}</span>
                <h3 class="mt-0.5 font-display text-sm font-bold text-white">${h.title}</h3>
              </div>
              <p class="max-w-[34ch] text-xs leading-[1.618] text-zinc-400 sm:text-right">${h.detail}</p>
            </div>`
            )
            .join('')}
        </div>
      </div>

      <div class="space-y-4">
        <div class="overflow-hidden rounded-3xl border border-white/15 bg-[#121216] shadow-2xl">
          <img id="about-portrait" alt="Dev Kumawat Studio Portrait" class="h-[410px] w-full object-cover object-top" />
          <div class="border-t border-white/10 p-5">
            <p class="font-mono text-xs uppercase tracking-[0.2em] text-[#C8A464]">JAIPUR, RAJASTHAN · WORLDWIDE</p>
            <p class="mt-1 font-display text-xl font-bold text-white">${profile.name}</p>
            <div class="mt-4 flex flex-wrap gap-2.5">
              <a href="./public/assets/Dev-Kumawat-Resume.pdf" target="_blank" rel="noopener" class="rounded-full bg-[#C8A464] px-4 py-2 font-mono text-[11px] font-semibold uppercase tracking-wider text-[#09090B] transition hover:bg-[#e0bf7d]">
                Resume PDF
              </a>
              <a href="${projectsManifest.rootFolderUrl}" target="_blank" rel="noopener" class="rounded-full border border-white/20 px-4 py-2 font-mono text-[11px] uppercase tracking-wider text-zinc-200 transition hover:border-white/40">
                ${publicProjects.length}+ Drive Proofs ↗
              </a>
            </div>
          </div>
        </div>

        <div class="rounded-2xl border border-white/10 bg-[#121216]/75 p-4 text-xs text-zinc-300">
          <span class="font-mono uppercase tracking-wider text-[#C8A464]">Credential:</span>
          <strong class="ml-1 text-white">${profile.education.degree}</strong> — ${profile.education.institution} (${profile.education.period})
        </div>
      </div>
    </div>
  </section>

  <!-- HIGH-CONTRAST ROUNDED WHITE SERVICES SHEET -->
  <section id="services" class="mx-auto max-w-[96rem] px-3 py-6 sm:px-6">
    <div class="rounded-[2.25rem] bg-[#F7F6F2] px-5 py-16 text-[#09090B] shadow-2xl sm:px-10 md:py-24">
      <div class="mx-auto max-w-6xl">
        <div class="flex flex-col justify-between gap-4 border-b border-black/15 pb-8 md:flex-row md:items-end">
          <div>
            <span class="font-mono text-xs uppercase tracking-[0.24em] text-zinc-600">CAPABILITIES &amp; CRAFT</span>
            <h2 class="mt-2 font-display text-4xl font-extrabold tracking-tight text-[#09090B] sm:text-6xl">${services.headline}</h2>
          </div>
          <p class="max-w-md text-sm leading-relaxed text-zinc-700">${services.subheadline}</p>
        </div>
        <div id="services-accordion" class="divide-y divide-black/15"></div>
      </div>
    </div>
  </section>

  <!-- CONFIGURABLE PRICING PACKAGES -->
  <section id="pricing" class="mx-auto max-w-7xl px-5 py-24 md:px-8">
    <div class="max-w-2xl">
      <span class="font-mono text-xs uppercase tracking-[0.24em] text-[#C8A464]">TRANSPARENT STUDIO SCOPING</span>
      <h2 class="mt-2 font-display text-3xl font-extrabold text-white sm:text-5xl">${pricing.headline}</h2>
      <p class="mt-3 text-sm leading-relaxed text-zinc-400">${pricing.subheadline}</p>
    </div>

    <div class="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      ${pricing.packages
        .map(
          (pkg) => `
        <div class="flex flex-col justify-between rounded-3xl border ${
          pkg.featured ? 'border-[#C8A464] bg-[#151310]' : 'border-white/10 bg-[#121216]'
        } p-6 shadow-xl">
          <div>
            <span class="inline-block rounded-full ${
              pkg.featured ? 'bg-[#C8A464] text-[#09090B]' : 'bg-white/10 text-[#C8A464]'
            } px-3 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.18em]">${pkg.badge}</span>
            <h3 class="mt-4 font-display text-xl font-bold text-white">${pkg.title}</h3>
            <p class="mt-2 text-xs leading-relaxed text-zinc-400">${pkg.shortDescription}</p>
            <div class="my-5 border-y border-white/10 py-3 font-serif text-xl italic text-[#C8A464]">${pkg.price}</div>
            <ul class="space-y-2 text-xs text-zinc-300">
              ${pkg.deliverables.map((d) => `<li class="flex gap-2"><span class="text-[#C8A464]">✦</span><span>${d}</span></li>`).join('')}
            </ul>
          </div>
          <button type="button" data-select-service="${pkg.serviceSelection}" class="mt-6 w-full rounded-full ${
            pkg.featured
              ? 'bg-[#C8A464] text-[#09090B] hover:bg-[#e0bf7d]'
              : 'border border-white/20 bg-white/5 text-white hover:border-[#C8A464]'
          } px-4 py-2.5 font-mono text-xs font-semibold uppercase tracking-wider transition">
            Request Tailored Quote
          </button>
        </div>`
        )
        .join('')}
    </div>
  </section>

  <!-- STICKY STACKED FEATURED PROJECTS -->
  <section id="projects" class="mx-auto max-w-7xl px-5 py-16 md:px-8">
    <div class="mb-10 flex flex-wrap items-end justify-between gap-4">
      <div>
        <span class="font-mono text-xs uppercase tracking-[0.24em] text-[#C8A464]">04 · DON'T TAKE MY WORD FOR IT — WATCH WHAT SHIPPED</span>
        <h2 class="mt-2 font-display text-3xl font-extrabold text-white sm:text-5xl">PROVEN PROJECTS</h2>
      </div>
      <a href="#archive" class="font-mono text-xs uppercase tracking-[0.18em] text-[#C8A464] hover:underline">WATCH ALL 232 PROOFS ↓</a>
    </div>
    <div id="featured-stack" class="space-y-6"></div>
  </section>

  <!-- INTERACTIVE GOOGLE DRIVE PORTFOLIO ARCHIVE EXPLORER -->
  <section id="archive" class="mx-auto max-w-7xl px-5 py-20 md:px-8">
    <div class="rounded-3xl border border-white/10 bg-[#101015] p-6 sm:p-10">
      <div class="flex flex-wrap items-end justify-between gap-4">
        <div>
          <span class="font-mono text-xs uppercase tracking-[0.24em] text-[#C8A464]">VERIFIED CLIENT VAULT</span>
          <h2 class="mt-2 font-display text-3xl font-extrabold text-white sm:text-4xl">232+ CLIENT PROOFS</h2>
        </div>
        <div class="flex flex-wrap items-center gap-2">
          <input id="archive-search" type="search" placeholder="Search brand, shoot, motion, AI..." class="rounded-full border border-white/15 bg-[#09090B] px-4 py-2 text-xs text-white placeholder-zinc-500 focus:border-[#C8A464] focus:outline-none" />
          <select id="archive-media-filter" class="rounded-full border border-white/15 bg-[#09090B] px-3.5 py-2 font-mono text-xs text-zinc-200 focus:border-[#C8A464] focus:outline-none">
            <option value="all">All Media</option>
            <option value="video">Videos Only</option>
            <option value="image">Graphics &amp; Photos</option>
          </select>
        </div>
      </div>

      <div id="category-pills" class="mt-6 flex flex-wrap gap-2"></div>
      <div id="archive-grid" class="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3"></div>
      <div class="mt-8 flex justify-center">
        <button id="btn-load-more" type="button" class="rounded-full border border-[#C8A464]/50 bg-[#C8A464]/10 px-6 py-2.5 font-mono text-xs uppercase tracking-[0.18em] text-[#C8A464] transition hover:bg-[#C8A464] hover:text-[#09090B]">
          Load More Works
        </button>
      </div>
    </div>
  </section>

  <!-- CONTACT, DISCOVERY CALL & WHATSAPP -->
  <section id="contact" class="mx-auto max-w-7xl px-5 py-24 md:px-8">
    <div class="grid gap-10 lg:grid-cols-[1fr_1.618fr]">
      <div>
        <span class="font-mono text-xs uppercase tracking-[0.24em] text-[#C8A464]">05 · STOP GAMBLING ON SLOW FREELANCERS</span>
        <h2 class="mt-2 font-display text-3xl font-extrabold text-white sm:text-5xl">HIRE DEV NOW.</h2>
        <p class="mt-4 text-sm leading-[1.618] text-zinc-400">
          Send your brief or book a 15-minute IST strategy call. Direct reply from <strong class="text-white">${profile.contact.email}</strong> within hours.
        </p>

        <div class="mt-6 space-y-3 text-sm">
          <a href="mailto:${profile.contact.email}" class="flex items-center justify-between rounded-2xl border border-white/10 bg-[#121216] p-4 transition hover:border-[#C8A464]/50">
            <span class="font-mono text-xs uppercase text-zinc-400">Email</span>
            <span class="font-medium text-white">${profile.contact.email}</span>
          </a>
          <a href="https://wa.me/${profile.contact.whatsappNumber}?text=${encodeURIComponent(profile.contact.whatsappPreFilledMessage)}" target="_blank" rel="noopener" class="flex items-center justify-between rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 transition hover:border-emerald-400">
            <span class="font-mono text-xs uppercase text-emerald-300">WhatsApp Instant Chat</span>
            <span class="font-medium text-white">${profile.contact.phone} ↗</span>
          </a>
          <a href="https://www.instagram.com/lenswithdragodev" target="_blank" rel="noopener" class="flex items-center justify-between rounded-2xl border border-white/10 bg-[#121216] p-4 transition hover:border-[#C8A464]/50">
            <span class="font-mono text-xs uppercase text-zinc-400">Instagram</span>
            <span class="font-medium text-white">@lenswithdragodev ↗</span>
          </a>
        </div>
      </div>

      <div>
        <form id="contact-form" class="rounded-3xl border border-white/15 bg-[#121216] p-6 shadow-2xl sm:p-8">
          <h3 class="font-display text-xl font-bold uppercase text-white">Send Your Brief — Claim Your Slot</h3>
          <div class="mt-5 grid gap-4 sm:grid-cols-2">
            <div>
              <label class="block font-mono text-[11px] uppercase tracking-wider text-zinc-400">Your Name *</label>
              <input name="name" required class="mt-1.5 w-full rounded-xl border border-white/15 bg-[#09090B] px-3.5 py-2.5 text-sm text-white focus:border-[#C8A464] focus:outline-none" placeholder="Alex Rivera" />
            </div>
            <div>
              <label class="block font-mono text-[11px] uppercase tracking-wider text-zinc-400">Email Address *</label>
              <input name="email" type="email" required class="mt-1.5 w-full rounded-xl border border-white/15 bg-[#09090B] px-3.5 py-2.5 text-sm text-white focus:border-[#C8A464] focus:outline-none" placeholder="you@company.com" />
            </div>
            <div>
              <label class="block font-mono text-[11px] uppercase tracking-wider text-zinc-400">Phone / WhatsApp</label>
              <input name="phone" class="mt-1.5 w-full rounded-xl border border-white/15 bg-[#09090B] px-3.5 py-2.5 text-sm text-white focus:border-[#C8A464] focus:outline-none" placeholder="+91 ..." />
            </div>
            <div>
              <label class="block font-mono text-[11px] uppercase tracking-wider text-zinc-400">Service Needed *</label>
              <select id="contact-service-select" name="serviceNeeded" class="mt-1.5 w-full rounded-xl border border-white/15 bg-[#09090B] px-3.5 py-2.5 text-sm text-white focus:border-[#C8A464] focus:outline-none">
                <option value="Video Editing & Post-Production">Video Editing &amp; Post-Production</option>
                <option value="Graphic Design & Branding">Graphic Design &amp; Branding</option>
                <option value="Motion Graphics & VFX">Motion Graphics &amp; VFX</option>
                <option value="AI-Powered Creative Production">AI-Powered Creative Production</option>
                <option value="Monthly Social Media Package">Monthly Social Media Package</option>
                <option value="Individual Project Quote">Individual Project Quote</option>
              </select>
            </div>
          </div>
          <div class="mt-4">
            <label class="block font-mono text-[11px] uppercase tracking-wider text-zinc-400">Project Details, Goals &amp; Preferred Call Time (IST) *</label>
            <textarea name="projectDetails" rows="4" required class="mt-1.5 w-full rounded-xl border border-white/15 bg-[#09090B] p-3.5 text-sm text-white focus:border-[#C8A464] focus:outline-none" placeholder="Tell Dev about your campaign, timeline, deliverables, or preferred discovery call window..."></textarea>
          </div>
          <div id="contact-status" class="mt-4 hidden rounded-xl border border-[#C8A464]/40 bg-[#C8A464]/10 p-3.5 text-xs text-zinc-200"></div>
          <div class="mt-5 flex flex-wrap gap-3">
            <button type="submit" class="rounded-full bg-[#C8A464] px-6 py-3 font-mono text-xs font-semibold uppercase tracking-[0.16em] text-[#09090B] transition hover:bg-[#e0bf7d]">
              Send Studio Enquiry
            </button>
            <button id="btn-send-whatsapp" type="button" class="rounded-full border border-emerald-500/40 bg-emerald-500/10 px-5 py-3 font-mono text-xs uppercase tracking-[0.15em] text-emerald-300 transition hover:bg-emerald-500/20">
              Send via WhatsApp ↗
            </button>
          </div>
        </form>
      </div>
    </div>
  </section>

  <footer class="border-t border-white/10 py-10 text-center font-mono text-xs text-zinc-500">
    © ${new Date().getFullYear()} ${profile.name} · ${profile.studioName} · Jaipur, Rajasthan, India
  </footer>

  <a href="https://wa.me/${profile.contact.whatsappNumber}?text=${encodeURIComponent(profile.contact.whatsappPreFilledMessage)}" target="_blank" rel="noopener" class="fixed bottom-5 right-5 z-40 rounded-full border border-emerald-400/40 bg-emerald-500 px-4 py-2.5 font-mono text-xs font-semibold uppercase tracking-wider text-[#09090B] shadow-2xl transition hover:bg-emerald-400">
    WhatsApp Dev ↗
  </a>

  <!-- CINEMA VIDEO & IMAGE MODAL -->
  <div id="cinema-modal" class="fixed inset-0 z-50 hidden items-center justify-center bg-black/90 p-4 backdrop-blur-xl">
    <div class="w-full max-w-5xl overflow-hidden rounded-3xl border border-white/15 bg-[#0D0D12] shadow-2xl">
      <div class="flex items-center justify-between border-b border-white/10 px-5 py-3.5">
        <div>
          <span id="modal-category" class="font-mono text-[10px] uppercase tracking-[0.2em] text-[#C8A464]"></span>
          <h3 id="modal-title" class="font-display text-base font-bold text-white"></h3>
        </div>
        <div class="flex items-center gap-3">
          <a id="modal-drive-link" href="#" target="_blank" rel="noopener" class="rounded-full border border-white/15 px-3 py-1 font-mono text-[11px] text-zinc-300 hover:border-[#C8A464]">Open on Drive ↗</a>
          <button id="close-cinema" type="button" class="rounded-full bg-white/10 px-3 py-1 font-mono text-xs text-white hover:bg-white/20">✕</button>
        </div>
      </div>
      <div id="modal-stage" class="relative aspect-video w-full bg-black"></div>
    </div>
  </div>

  <script>
    window.__STUDIO_DATA__ = ${JSON.stringify(embeddedData)};
    window.__PORTRAIT_BASE64__ = "${portraitBase64}";
  </script>

  <script>
    const DATA = window.__STUDIO_DATA__;
    let localhostOnline = false;

    document.getElementById('about-portrait').src = 'data:image/jpeg;base64,' + window.__PORTRAIT_BASE64__;

    // 1. Live Server Probe
    function checkLocalhost() {
      const probe = new Image();
      probe.onload = () => {
        localhostOnline = true;
        document.getElementById('server-dot').className = 'inline-block h-2 w-2 rounded-full bg-emerald-400';
        document.getElementById('server-status-text').textContent = 'LIVE NEXT.JS SERVER ONLINE AT http://localhost:3000';
      };
      probe.onerror = () => {
        localhostOnline = false;
        document.getElementById('server-dot').className = 'inline-block h-2 w-2 rounded-full bg-[#3B63FF]';
        document.getElementById('server-status-text').textContent = 'STANDALONE STUDIO HTML EDITION · Double-click ready anytime';
      };
      probe.src = 'http://localhost:3000/assets/dev-cv-photo.jpg?t=' + Date.now();
    }
    checkLocalhost();

    // 2. Hero Video Controls (DEV_KUMAWAT_SAAS_WEB.mp4)
    const heroVid = document.getElementById('hero-video');
    const heroStage = document.getElementById('hero-stage');
    const btnSound = document.getElementById('btn-hero-sound');
    const btnPlay = document.getElementById('btn-hero-play');
    const btnRestart = document.getElementById('btn-hero-restart');
    const btnFs = document.getElementById('btn-hero-fullscreen');
    const scrubber = document.getElementById('hero-scrubber');
    const progressBar = document.getElementById('hero-progress-bar');
    const timecode = document.getElementById('hero-timecode');

    function fmtTime(s) {
      const n = Math.max(0, Math.floor(s || 0));
      return String(Math.floor(n / 60)).padStart(2, '0') + ':' + String(n % 60).padStart(2, '0');
    }

    function updateSoundUi() {
      if (heroVid.muted) {
        btnSound.textContent = 'ENABLE SOUND';
        btnSound.className = 'rounded-full bg-[#3B63FF] px-4 py-2 font-mono text-xs font-semibold uppercase tracking-wider text-white shadow-[0_0_24px_rgba(59,99,255,0.5)] transition hover:bg-[#5277FF]';
      } else {
        btnSound.textContent = 'SOUND ON';
        btnSound.className = 'rounded-full border border-emerald-400/40 bg-emerald-500/15 px-4 py-2 font-mono text-xs font-semibold uppercase tracking-wider text-emerald-200 transition hover:bg-emerald-500/25';
      }
    }

    let userMutedHero = false;
    function startHeroWithSoundDefault() {
      heroVid.volume = 0.92;
      heroVid.muted = false;
      heroVid.play().then(() => {
        updateSoundUi();
      }).catch(() => {
        heroVid.muted = true;
        updateSoundUi();
        heroVid.play().catch(() => {});
        const evts = ['pointerdown', 'mousedown', 'touchstart', 'keydown', 'click'];
        const unlock = (e) => {
          if (e.target && e.target.closest && e.target.closest('#btn-hero-sound')) {
            evts.forEach((ev) => window.removeEventListener(ev, unlock, true));
            return;
          }
          if (!userMutedHero) {
            heroVid.muted = false;
            heroVid.volume = 0.92;
            updateSoundUi();
            if (heroVid.paused) heroVid.play().catch(() => {});
          }
          evts.forEach((ev) => window.removeEventListener(ev, unlock, true));
        };
        evts.forEach((ev) => window.addEventListener(ev, unlock, { capture: true, passive: true }));
      });
    }
    startHeroWithSoundDefault();

    btnSound.addEventListener('click', () => {
      heroVid.muted = !heroVid.muted;
      userMutedHero = heroVid.muted;
      if (!heroVid.muted) {
        heroVid.volume = 0.92;
        if (heroVid.paused) heroVid.play().catch(() => {});
      }
      updateSoundUi();
    });

    btnPlay.addEventListener('click', () => {
      if (heroVid.paused) heroVid.play().catch(() => {});
      else heroVid.pause();
    });

    btnRestart.addEventListener('click', () => {
      heroVid.currentTime = 0;
      heroVid.muted = false;
      heroVid.volume = 0.92;
      updateSoundUi();
      heroVid.play().catch(() => {});
    });

    btnFs.addEventListener('click', () => {
      if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
      else if (heroStage.requestFullscreen) heroStage.requestFullscreen().catch(() => {});
    });

    heroVid.addEventListener('click', () => {
      if (heroVid.muted) {
        heroVid.muted = false;
        heroVid.volume = 0.92;
        updateSoundUi();
        if (heroVid.paused) heroVid.play().catch(() => {});
      } else if (heroVid.paused) {
        heroVid.play().catch(() => {});
      } else {
        heroVid.pause();
      }
    });

    heroVid.addEventListener('play', () => { btnPlay.textContent = 'PAUSE'; });
    heroVid.addEventListener('pause', () => { btnPlay.textContent = 'PLAY'; });
    heroVid.addEventListener('loadedmetadata', () => {
      if (heroVid.duration) scrubber.max = String(heroVid.duration);
    });
    heroVid.addEventListener('timeupdate', () => {
      const dur = heroVid.duration || 52;
      scrubber.value = String(heroVid.currentTime);
      progressBar.style.width = Math.min(100, (heroVid.currentTime / dur) * 100) + '%';
      timecode.textContent = fmtTime(heroVid.currentTime) + ' / ' + fmtTime(dur);
    });
    scrubber.addEventListener('input', (e) => {
      heroVid.currentTime = Number(e.target.value);
    });

    // 3. Cinema Modal (Pauses Hero Video Automatically)
    const cinemaModal = document.getElementById('cinema-modal');
    const modalStage = document.getElementById('modal-stage');
    let heroWasPlaying = false;

    function openProjectModal(proj) {
      heroWasPlaying = !heroVid.paused;
      if (!heroVid.paused) heroVid.pause();

      document.getElementById('modal-category').textContent = proj.category + (proj.subcategory ? ' · ' + proj.subcategory : '');
      document.getElementById('modal-title').textContent = proj.title;
      document.getElementById('modal-drive-link').href = proj.driveUrl;
      modalStage.innerHTML = '';

      if (proj.mediaType === 'video') {
        if (localhostOnline) {
          const vid = document.createElement('video');
          vid.src = 'http://localhost:3000/api/drive/stream/' + proj.fileId;
          vid.controls = true;
          vid.autoplay = true;
          vid.playsInline = true;
          vid.className = 'h-full w-full object-contain bg-black';
          vid.onerror = () => {
            modalStage.innerHTML = '<iframe src="' + proj.previewUrl + '" allow="autoplay; fullscreen" class="h-full w-full border-0"></iframe>';
          };
          modalStage.appendChild(vid);
        } else {
          modalStage.innerHTML = '<iframe src="' + proj.previewUrl + '" allow="autoplay; fullscreen" class="h-full w-full border-0"></iframe>';
        }
      } else {
        const img = document.createElement('img');
        img.src = localhostOnline
          ? 'http://localhost:3000/api/drive/thumbnail/' + proj.fileId
          : 'https://drive.google.com/thumbnail?id=' + proj.fileId + '&sz=w1000';
        img.alt = proj.title;
        img.className = 'h-full w-full object-contain bg-black';
        modalStage.appendChild(img);
      }
      cinemaModal.classList.remove('hidden');
      cinemaModal.classList.add('flex');
    }

    document.getElementById('close-cinema').addEventListener('click', () => {
      modalStage.innerHTML = '';
      cinemaModal.classList.add('hidden');
      cinemaModal.classList.remove('flex');
      if (heroWasPlaying) heroVid.play().catch(() => {});
    });

    // 4. Verified Client Brand Logos Marquee
    const brandLogosRow1 = [
      { name: 'Chaayos', font: 'font-sans font-extrabold tracking-tight text-xl', sub: '', svg: '<path d="M8 13.5h13.5l-1.6 11.2a3 3 0 0 1-2.97 2.55h-4.36a3 3 0 0 1-2.97-2.55L8 13.5Z" stroke="currentColor" stroke-width="1.9"/><path d="M21.2 15.5h2.3a2.75 2.75 0 0 1 0 5.5h-2.9M12.2 9.5c0-1.6 1.5-2.2 1.5-3.8M16.8 9.8c0-1.8 1.7-2.5 1.7-4.3" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>' },
      { name: 'Mahanagar Times', font: 'font-serif text-xl tracking-wide', sub: 'BROADCAST & PRINT', svg: '<rect x="4.5" y="6" width="23" height="20" rx="2.5" stroke="currentColor" stroke-width="1.8"/><path d="M8.5 11h15M8.5 15.5h9M8.5 19.5h9M20.5 15.5h3v5h-3z" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>' },
      { name: 'AMITY', font: 'font-display font-bold uppercase tracking-[0.14em] text-base', sub: 'UNIVERSITY', svg: '<path d="M6.5 6.5h19v10.2c0 5.8-4.2 9.5-9.5 11.3-5.3-1.8-9.5-5.5-9.5-11.3V6.5Z" stroke="currentColor" stroke-width="1.85"/><path d="M10 11.5l12 8M10 16.5l8.5 5.6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>' },
      { name: 'ALICE BLUE', font: 'font-display font-extrabold uppercase tracking-[0.08em] text-base', sub: '', svg: '<path d="M16 5.5L26.5 24.5H19.8L16 17.2L12.2 24.5H5.5L16 5.5Z" stroke="currentColor" stroke-width="1.85" stroke-linejoin="round"/>' },
      { name: 'LIVANTO', font: 'font-display font-extrabold uppercase tracking-[0.1em] text-base', sub: 'GREEN INFRA', svg: '<path d="M7.5 25.5V9.5l6.5-3v19M18 25.5V13.5l6.5-2.5v14.5M5.5 25.5h21" stroke="currentColor" stroke-width="1.85" stroke-linecap="round" stroke-linejoin="round"/>' },
      { name: 'JP Vijayaa', font: 'font-serif text-lg tracking-wide', sub: 'FOODS', svg: '<circle cx="16" cy="16" r="10.5" stroke="currentColor" stroke-width="1.75"/><path d="M16 9.5c2.6 2.5 3.6 5.4 0 9.5-3.6-4.1-2.6-7 0-9.5Z" stroke="currentColor" stroke-width="1.65"/>' },
      { name: 'TAASH', font: 'font-serif text-xl tracking-[0.14em]', sub: 'KITCHEN & BAR', svg: '<path d="M16 5.5L25.5 16L16 26.5L6.5 16L16 5.5Z" stroke="currentColor" stroke-width="1.8"/>' },
      { name: 'malingo', font: 'font-sans font-extrabold tracking-tight text-xl', sub: '', svg: '<circle cx="14.5" cy="16" r="8.5" stroke="currentColor" stroke-width="1.85"/><circle cx="19.5" cy="13.5" r="5.5" stroke="currentColor" stroke-width="1.65"/>' },
      { name: 'SIGN O', font: 'font-display font-bold uppercase tracking-[0.2em] text-base', sub: '', svg: '<circle cx="16" cy="16" r="10" stroke="currentColor" stroke-width="2"/><circle cx="16" cy="16" r="4.2" stroke="currentColor" stroke-width="1.8"/>' },
      { name: 'JDH', font: 'font-display font-extrabold uppercase tracking-[0.1em] text-base', sub: 'IMMIGRATION', svg: '<circle cx="16" cy="16" r="10" stroke="currentColor" stroke-width="1.75"/><ellipse cx="16" cy="16" rx="4.6" ry="10" stroke="currentColor" stroke-width="1.5"/><path d="M6.5 16h19" stroke="currentColor" stroke-width="1.5"/>' }
    ];
    const brandLogosRow2 = [
      { name: 'DrDermX', font: 'font-sans font-bold tracking-tight text-lg', sub: '', svg: '<path d="M16 5L25.5 10.5V21.5L16 27L6.5 21.5V10.5L16 5Z" stroke="currentColor" stroke-width="1.8"/><path d="M16 11.5v9M11.5 16h9" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>' },
      { name: 'Ratnaya', font: 'font-serif text-lg tracking-wide', sub: 'ORGANICS', svg: '<path d="M16 6.5c4.5 4.2 6.8 8.4 6.8 12.2a6.8 6.8 0 1 1-13.6 0c0-3.8 2.3-8 6.8-12.2Z" stroke="currentColor" stroke-width="1.8"/>' },
      { name: 'PURE+', font: 'font-display font-extrabold uppercase tracking-[0.1em] text-lg', sub: '', svg: '<rect x="6" y="6" width="20" height="20" rx="6" stroke="currentColor" stroke-width="1.85"/><path d="M16 11.5v9M11.5 16h9" stroke="currentColor" stroke-width="2.1" stroke-linecap="round"/>' },
      { name: 'Assist MyDay', font: 'font-sans font-bold tracking-tight text-lg', sub: '', svg: '<circle cx="16" cy="16" r="10" stroke="currentColor" stroke-width="1.8"/><path d="M11.8 16.4l2.9 2.9 6-6.2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>' },
      { name: 'SUFIWOOD', font: 'font-display font-semibold uppercase tracking-[0.22em] text-base', sub: '', svg: '<rect x="6" y="6" width="20" height="20" rx="2" stroke="currentColor" stroke-width="1.8"/><rect x="10.5" y="10.5" width="11" height="11" rx="1" stroke="currentColor" stroke-width="1.6"/>' },
      { name: 'UNOVA', font: 'font-display font-extrabold uppercase tracking-[0.12em] text-base', sub: 'SOCKS', svg: '<path d="M9.5 7.5v9.5a6.5 6.5 0 0 0 13 0V7.5" stroke="currentColor" stroke-width="2.1" stroke-linecap="round"/>' },
      { name: 'PRIVINTAL', font: 'font-display font-bold uppercase tracking-[0.14em] text-base', sub: 'GREEN', svg: '<path d="M16 5.5l9.5 5.5v10L16 26.5 6.5 21V11L16 5.5Z" stroke="currentColor" stroke-width="1.8"/>' },
      { name: 'KRISHAZ', font: 'font-serif uppercase tracking-[0.14em] text-xl', sub: '', svg: '<path d="M6.5 21.5L9 11l7 5.5L23 11l2.5 10.5H6.5ZM8 24.5h16" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>' },
      { name: 'SAVJI PRO', font: 'font-display font-extrabold uppercase tracking-[0.08em] text-base', sub: '', svg: '<rect x="5.5" y="5.5" width="21" height="21" rx="5" stroke="currentColor" stroke-width="1.8"/><path d="M19.5 11.5h-5.2a2.3 2.3 0 0 0 0 4.6h3.4a2.3 2.3 0 0 1 0 4.6h-5.2" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/>' },
      { name: 'IWSM', font: 'font-display font-bold uppercase tracking-[0.24em] text-lg', sub: '', svg: '<circle cx="16" cy="16" r="10" stroke="currentColor" stroke-width="1.75"/><path d="M11 11.5v9M16 9.5v13M21 11.5v9" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/>' }
    ];
    function renderMarqueeRow(elId, list) {
      const container = document.getElementById(elId);
      [...list, ...list].forEach((b) => {
        const item = document.createElement('div');
        item.className = 'flex shrink-0 select-none items-center gap-12 text-zinc-400 transition-colors duration-300 hover:text-white';
        item.innerHTML = \`
          <div class="flex items-center gap-2.5">
            <svg viewBox="0 0 32 32" fill="none" class="h-8 w-8 shrink-0">\${b.svg}</svg>
            <div class="flex flex-col leading-none">
              <span class="\${b.font}">\${b.name}</span>
              \${b.sub ? \`<span class="mt-0.5 font-mono text-[8px] uppercase tracking-[0.24em] opacity-65">\${b.sub}</span>\` : ''}
            </div>
          </div>
          <span class="h-1 w-1 shrink-0 rounded-full bg-white/15"></span>\`;
        container.appendChild(item);
      });
    }
    renderMarqueeRow('marquee-row-1', brandLogosRow1);
    renderMarqueeRow('marquee-row-2', brandLogosRow2);

    // 5. Rounded White Services Sheet
    const servicesWrap = document.getElementById('services-accordion');
    DATA.services.primaryGroups.forEach((svc, idx) => {
      const row = document.createElement('div');
      row.className = 'py-7';
      row.innerHTML = \`
        <button type="button" class="flex w-full items-center justify-between gap-4 text-left">
          <div class="flex items-baseline gap-5">
            <span class="font-mono text-sm font-semibold text-zinc-500">\${svc.number}</span>
            <div>
              <h3 class="font-display text-2xl font-extrabold text-[#09090B] sm:text-4xl">\${svc.title}</h3>
              <p class="mt-1 text-xs font-medium text-zinc-600 sm:text-sm">\${svc.tagline}</p>
            </div>
          </div>
          <span class="svc-toggle-icon rounded-full border border-black/20 px-3.5 py-1.5 font-mono text-xs">\${idx === 0 ? '−' : '+'}</span>
        </button>
        <div class="svc-body \${idx === 0 ? '' : 'hidden'} mt-5 pl-0 sm:pl-11">
          <p class="max-w-2xl text-sm leading-relaxed text-zinc-700">\${svc.shortDescription}</p>
          <div class="mt-4 flex flex-wrap gap-2">
            \${svc.capabilities.map((c) => \`<span class="rounded-full border border-black/15 bg-white px-3 py-1 font-mono text-[11px] text-zinc-800">\${c}</span>\`).join('')}
          </div>
          <div class="mt-5 flex flex-wrap gap-3">
            <button type="button" data-filter-cat="\${svc.driveCategories[0]}" class="rounded-full bg-[#09090B] px-4 py-2 font-mono text-xs uppercase tracking-wider text-white hover:bg-zinc-800">
              View Matching Work →
            </button>
            <button type="button" data-select-service="\${svc.enquiryServiceValue}" class="rounded-full border border-black/25 px-4 py-2 font-mono text-xs uppercase tracking-wider text-[#09090B] hover:bg-black/5">
              Enquire About \${svc.title}
            </button>
          </div>
        </div>\`;
      const headerBtn = row.querySelector('button');
      const body = row.querySelector('.svc-body');
      const icon = row.querySelector('.svc-toggle-icon');
      headerBtn.addEventListener('click', () => {
        const isHidden = body.classList.toggle('hidden');
        icon.textContent = isHidden ? '+' : '−';
      });
      servicesWrap.appendChild(row);
    });

    // 6. Sticky Stacked Featured Projects
    const featuredStack = document.getElementById('featured-stack');
    DATA.projects.filter((p) => p.featured).slice(0, 6).forEach((proj, idx) => {
      const card = document.createElement('div');
      card.style.top = (88 + idx * 18) + 'px';
      card.className = 'relative lg:sticky grid gap-6 overflow-hidden rounded-3xl border border-white/15 bg-[#121218] p-5 shadow-2xl md:grid-cols-12 md:p-8';
      card.innerHTML = \`
        <div class="md:col-span-6 overflow-hidden rounded-2xl bg-black aspect-video">
          <img src="https://drive.google.com/thumbnail?id=\${proj.fileId}&sz=w1000" loading="lazy" alt="\${proj.title}" class="h-full w-full object-cover" />
        </div>
        <div class="md:col-span-6 flex flex-col justify-between">
          <div>
            <span class="font-mono text-xs uppercase tracking-[0.2em] text-[#C8A464]">0\${idx + 1} · \${proj.category}</span>
            <h3 class="mt-2 font-display text-2xl font-extrabold text-white sm:text-3xl">\${proj.title}</h3>
            <p class="mt-3 text-sm leading-relaxed text-zinc-400">\${proj.description}</p>
          </div>
          <div class="mt-6 flex flex-wrap gap-3">
            <button type="button" class="play-featured rounded-full bg-[#C8A464] px-5 py-2.5 font-mono text-xs font-semibold uppercase tracking-wider text-[#09090B] hover:bg-[#e0bf7d]">
              \${proj.mediaType === 'video' ? '▶ Watch in Cinema Player' : 'Inspect Creative'}
            </button>
            <a href="\${proj.driveUrl}" target="_blank" rel="noopener" class="rounded-full border border-white/20 px-4 py-2.5 font-mono text-xs uppercase tracking-wider text-zinc-300 hover:border-white/40">
              Drive Source ↗
            </a>
          </div>
        </div>\`;
      card.querySelector('.play-featured').addEventListener('click', () => openProjectModal(proj));
      featuredStack.appendChild(card);
    });

    // 7. Full Archive Explorer
    let activeCategory = 'ALL';
    let visibleCount = 12;
    const categoryPills = document.getElementById('category-pills');
    const archiveGrid = document.getElementById('archive-grid');
    const searchInput = document.getElementById('archive-search');
    const mediaFilter = document.getElementById('archive-media-filter');
    const loadMoreBtn = document.getElementById('btn-load-more');

    const allCatNames = ['ALL', ...DATA.categories.map((c) => c.name)];
    function renderCategoryPills() {
      categoryPills.innerHTML = '';
      allCatNames.forEach((cat) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'rounded-full px-3.5 py-1.5 font-mono text-[11px] uppercase tracking-wider transition ' +
          (activeCategory === cat
            ? 'bg-[#C8A464] text-[#09090B] font-semibold'
            : 'border border-white/15 bg-white/5 text-zinc-300 hover:border-white/35');
        btn.textContent = cat;
        btn.addEventListener('click', () => {
          activeCategory = cat;
          visibleCount = 12;
          renderCategoryPills();
          renderArchive();
        });
        categoryPills.appendChild(btn);
      });
    }

    function renderArchive() {
      const q = searchInput.value.trim().toLowerCase();
      const media = mediaFilter.value;
      const filtered = DATA.projects.filter((p) => {
        if (activeCategory !== 'ALL' && p.category !== activeCategory) return false;
        if (media !== 'all' && p.mediaType !== media) return false;
        if (q && !(p.title.toLowerCase().includes(q) || p.category.toLowerCase().includes(q) || p.subcategory.toLowerCase().includes(q))) return false;
        return true;
      });

      archiveGrid.innerHTML = '';
      filtered.slice(0, visibleCount).forEach((p) => {
        const item = document.createElement('button');
        item.type = 'button';
        item.className = 'group overflow-hidden rounded-2xl border border-white/10 bg-[#14141C] text-left transition hover:border-[#C8A464]/60';
        item.innerHTML = \`
          <div class="relative aspect-video w-full overflow-hidden bg-black">
            <img src="https://drive.google.com/thumbnail?id=\${p.fileId}&sz=w640" loading="lazy" alt="\${p.title}" class="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
            <span class="absolute right-2.5 top-2.5 rounded-full bg-black/80 px-2.5 py-1 font-mono text-[10px] uppercase text-[#C8A464]">\${p.mediaType}</span>
          </div>
          <div class="p-4">
            <div class="font-mono text-[10px] uppercase tracking-wider text-zinc-400">\${p.category}\${p.subcategory ? ' · ' + p.subcategory : ''}</div>
            <div class="mt-1 font-display text-sm font-bold text-white line-clamp-1">\${p.title}</div>
          </div>\`;
        item.addEventListener('click', () => openProjectModal(p));
        archiveGrid.appendChild(item);
      });
      loadMoreBtn.style.display = visibleCount < filtered.length ? 'inline-block' : 'none';
    }

    renderCategoryPills();
    renderArchive();
    searchInput.addEventListener('input', () => { visibleCount = 12; renderArchive(); });
    mediaFilter.addEventListener('change', () => { visibleCount = 12; renderArchive(); });
    loadMoreBtn.addEventListener('click', () => { visibleCount += 12; renderArchive(); });

    document.body.addEventListener('click', (e) => {
      const svcBtn = e.target.closest('[data-select-service]');
      if (svcBtn) {
        document.getElementById('contact-service-select').value = svcBtn.getAttribute('data-select-service');
        document.getElementById('contact').scrollIntoView({ behavior: 'smooth' });
      }
      const catBtn = e.target.closest('[data-filter-cat]');
      if (catBtn) {
        activeCategory = catBtn.getAttribute('data-filter-cat');
        visibleCount = 12;
        renderCategoryPills();
        renderArchive();
        document.getElementById('archive').scrollIntoView({ behavior: 'smooth' });
      }
    });

    // 8. Contact Form
    const contactForm = document.getElementById('contact-form');
    const contactStatus = document.getElementById('contact-status');
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const fd = new FormData(contactForm);
      const payload = Object.fromEntries(fd.entries());
      contactStatus.classList.remove('hidden');

      if (localhostOnline) {
        try {
          const res = await fetch('http://localhost:3000/api/contact', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });
          const json = await res.json();
          contactStatus.textContent = json.message || 'Enquiry processed.';
          if (res.ok) { contactForm.reset(); return; }
        } catch {}
      }
      const subject = encodeURIComponent('Studio Enquiry: ' + payload.serviceNeeded + ' — ' + payload.name);
      const body = encodeURIComponent('Name: ' + payload.name + '\\nEmail: ' + payload.email + '\\nPhone: ' + (payload.phone || 'N/A') + '\\nService: ' + payload.serviceNeeded + '\\n\\nDetails:\\n' + payload.projectDetails);
      contactStatus.innerHTML = 'Opening your email client to send directly to <strong>${profile.contact.email}</strong> — <a class="underline text-[#C8A464]" href="mailto:${profile.contact.email}?subject=' + subject + '&body=' + body + '">Click here if it did not open</a>.';
      window.location.href = 'mailto:${profile.contact.email}?subject=' + subject + '&body=' + body;
    });

    document.getElementById('btn-send-whatsapp').addEventListener('click', () => {
      const fd = new FormData(contactForm);
      const msg = 'Hi Dev! Name: ' + (fd.get('name') || '') + ' | Service: ' + (fd.get('serviceNeeded') || '') + ' | Brief: ' + (fd.get('projectDetails') || 'Let us discuss a project.');
      window.open('https://wa.me/${profile.contact.whatsappNumber}?text=' + encodeURIComponent(msg), '_blank');
    });

    // 9. Cobalt-Blue Spotlight Card & Button Border Tracker
    document.querySelectorAll('button, a.rounded-full, a.rounded-2xl').forEach((el) => {
      if (!el.hasAttribute('data-glow')) el.setAttribute('data-glow-btn', '');
    });
    let ptrX = -9999, ptrY = -9999, ptrRaf = 0;
    function flushSpotlight() {
      ptrRaf = 0;
      const vh = window.innerHeight;
      document.querySelectorAll('[data-glow], [data-glow-btn]').forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.bottom < -160 || r.top > vh + 160) return;
        el.style.setProperty('--gx', (ptrX - r.left).toFixed(1) + 'px');
        el.style.setProperty('--gy', (ptrY - r.top).toFixed(1) + 'px');
        const dx = Math.max(r.left - ptrX, 0, ptrX - r.right);
        const dy = Math.max(r.top - ptrY, 0, ptrY - r.bottom);
        const dist = Math.hypot(dx, dy);
        const reach = el.hasAttribute('data-glow-btn') ? 76 : 140;
        el.style.setProperty('--glow-alpha', dist < reach ? (1 - dist / reach).toFixed(3) : '0');
      });
    }
    window.addEventListener('pointermove', (e) => {
      if (e.pointerType === 'touch') return;
      ptrX = e.clientX;
      ptrY = e.clientY;
      if (!ptrRaf) ptrRaf = requestAnimationFrame(flushSpotlight);
    }, { passive: true });
    window.addEventListener('scroll', () => {
      if (ptrX > -1000 && !ptrRaf) ptrRaf = requestAnimationFrame(flushSpotlight);
    }, { passive: true });
    window.addEventListener('pointerdown', (e) => {
      const btn = e.target && e.target.closest && e.target.closest('[data-glow-btn]');
      if (!btn) return;
      btn.setAttribute('data-liquid-surge', 'true');
      setTimeout(() => { if (btn.isConnected) btn.removeAttribute('data-liquid-surge'); }, 320);
      const r = btn.getBoundingClientRect();
      let host = btn.querySelector(':scope > .liquid-btn-ripple-host');
      if (!host) {
        host = document.createElement('span');
        host.className = 'liquid-btn-ripple-host';
        btn.appendChild(host);
      }
      const rip = document.createElement('span');
      rip.className = 'liquid-btn-ripple';
      rip.style.left = ((e.clientX || r.left + r.width / 2) - r.left).toFixed(1) + 'px';
      rip.style.top = ((e.clientY || r.top + r.height / 2) - r.top).toFixed(1) + 'px';
      host.appendChild(rip);
      setTimeout(() => {
        rip.remove();
        if (host && host.childElementCount === 0 && host.isConnected) host.remove();
      }, 620);
    }, { passive: true });
  </script>
</body>
</html>`;

const outPath = path.join(rootDir, 'dev-studio.html');
fs.writeFileSync(outPath, html, 'utf8');
console.log(`Generated ${outPath} (${(fs.statSync(outPath).size / 1024).toFixed(1)} KB)`);
