import profileJson from '@/content/profile.json';
import servicesJson from '@/content/services.json';
import projectsJson from '@/content/projects.json';
import pricingJson from '@/content/pricing.json';
import socialLinksJson from '@/content/social-links.json';
import siteConfigJson from '@/content/site-config.json';

import type {
  ProfileContent,
  ServicesContent,
  ProjectsManifest,
  PortfolioProject,
  PricingContent,
  SocialLinksContent,
  SiteConfigContent,
} from './types';

const rawProfile = profileJson as ProfileContent;

export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || '';

export function isStaticDeployment(): boolean {
  if (process.env.NEXT_PUBLIC_GITHUB_PAGES === 'true') return true;
  if (typeof window !== 'undefined' && window.location.hostname.endsWith('.github.io')) {
    return true;
  }
  return false;
}

export function withBasePath(assetPath: string): string {
  if (!assetPath || assetPath.startsWith('http://') || assetPath.startsWith('https://') || assetPath.startsWith('data:')) {
    return assetPath;
  }
  if (BASE_PATH && assetPath.startsWith('/') && !assetPath.startsWith(`${BASE_PATH}/`)) {
    return `${BASE_PATH}${assetPath}`;
  }
  return assetPath;
}

export function getProjectThumbnailUrl(
  project: Pick<PortfolioProject, 'id' | 'thumbnail'>,
  sz: 'w320' | 'w480' | 'w640' | 'w800' | 'w1200' = 'w640'
): string {
  if (isStaticDeployment()) {
    return `https://drive.google.com/thumbnail?id=${encodeURIComponent(project.id)}&sz=${sz}`;
  }
  return `${withBasePath(project.thumbnail)}?sz=${sz}`;
}

export function getFallbackPosterDataUri(title: string, category: string): string {
  const safeTitle = (title || 'Portfolio Project').replace(/[<>&"']/g, '').slice(0, 42);
  const safeCat = (category || 'DEV STUDIO').replace(/[<>&"']/g, '').slice(0, 26).toUpperCase();
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="450" viewBox="0 0 800 450"><rect width="800" height="450" fill="#0b0b12"/><circle cx="660" cy="95" r="155" fill="#7c3aed" fill-opacity="0.18"/><rect x="40" y="40" width="720" height="370" rx="18" fill="none" stroke="rgba(255,255,255,0.12)"/><text x="68" y="102" fill="#a855f7" font-family="sans-serif" font-size="15" font-weight="700" letter-spacing="3">${safeCat}</text><text x="68" y="236" fill="#f4f4f6" font-family="sans-serif" font-size="27" font-weight="700">${safeTitle}</text><text x="68" y="366" fill="#9ca3af" font-family="monospace" font-size="13" letter-spacing="2">DEV STUDIO · JAIPUR</text></svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

export const profileContent: ProfileContent = {
  ...rawProfile,
  portraitUrl: withBasePath(rawProfile.portraitUrl),
  resume: {
    ...rawProfile.resume,
    primaryPdfUrl: withBasePath(rawProfile.resume.primaryPdfUrl),
    portfolioOverviewPdfUrl: withBasePath(rawProfile.resume.portfolioOverviewPdfUrl),
  },
};
export const servicesContent = servicesJson as ServicesContent;
export const projectsManifest = projectsJson as ProjectsManifest;
export const pricingContent = pricingJson as PricingContent;
export const socialLinksContent = socialLinksJson as SocialLinksContent;
export const siteConfigContent = siteConfigJson as SiteConfigContent;

export function getPublicProjects(): PortfolioProject[] {
  return projectsManifest.projects
    .filter((p) => p.visibility === 'public')
    .sort((a, b) => a.order - b.order);
}

export function getFeaturedProjects(): PortfolioProject[] {
  const pub = getPublicProjects();
  const featured = pub.filter((p) => p.featured && p.mediaType === 'video');
  return featured.length > 0 ? featured : pub.filter((p) => p.mediaType === 'video').slice(0, 6);
}

export function getMarqueeProjects(): { row1: PortfolioProject[]; row2: PortfolioProject[] } {
  const pub = getPublicProjects();
  const marqueePool = pub.filter((p) => p.inMarquee);
  const items = marqueePool.length >= 12 ? marqueePool : pub.slice(0, 18);
  const mid = Math.ceil(items.length / 2);
  return {
    row1: items.slice(0, mid),
    row2: items.slice(mid),
  };
}

export function getStudioMonitorProjects(): PortfolioProject[] {
  const pub = getPublicProjects();
  const monitors = pub.filter((p) => p.inStudioMonitor && p.mediaType === 'video');
  return monitors.length > 0 ? monitors : pub.filter((p) => p.mediaType === 'video').slice(0, 4);
}

export function getProjectById(fileId: string): PortfolioProject | undefined {
  return projectsManifest.projects.find((p) => p.id === fileId || p.fileId === fileId);
}

export function isAllowedDriveFileId(fileId: string): boolean {
  return projectsManifest.projects.some(
    (p) => (p.id === fileId || p.fileId === fileId) && p.visibility === 'public'
  );
}

export function getWhatsappDeepLink(customMessage?: string): string {
  const number =
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ||
    socialLinksContent.whatsapp.numberWithCountryCode ||
    '919309425465';
  const msg = customMessage || socialLinksContent.whatsapp.defaultMessage;
  return `https://wa.me/${number.replace(/\D/g, '')}?text=${encodeURIComponent(msg)}`;
}

