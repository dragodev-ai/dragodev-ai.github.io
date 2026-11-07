export interface ProfileContent {
  name: string;
  studioName: string;
  headline: string;
  roles: string[];
  primaryRoleTitle: string;
  location: {
    city: string;
    state: string;
    country: string;
    display: string;
    availability: string;
    timezone: string;
  };
  contact: {
    email: string;
    phone: string;
    whatsappNumber: string;
    whatsappPreFilledMessage: string;
  };
  introScript: {
    fullText: string;
    segments: Array<{
      id: string;
      file: string;
      text: string;
    }>;
  };
  bio: {
    lead: string;
    paragraphs: string[];
  };
  stats: Array<{ value: string; label: string }>;
  highlights: Array<{
    number: string;
    category: string;
    title: string;
    subtitle: string;
    detail: string;
  }>;
  education: {
    degree: string;
    institution: string;
    period: string;
    notes: string;
  };
  experience: Array<{
    role: string;
    organization: string;
    duration: string;
    points: string[];
  }>;
  software: string[];
  disciplines: string[];
  languages: Array<{ language: string; proficiency: string }>;
  collaboratedBrands: string[];
  resume: {
    primaryPdfUrl: string;
    portfolioOverviewPdfUrl: string;
    downloadFileName: string;
  };
  portraitUrl: string;
}

export interface ServiceGroup {
  id: string;
  number: string;
  title: string;
  tagline: string;
  shortDescription: string;
  capabilities: string[];
  driveCategories: string[];
  enquiryServiceValue: string;
}

export interface ServicesContent {
  headline: string;
  subheadline: string;
  primaryGroups: ServiceGroup[];
  additionalDisciplines: string[];
}

export interface PortfolioProject {
  id: string;
  fileName: string;
  title: string;
  category: string;
  subcategory: string;
  serviceTag: string;
  mediaType: 'video' | 'image';
  mimeType: string;
  source: 'google-drive' | 'custom';
  videoId: string | null;
  fileId: string;
  parentFolderId: string;
  driveFolderPath: string;
  sizeBytes: number;
  modifiedTime: string;
  year: string;
  thumbnail: string;
  streamUrl: string | null;
  previewUrl: string;
  driveUrl: string;
  description: string;
  verifiedLabel: string | null;
  featured: boolean;
  inMarquee: boolean;
  inStudioMonitor: boolean;
  order: number;
  visibility: 'public' | 'private' | 'hidden';
  curated?: boolean;
}

export interface DriveCategoryNode {
  id: string;
  name: string;
  subcategories: Array<{ id: string; name: string }>;
}

export interface ProjectsManifest {
  rootFolderId: string;
  rootFolderUrl: string;
  lastSyncedAt: string;
  totalProjects: number;
  categories: DriveCategoryNode[];
  projects: PortfolioProject[];
}

export interface PricingPackage {
  id: string;
  badge: string;
  title: string;
  shortDescription: string;
  price: string;
  deliverables: string[];
  serviceSelection: string;
  featured: boolean;
}

export interface PricingContent {
  headline: string;
  subheadline: string;
  defaultPriceNote: string;
  packages: PricingPackage[];
  individualProjectNote: string;
}

export interface SocialLinksContent {
  email: string;
  mailtoUrl: string;
  phoneDisplay: string;
  telUrl: string;
  whatsapp: {
    numberWithCountryCode: string;
    display: string;
    url: string;
    defaultMessage: string;
  };
  socials: Array<{
    id: string;
    platform: string;
    handle: string;
    url: string;
  }>;
}

export interface NavItem {
  label: string;
  href: string;
  sectionId: string;
}

export interface SiteConfigContent {
  siteName: string;
  siteTitle: string;
  siteDescription: string;
  keywords: string[];
  locale: string;
  timezone: string;
  navigation: {
    left: NavItem[];
    center: NavItem[];
    right: NavItem[];
  };
  studio: {
    characterModelPath: string;
    pointerLerpFactor: number;
    maxHeadYawRad: number;
    maxHeadPitchRad: number;
    defaultVolume: number;
    ambienceVolume: number;
    musicVolumeDuringSpeech: number;
    musicVolumeIdle: number;
  };
  booking: {
    timezone: string;
    timezoneLabel: string;
    calendlyUrl: string;
    externalBookingUrl: string;
    modeNote: string;
  };
  enquiryServiceOptions: string[];
  budgetRanges: string[];
}

