# Production Deployment Guide

**DEV STUDIO** is architected as a standard **Next.js 15 App Router** application with Route Handlers (`app/api/*`), making **Vercel** the primary zero-configuration deployment target, while remaining 100% compatible with any Node.js VPS, Railway, Render, or Docker container.

---

## Option A: Recommended Deployment on Vercel

### 1. Push Repository to GitHub
Push the repository to a private or public GitHub repository (never commit `.env.local` — `.gitignore` blocks `.env*` files automatically while keeping `.env.example`).

### 2. Import Project into Vercel
1. Open [https://vercel.com/new](https://vercel.com/new) and select your GitHub repository.
2. Framework Preset: **Next.js** (auto-detected).
3. Build Command: `npm run build`
4. Output Directory: `.next` (default)
5. Install Command: `npm install`
6. Node.js Version: `20.x` or `22.x`

### 3. Configure Production Environment Variables
In **Vercel Project Settings → Environment Variables**, configure:

| Variable | Value | Required? |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_SITE_URL` | Your live production domain (e.g., `https://devkumawat.com`) | **Yes** (for SEO canonicals, Open Graph, `sitemap.xml`, `robots.txt`) |
| `CONTACT_EMAIL` | `kumawatrishi096@gmail.com` | **Yes** |
| `RESEND_API_KEY` | `re_...` (from [resend.com](https://resend.com)) | **Recommended** (or configure `SMTP_*` instead) |
| `EMAIL_FROM` | Verified sender address, e.g. `DEV STUDIO <studio@yourdomain.com>` | **Recommended** when using Resend/SMTP |
| `SEND_VISITOR_CONFIRMATION` | `true` | Optional |
| `GOOGLE_DRIVE_ROOT_FOLDER_ID` | `1fIRbUsJen8EHxLfdU5LXlmXJzk_FsztC` | Pre-configured default |
| `GOOGLE_DRIVE_API_KEY` | `AIza...` | Optional (increases Google Drive upstream quota) |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | `919309425465` | Pre-configured default |
| `NEXT_PUBLIC_CALENDLY_URL` | Leave empty for built-in IST Call Request form, or set Calendly URL | Optional |

See [ENVIRONMENT_VARIABLES.md](./ENVIRONMENT_VARIABLES.md) for the complete variable reference.

### 4. Deploy & Verify
Click **Deploy**. Once live, verify:
1. `/` loads the 3D studio hero and `"ENTER STUDIO / ENABLE SOUND"` gate.
2. Clicking a portfolio video streams `206 Partial Content` from `/api/drive/stream/<fileId>`.
3. `/assets/Dev-Kumawat-Resume.pdf` downloads cleanly.
4. Submitting the Contact or Book-a-Call form delivers an email directly to `kumawatrishi096@gmail.com`.
5. `/sitemap.xml` and `/robots.txt` reflect your `NEXT_PUBLIC_SITE_URL`.

---

## Option B: Self-Hosted Node.js Server / VPS (PM2 or Systemd)

If hosting on Ubuntu/Debian VPS behind Nginx or Caddy:

```bash
npm ci
npm run validate:assets
npm run build
PORT=3000 NODE_ENV=production npm run start
```

### Reverse Proxy Notes for Video Streaming (`/api/drive/stream/[fileId]`)
- Keep proxy response buffering **disabled** (`proxy_buffering off;` in Nginx) on `/api/drive/stream/` so HTTP `Range` (`206 Partial Content`) video chunks stream directly to the browser with instant timeline scrubbing and minimal server RAM usage.
- Caddy streams chunked/range responses natively with zero extra configuration.

---

## Custom Domain & DNS Checklist
1. Point your apex domain (`@`) and `www` to Vercel (or your reverse proxy IP).
2. Update `NEXT_PUBLIC_SITE_URL` to match the final `https://` domain and trigger a redeploy so JSON-LD `Person` schema, Open Graph tags, and `sitemap.xml` use the exact production URL.
3. If using **Resend** or **SMTP**, verify your domain's `SPF` and `DKIM` DNS records so studio enquiries land in the primary inbox of `kumawatrishi096@gmail.com`.

