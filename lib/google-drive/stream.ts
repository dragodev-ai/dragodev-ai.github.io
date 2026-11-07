import { getProjectById, isAllowedDriveFileId } from '@/lib/content';

let cachedAccessToken: { token: string; expiresAt: number } | null = null;

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
    'User-Agent': 'Mozilla/5.0 (compatible; DevStudioMediaProxy/1.0)',
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

  // 2. Publicly shared Google Drive direct stream endpoint (verified 206 Partial Content support)
  const publicUrl = `https://drive.usercontent.google.com/download?id=${encodeURIComponent(
    fileId
  )}&export=download&confirm=t`;

  const pubRes = await fetch(publicUrl, {
    headers,
    redirect: 'follow',
    cache: 'no-store',
  });

  return pubRes;
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

