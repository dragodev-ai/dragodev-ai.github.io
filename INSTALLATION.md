# Installation & Local Development Guide

This guide walks through setting up **DEV STUDIO** locally on Windows, macOS, or Linux.

---

## 1. Prerequisites

### Required
- **Node.js**: `v20.x` or `v22.x` LTS (verified on `Node v22.14.0`)
- **npm**: `v10+` (bundled with Node.js)
- **Git**: `v2.40+`

### Optional (Only Needed If Regenerating Raw 3D `.glb` or Voiceover Audio Locally)
- **Python**: `3.11+` (`numpy`, `scipy`, `Pillow`, `edge-tts`) — used only by `scripts/build-character-glb.py` and `scripts/generate-studio-audio.py`. All generated assets (`public/models/dev-character.glb` and `public/audio/*`) are already built and committed in `public/`, so **Python is not required to run, build, or deploy the Next.js app**.
- **FFmpeg**: `v6+` — used only when re-mastering studio MP3 files via `scripts/generate-studio-audio.py`.

---

## 2. Step-by-Step Local Setup

### Step 1: Clone or Open the Repository
```bash
cd "D:/Dev website"
```

### Step 2: Install Node Dependencies
```bash
npm install
```

### Step 3: Create Local Environment File
Copy `.env.example` to `.env.local`:

**PowerShell (Windows):**
```powershell
Copy-Item .env.example .env.local
```

**macOS / Linux:**
```bash
cp .env.example .env.local
```

> **Note:** The portfolio, 3D studio, voiceover, WhatsApp CTA, and Google Drive video streaming work immediately out of the box without any secret keys. To enable live email delivery from the Contact and Book-a-Call forms, add either `RESEND_API_KEY` or `SMTP_HOST` / `SMTP_USER` / `SMTP_PASS` in `.env.local` (see [ENVIRONMENT_VARIABLES.md](./ENVIRONMENT_VARIABLES.md)).

### Step 4: Validate Studio Assets & Content Manifests
```bash
npm run validate:assets
```
Expected output: `All 19 asset checks passed!`

### Step 5: Start the Development Server
```bash
npm run dev
```
Open `http://localhost:3000` in Chrome, Edge, Safari, or Firefox.

---

## 3. Building for Production Locally

Always verify strict TypeScript, ESLint, and Next.js production compilation before deploying:

```bash
npm run typecheck
npm run lint
npm run build
npm run start
```

---

## 4. Running the Automated Test Suites

### Unit & Integration Tests (Vitest)
```bash
npm test
```
Runs:
- `tests/unit/content-and-validation.test.ts` (brand data integrity, Google Drive category mapping, duplicate exclusion, binary `.glb` joint hierarchy, Zod validation, and IP rate limiting).
- `tests/integration/api-routes.test.ts` (live local TCP SMTP email delivery to `kumawatrishi096@gmail.com` and live Google Drive `206 Partial Content` byte-range streaming).

### End-to-End Browser Tests (Playwright)
First-time browser installation:
```bash
npx playwright install chromium
```

Ensure a fresh production build exists, then run E2E tests across Desktop (`1440x900`) and Mobile (`Pixel 7`):
```bash
npm run build
npm run test:e2e
```

