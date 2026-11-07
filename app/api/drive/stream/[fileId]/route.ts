import { NextRequest, NextResponse } from 'next/server';
import { isAllowedDriveFileId } from '@/lib/content';
import {
  fetchDriveMediaUpstream,
  getLocalFaststartPath,
  resolveVideoMimeType,
  serveAcceleratedDriveRange,
  serveLocalFaststartStream,
} from '@/lib/google-drive/stream';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ fileId: string }> }
) {
  const { fileId } = await context.params;

  if (!fileId || !/^[a-zA-Z0-9_-]{10,80}$/.test(fileId) || !isAllowedDriveFileId(fileId)) {
    return NextResponse.json(
      { ok: false, error: 'Portfolio media asset not found or not authorized for public streaming.' },
      { status: 404 }
    );
  }

  const rangeHeader = request.headers.get('range');

  try {
    // 1. Instant <1ms local web-optimized faststart MP4 stream when cached
    const localFastPath = getLocalFaststartPath(fileId);
    if (localFastPath) {
      return serveLocalFaststartStream(localFastPath, rangeHeader);
    }

    // 2. Accelerated 2MB block cache + parallel EOF moov prefetch + sliding read-ahead
    const accelerated = await serveAcceleratedDriveRange(fileId, rangeHeader || 'bytes=0-');
    if (accelerated) {
      return accelerated;
    }

    // 3. Direct upstream Google Drive byte-range pass-through fallback
    const upstream = await fetchDriveMediaUpstream(fileId, rangeHeader);
    if (!upstream || (!upstream.ok && upstream.status !== 206)) {
      return NextResponse.json(
        {
          ok: false,
          error: 'Upstream Google Drive stream unavailable.',
          fallbackPreviewUrl: `https://drive.google.com/file/d/${fileId}/preview`,
        },
        { status: 502 }
      );
    }

    const upstreamType = upstream.headers.get('content-type') || '';
    if (upstreamType.includes('text/html')) {
      return NextResponse.json(
        {
          ok: false,
          error: 'Google Drive returned an HTML interstitial instead of binary video.',
          fallbackPreviewUrl: `https://drive.google.com/file/d/${fileId}/preview`,
        },
        { status: 422 }
      );
    }

    const mimeType = resolveVideoMimeType(fileId, upstreamType);
    const responseHeaders = new Headers();
    responseHeaders.set('Content-Type', mimeType);
    responseHeaders.set('Accept-Ranges', upstream.headers.get('accept-ranges') || 'bytes');
    responseHeaders.set('Cache-Control', 'public, max-age=3600, stale-while-revalidate=86400');

    const contentLength = upstream.headers.get('content-length');
    if (contentLength) responseHeaders.set('Content-Length', contentLength);

    const contentRange = upstream.headers.get('content-range');
    if (contentRange) responseHeaders.set('Content-Range', contentRange);

    return new NextResponse(upstream.body, {
      status: upstream.status === 206 ? 206 : 200,
      headers: responseHeaders,
    });
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        error: `Media proxy error: ${(err as Error).message}`,
        fallbackPreviewUrl: `https://drive.google.com/file/d/${fileId}/preview`,
      },
      { status: 502 }
    );
  }
}
