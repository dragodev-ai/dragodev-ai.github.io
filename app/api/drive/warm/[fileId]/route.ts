import { NextRequest, NextResponse } from 'next/server';
import { isAllowedDriveFileId } from '@/lib/content';
import { warmDriveVideoStream } from '@/lib/google-drive/stream';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ fileId: string }> }
) {
  const { fileId } = await context.params;
  if (!fileId || !/^[a-zA-Z0-9_-]{10,80}$/.test(fileId) || !isAllowedDriveFileId(fileId)) {
    return NextResponse.json({ ok: false }, { status: 404 });
  }

  const status = await warmDriveVideoStream(fileId);
  return NextResponse.json(status, {
    status: 200,
    headers: {
      'Cache-Control': 'private, max-age=60',
    },
  });
}

