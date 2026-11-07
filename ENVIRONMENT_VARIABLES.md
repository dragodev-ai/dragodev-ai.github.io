# Environment Variables Reference

Copy `.env.example` to `.env.local` for local development, and configure production secrets in your hosting provider's dashboard (e.g., **Vercel → Settings → Environment Variables**).

> **Security Rule:** Never commit `.env`, `.env.local`, or `.env.production` to git. Never prefix private API keys, OAuth secrets, or SMTP passwords with `NEXT_PUBLIC_`.

---

## Complete Variable Reference

### 1. Site & SEO Configuration

| Variable | Default | Exposure | Description |
| :--- | :--- | :--- | :--- |
| `NEXT_PUBLIC_SITE_URL` | `http://localhost:3000` | Public | Base canonical URL used to generate Open Graph URLs, JSON-LD `Person` schema, `sitemap.xml`, and `robots.txt`. Set to your `https://` domain in production. |

---

### 2. Contact & Booking Email Delivery (`/api/contact`, `/api/booking`)

Configure **either** **Option A (Resend)** or **Option B (SMTP)**. When both are set, Resend is attempted first with automatic fallback. When neither is configured (such as a fresh local clone), the API transparently returns `503 EMAIL_PROVIDER_NOT_CONFIGURED` along with a pre-filled `mailto:kumawatrishi096@gmail.com` link and WhatsApp CTA instead of faking delivery.

| Variable | Default | Exposure | Description |
| :--- | :--- | :--- | :--- |
| `CONTACT_EMAIL` | `kumawatrishi096@gmail.com` | Server-only | Primary inbox receiving all Project Enquiries and IST Discovery Call requests. |
| `EMAIL_FROM` | `DEV STUDIO <onboarding@resend.dev>` | Server-only | Sender header (`From:`). Update to a verified sender address on your domain in production. |
| `SEND_VISITOR_CONFIRMATION` | `true` | Server-only | When `"true"`, sends an automated receipt email to the visitor after notifying `CONTACT_EMAIL`. |
| `RESEND_API_KEY` | *(empty)* | **Secret (Server)** | API key from [Resend](https://resend.com) (`re_...`) for HTTPS transactional email delivery. |
| `SMTP_HOST` | *(empty)* | **Secret (Server)** | SMTP hostname (e.g., `smtp.gmail.com`, `smtp.zoho.in`, `email-smtp.ap-south-1.amazonaws.com`). |
| `SMTP_PORT` | `587` | Server-only | SMTP port (`587` for STARTTLS, `465` for implicit TLS). |
| `SMTP_SECURE` | `false` | Server-only | Set `"true"` when using port `465`; `"false"` for port `587`. |
| `SMTP_USER` | *(empty)* | **Secret (Server)** | SMTP username / email address (optional only for unauthenticated local test relays). |
| `SMTP_PASS` | *(empty)* | **Secret (Server)** | SMTP password or Gmail 16-character App Password. |

---

### 3. Google Drive Portfolio Streaming & Sync (`/api/drive/*`, `scripts/sync-drive.ts`)

Publicly shared files inside `1fIRbUsJen8EHxLfdU5LXlmXJzk_FsztC` work immediately without credentials. Optional Google API credentials increase upstream quota and support restricted files.

| Variable | Default | Exposure | Description |
| :--- | :--- | :--- | :--- |
| `GOOGLE_DRIVE_ROOT_FOLDER_ID` | `1fIRbUsJen8EHxLfdU5LXlmXJzk_FsztC` | Server-only | Root Google Drive portfolio folder ID scanned by `npm run sync:drive`. |
| `GOOGLE_DRIVE_API_KEY` | *(empty)* | **Secret (Server)** | Optional Google Cloud Drive API v3 key (`AIza...`) used server-side for `alt=media` Range streaming and folder sync. |
| `GOOGLE_CLIENT_ID` | *(empty)* | **Secret (Server)** | Optional Google OAuth 2.0 Client ID (only needed if accessing private non-shared Drive files). |
| `GOOGLE_CLIENT_SECRET` | *(empty)* | **Secret (Server)** | Optional Google OAuth 2.0 Client Secret. |
| `GOOGLE_REFRESH_TOKEN` | *(empty)* | **Secret (Server)** | Optional Google OAuth 2.0 Refresh Token. |

---

### 4. WhatsApp & Call Scheduling

| Variable | Default | Exposure | Description |
| :--- | :--- | :--- | :--- |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | `919309425465` | Public | Country-code + phone digits (no `+` or spaces) used for `https://wa.me/919309425465?text=...` deep links. |
| `NEXT_PUBLIC_CALENDLY_URL` | *(empty)* | Public | Optional external Calendly / Cal.com URL. Leave empty to use the built-in `Asia/Kolkata` (IST) Call Request form. |

---

### 5. Offline Audio Generation CLI (`scripts/generate-elevenlabs-audio.mjs`)

Used **only** when running `node scripts/generate-elevenlabs-audio.mjs` locally to regenerate MP3 files — never required at runtime in production.

| Variable | Default | Exposure | Description |
| :--- | :--- | :--- | :--- |
| `ELEVENLABS_API_KEY` | *(empty)* | **Secret (Local CLI)** | ElevenLabs API key for regenerating studio voiceover MP3s. |
| `ELEVENLABS_VOICE_ID` | `pNInz6obpgDQGcFmaJgB` | Local CLI | Target ElevenLabs Voice ID. |

