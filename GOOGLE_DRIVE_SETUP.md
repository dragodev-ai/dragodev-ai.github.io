# Google Drive Portfolio Integration & Sync Guide

**DEV STUDIO** uses Dev Kumawat's working Google Drive portfolio folder as the primary source of portfolio videos, motion graphics, brand designs, and photography:

- **Root Portfolio Folder URL**: [https://drive.google.com/drive/folders/1fIRbUsJen8EHxLfdU5LXlmXJzk_FsztC?usp=sharing](https://drive.google.com/drive/folders/1fIRbUsJen8EHxLfdU5LXlmXJzk_FsztC?usp=sharing)
- **Root Folder ID**: `1fIRbUsJen8EHxLfdU5LXlmXJzk_FsztC`

---

## 1. How the Integration Works

1. **Manifest Source of Truth (`content/projects.json`)**:
   - Stores every discovered portfolio file (`232` public items across **10 real Drive categories** plus root `Studio Showcase`) with its Google Drive `fileId`, category, subcategory, MIME type, stream URL (`/api/drive/stream/<fileId>`), and cached thumbnail URL (`/api/drive/thumbnail/<fileId>`).
   - Byte-identical duplicates (such as `ECOM AD 1 (1).mp4`) are preserved in the manifest with `"visibility": "hidden"` so re-syncing never re-exposes duplicates.
2. **Server-Side HTTP Range Video Proxy (`app/api/drive/stream/[fileId]/route.ts`)**:
   - Checks `isAllowedDriveFileId(fileId)` so arbitrary third-party Drive IDs cannot abuse your server proxy (`404` if not in `content/projects.json` with `visibility: "public"`).
   - Forwards browser `Range: bytes=...` headers upstream to Google Drive (via Google Drive API v3 `alt=media` if `GOOGLE_DRIVE_API_KEY` / OAuth is configured, or `drive.usercontent.google.com` direct binary download for shared files) and streams `206 Partial Content` directly to the `<video>` element.
   - Detects any unexpected HTML interstitial or QuickTime `.mov` container (`video/quicktime`) and seamlessly switches the **Cinema Video Player Modal** to Google Drive's transcoded `/preview` player so visitors never encounter an unplayable video.
3. **Cached Thumbnail Proxy (`app/api/drive/thumbnail/[fileId]/route.ts`)**:
   - Proxies and caches Google Drive thumbnails (`Cache-Control: public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400`) and serves a clean branded dark SVG poster if an upstream thumbnail temporarily times out.

---

## 2. Current Google Drive Folder Hierarchy

Top-level folders inside `1fIRbUsJen8EHxLfdU5LXlmXJzk_FsztC` map automatically to category tabs on `/` and `/work`, while nested folders map to subcategory filter pills:

- `AD - Shoot` (Subfolder: `Photos`)
- `Advance Motion Graphics`
- `AI- Artificial Intelligence`
- `BRANDS`
- `Govt. Projects`
- `Graphics` (Subfolders: `COMPANY banners`, `FOOD`, `INFLUENCER instagram thumbnails`, `INSTA POST`, `Sample Brochure`)
- `INFLUENCERS`
- `pictures`
- `Pre Wed`
- `TELEVISION BYTE`
- Root-level video (`3d mockup banner.mp4` → `Studio Showcase`)

---

## 3. Adding New Videos or Categories to Google Drive

### Step 1: Upload to Google Drive
1. Upload new `.mp4` (H.264 + AAC recommended for universal native HTML5 streaming), `.webm`, `.jpg`, or `.png` files into an existing category folder — or create a brand-new folder inside `1fIRbUsJen8EHxLfdU5LXlmXJzk_FsztC`.
2. Ensure the folder or file inherits **"Anyone with the link → Viewer"** sharing permissions from the parent portfolio folder.

### Step 2: Run the Non-Destructive Sync Script
```bash
npm run sync:drive
```
`scripts/sync-drive.ts` recursively walks the entire Google Drive folder tree and updates `content/projects.json` **without overwriting** your existing curated titles, descriptions, `featured` flags, `inMarquee` selections, `order` values, or `visibility: "hidden"` flags.

### Step 3: Validate & Rebuild
```bash
npm run validate:assets
npm run build
```
Commit the updated `content/projects.json` and deploy (or push to GitHub for automatic Vercel deployment).

---

## 4. Optional: Adding a Google Drive API Key for Higher Quota

While public shared files stream without credentials, high-traffic production deployments benefit from setting a free Google Cloud Drive API v3 key:

1. Open [Google Cloud Console](https://console.cloud.google.com/), create or select a project, and enable **Google Drive API**.
2. Go to **APIs & Services → Credentials → Create Credentials → API Key**.
3. Restrict the API key to **Google Drive API** (server-side usage only — never prefix with `NEXT_PUBLIC_`).
4. Add `GOOGLE_DRIVE_API_KEY=your_key_here` to `.env.local` and Vercel Environment Variables.
   - Both `npm run sync:drive` and `/api/drive/stream/[fileId]` automatically detect `GOOGLE_DRIVE_API_KEY` and use Drive API v3!

