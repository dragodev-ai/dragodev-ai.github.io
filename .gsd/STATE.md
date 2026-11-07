---
updated: 2026-11-07T13:16:00+05:30
---

# Project State — DEV STUDIO

## Current Position

**Milestone:** DEV STUDIO v1.0 Production Release
**Phase:** Wave 1 — Foundation, Content Source of Truth & Next.js Architecture
**Status:** executing
**Plan:** Plan 1.1 & Plan 1.2

## Last Action

Completed Phase 0 (`ENVIRONMENT_AUDIT.md`), extracted verified text & portrait from `DEV KUMAWAT CV.pdf` and `Dev Kumawat CV Portfolio.pdf`, recursively scanned Google Drive root `1fIRbUsJen8EHxLfdU5LXlmXJzk_FsztC` (`17` folders, `251` items: `92` videos + `141` images + `2` CV PDFs), empirically verified Google Drive HTTP `206 Partial Content` Range streaming & thumbnail endpoints, and finalized `.gsd/SPEC.md` (`Status: FINALIZED`).

## Next Steps

1. Archive earlier static reference prototype (`index.html`, `style.css`, `script.js`, `assets/`) into `legacy-reference/` and scaffold Next.js 15 + TypeScript + Tailwind CSS + Three.js/R3F + Drei + GSAP + Zod + Nodemailer + Vitest + Playwright at `D:\Dev website`.
2. Generate `/content/{profile,services,projects,pricing,social-links,site-config}.json`, copy verified Resume PDFs into `public/assets/`, and write `scripts/sync-drive.ts` + `scripts/validate-assets.ts`.
3. Build rigged 3D character (`public/models/dev-character.glb`), Indian-English voiceover + studio audio (`public/audio/*`), and the Live 3D Editing Studio hero.

## Active Decisions

| Decision | Choice | Made | Affects |
|----------|--------|------|---------|
| Spec Lock | `.gsd/SPEC.md` marked `FINALIZED` | 2026-11-07 | All Waves |
| Drive Video Delivery | Server-side `/api/drive/stream/[fileId]` forwarding `Range` headers to `drive.usercontent.google.com` (`206 Partial Content` verified) + allowlist check + Drive `/preview` iframe fallback for unsupported codecs (`.mov`) | 2026-11-07 | Wave 3 |
| 3D Hero Character | Actual glTF 2.0 `.glb` skeletal + morph-rigged model (`public/models/dev-character.glb`) built from `character sheet.png` & portrait textures with articulated eyes, eyelids, brows, jaw/mouth visemes, head/neck/spine, and gesturing arms; zero unpaid Magnific credit spend without prior user notice | 2026-11-07 | Wave 2 |
| Voiceover & Soundscape | `en-IN-PrabhatNeural` Indian-English male neural voiceover (`intro-01..05.mp3` + `intro-full.mp3` + exact `WordBoundary` caption/viseme JSON) + original synthesized ambient studio music & room tone + ElevenLabs/Magnific script support | 2026-11-07 | Wave 2 |

## Blockers

None — core build, real Drive streaming, 3D studio/character, and audio work offline/locally. Deployment secrets (`RESEND_API_KEY` / `SMTP_*`, optional `ELEVENLABS_API_KEY`, optional `NEXT_PUBLIC_CALENDLY_URL`) will be cleanly wired via `.env.example` and documented in `ENVIRONMENT_VARIABLES.md`.
