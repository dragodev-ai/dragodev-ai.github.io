# DEV STUDIO — Creative Portfolio

**DEV STUDIO** is the interactive creative portfolio web application for **Dev Kumawat** — Creative Director, Video Editor, Motion Graphics Creator, Graphic Designer, Commercial Photographer/Videographer, AI Generalist, and Prompt Engineer based in **Jaipur, Rajasthan, India**.

Visitors experience Dev's **52-second Full-HD Showcase Hero Film (`DEV_KUMAWAT_SAAS_WEB.mp4`)** with one-click voiceover sound, timeline scrubbing, and replay controls, stream **230+ verified portfolio works** directly from his Google Drive archive via an HTTP `Range` (`206 Partial Content`) proxy, and convert via a server-side Contact backend, WhatsApp deep link (`+91 9309425465`), or `Asia/Kolkata` Discovery Call workflow.

---

## Live Architecture & Capabilities

- **Full-HD Showcase Video Hero (`components/hero/VideoHeroSection.tsx`, `public/videos/DEV_KUMAWAT_SAAS_WEB.mp4`)**:
  - Web-optimized `-movflags +faststart` `1920×1080` showcase hero film with instant muted autoplay, one-click **Enable Sound / Sound On** voiceover toggle, Play/Pause, `Replay 0:00`, interactive timeline scrubber, Fullscreen support, and automatic pause coordination whenever a portfolio video modal opens.
- **Google Drive Portfolio Sync & HTTP Range Streaming (`scripts/sync-drive.ts`, `app/api/drive/`)**:
  - Synced against Dev's working Google Drive root folder (`1fIRbUsJen8EHxLfdU5LXlmXJzk_FsztC`) across all **10 real categories** (`AD - Shoot`, `Advance Motion Graphics`, `AI- Artificial Intelligence`, `BRANDS`, `Govt. Projects`, `Graphics` + 5 subfolders, `INFLUENCERS`, `pictures`, `Pre Wed`, `TELEVISION BYTE`, plus `Studio Showcase`).
  - `/api/drive/stream/[fileId]` validates against the approved portfolio allowlist and forwards HTTP `Range` headers for instant `206 Partial Content` MP4 seeking, with automatic Google Drive `/preview` embed fallback for `.mov` (`video/quicktime`) assets.
  - `/api/drive/thumbnail/[fileId]` caches Drive thumbnails (`Cache-Control: public, max-age=86400`) with a dark studio SVG fallback.
- **Editorial Sections & Conversion System (`components/`)**:
  - **Fixed 3-Column Glass Navbar**: `ABOUT` | `SERVICES · PRICE · PROJECTS · WORK ARCHIVE` | `CONTACT` + mobile touch drawer.
  - **Dual-Row Opposite-Direction Infinite Marquee**: Seamless loop of real Drive thumbnails opening the custom **Cinema Video Player Modal**.
  - **Editorial About Me**: Verified credentials (`Mahanagar Times`, `Dr. Gopal Sharma` campaign team, `University of Rajasthan`), floating 3D artifacts scene, and one-click **Resume PDF** download (`/assets/Dev-Kumawat-Resume.pdf`).
  - **High-Contrast White Services Sheet**: GSAP scroll-lifted rounded white sheet (`#F7F6F2`) with expandable `01`–`04` capability rows and live Drive category samples.
  - **Configurable Custom-Quote Pricing**: Non-fabricated `"Custom Quote — Let's Discuss Your Project."` packages wired directly into the Contact service selector.
  - **Sticky Stacked Featured Projects & Dedicated `/work` Archive**: Category/subfolder tabs, instant search, media-type filter, sort selector, Grid/List toggle, and incremental lazy loading.
  - **Server-Side Contact & `Asia/Kolkata` Call Booking**: `/api/contact` and `/api/booking` with Zod validation, honeypot spam protection, sliding-window IP rate limiting, Resend HTTP API + Nodemailer SMTP transport to `kumawatrishi096@gmail.com`, and floating WhatsApp CTA (`+91 9309425465`).

---

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Copy environment template and configure optional email/API keys
cp .env.example .env.local

# 3. Validate 3D model, audio, resume PDF, and content manifests
npm run validate:assets

# 4. Start local development server (http://localhost:3000)
npm run dev
```

---

## Available Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts Next.js 15 development server at `http://localhost:3000` |
| `npm run build` | Builds optimized production bundle |
| `npm run start` | Runs compiled production server |
| `npm run typecheck` | Runs strict TypeScript compiler check (`tsc --noEmit`) |
| `npm run lint` | Runs Next.js ESLint rules (`next lint`) |
| `npm test` | Executes Vitest unit & integration suites (`vitest run`) |
| `npm run test:e2e` | Executes Playwright desktop & mobile E2E suite (`playwright test`) |
| `npm run sync:drive` | Re-scans Google Drive portfolio folder without overwriting curated fields |
| `npm run validate:assets` | Verifies `.glb` binary integrity, audio tracks, PDFs, and JSON schemas |

---

## Project Structure

```text
├── app/
│   ├── api/
│   │   ├── booking/route.ts                # POST /api/booking (IST call requests)
│   │   ├── contact/route.ts                # POST /api/contact (project enquiries)
│   │   └── drive/
│   │       ├── stream/[fileId]/route.ts    # HTTP Range 206 video stream proxy
│   │       └── thumbnail/[fileId]/route.ts # Cached Drive thumbnail proxy + SVG fallback
│   ├── work/page.tsx                       # Dedicated /work full portfolio explorer
│   ├── globals.css                         # Studio design tokens & marquee keyframes
│   ├── layout.tsx                          # Fonts, Open Graph, canonical, JSON-LD Person
│   ├── page.tsx                            # Primary immersive studio landing page
│   ├── robots.ts                           # Search crawler rules
│   └── sitemap.ts                          # Dynamic XML sitemap
├── components/
│   ├── about/AboutSection.tsx
│   ├── audio/StudioAudioControls.tsx
│   ├── contact/{ContactAndBookingSection,FloatingWhatsAppButton}.tsx
│   ├── hero/StudioHeroSection.tsx
│   ├── marquee/PortfolioMarquee.tsx
│   ├── navigation/{FixedGlassNavbar,StudioFooter}.tsx
│   ├── portfolio/{CinemaVideoPlayerModal,PortfolioExplorer}.tsx
│   ├── pricing/PricingSection.tsx
│   ├── projects/StackedProjectsSection.tsx
│   └── services/ServicesSection.tsx
├── content/                                # Decoupled JSON source of truth
│   ├── pricing.json
│   ├── profile.json
│   ├── projects.json
│   ├── services.json
│   ├── site-config.json
│   └── social-links.json
├── lib/
│   ├── audio/studio-audio-context.tsx      # Web Audio FFT lip-sync, ducking & modal state
│   ├── content/{index,types}.ts            # Typed content loaders & allowlist helpers
│   ├── email/mailer.ts                     # Resend HTTP + Nodemailer SMTP transport
│   ├── google-drive/stream.ts              # Google Drive Range upstream fetcher
│   └── validation/{rate-limit,schemas}.ts  # Zod schemas & IP sliding-window limiter
├── public/
│   ├── assets/                             # Verified Resume PDF, Portfolio PDF & portraits
│   ├── audio/                              # Studio voiceover MP3s, timings JSON & ambience
│   └── models/dev-character.glb            # Rigged 3D character glTF 2.0 binary
├── scripts/
│   ├── build-character-glb.py              # Procedural rigged 3D character builder
│   ├── generate-elevenlabs-audio.mjs       # Optional ElevenLabs TTS generator
│   ├── generate-studio-audio.py            # Neural voice + ffmpeg studio audio generator
│   ├── sync-drive.ts                       # Non-destructive Google Drive folder sync
│   └── validate-assets.ts                  # Pre-build binary & manifest validator
├── tests/
│   ├── unit/content-and-validation.test.ts # Content integrity, GLB rig, Zod & rate-limit tests
│   ├── integration/api-routes.test.ts      # Live TCP SMTP & Google Drive 206 Range tests
│   └── e2e/dev-studio.spec.ts              # Full Playwright Desktop & Mobile E2E journeys
└── three/
    ├── lighting/StudioLighting.tsx
    ├── models/{DevCharacterModel,EditingSuiteProps}.tsx
    └── scenes/{AboutArtifactsScene,EditingStudioScene}.tsx
```

---

## Operations & Maintenance Guides

- [INSTALLATION.md](./INSTALLATION.md) — Local environment setup, dependencies, and asset regeneration
- [DEPLOYMENT.md](./DEPLOYMENT.md) — Production deployment on Vercel or Node/VPS
- [GOOGLE_DRIVE_SETUP.md](./GOOGLE_DRIVE_SETUP.md) — Managing Drive folders, videos, and running `npm run sync:drive`
- [AUDIO_SETUP.md](./AUDIO_SETUP.md) — Updating Dev's spoken voiceover, ElevenLabs integration, and studio ambience
- [CONTENT_MANAGEMENT.md](./CONTENT_MANAGEMENT.md) — Editing profile, pricing, services, resume PDF, and featured projects via JSON
- [ENVIRONMENT_VARIABLES.md](./ENVIRONMENT_VARIABLES.md) — Complete reference for `.env.local` / production secrets
- [TESTING_REPORT.md](./TESTING_REPORT.md) — Empirical verification results across compiler, unit, integration, and E2E suites
- [ENVIRONMENT_AUDIT.md](./ENVIRONMENT_AUDIT.md) — Phase 0 toolchain, skill, and MCP audit

