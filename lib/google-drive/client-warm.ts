'use client';

import type { PortfolioProject } from '@/lib/content/types';

const warmedIds = new Set<string>();
const faststartStatusMap = new Map<string, boolean>();
const inflightWarmPromises = new Map<string, Promise<boolean>>();

export function getKnownFaststartStatus(fileId: string): boolean | undefined {
  return faststartStatusMap.get(fileId);
}

export function warmProjectMedia(project: PortfolioProject | null | undefined): Promise<boolean> {
  if (!project || typeof window === 'undefined') return Promise.resolve(false);

  // Preload poster thumbnail in browser cache
  if (project.thumbnail && !warmedIds.has(`thumb_${project.id}`)) {
    warmedIds.add(`thumb_${project.id}`);
    const img = new window.Image();
    img.decoding = 'async';
    img.src = `${project.thumbnail}?sz=w800`;
  }

  if (project.mediaType !== 'video') {
    return Promise.resolve(false);
  }

  const known = faststartStatusMap.get(project.id);
  if (known !== undefined && warmedIds.has(`vid_${project.id}`)) {
    return Promise.resolve(known);
  }

  const existing = inflightWarmPromises.get(project.id);
  if (existing) return existing;

  warmedIds.add(`vid_${project.id}`);
  const p = fetch(`/api/drive/warm/${encodeURIComponent(project.id)}`, {
    method: 'GET',
    credentials: 'same-origin',
  })
    .then(async (res) => {
      if (!res.ok) return false;
      const json = (await res.json()) as { faststartReady?: boolean };
      const ready = Boolean(json.faststartReady);
      faststartStatusMap.set(project.id, ready);
      return ready;
    })
    .catch(() => false)
    .finally(() => {
      inflightWarmPromises.delete(project.id);
    });

  inflightWarmPromises.set(project.id, p);
  return p;
}

