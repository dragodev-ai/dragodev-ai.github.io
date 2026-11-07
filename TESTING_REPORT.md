# Empirical Testing & QA Verification Report — DEV STUDIO

**Project**: DEV STUDIO — Immersive 3D Creative Portfolio (`Dev Kumawat`)  
**Verification Date**: 2026-11-07  
**Environment**: Windows, Node.js `v22.14.0`, Next.js `15.5.29`, React `19.2.9`, Three.js `0.175.0`, `@react-three/fiber` `9.8.2`, Vitest `3.2.7`, Playwright `1.51+` (Chromium `158.0.8127.18`)

---

## 1. Automated Verification Summary

Every verification gate was executed directly against the repository and production build with exit code `0`:

| Gate | Command | Result | Details |
| :--- | :--- | :--- | :--- |
| **Asset & Manifest Integrity** | `npm run validate:assets` | **PASS (`19/19`)** | Verified all 6 `/content/*.json` manifests, `dev-character.glb` (`1,347.5 KB`), Resume & Portfolio PDFs, studio portrait, 6 speech MP3s, ambient/music MP3s, and `intro-timings.json` |
| **TypeScript Strict Check** | `npm run typecheck` | **PASS (`0 errors`)** | `tsc --noEmit` across `app/`, `components/`, `three/`, `lib/`, `scripts/`, and `tests/` |
| **ESLint Verification** | `npm run lint` | **PASS (`0 warnings / 0 errors`)** | `next lint` (`✔ No ESLint warnings or errors`) |
| **Unit & Integration Suite** | `npm test` | **PASS (`11/11 tests`, `3.17s`)** | `tests/unit/content-and-validation.test.ts` (`7/7`) + `tests/integration/api-routes.test.ts` (`4/4`) |
| **Production Build** | `npm run build` | **PASS (`3.2s` compile)** | Static & dynamic App Router routes built cleanly (`/` First Load JS `182 kB`, `/work` `122 kB`) |
| **Playwright E2E Suite** | `npm run test:e2e` | **PASS (`10/10 specs`, `1.7m`)** | `5/5` Desktop (`1440x900`) + `5/5` Mobile (`Pixel 7`) end-to-end journeys covering all 26 required studio interactions |

---

## 2. Unit & Integration Test Evidence (`vitest run`)

### `tests/unit/content-and-validation.test.ts` (`7/7` Passed)
1. **Brand & Contact Integrity**: Confirms `Dev Kumawat`, `kumawatrishi096@gmail.com`, `Asia/Kolkata`, and `https://wa.me/919309425465?text=...`.
2. **Google Drive Category & Deduplication Check**: Confirms `232` unique public portfolio items across all `10` real Google Drive categories (`AD - Shoot`, `Advance Motion Graphics`, `AI- Artificial Intelligence`, `BRANDS`, `Govt. Projects`, `Graphics`, `INFLUENCERS`, `pictures`, `Pre Wed`, `TELEVISION BYTE`), blocks byte-identical duplicate `110EshC9ZKwgsV_wXM2ot78FVbe9jj2m_`, and allows approved portfolio video `15pG7_-tCMWDAEhK7Xb5SPhJVAiRJwR0A`.
3. **Configurable Custom-Quote Pricing**: Confirms all 4 packages use `"Custom Quote — Let's Discuss Your Project."` with zero fabricated rates and map cleanly to `siteConfigContent.enquiryServiceOptions`.
4. **3D Character Binary `.glb` Rig Inspection**: Parses `public/models/dev-character.glb` glTF 2.0 binary header and verifies `DevCharacterRig` skin (`24` joints) including `CharacterRoot`, `Hips`, `Chest`, `Neck`, `Head`, `Jaw`, `Eye_L`, `Eye_R`, `Eyelid_L`, `Eyelid_R`, `Brow_L`, `Brow_R`, and articulated left/right arms & hands.
5. **Contact Enquiry Schema Validation**: Rejects malformed emails/short payloads and accepts valid multi-field briefs.
6. **`Asia/Kolkata` Booking Schema Validation**: Validates IST discovery call requests strictly.
7. **Sliding-Window IP Rate Limiter**: Confirms burst blocking and `Retry-After` calculation.

### `tests/integration/api-routes.test.ts` (`4/4` Passed)
1. **`POST /api/contact` Validation (`400`)**: Confirms `VALIDATION_ERROR` and structured `fieldErrors` on invalid payloads.
2. **Honest Unconfigured Email Reporting (`503`)**: Confirms that when `RESEND_API_KEY` and `SMTP_HOST` are unset, `/api/contact` never fakes delivery and instead returns `503 EMAIL_PROVIDER_NOT_CONFIGURED` with a pre-filled `mailto:kumawatrishi096@gmail.com` fallback link.
3. **Live TCP Socket SMTP Delivery (`200`)**: Spins up an RFC-5321 local TCP ESMTP server on `127.0.0.1`, executes `POST /api/contact` and `POST /api/booking`, and proves Nodemailer transmits both formatted MIME emails directly to `RCPT TO:<kumawatrishi096@gmail.com>`.
4. **Live Google Drive `206 Partial Content` Streaming & Allowlist Enforcement**: Confirms unapproved IDs return `404` while `GET /api/drive/stream/15pG7_-tCMWDAEhK7Xb5SPhJVAiRJwR0A` with `Range: bytes=0-4095` returns `206 Partial Content` (`Content-Type: video/mp4`, `Content-Range: bytes 0-4095/...`) and `/api/drive/thumbnail/...` returns `200 image/jpeg`.

---

## 3. End-to-End Browser & Mobile Journeys (`playwright test`)

Executed against the compiled production server (`npm run start -- -p 3100`) across `chromium-desktop` (`1440x900`) and `mobile-chrome` (`Pixel 7`):

1. **Hero 3D Studio, Entry Audio Gate, Live Captions, Controls & Navigation** (`18.6s` Desktop / `13.4s` Mobile — **PASS**):
   - Zero uncaught `pageerror` exceptions and zero horizontal viewport overflow (`scrollWidth <= innerWidth`).
   - Interactive Three.js WebGL studio & rigged 3D character load cleanly behind browser-safe `"ENTER STUDIO / ENABLE SOUND"` gate.
   - Pointer movement drives smooth head/eye gaze tracking; clicking `"ENTER STUDIO / ENABLE SOUND"` reveals live synchronized captions, mute/unmute toggle, volume slider, and full text transcript popover.
   - Desktop 3-column glass navbar (`ABOUT` | `SERVICES · PRICE · PROJECTS · WORK ARCHIVE` | `CONTACT`) and Mobile hamburger touch drawer navigate accurately.
2. **Dual-Row Marquee, Cinema Video Player Modal, About Me & Verified Resume PDF** (`13.8s` Desktop / `6.5s` Mobile — **PASS**):
   - Dual-row opposite-direction marquee renders real Google Drive thumbnails; clicking a card opens `CinemaVideoPlayerModal` wired to `/api/drive/stream/<fileId>` with timeline seek, play/pause, mute/volume, retry, Drive fallback toggle, and fullscreen controls.
   - `ABOUT ME` renders verified Jaipur, `Mahanagar Times`, `MLA Dr. Gopal Sharma`, and `Rajasthan University` credentials alongside floating 3D metallic studio artifacts.
   - `RESUME (PDF)` button points to `/assets/Dev-Kumawat-Resume.pdf` and returns `200 OK` (`application/pdf`).
3. **White Editorial Services Sheet, Custom-Quote Pricing, Sticky Stacked Projects & Conversion Wiring** (`15.2s` Desktop / `8.0s` Mobile — **PASS**):
   - High-contrast `#F7F6F2` rounded white Services sheet expands/collapses capability groups `01`–`04` and displays matching Google Drive portfolio items.
   - Pricing cards display `"Custom Quote — Let's Discuss Your Project."`; clicking `"Monthly Social Media & Content Retainer"` pre-selects `"Monthly Social Media Package"` inside the Contact form's `Interested Service` dropdown.
   - Sticky stacked project cards render verified featured works with Drive source links.
4. **Dedicated `/work` Portfolio Explorer** (`6.8s` Desktop / `3.9s` Mobile — **PASS**):
   - Filters across real Google Drive categories (`Graphics` + subfolders `FOOD`, `COMPANY banners`, etc., and `AI- Artificial Intelligence`), instant search (`Podcast`), and Grid/List layout toggle.
5. **Contact Backend, Floating WhatsApp (`+91 9309425465`), IST Call Booking & `prefers-reduced-motion`** (`7.3s` Desktop / `3.1s` Mobile — **PASS**):
   - Floating WhatsApp button links to `https://wa.me/919309425465?text=...`.
   - Contact & `Asia/Kolkata` Booking forms validate invalid submissions and submit valid payloads cleanly under `reducedMotion: 'reduce'`.

---

## 4. Visual Inspection Fixes Applied During QA

Visual review of full-resolution desktop and mobile Playwright captures identified and resolved four polish items prior to final sign-off:
1. **glTF 2.0 Linear PBR Suit & Skin Calibration (`scripts/build-character-glb.py`)**: Converted `baseColorFactor` sRGB hex swatches (`#D7966B` skin, `#24242A` satin lapels, `#16161B` black shirt, `#131317` trousers) to exact glTF linear RGB values and sculpted smooth continuous satin lapels so the 3D character's black blazer and skin tones match the reference sheet cleanly.
2. **Expressive Open Eye Gaze (`three/models/DevCharacterModel.tsx`)**: Adjusted resting upper-eyelid angle to `-0.56 rad` so dark-brown irises and studio catchlights remain crisp between natural stochastic blinks.
3. **Zero HUD Overlap & High-Contrast Glass (`StudioHeroSection.tsx`, `FixedGlassNavbar.tsx`, `StudioAudioControls.tsx`)**: Positioned post-entry hero action pills cleanly beneath the hero display title and increased glass backdrop opacity (`90%–95%`) so navbar, audio dock, captions, and WhatsApp button never collide and remain 100% legible over the white `#F7F6F2` Services sheet.
4. **Mobile Viewport Containment & Upstream Thumbnail Cache**: Enforced `overflow-x: clip` + responsive `Syne` mobile heading scales (`Zero` overflow on `412px` Pixel 7) and set `cache: 'no-store'` on upstream Drive thumbnail fetches (while keeping HTTP `Cache-Control: public, max-age=86400`) to eliminate Next.js `>2MB` data-cache log warnings.

---

## 5. Production Deployment Checklist Items (External Secrets Only)

No code defects remain. When deploying to production (e.g., Vercel), configure:
1. `NEXT_PUBLIC_SITE_URL` → Your live `https://` domain.
2. `RESEND_API_KEY` (or `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`) + `EMAIL_FROM` → Enables live automated email dispatch to `kumawatrishi096@gmail.com` (until set, the UI transparently provides one-click pre-filled `mailto:` and WhatsApp fallback buttons).
3. *(Optional)* `GOOGLE_DRIVE_API_KEY` → Increases upstream Google Drive streaming quota for high-traffic launches.
4. *(Optional)* `NEXT_PUBLIC_CALENDLY_URL` → Switches Book-a-Call from the built-in `Asia/Kolkata` request form to an external live calendar embed if desired later.
