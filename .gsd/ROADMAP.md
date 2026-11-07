---
milestone: DEV STUDIO v1.0 Production Release
version: 1.0.0
updated: 2026-11-07T13:16:00+05:30
---

# Roadmap — DEV STUDIO

> **Current Phase:** Wave 1 — Foundation, Content Source of Truth & Next.js Architecture
> **Status:** executing

## Must-Haves (from SPEC)

- [x] Phase 0 Environment Audit (`ENVIRONMENT_AUDIT.md`) & Google Drive recursive discovery (`251` Drive items scanned)
- [ ] Wave 1: Next.js + TypeScript + R3F + GSAP scaffold, `/content/*.json` source of truth, `scripts/sync-drive.ts` & `scripts/validate-assets.ts`, Resume PDF assets
- [ ] Wave 2: Actual 3D rigged character (`public/models/dev-character.glb`), Indian-English voiceover + ambient studio audio (`public/audio/*`), and Live 3D Editing Studio Hero (`three/` + `components/hero/`, `studio/`, `character/`, `audio/`)
- [ ] Wave 3: Server-side Google Drive HTTP `Range` streaming & thumbnail APIs (`/api/drive/*`), Cinema Video Player, Fixed Glass Navbar, Dual-Row Portfolio Marquee, and `/work` Complete Portfolio Explorer
- [ ] Wave 4: Editorial About Me (with real 3D floating artifacts & Resume PDF), High-Contrast Sliding White Services Sheet, Configurable Custom-Quote Pricing, Sticky Stacked Projects, GSAP Scroll Choreography
- [ ] Wave 5: Functional `/api/contact` & `/api/booking` backends (Zod + rate limit + honeypot + Resend/SMTP), Floating WhatsApp (`+919309425465`), Responsive Mobile Studio, Accessibility & SEO (`sitemap.ts`, `robots.ts`, JSON-LD)
- [ ] Wave 6: Unit, Integration, Build & Playwright E2E QA (`TESTING_REPORT.md`) + Full 8-Document Deployment & Operations Suite

---

## Phases

### Wave 1: Foundation, Content Pipeline & Next.js Scaffold
**Status:** 🔄 In Progress
**Objective:** Preserve legacy reference prototype cleanly, scaffold Next.js + TypeScript + Tailwind + Three.js/R3F + GSAP + Vitest + Playwright at `D:\Dev website`, populate `/content/*.json` from verified CV & Drive scan, and build `scripts/sync-drive.ts` + `scripts/validate-assets.ts`.

**Plans:**
- [ ] Plan 1.1: Archive initial static video-analysis prototype to `legacy-reference/` and initialize Next.js App Router project structure
- [ ] Plan 1.2: Generate `/content/{profile,services,projects,pricing,social-links,site-config}.json`, copy verified Resume PDFs & portrait assets, and implement `scripts/sync-drive.ts` + `scripts/validate-assets.ts`

---

### Wave 2: 3D Rigged Character, Audio Engine & Live 3D Editing Studio
**Status:** ⬜ Not Started
**Objective:** Build actual skeletal + morph-rigged `dev-character.glb` from `character sheet.png`, generate segmented Indian-English male voiceover + original studio ambience, and implement the interactive 3D Editing Studio hero with `"ENTER STUDIO / ENABLE SOUND"` gate, cursor tracking, blinking, gestures, and lip-sync.
**Depends on:** Wave 1

---

### Wave 3: Google Drive Streaming Backend, Cinema Player, Navbar, Marquee & `/work` Explorer
**Status:** ⬜ Not Started
**Objective:** Implement `/api/drive/stream/[fileId]` (`206 Partial Content` Range proxy + Drive `/preview` fallback) and `/api/drive/thumbnail/[fileId]`, custom Cinema Video Player modal, 3-column glass navbar, dual-row opposite marquee, and dedicated `/work` + homepage Portfolio Explorer.
**Depends on:** Wave 1

---

### Wave 4: Editorial Sections (About 3D, Sliding White Services, Pricing, Stacked Projects)
**Status:** ⬜ Not Started
**Objective:** Implement About Me with reactive 3D floating objects + Resume PDF button, rounded white Services sheet (`01`–`04` expandable rows with related Drive work), custom-quote Pricing pre-selecting Contact service, and GSAP ScrollTrigger sticky stacked Project cards.
**Depends on:** Wave 2, Wave 3

---

### Wave 5: Contact, WhatsApp, Booking, Responsive Mobile, A11y & SEO
**Status:** ⬜ Not Started
**Objective:** Build `/api/contact` and `/api/booking` with Zod, honeypot, IP rate limiter, and Resend/Nodemailer SMTP delivery to `kumawatrishi096@gmail.com`; add WhatsApp button (`+919309425465`), `Asia/Kolkata` booking workflow, mobile studio adaptation, reduced-motion support, JSON-LD `Person` schema, `sitemap.ts`, and `robots.ts`.
**Depends on:** Wave 4

---

### Wave 6: Comprehensive QA, Playwright E2E Suite & Documentation
**Status:** ⬜ Not Started
**Objective:** Run `tsc`, `eslint`, `vitest`, `next build`, and Playwright E2E across all 26 user journeys; visually inspect screenshots; fix all defects; produce `TESTING_REPORT.md` and all 8 operational guides + `.env.example`.
**Depends on:** Wave 5

---

## Progress Summary

| Wave | Status | Complete |
|------|--------|----------|
| 0 (Audit & Discovery) | ✅ | 100% |
| 1 | 🔄 | 0% |
| 2 | ⬜ | 0% |
| 3 | ⬜ | 0% |
| 4 | ⬜ | 0% |
| 5 | ⬜ | 0% |
| 6 | ⬜ | 0% |
