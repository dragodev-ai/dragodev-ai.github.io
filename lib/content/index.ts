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

export const profileContent = profileJson as ProfileContent;
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
