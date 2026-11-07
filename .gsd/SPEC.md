# SPEC.md — DEV STUDIO: Immersive 3D Creative Portfolio

> **Status**: `FINALIZED`
>
> ⚠️ **Planning Lock**: `Status: FINALIZED` — Approved for implementation across Waves 1–6.

## Vision
**DEV STUDIO** is a custom, agency-grade interactive 3D creative studio and client-acquisition portfolio for **Dev Kumawat** (Creative Director, Video Editor, Graphic Designer, Photographer, Videographer, AI Generalist, Social Media Manager, Prompt Engineer & Motion Graphics Creator based in Jaipur, Rajasthan, India). Instead of a flat template, visitors enter a physically lit virtual 3D video-editing suite, meet Dev's articulated 3D character modeled directly from his supplied character sheet and original portrait, listen to his spoken Indian-English studio welcome, explore 230+ real Google Drive portfolio assets (92 videos + 141 design/photo works) across his actual folder hierarchy with HTTP `Range` streaming, inspect his verified 8-year journey, services, and configurable custom-quote pricing, and convert via email enquiry (`kumawatrishi096@gmail.com`), WhatsApp (`+91 9309425465`), or `Asia/Kolkata` call booking.

## Goals
1. **Immersive 3D Studio & Rigged Character Hero** — Physically composed React Three Fiber editing suite (walnut/steel desk, ultrawide NLE timeline monitor, secondary live-video preview monitor, cinema camera & lenses, studio key/fill/rim lights, speakers, headphones, acoustic slat panels, leather chair) starring an actual `.glb` skeletal/morph-rigged 3D character of Dev (matching `character sheet.png` & portrait: `#D7966B` medium-brown skin, wavy `#1A0F0B` hair, moustache + subtle stubble, `#111111` matte black formal blazer & `#1A1A1A` black shirt) with pointer head/eye tracking (`lerp 0.08–0.18`), natural blinking, idle breathing, hand gestures, and audio-synchronized lip-sync.
2. **Browser-Safe Studio Audio & Voiceover** — Interactive `"ENTER STUDIO / ENABLE SOUND"` / `"ENTER MUTED"` entry gate, Indian-English male voiceover (`en-IN-PrabhatNeural` segmented & full tracks + ElevenLabs/Magnific upgrade pipeline) delivering Dev's exact introduction script with synchronized captions/transcript, original studio room ambience & subtle music ducking, mute toggle, and volume slider.
3. **Real Google Drive Portfolio Pipeline & Reliable Streaming** — Recursive sync (`scripts/sync-drive.ts`) from root folder `1fIRbUsJen8EHxLfdU5LXlmXJzk_FsztC` preserving all 10 real Drive categories (`AD - Shoot`, `Advance Motion Graphics`, `AI- Artificial Intelligence`, `BRANDS`, `Govt. Projects`, `Graphics`, `INFLUENCERS`, `pictures`, `Pre Wed`, `TELEVISION BYTE`) and nested subfolders without overwriting curated metadata, backed by `/api/drive/stream/[fileId]` (`206 Partial Content` HTTP `Range` streaming + allowlist security + embedded `/preview` fallback) and `/api/drive/thumbnail/[fileId]`.
4. **Editorial Narrative & Conversion Architecture** — Balanced 3-column fixed glass navbar, dual-row opposite-direction portfolio marquee, editorial `ABOUT ME` with reactive 3D artifacts (crescent moon, 3D smiley, geometric arrow, creative brick, metallic forms) and verified Resume PDF download (`/assets/Dev-Kumawat-Resume.pdf`), sliding rounded white `SERVICES` sheet (`01`–`04` expandable capabilities + matching Drive projects), configurable `PRICING` (`"Custom Quote — Let's Discuss Your Project."`) pre-filling Contact service selection, sticky stacked `PROJECTS` cards, full `/work` Portfolio Explorer, and functional `/api/contact` + `/api/booking` + floating WhatsApp (`+919309425465`).
5. **Production Performance, Accessibility, SEO & Empirical QA** — Adaptive WebGL DPR, visibility pause, WebGL-unavailable fallback, `prefers-reduced-motion` support, dedicated mobile studio layout, semantic ARIA/keyboard accessibility, JSON-LD `Person` schema, Open Graph/sitemap/robots, unit + integration + Playwright E2E verification, and complete 8-file operational documentation suite.

## Non-Goals (Out of Scope)
- Fabricating client names, awards, metrics, testimonials, company roles, education, fixed prices, or fake calendar time slots.
- Relying on Dev's legacy broken Wix URL (`fires21366.wixsite.com/freelancerphotograph`) as a portfolio data source.
- Using a flat 2D `<img>` cutout of `character sheet.png` as the primary hero character in place of an actual 3D `.glb` model.
- Autoplaying unmuted audio prior to explicit user interaction.
- Exposing server credentials (`RESEND_API_KEY`, `SMTP_*`, `GOOGLE_*`, `ELEVENLABS_API_KEY`) in client bundles or git history.
- Deploying an unauthenticated public admin dashboard.

## Constraints
- **Art Direction & Craft Floor**: Near-black charcoal (`#070709`), dark graphite (`#111116`), controlled violet/purple/magenta (`#7C3AED` / `#9333EA` / `#C026D3`) accents, warm amber (`#F59E0B`) practical studio key lighting + cool rim lighting, contrasted by the crisp alabaster-white (`#F7F6F2`) editorial Services sheet (`#0A0A0C` ink). Zero generic AI-slop gradients or random decorative glass clutter.
- **Content Separation**: All personal data, services, projects, pricing, socials, and site configuration live in `/content/*.json` (`profile.json`, `services.json`, `projects.json`, `pricing.json`, `social-links.json`, `site-config.json`).
- **Verified Identity Only**:
  - Name: Dev Kumawat | Location: Jaipur, Rajasthan, India (`Asia/Kolkata`)
  - Email: `kumawatrishi096@gmail.com` | Phone/WhatsApp: `+91 9309425465` (`https://wa.me/919309425465`)
  - Instagram: `@lenswithdragodev` (`https://www.instagram.com/lenswithdragodev`) & `@dragodev`
  - Education: Bachelor's in Science, Rajasthan University (`2017 – 2021`) + photography/videography internships
  - Experience: `8+` Years Experience, `18+` Brands Collaborated (`21+` institutional/brand collaborations pictured on CV), `500+` Projects Delivered, `100+` Client Shoots; Creative Director & Photographer (Freelance, 8 yrs); Mahanagar Times News Agency (2 yrs — creative shoots, podcasts, interviews, post-production); Campaign content for Civil Lines MLA Dr. Gopal Sharma.

## Success Criteria
- [x] `ENVIRONMENT_AUDIT.md` verified and written with live tool/MCP status.
- [ ] `/content/{profile,services,projects,pricing,social-links,site-config}.json` populated with 100% verified resume & Google Drive data (`230+` real items, zero duplicates/fabrications).
- [ ] Actual rigged `.glb` 3D character (`public/models/dev-character.glb`) and 3D editing studio hero load, animate, track cursor smoothly (`lerp 0.08–0.18`), blink, gesture, and lip-sync to Dev's spoken introduction.
- [ ] `"ENTER STUDIO / ENABLE SOUND"` gate plays real Indian-English male voiceover + original studio soundscape with captions, mute, and volume controls.
- [ ] `/api/drive/stream/[fileId]` serves HTTP `206 Partial Content` Range video streams for real Drive videos; Cinema Video Player supports play/pause, seek, volume, mute, fullscreen, retry, and Drive preview fallback.
- [ ] Dual-row marquee, About Me (with 3D floating objects + working Resume PDF download), sliding white Services sheet (`01`–`04`), custom-quote Pricing, sticky stacked Projects, and `/work` Portfolio Explorer (category/subcategory filters, search, sort, grid/list toggle) work across desktop, tablet, and mobile.
- [ ] `/api/contact` and `/api/booking` validate inputs, block spam/rate-abuse, deliver via configured Resend/SMTP transport to `kumawatrishi096@gmail.com` (and report transport configuration transparently), alongside working WhatsApp deep link (`+919309425465`).
- [ ] `tsc --noEmit`, `npm run lint`, `npm test` (Vitest), `npm run build`, and `npx playwright test` pass with empirical output recorded in `TESTING_REPORT.md`.
- [ ] Complete documentation suite (`README.md`, `INSTALLATION.md`, `DEPLOYMENT.md`, `GOOGLE_DRIVE_SETUP.md`, `AUDIO_SETUP.md`, `CONTENT_MANAGEMENT.md`, `ENVIRONMENT_VARIABLES.md`, `TESTING_REPORT.md`, `.env.example`) created.

## Technical Requirements

| Requirement | Priority | Stack / Implementation |
|-------------|----------|------------------------|
| Framework & Language | Must-have | Next.js 15 (App Router), React 19, TypeScript 5 (strict) |
| 3D & Shaders | Must-have | Three.js, `@react-three/fiber`, `@react-three/drei`, custom glTF 2.0 `.glb` skeletal character & PBR studio scene |
| Motion & Scroll | Must-have | GSAP 3 + `ScrollTrigger`, CSS hardware-accelerated marquee, `prefers-reduced-motion` compliance |
| Styling & Typography | Must-have | Tailwind CSS + `next/font/google` (`Syne` / `Bebas Neue` editorial display + `Plus Jakarta Sans` body + `JetBrains Mono` timecode/hud) |
| Backend & Validation | Must-have | Next.js Route Handlers (`app/api/drive/stream/[fileId]`, `app/api/drive/thumbnail/[fileId]`, `app/api/contact`, `app/api/booking`), `zod`, `nodemailer` / Resend HTTP API |
| Automated QA | Must-have | `vitest` (unit + API route integration) & `@playwright/test` (26 end-to-end user journeys + a11y checks) |

---

*Last updated: 2026-11-07T13:16:00+05:30*
