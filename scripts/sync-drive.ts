/**
 * scripts/sync-drive.ts
 * Recursively synchronizes Dev Kumawat's Google Drive portfolio folder into /content/projects.json
 * WITHOUT deleting or overwriting manually curated titles, descriptions, visibility, featured flags, or ordering.
 *
 * Supports:
 * 1. Official Google Drive API v3 (when GOOGLE_DRIVE_API_KEY or GOOGLE_REFRESH_TOKEN is set)
 * 2. Authenticated local `gdrive` CLI fallback (used in Antigravity studio environment)
 */

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import type { DriveCategoryNode, PortfolioProject, ProjectsManifest } from '../lib/content/types';

const ROOT_DIR = path.resolve(__dirname, '..');
const MANIFEST_PATH = path.join(ROOT_DIR, 'content', 'projects.json');
const DEFAULT_ROOT_FOLDER_ID = '1fIRbUsJen8EHxLfdU5LXlmXJzk_FsztC';

interface RawDriveFile {
  id: string;
  name: string;
  mimeType: string;
  size?: string | number;
  modifiedTime?: string;
}

const SUPPORTED_VIDEO_EXT = new Set(['.mp4', '.mov', '.webm', '.m4v']);
const SERVICE_TAG_MAP: Record<string, string> = {
  'AD - Shoot': 'video-editing',
  'Advance Motion Graphics': 'motion-design',
  'AI- Artificial Intelligence': 'ai-production',
  BRANDS: 'video-editing',
  'Govt. Projects': 'video-editing',
  Graphics: 'graphic-design',
  INFLUENCERS: 'video-editing',
  pictures: 'graphic-design',
  'Pre Wed': 'video-editing',
  'TELEVISION BYTE': 'video-editing',
  'Studio Showcase': 'motion-design',
};

async function fetchOAuthAccessToken(): Promise<string | null> {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;
  if (!clientId || !clientSecret || !refreshToken) return null;

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }),
  });
  if (!res.ok) {
    throw new Error(`OAuth token refresh failed (${res.status})`);
  }
  const json = (await res.json()) as { access_token?: string };
  return json.access_token || null;
}

async function listFolderViaApi(
  folderId: string,
  apiKey?: string,
  accessToken?: string | null
): Promise<RawDriveFile[]> {
  const files: RawDriveFile[] = [];
  let pageToken = '';

  do {
    const params = new URLSearchParams({
      q: `'${folderId}' in parents and trashed = false`,
      fields: 'nextPageToken, files(id, name, mimeType, size, modifiedTime)',
      pageSize: '200',
    });
    if (apiKey && !accessToken) params.set('key', apiKey);
    if (pageToken) params.set('pageToken', pageToken);

    const headers: Record<string, string> = {};
    if (accessToken) headers.Authorization = `Bearer ${accessToken}`;

    const res = await fetch(`https://www.googleapis.com/drive/v3/files?${params.toString()}`, {
      headers,
    });
    if (!res.ok) {
      throw new Error(`Google Drive API list failed (${res.status}): ${await res.text()}`);
    }
    const data = (await res.json()) as { files?: RawDriveFile[]; nextPageToken?: string };
    if (data.files) files.push(...data.files);
    pageToken = data.nextPageToken || '';
  } while (pageToken);

  return files;
}

function listFolderViaGdriveCli(folderId: string): RawDriveFile[] {
  const candidates = [
    process.env.GDRIVE_BIN,
    'C:\\Users\\Rishiii\\.gemini\\config\\plugins\\gdrive\\skills\\gdrive\\scripts\\gdrive.cmd',
    'gdrive',
  ].filter(Boolean) as string[];

  for (const bin of candidates) {
    try {
      const out =
        process.platform === 'win32' && bin.endsWith('.cmd')
          ? execFileSync('cmd.exe', ['/c', bin, 'readonly', 'ls', folderId, '--max', '200', '--json'], {
              encoding: 'utf-8',
            })
          : execFileSync(bin, ['readonly', 'ls', folderId, '--max', '200', '--json'], {
              encoding: 'utf-8',
            });
      const parsed = JSON.parse(out);
      return Array.isArray(parsed) ? parsed : parsed.files || [];
    } catch {
      // Try next candidate
    }
  }
  throw new Error(
    'Neither GOOGLE_DRIVE_API_KEY / GOOGLE_REFRESH_TOKEN nor an authenticated gdrive CLI was found.'
  );
}

function formatFallbackTitle(rawName: string, category: string, subcategory: string, index: number): string {
  const stem = path.parse(rawName).name.replace(/\s*copy(\s+copy)*\s*$/i, '').replace(/_/g, ' ').trim();
  if (/^(\d{8,}.*IMG.*|IMG[-_\s]?\d+.*|Untitled-\d+|\d+(\s*\(\d+\))?)$/i.test(stem)) {
    return `${subcategory || category} — Frame ${String(index).padStart(2, '0')}`;
  }
  return stem.replace(/\s{2,}/g, ' ');
}

async function main() {
  const rootFolderId = process.env.GOOGLE_DRIVE_ROOT_FOLDER_ID || DEFAULT_ROOT_FOLDER_ID;
  const existing: ProjectsManifest = fs.existsSync(MANIFEST_PATH)
    ? JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf-8'))
    : {
        rootFolderId,
        rootFolderUrl: `https://drive.google.com/drive/folders/${rootFolderId}?usp=sharing`,
        lastSyncedAt: '',
        totalProjects: 0,
        categories: [],
        projects: [],
      };

  const existingById = new Map<string, PortfolioProject>(
    existing.projects.map((p) => [p.id, p])
  );

  const apiKey = process.env.GOOGLE_DRIVE_API_KEY;
  const accessToken = await fetchOAuthAccessToken();
  const useRestApi = Boolean(apiKey || accessToken);

  console.log(
    `[sync-drive] Scanning root folder ${rootFolderId} via ${useRestApi ? 'Google Drive REST API v3' : 'gdrive CLI'}...`
  );

  const categoriesMap = new Map<string, DriveCategoryNode>();
  const discoveredProjects: PortfolioProject[] = [];
  const visitedFolders = new Set<string>();
  const folderItemCount = new Map<string, number>();

  async function walk(folderId: string, pathParts: string[]) {
    if (visitedFolders.has(folderId)) return;
    visitedFolders.add(folderId);

    const items = useRestApi
      ? await listFolderViaApi(folderId, apiKey, accessToken)
      : listFolderViaGdriveCli(folderId);

    for (const item of items) {
      if (item.mimeType === 'application/vnd.google-apps.folder') {
        if (pathParts.length === 0) {
          if (!categoriesMap.has(item.name)) {
            categoriesMap.set(item.name, { id: item.id, name: item.name, subcategories: [] });
          }
        } else if (pathParts.length === 1) {
          const parentName = pathParts[0];
          const parentNode = categoriesMap.get(parentName) || {
            id: folderId,
            name: parentName,
            subcategories: [],
          };
          parentNode.subcategories.push({ id: item.id, name: item.name });
          categoriesMap.set(parentName, parentNode);
        }
        await walk(item.id, [...pathParts, item.name]);
        continue;
      }

      if (item.mimeType === 'application/pdf') continue;

      const ext = path.extname(item.name).toLowerCase();
      const isVideo = item.mimeType.startsWith('video/') || SUPPORTED_VIDEO_EXT.has(ext);
      const isImage = item.mimeType.startsWith('image/');
      if (!isVideo && !isImage) continue;

      const category = pathParts[0] || 'Studio Showcase';
      const subcategory = pathParts[1] || '';
      const countKey = `${category}/${subcategory}`;
      const localIndex = (folderItemCount.get(countKey) || 0) + 1;
      folderItemCount.set(countKey, localIndex);

      const prev = existingById.get(item.id);
      const modTime = item.modifiedTime || prev?.modifiedTime || new Date().toISOString();
      const year = modTime.slice(0, 4);

      discoveredProjects.push({
        id: item.id,
        fileName: item.name,
        // Preserve manually curated fields if entry already exists
        title: prev ? prev.title : formatFallbackTitle(item.name, category, subcategory, localIndex),
        category: prev ? prev.category : category,
        subcategory: prev ? prev.subcategory : subcategory,
        serviceTag: prev ? prev.serviceTag : SERVICE_TAG_MAP[category] || 'video-editing',
        mediaType: isVideo ? 'video' : 'image',
        mimeType: item.mimeType,
        source: 'google-drive',
        videoId: isVideo ? item.id : null,
        fileId: item.id,
        parentFolderId: folderId,
        driveFolderPath: pathParts.join('/'),
        sizeBytes: Number(item.size || prev?.sizeBytes || 0),
        modifiedTime: modTime,
        year: prev?.year || year,
        thumbnail: prev ? prev.thumbnail : `/api/drive/thumbnail/${item.id}`,
        streamUrl: isVideo ? `/api/drive/stream/${item.id}` : null,
        previewUrl: `https://drive.google.com/file/d/${item.id}/preview`,
        driveUrl: `https://drive.google.com/file/d/${item.id}/view`,
        description: prev
          ? prev.description
          : `${isVideo ? 'Video production' : 'Visual design & photography'} piece from Dev Kumawat's ${subcategory || category} archive.`,
        verifiedLabel: prev ? prev.verifiedLabel : null,
        featured: prev ? prev.featured : false,
        inMarquee: prev ? prev.inMarquee : false,
        inStudioMonitor: prev ? prev.inStudioMonitor : false,
        order: prev ? prev.order : 500 + discoveredProjects.length,
        visibility: prev ? prev.visibility : 'public',
        curated: prev?.curated ?? false,
      });
    }
  }

  await walk(rootFolderId, []);

  // Retain custom non-Drive entries if user ever added custom entries manually
  for (const prev of existing.projects) {
    if (prev.source === 'custom' && !discoveredProjects.some((d) => d.id === prev.id)) {
      discoveredProjects.push(prev);
    }
  }

  discoveredProjects.sort((a, b) => a.order - b.order || a.title.localeCompare(b.title));

  const updated: ProjectsManifest = {
    rootFolderId,
    rootFolderUrl: `https://drive.google.com/drive/folders/${rootFolderId}?usp=sharing`,
    lastSyncedAt: new Date().toISOString(),
    totalProjects: discoveredProjects.filter((p) => p.visibility === 'public').length,
    categories: Array.from(categoriesMap.values()).sort((a, b) => a.name.localeCompare(b.name)),
    projects: discoveredProjects,
  };

  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(updated, null, 2) + '\n', 'utf-8');
  console.log(
    `[sync-drive] Complete! ${updated.totalProjects} public items (${updated.projects.length} total) across ${updated.categories.length} categories.`
  );
}

main().catch((err) => {
  console.error('[sync-drive] ERROR:', err);
  process.exit(1);
});
