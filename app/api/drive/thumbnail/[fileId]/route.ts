import fs from 'node:fs';
import path from 'node:path';
import { NextRequest, NextResponse } from 'next/server';
import { getProjectById, isAllowedDriveFileId } from '@/lib/content';
import { THUMB_CACHE_DIR } from '@/lib/google-drive/stream';

export const runtime = 'nodejs';

interface CachedThumb {
  buf: Buffer;
  contentType: string;
}

const MAX_MEM_THUMBS = 260;
const memoryThumbCache = new Map<string, CachedThumb>();
const inflightThumbs = new Map<string, Promise<CachedThumb | null>>();

function setMemThumb(key: string, val: CachedThumb) {
  if (memoryThumbCache.has(key)) memoryThumbCache.delete(key);
  memoryThumbCache.set(key, val);
  while (memoryThumbCache.size > MAX_MEM_THUMBS) {
    const first = memoryThumbCache.keys().next().value;
    if (!first) break;
    memoryThumbCache.delete(first);
  }
}

function readCachedThumb(key: string): CachedThumb | null {
  const mem = memoryThumbCache.get(key);
  if (mem) {
    memoryThumbCache.delete(key);
    memoryThumbCache.set(key, mem);
    return mem;
  }
  try {
    const binPath = path.join(THUMB_CACHE_DIR, `${key}.bin`);
    const typePath = path.join(THUMB_CACHE_DIR, `${key}.type`);
    if (fs.existsSync(binPath)) {
      const buf = fs.readFileSync(binPath);
      const contentType = fs.existsSync(typePath)
        ? fs.readFileSync(typePath, 'utf8').trim() || 'image/jpeg'
        : 'image/jpeg';
      if (buf.length > 0) {
        const entry = { buf, contentType };
        setMemThumb(key, entry);
        return entry;
      }
    }
  } catch {
    // Ignore read-only disk environments
  }
  return null;
}

function writeCachedThumb(key: string, entry: CachedThumb) {
  setMemThumb(key, entry);
  try {
    fs.mkdirSync(THUMB_CACHE_DIR, { recursive: true });
    fs.writeFileSync(path.join(THUMB_CACHE_DIR, `${key}.bin`), entry.buf);
    fs.writeFileSync(path.join(THUMB_CACHE_DIR, `${key}.type`), entry.contentType);
  } catch {
    // Ignore read-only disk environments
  }
}

function buildPosterFallbackSvg(title: string, category: string): string {
  const safeTitle = title.replace(/[<>&"]/g, '').slice(0, 44);
  const safeCat = category.replace(/[<>&"]/g, '').slice(0, 28).toUpperCase();
  return `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="450" viewBox="0 0 800 450">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#0a0a0f"/>
        <stop offset="55%" stop-color="#151320"/>
        <stop offset="100%" stop-color="#1e1533"/>
      </linearGradient>
    </defs>
    <rect width="800" height="450" fill="url(#bg)"/>
    <circle cx="680" cy="90" r="160" fill="#7c3aed" fill-opacity="0.14"/>
    <circle cx="120" cy="380" r="140" fill="#f59e0b" fill-opacity="0.09"/>
    <rect x="44" y="44" width="712" height="362" rx="18" fill="none" stroke="rgba(255,255,255,0.10)"/>
    <text x="72" y="102" fill="#a855f7" font-family="sans-serif" font-size="15" font-weight="700" letter-spacing="3">${safeCat}</text>
    <text x="72" y="238" fill="#f4f4f6" font-family="sans-serif" font-size="28" font-weight="700">${safeTitle}</text>
    <text x="72" y="366" fill="#9ca3af" font-family="monospace" font-size="13" letter-spacing="2">DEV STUDIO · JAIPUR</text>
  </svg>`;
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ fileId: string }> }
) {
  const { fileId } = await context.params;
  if (!fileId || !/^[a-zA-Z0-9_-]{10,80}$/.test(fileId) || !isAllowedDriveFileId(fileId)) {
    return NextResponse.json({ ok: false, error: 'Asset not found' }, { status: 404 });
  }

  const szParam = request.nextUrl.searchParams.get('sz') || 'w800';
  const sz = /^w(320|480|640|800|1200)$/.test(szParam) ? szParam : 'w800';
  const cacheKey = `${fileId}_${sz}`;

  const hit = readCachedThumb(cacheKey);
  if (hit) {
    return new NextResponse(new Uint8Array(hit.buf), {
      status: 200,
      headers: {
        'Content-Type': hit.contentType,
        'Cache-Control': 'public, max-age=604800, s-maxage=2592000, stale-while-revalidate=2592000, immutable',
        'X-Thumb-Cache': 'HIT',
      },
    });
  }

  let fetchPromise = inflightThumbs.get(cacheKey);
  if (!fetchPromise) {
    fetchPromise = (async (): Promise<CachedThumb | null> => {
      try {
        const thumbUrl = `https://drive.google.com/thumbnail?id=${encodeURIComponent(fileId)}&sz=${sz}`;
        const res = await fetch(thumbUrl, {
          headers: { 'User-Agent': 'Mozilla/5.0 (compatible; DevStudioThumbProxy/2.0)' },
          redirect: 'follow',
          next: { revalidate: 604800 },
        });
        const contentType = res.headers.get('content-type') || '';
        if (res.ok && contentType.startsWith('image/')) {
          const buf = Buffer.from(await res.arrayBuffer());
          if (buf.length > 0) {
            const entry = { buf, contentType };
            writeCachedThumb(cacheKey, entry);
            return entry;
          }
        }
      } catch {
        // Fall through to SVG poster
      } finally {
        inflightThumbs.delete(cacheKey);
      }
      return null;
    })();
    inflightThumbs.set(cacheKey, fetchPromise);
  }

  const resolved = await fetchPromise;
  if (resolved) {
    return new NextResponse(new Uint8Array(resolved.buf), {
      status: 200,
      headers: {
        'Content-Type': resolved.contentType,
        'Cache-Control': 'public, max-age=604800, s-maxage=2592000, stale-while-revalidate=2592000, immutable',
        'X-Thumb-Cache': 'MISS',
      },
    });
  }

  const project = getProjectById(fileId);
  const svg = buildPosterFallbackSvg(
    project?.title || 'Portfolio Project',
    project?.category || 'DEV STUDIO'
  );
  return new NextResponse(svg, {
    status: 200,
    headers: {
      'Content-Type': 'image/svg+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
