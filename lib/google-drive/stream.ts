import fs from 'node:fs';
import path from 'node:path';
import { Readable } from 'node:stream';
import { getProjectById, isAllowedDriveFileId } from '@/lib/content';

export const BLOCK_SIZE = 2 * 1024 * 1024; // 2 MB aligned streaming blocks
const MAX_MEMORY_BLOCKS = 48; // Max ~96 MB in-process LRU RAM cache

const CACHE_ROOT = path.join(process.cwd(), '.cache');
export const FASTSTART_CACHE_DIR = path.join(CACHE_ROOT, 'drive-faststart');
const STREAM_BLOCK_CACHE_DIR = path.join(CACHE_ROOT, 'drive-streams');
export const THUMB_CACHE_DIR = path.join(CACHE_ROOT, 'drive-thumbnails');

let cachedAccessToken: { token: string; expiresAt: number } | null = null;

interface CachedBlockEntry {
  buf: Buffer;
  totalSize: number;
}

const memoryBlockCache = new Map<string, CachedBlockEntry>();
const knownTotalSizes = new Map<string, number>();
const inflightBlockFetches = new Map<string, Promise<CachedBlockEntry | null>>();

function ensureDirSafe(dir: string): boolean {
  try {
    fs.mkdirSync(dir, { recursive: true });
    return true;
  } catch {
    return false;
  }
}

function setMemoryBlock(cacheKey: string, entry: CachedBlockEntry): void {
  if (memoryBlockCache.has(cacheKey)) {
    memoryBlockCache.delete(cacheKey);
  }
  memoryBlockCache.set(cacheKey, entry);
  while (memoryBlockCache.size > MAX_MEMORY_BLOCKS) {
    const oldestKey = memoryBlockCache.keys().next().value;
    if (!oldestKey) break;
    memoryBlockCache.delete(oldestKey);
  }
}

function getDiskBlockPath(cacheKey: string): string {
  const safe = cacheKey.replace(/[^a-zA-Z0-9_-]/g, '_');
  return path.join(STREAM_BLOCK_CACHE_DIR, `${safe}.bin`);
}

function readCachedBlock(cacheKey: string, fallbackTotalSize: number): CachedBlockEntry | null {
  const mem = memoryBlockCache.get(cacheKey);
  if (mem) {
    // Refresh LRU position
    memoryBlockCache.delete(cacheKey);
    memoryBlockCache.set(cacheKey, mem);
    return mem;
  }

  try {
    const diskPath = getDiskBlockPath(cacheKey);
    const metaPath = `${diskPath}.meta`;
    if (fs.existsSync(diskPath)) {
      const buf = fs.readFileSync(diskPath);
      let totalSize = fallbackTotalSize;
      if (fs.existsSync(metaPath)) {
        const parsed = Number(fs.readFileSync(metaPath, 'utf8').trim());
        if (Number.isFinite(parsed) && parsed > 0) totalSize = parsed;
      }
      if (buf.length > 0 && totalSize > 0) {
        const entry = { buf, totalSize };
        setMemoryBlock(cacheKey, entry);
        return entry;
      }
    }
  } catch {
    // Ignore read-only filesystem errors on serverless platforms
  }
  return null;
}

function writeCachedBlock(cacheKey: string, entry: CachedBlockEntry): void {
  setMemoryBlock(cacheKey, entry);
  if (!ensureDirSafe(STREAM_BLOCK_CACHE_DIR)) return;
  try {
    const diskPath = getDiskBlockPath(cacheKey);
    fs.writeFileSync(diskPath, entry.buf);
    fs.writeFileSync(`${diskPath}.meta`, String(entry.totalSize));
  } catch {
    // Ignore disk write failure on ephemeral environments
  }
}

async function getDriveAccessToken(): Promise<string | null> {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;
  if (!clientId || !clientSecret || !refreshToken) return null;

  if (cachedAccessToken && Date.now() < cachedAccessToken.expiresAt - 30_000) {
    return cachedAccessToken.token;
  }

  try {
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
    if (!res.ok) return null;
    const data = (await res.json()) as { access_token?: string; expires_in?: number };
    if (!data.access_token) return null;
    cachedAccessToken = {
      token: data.access_token,
      expiresAt: Date.now() + (data.expires_in || 3500) * 1000,
    };
    return data.access_token;
  } catch {
    return null;
  }
}

export async function fetchDriveMediaUpstream(
  fileId: string,
  rangeHeader: string | null
): Promise<Response | null> {
  if (!isAllowedDriveFileId(fileId)) {
    return null;
  }

  const headers = new Headers({
    'User-Agent': 'Mozilla/5.0 (compatible; DevStudioMediaProxy/2.0)',
    Connection: 'keep-alive',
  });
  if (rangeHeader) {
    headers.set('Range', rangeHeader);
  }

  // 1. Prefer authenticated Google Drive v3 media endpoint when OAuth or API Key is set
  const token = await getDriveAccessToken();
  const apiKey = process.env.GOOGLE_DRIVE_API_KEY;
  if (token || apiKey) {
    const apiHeaders = new Headers(headers);
    const url = new URL(`https://www.googleapis.com/drive/v3/files/${encodeURIComponent(fileId)}`);
    url.searchParams.set('alt', 'media');
    if (token) {
      apiHeaders.set('Authorization', `Bearer ${token}`);
    } else if (apiKey) {
      url.searchParams.set('key', apiKey);
    }

    const apiRes = await fetch(url.toString(), {
      headers: apiHeaders,
      redirect: 'follow',
      cache: 'no-store',
    });
    if (apiRes.ok || apiRes.status === 206) {
      return apiRes;
    }
  }

  // 2. Publicly shared Google Drive direct stream endpoint (206 Partial Content)
  const publicUrl = `https://drive.usercontent.google.com/download?id=${encodeURIComponent(
    fileId
  )}&export=download&confirm=t`;

  return fetch(publicUrl, {
    headers,
    redirect: 'follow',
    cache: 'no-store',
  });
}

export function resolveVideoMimeType(fileId: string, upstreamContentType: string | null): string {
  const project = getProjectById(fileId);
  if (
    upstreamContentType &&
    upstreamContentType.startsWith('video/') &&
    upstreamContentType !== 'application/octet-stream'
  ) {
    return upstreamContentType;
  }
  if (project?.mimeType && project.mimeType.startsWith('video/')) {
    return project.mimeType;
  }
  return 'video/mp4';
}

export function getLocalFaststartPath(fileId: string): string | null {
  if (!/^[a-zA-Z0-9_-]{10,80}$/.test(fileId)) return null;
  const candidate = path.join(FASTSTART_CACHE_DIR, `${fileId}.mp4`);
  try {
    const st = fs.statSync(candidate);
    if (st.isFile() && st.size > 8192) {
      return candidate;
    }
  } catch {
    // Not cached locally yet
  }
  return null;
}

export function hasLocalFaststartFile(fileId: string): boolean {
  return getLocalFaststartPath(fileId) !== null;
}

function parseContentRangeTotal(contentRange: string | null, fallback: number): number {
  if (!contentRange) return fallback;
  const match = /\/(\d+)$/.exec(contentRange.trim());
  if (match) {
    const total = Number(match[1]);
    if (Number.isFinite(total) && total > 0) return total;
  }
  return fallback;
}

async function fetchBlockRange(
  fileId: string,
  cacheKey: string,
  start: number,
  end: number,
  knownTotal: number
): Promise<CachedBlockEntry | null> {
  const cached = readCachedBlock(cacheKey, knownTotal);
  if (cached) {
    knownTotalSizes.set(fileId, cached.totalSize);
    return cached;
  }

  const inflight = inflightBlockFetches.get(cacheKey);
  if (inflight) {
    return inflight;
  }

  const promise = (async (): Promise<CachedBlockEntry | null> => {
    try {
      const upstream = await fetchDriveMediaUpstream(fileId, `bytes=${start}-${end}`);
      if (!upstream || (!upstream.ok && upstream.status !== 206)) return null;
      const cType = upstream.headers.get('content-type') || '';
      if (cType.includes('text/html')) return null;

      const arr = await upstream.arrayBuffer();
      const buf = Buffer.from(arr);
      if (buf.length === 0) return null;

      const totalSize = parseContentRangeTotal(
        upstream.headers.get('content-range'),
        knownTotal || start + buf.length
      );
      knownTotalSizes.set(fileId, totalSize);

      const entry: CachedBlockEntry = { buf, totalSize };
      writeCachedBlock(cacheKey, entry);
      return entry;
    } catch {
      return null;
    } finally {
      inflightBlockFetches.delete(cacheKey);
    }
  })();

  inflightBlockFetches.set(cacheKey, promise);
  return promise;
}

export async function warmDriveVideoStream(fileId: string): Promise<{
  ok: boolean;
  faststartReady: boolean;
  sizeBytes: number;
}> {
  if (!isAllowedDriveFileId(fileId)) {
    return { ok: false, faststartReady: false, sizeBytes: 0 };
  }

  const fastPath = getLocalFaststartPath(fileId);
  if (fastPath) {
    const st = fs.statSync(fastPath);
    return { ok: true, faststartReady: true, sizeBytes: st.size };
  }

  const project = getProjectById(fileId);
  const hintTotal = knownTotalSizes.get(fileId) || project?.sizeBytes || 0;
  const firstEnd = hintTotal > 0 ? Math.min(hintTotal - 1, BLOCK_SIZE - 1) : BLOCK_SIZE - 1;

  // Warm Block 0 in background without blocking caller if already running
  void fetchBlockRange(fileId, `${fileId}_blk_0`, 0, firstEnd, hintTotal).then((blk0) => {
    if (!blk0) return;
    const total = blk0.totalSize;
    const headSlice = blk0.buf.subarray(0, Math.min(blk0.buf.length, 262_144));
    const hasMoovAtStart = headSlice.includes(Buffer.from('moov'));
    if (!hasMoovAtStart && total > BLOCK_SIZE) {
      const tailStart = Math.max(0, total - BLOCK_SIZE);
      void fetchBlockRange(fileId, `${fileId}_tail_${tailStart}`, tailStart, total - 1, total);
    }
  });

  return { ok: true, faststartReady: false, sizeBytes: hintTotal };
}

export function serveLocalFaststartStream(
  fastPath: string,
  rangeHeader: string | null
): Response {
  const stat = fs.statSync(fastPath);
  const total = stat.size;

  if (!rangeHeader) {
    const nodeStream = fs.createReadStream(fastPath);
    return new Response(Readable.toWeb(nodeStream) as ReadableStream, {
      status: 200,
      headers: {
        'Content-Type': 'video/mp4',
        'Content-Length': String(total),
        'Accept-Ranges': 'bytes',
        'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
        'X-Stream-Mode': 'local-faststart',
      },
    });
  }

  const match = /^bytes=(\d+)-(\d*)$/.exec(rangeHeader.trim());
  const start = match ? Math.min(Number(match[1]), Math.max(0, total - 1)) : 0;
  const requestedEnd = match && match[2] ? Number(match[2]) : total - 1;
  const end = Math.min(Math.max(start, requestedEnd), total - 1);
  const chunkLen = end - start + 1;

  const nodeStream = fs.createReadStream(fastPath, { start, end });
  return new Response(Readable.toWeb(nodeStream) as ReadableStream, {
    status: 206,
    headers: {
      'Content-Type': 'video/mp4',
      'Content-Length': String(chunkLen),
      'Content-Range': `bytes ${start}-${end}/${total}`,
      'Accept-Ranges': 'bytes',
      'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
      'X-Stream-Mode': 'local-faststart',
    },
  });
}

export async function serveAcceleratedDriveRange(
  fileId: string,
  rangeHeader: string
): Promise<Response | null> {
  const match = /^bytes=(\d+)-(\d*)$/.exec(rangeHeader.trim());
  if (!match) return null;

  const reqStart = Number(match[1]);
  const hasExplicitEnd = match[2].length > 0;
  const reqEndRaw = hasExplicitEnd ? Number(match[2]) : null;

  const project = getProjectById(fileId);
  const hintTotal = knownTotalSizes.get(fileId) || project?.sizeBytes || 0;

  // Check if request lands inside the EOF tail block (for MP4s with moov at EOF)
  if (hintTotal > BLOCK_SIZE && reqStart >= hintTotal - BLOCK_SIZE) {
    const tailStart = Math.max(0, hintTotal - BLOCK_SIZE);
    const tailEntry = await fetchBlockRange(
      fileId,
      `${fileId}_tail_${tailStart}`,
      tailStart,
      hintTotal - 1,
      hintTotal
    );
    if (tailEntry) {
      const sliceStart = reqStart - tailStart;
      const effectiveEnd =
        reqEndRaw !== null
          ? Math.min(reqEndRaw, tailEntry.totalSize - 1)
          : tailEntry.totalSize - 1;
      const sliceEndExclusive = Math.min(tailEntry.buf.length, effectiveEnd - tailStart + 1);
      if (sliceStart >= 0 && sliceEndExclusive > sliceStart) {
        const chunk = tailEntry.buf.subarray(sliceStart, sliceEndExclusive);
        const actualEnd = reqStart + chunk.length - 1;
        return new Response(new Uint8Array(chunk), {
          status: 206,
          headers: {
            'Content-Type': resolveVideoMimeType(fileId, null),
            'Content-Length': String(chunk.length),
            'Content-Range': `bytes ${reqStart}-${actualEnd}/${tailEntry.totalSize}`,
            'Accept-Ranges': 'bytes',
            'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
            'X-Stream-Mode': 'accelerated-tail-block',
          },
        });
      }
    }
  }

  // Aligned 2 MB block acceleration for open-ended ranges AND bounded ranges within a single 2 MB block
  const blockIdx = Math.floor(reqStart / BLOCK_SIZE);
  const blockStart = blockIdx * BLOCK_SIZE;
  const fitsSingleBlock =
    reqEndRaw === null ||
    (reqEndRaw >= reqStart && Math.floor(reqEndRaw / BLOCK_SIZE) === blockIdx);

  if (!fitsSingleBlock) {
    return null; // Let route handler stream multi-block explicit range directly
  }

  const blockEndTarget =
    hintTotal > 0 ? Math.min(hintTotal - 1, blockStart + BLOCK_SIZE - 1) : blockStart + BLOCK_SIZE - 1;

  const entry = await fetchBlockRange(
    fileId,
    `${fileId}_blk_${blockIdx}`,
    blockStart,
    blockEndTarget,
    hintTotal
  );
  if (!entry) return null;

  const total = entry.totalSize;

  // Trigger non-blocking parallel EOF moov warm + next-block read-ahead!
  if (blockIdx === 0 && total > BLOCK_SIZE) {
    const headProbe = entry.buf.subarray(0, Math.min(entry.buf.length, 262_144));
    if (!headProbe.includes(Buffer.from('moov'))) {
      const tailStart = Math.max(0, total - BLOCK_SIZE);
      void fetchBlockRange(fileId, `${fileId}_tail_${tailStart}`, tailStart, total - 1, total);
    }
  }
  const nextBlockStart = (blockIdx + 1) * BLOCK_SIZE;
  if (nextBlockStart < total) {
    const nextBlockEnd = Math.min(total - 1, nextBlockStart + BLOCK_SIZE - 1);
    void fetchBlockRange(fileId, `${fileId}_blk_${blockIdx + 1}`, nextBlockStart, nextBlockEnd, total);
  }

  const offsetStart = reqStart - blockStart;
  const maxAvailableEnd = blockStart + entry.buf.length - 1;
  const targetEnd = reqEndRaw !== null ? Math.min(reqEndRaw, maxAvailableEnd) : maxAvailableEnd;
  const offsetEndExclusive = targetEnd - blockStart + 1;

  if (offsetStart < 0 || offsetEndExclusive <= offsetStart || offsetStart >= entry.buf.length) {
    return null;
  }

  const outSlice = entry.buf.subarray(offsetStart, offsetEndExclusive);
  const finalEnd = reqStart + outSlice.length - 1;

  return new Response(new Uint8Array(outSlice), {
    status: 206,
    headers: {
      'Content-Type': resolveVideoMimeType(fileId, null),
      'Content-Length': String(outSlice.length),
      'Content-Range': `bytes ${reqStart}-${finalEnd}/${total}`,
      'Accept-Ranges': 'bytes',
      'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
      'X-Stream-Mode': 'accelerated-block',
    },
  });
}
