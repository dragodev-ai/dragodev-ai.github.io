import { NextRequest, NextResponse } from 'next/server';
import { getProjectById, isAllowedDriveFileId } from '@/lib/content';

export const runtime = 'nodejs';

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
  const project = getProjectById(fileId);

  try {
    const thumbUrl = `https://drive.google.com/thumbnail?id=${encodeURIComponent(fileId)}&sz=${sz}`;
    const res = await fetch(thumbUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; DevStudioThumbProxy/1.0)' },
      redirect: 'follow',
      next: { revalidate: 86400 },
    });

    const contentType = res.headers.get('content-type') || '';
    if (res.ok && contentType.startsWith('image/')) {
      return new NextResponse(res.body, {
        status: 200,
        headers: {
          'Content-Type': contentType,
          'Cache-Control': 'public, max-age=86400, s-maxage=604800, stale-while-revalidate=604800',
        },
      });
    }
  } catch {
    // Fall through to studio SVG poster
  }

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
