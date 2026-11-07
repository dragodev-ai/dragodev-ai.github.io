# Content Management Guide (Zero-Code Updates)

All personal branding, biography details, services, pricing packages, portfolio projects, social links, and studio settings are decoupled from React components inside `/content/*.json` and `/public/assets/`.

You can update almost everything on **DEV STUDIO** by editing JSON files and redeploying — without editing TypeScript or Three.js components.

---

## 1. Content Files Overview

| File | Controls |
| :--- | :--- |
| `content/profile.json` | Name, roles, Jaipur location, availability badge, email, WhatsApp number, About Me paragraphs, verified career highlights, education, software tags, collaborated brands, resume paths, and spoken intro script |
| `content/services.json` | Services headline, expandable capability groups (`01`–`04`), deliverables lists, linked Google Drive categories, and additional discipline pills |
| `content/projects.json` | Master Google Drive portfolio manifest (`232` public items), categories, subcategories, featured stacked cards, marquee items, studio monitor reels, ordering, and visibility |
| `content/pricing.json` | Pricing section headline, `"Custom Quote — Let's Discuss Your Project."` packages, deliverables, `"MOST REQUESTED"` badge, and pre-selected Contact service mapping |
| `content/social-links.json` | Instagram (`@lenswithdragodev`), WhatsApp number & pre-filled message, Google Drive portfolio link, and `mailto:` link |
| `content/site-config.json` | SEO title/description/keywords, navbar links, 3D head-tracking sensitivity, default audio mix, `Asia/Kolkata` booking settings, Contact service dropdown options, and budget ranges |

---

## 2. Common Content Tasks

### Updating Your Resume PDF
1. Replace `public/assets/Dev-Kumawat-Resume.pdf` with your updated PDF (or add a new file in `public/assets/` and update `resume.primaryPdfUrl` in `content/profile.json`).
2. Run `npm run validate:assets` to confirm the PDF is non-empty and valid.

### Updating Your Studio Portrait
1. Place your new portrait in `public/assets/` (e.g., `public/assets/dev-studio-portrait.jpg`).
2. Update `portraitUrl` in `content/profile.json`.

### Featuring or Reordering Stacked Projects (`#projects`)
Open `content/projects.json` and locate the project object:
- **`"featured": true`** — Displays the project in the **Sticky Stacked Featured Projects** section (`#projects`).
- **`"order": 1`** — Controls sort priority (`1`, `2`, `3`... appear first in Featured & Explorer views).
- **`"inMarquee": true`** — Includes the project in the **Dual-Row Infinite Portfolio Marquee**.
- **`"inStudioMonitor": true`** — Displays the video on the **3D Dual Editing Monitors** inside the hero studio.
- **`"visibility": "hidden"`** — Hides any duplicate or archive-only file from the public website AND blocks its ID on `/api/drive/stream/[fileId]`, while remembering it so future `npm run sync:drive` runs keep it hidden.
- **`"curated": true`** — Marks your manual edits; `npm run sync:drive` preserves `title`, `description`, `category`, `featured`, `inMarquee`, `inStudioMonitor`, `order`, and `visibility` for every existing item ID.

### Updating Pricing Packages (Adding Fixed Rates Later If Desired)
By default, all packages in `content/pricing.json` display `"Custom Quote — Let's Discuss Your Project."` so rates are never fabricated.
To display a starting rate later, edit `"price"` in `content/pricing.json`:
```json
{
  "id": "monthly-social-retainer",
  "title": "Monthly Social Media & Content Retainer",
  "price": "Custom Quote — Let's Discuss Your Project.",
  "serviceSelection": "Monthly Social Media Package",
  "featured": true
}
```
Make sure `"serviceSelection"` matches one of the strings in `enquiryServiceOptions` inside `content/site-config.json` so clicking the package CTA pre-selects that exact option in the Contact form!

### Enabling an External Calendly / Cal.com Scheduler
By default, **BOOK A CALL** uses the built-in `Asia/Kolkata` (IST) Call Request form (delivering to `kumawatrishi096@gmail.com` without inventing fake open slots).
If you later create a live Calendly or Cal.com booking page:
- Either set `NEXT_PUBLIC_CALENDLY_URL=https://calendly.com/your-handle/15min` in `.env.local` / Vercel, **or**
- Set `"calendlyUrl"` in `content/site-config.json`.
The Book-a-Call panel will automatically switch to your live embedded scheduler + external tab link.

### Replacing the 3D Character `.glb` Model
The hero studio loads `public/models/dev-character.glb` (configured via `studio.characterModelPath` in `content/site-config.json`).
- To tweak procedural proportions/colors locally, edit `scripts/build-character-glb.py` and run `python scripts/build-character-glb.py`.
- If importing a custom sculpted Blender `.glb`, name the head/face joints `Head`, `Neck`, `Chest`, `Hips`, `Jaw`, `Eye_L`, `Eye_R`, `Eyelid_L`, `Eyelid_R`, `Brow_L`, `Brow_R` (or `DevCharacterModel.tsx` will gracefully fall back to root-level pointer tracking if custom bone names differ).

---

## 3. Always Validate After Editing JSON
After saving any file in `content/`, run:
```bash
npm run validate:assets
npm run typecheck
npm test
```
This catches JSON syntax typos or broken asset paths before deployment.

