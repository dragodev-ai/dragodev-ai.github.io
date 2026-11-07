# ENVIRONMENT AUDIT — DEV STUDIO

**Project:** DEV STUDIO — Immersive 3D Creative Portfolio (Dev Kumawat)  
**Audit Timestamp:** 2026-11-07T13:11:00+05:30  
**Operating System & Shell:** Windows (`win32`), PowerShell  
**Workspace:** `D:\Dev website`

> Every entry in this audit reflects live verification executed in the current Antigravity workspace. Nothing is marked installed or working without empirical verification.

---

## 1. Required Capability Matrix (Phase 0.1)

| Category | Installed | Working | Action |
| :--- | :--- | :--- | :--- |
| **UI/UX Skills** | Yes (`impeccable`, `frontend-design`, `design-taste-frontend`, `landing-page-design`, `emil-design-eng`, `antigravity-design-expert`, `design-system`, `gsd-ui-phase`, `gsd-ui-review`) | Verified (`SKILL.md` & `craft-floor.md` loaded; synced `impeccable` to `.agents/skills/`) | Ready — apply studio craft-floor & anti-AI-slop rules |
| **3D/Blender** | `magnific` 3D MCP (`models3d_generate`, `models3d_rig`, `models3d_animate`, `scene3d_*`) + `3d-web-experience` & `3d-website-architect` skills installed; local `blender.exe` **not** installed | `magnific` 3D catalog verified (`13` active engines incl. `tripo-v31`, `tripo-p2`, `hunyuan-v3.1-pro`, `meshy-7.1`, `hi3d-portrait-v2.1`); local Blender CLI unavailable | Use procedural glTF/GLB skeletal builder + `magnific` 3D MCP (with user credit confirmation) + R3F PBR studio geometry |
| **Three.js** | Skills installed (`3d-web-experience`, `threejs-animation`, `shader-glsl`); Node.js `v24.19.0` & `npm 11.17.0` verified | Runtime verified; project `package.json` to be scaffolded in Phase 14 | Install `three`, `@types/three`, `@react-three/fiber`, `@react-three/drei` in Next.js app |
| **Animation** | Skills installed (`gsap-web`, `antigravity-ui-motion-design-expert`, `motion-designer`, `motionsites` MCP) | Verified (`motionsites` MCP authenticated; GSAP patterns loaded) | Install `gsap` (`ScrollTrigger`) in Next.js app; enforce `prefers-reduced-motion` |
| **Video Processing** | `ffmpeg` (`9.0.2-full_build`), Python `3.12` (`opencv-python`, `Pillow`, `pymupdf`), `ffmpeg` skill | Verified (`ffmpeg -version` & frame extraction tested) | Ready — use server-side HTTP `Range` streaming proxy + FFmpeg/Canvas poster support |
| **Audio** | `edge-tts` (`en-IN-PrabhatNeural` Indian-English male neural voice + exact `WordBoundary` timing), `scipy`/`soundfile` synth engine, `elevenlabs` skill + `magnific` Audio MCP (`audio_tts` w/ ElevenLabs `eleven_v3`/`eleven_v4`); `ELEVENLABS_API_KEY` env var not set locally | Verified (`en-IN-PrabhatNeural` listed & tested; `magnific` `simulate_cost` `96` credits TTS, `80` credits music) | Ready — generate segmented & full Indian-English male voiceover + original studio soundscape locally; support `ELEVENLABS_API_KEY` & user-approved `magnific` upgrade |
| **Backend** | Skills installed (`nextjs-app-router-patterns`, `api-design-principles`, `backend-security-coder`, `typescript-pro`); Node `v24.19.0` | Verified | Scaffold Next.js App Router API routes (`/api/drive/*`, `/api/contact`, `/api/booking`) with Zod + Resend/Nodemailer SMTP |
| **Google Drive** | `gdrive` CLI plugin (`cl/1013145354`) + `google-drive` & `gws-drive` skills installed | Verified live (`17` folders, `251` items scanned; `206 Partial Content` HTTP `Range` streaming & `200 image/jpeg` thumbnails verified) | Ready — generate `/content/projects.json` + `scripts/sync-drive.ts` + server-side `/api/drive/stream/[fileId]` |
| **Browser Automation** | `chrome-devtools` MCP + `puppeteer` / `puppeteer-automation` skills installed | `chrome-devtools` autoConnect inactive (targets Chrome `DevToolsActivePort`, whereas host runs Edge); local Chromium/Edge binary available | Install `@playwright/test` in project for deterministic headless/headed E2E & accessibility verification |
| **Testing** | Skills installed (`tdd`, `test-driven-development`, `empirical-validation`, `verification-before-completion`, `a11y-debugging`, `systematic-debugging`) | Verified | Install `vitest`, `@playwright/test`, `eslint`, and `typescript` in Next.js workspace and run full suite |

---

## 2. Skills Audit & Activation (Phase 0.2)

### 2.1 Requested Skill Repositories
1. **Superpowers (`obra/superpowers`)**  
   - **Status:** Installed globally (`C:\Users\Rishiii\.gemini\config\plugins\superpowers\skills\` and `C:\Users\Rishiii\.gemini\config\skills\`).  
   - **Verified Workflows:** `using-superpowers`, `brainstorming`, `writing-plans`, `subagent-driven-development`, `dispatching-parallel-agents`, `test-driven-development`, `systematic-debugging`, `requesting-code-review`, `verification-before-completion`.
2. **Matt Pocock Skills (`mattpocock/skills`)**  
   - **Status:** Verified and synced directly into workspace `.agents/skills/`:
     - `grill-me` (via `grilling`)
     - `to-spec` / `gsd-spec-phase`
     - `writing-plans`
     - `tdd`
     - `diagnosing-bugs`
     - `code-review`
     - `codebase-design` / `domain-modeling`
     - `writing-for-agents`
3. **Impeccable (`pbakaus/impeccable`)**  
   - **Status:** Installed globally and synced into `D:\Dev website\.agents\skills\impeccable\`.  
   - **Verified Reference:** `impeccable/SKILL.md` and `impeccable/reference/craft-floor.md` loaded and active for typography, contrast, layout rhythm, and anti-generic-template polish.
4. **Bounded Iterative Execution Loops (Ralph-style / GSD)**  
   - **Status:** Active via workspace GSD infrastructure (`PROJECT_RULES.md`, `.gsd/SPEC.md`, `.gsd/ROADMAP.md`, `.gsd/STATE.md`, `.agents/skills/executor`, `.agents/skills/verifier`, `.agents/skills/empirical-validation`).  
   - **Guardrail:** Strictly bounded task waves with empirical proof gates (`tsc`, `lint`, `vitest`, `playwright`, `next build`); zero unbounded or infinite loops.
5. **Domain-Specific Technical Skills Verified**
   - **3D / WebGL / R3F:** `3d-web-experience`, `3d-website-architect`, `threejs-animation`, `shader-glsl`
   - **Motion / GSAP:** `gsap-web`, `antigravity-ui-motion-design-expert`, `motionsites`, `emil-design-eng`
   - **React / Next.js / TypeScript:** `nextjs-app-router-patterns`, `frontend-developer`, `frontend-expert`, `react-modernization`, `typescript-pro`
   - **Google Drive & Media:** `gdrive` plugin CLI, `google-drive`, `ffmpeg`, `elevenlabs`
   - **Security, A11y & QA:** `backend-security-coder`, `frontend-security-coder`, `a11y-debugging`, `empirical-validation`

---

## 3. Subagent & Runtime Capabilities

- **Native Subagents Available (`invoke_subagent`):**
  - `self` (full tool inheritance)
  - `research` (read-only exploration)
  - `image-generator` (visual asset generation/editing)
  - `gsd-researcher`, `gsd-planner`, `gsd-executor`, `gsd-verifier`, `gsd-debugger`
- **Verified Local Runtimes & CLIs:**
  - `node`: `v24.19.0`
  - `npm`: `11.17.0`
  - `python`: `3.12` (with `pymupdf` / `fitz`, `pypdf`, `Pillow`, `opencv-python`, `numpy`)
  - `git`: Installed and initialized in `D:\Dev website\.git`
  - `ffmpeg`: `9.0.2-full_build` (`Gyan.FFmpeg`)
  - `gdrive`: `cl/1013145354` (authenticated)
  - **Not Installed Locally:** `blender`, `docker`, `gh`, `vercel` CLI, `pnpm`/`bun`

---

## 4. MCP Server Discovery & Live Verification (Phase 0.3)

| MCP Server | Category | Connection Status | Live Verification Result | Project Role |
| :--- | :--- | :--- | :--- | :--- |
| **`magnific`** | 3D, Audio (ElevenLabs TTS & Lyria Music), Image, Video | **Connected & Authenticated** | `account_balance`: Plus plan (`5,210` credits available; `unlimitedAppliesHere: false` — requires notifying user before paid calls). `models3d_models_list`: 13 active 3D engines. `audio_voices_list`: Indian-English male voices (`1262`, `1213`, `872`, `1381`) available. | Optional/user-approved high-res 3D mesh/rig & ElevenLabs voiceover generation (`simulate_cost` verified: `1035` 3D + `580` rig + `96` TTS + `80` music credits) |
| **`motionsites`** | Motion & UI Design Reference | **Connected & Authenticated** | `my_account`: Free plan active (`3/3` free MCP prompt lookups remaining) | Motion choreography & layout inspiration |
| **`gdrive` (Plugin CLI)** | Google Drive Portfolio Integration | **Connected & Authenticated** | `gdrive readonly ls 1fIRbUsJen8EHxLfdU5LXlmXJzk_FsztC --json` succeeded; listed all 10 root portfolio folders + CV PDFs + root banner video | Primary Google Drive recursive scanner & metadata sync source |
| **`chrome-devtools`** | Browser Debugging | **Installed / Target Disconnected** | `list_pages` returned `Could not find DevToolsActivePort` (looks for Chrome profile while host uses Microsoft Edge) | Replaced for automated QA by project-local **Playwright** (`@playwright/test`) |
| **`hermes`** | Messaging Channels | **Connected** | `channels_list` returned `{"count": 0, "channels": []}` | Not used (no messaging channels configured; not applicable to visitor portfolio) |
| **`rea`** | Reverse Engineering | **Connected** | `binary_session` responded cleanly | Not required for portfolio build |
| **`github-mcp-server`** | GitHub | **Unavailable (Requires Docker)** | Configured in `mcp_config.json` via `docker`, which is not installed on Windows host | Replaced by native local `git` CLI |
| **`netlify_netlify`** | Deployment | **Unauthenticated** | Reported waiting on sign-in via `list_plugin_accounts` | Not required — preparing Next.js standard deployment for Vercel / Node hosting |

---

## 5. External Credentials & Environment Status

| Variable / Secret | Local Environment Status | Handling Strategy |
| :--- | :--- | :--- |
| **Google Drive Portfolio Folder** | Provided (`1fIRbUsJen8EHxLfdU5LXlmXJzk_FsztC`) | Publicly shared portfolio folder scanned recursively via `gdrive` CLI; streamed safely via Next.js `/api/drive/stream/[fileId]` with HTTP `Range` + embedded preview fallback |
| **`RESEND_API_KEY` / `SMTP_*`** | Not set in current OS env | Full server-side Resend + Nodemailer SMTP transport built in `/api/contact` & `/api/booking` targeting `kumawatrishi096@gmail.com`; clearly reports missing secret in dev/deployment status without faking delivery |
| **`ELEVENLABS_API_KEY`** | Not set in current OS env | Supported in `scripts/` & `AUDIO_SETUP.md`; `magnific` MCP also provides ElevenLabs `eleven_v3`/`eleven_v4` (`96` credits upon user approval), alongside local synthesized studio audio & synchronized speech/caption engine |
| **`NEXT_PUBLIC_CALENDLY_URL`** | Optional / Not yet set | `/content/site-config.json` & Booking component support live Calendly embed/link when set, defaulting cleanly to the real `Asia/Kolkata` Meeting Request workflow without inventing fake time slots |
