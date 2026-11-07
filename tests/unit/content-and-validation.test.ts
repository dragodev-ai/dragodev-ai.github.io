import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it, beforeEach } from 'vitest';
import {
  getFeaturedProjects,
  getMarqueeProjects,
  getPublicProjects,
  getWhatsappDeepLink,
  isAllowedDriveFileId,
  pricingContent,
  profileContent,
  projectsManifest,
  servicesContent,
  siteConfigContent,
} from '@/lib/content';
import { bookingRequestSchema, contactEnquirySchema } from '@/lib/validation/schemas';
import { checkRateLimit, resetRateLimitStore } from '@/lib/validation/rate-limit';

describe('Content Source of Truth & Brand Integrity', () => {
  it('loads verified identity, email, Jaipur location, and WhatsApp deep link', () => {
    expect(profileContent.name).toBe('Dev Kumawat');
    expect(profileContent.contact.email).toBe('kumawatrishi096@gmail.com');
    expect(profileContent.location.timezone).toBe('Asia/Kolkata');
    const wa = getWhatsappDeepLink();
    expect(wa).toContain('https://wa.me/919309425465?text=');
  });

  it('exposes real Google Drive categories and deduplicated public projects', () => {
    const pub = getPublicProjects();
    expect(pub.length).toBeGreaterThanOrEqual(200);

    const ids = new Set(pub.map((p) => p.id));
    expect(ids.size).toBe(pub.length);

    // Byte-identical duplicate ECOM AD 1 (1).mp4 must stay hidden
    expect(isAllowedDriveFileId('110EshC9ZKwgsV_wXM2ot78FVbe9jj2m_')).toBe(false);
    // Real portfolio video must be allowed
    expect(isAllowedDriveFileId('15pG7_-tCMWDAEhK7Xb5SPhJVAiRJwR0A')).toBe(true);

    const catNames = projectsManifest.categories.map((c) => c.name);
    expect(catNames).toEqual(
      expect.arrayContaining([
        'AD - Shoot',
        'Advance Motion Graphics',
        'AI- Artificial Intelligence',
        'BRANDS',
        'Govt. Projects',
        'Graphics',
        'INFLUENCERS',
        'pictures',
        'Pre Wed',
        'TELEVISION BYTE',
      ])
    );

    const featured = getFeaturedProjects();
    expect(featured.length).toBeGreaterThanOrEqual(4);

    const marquee = getMarqueeProjects();
    expect(marquee.row1.length).toBeGreaterThan(0);
    expect(marquee.row2.length).toBeGreaterThan(0);
  });

  it('uses configurable Custom Quote pricing without fabricated rates', () => {
    expect(pricingContent.packages.length).toBe(4);
    for (const pkg of pricingContent.packages) {
      expect(pkg.price).toBe("Custom Quote — Let's Discuss Your Project.");
      expect(siteConfigContent.enquiryServiceOptions).toContain(pkg.serviceSelection);
    }
    expect(servicesContent.primaryGroups.map((g) => g.number)).toEqual(['01', '02', '03', '04']);
  });

  it('verifies binary rigged 3D character GLB contains full facial and body joint hierarchy', () => {
    const glbPath = path.resolve(process.cwd(), 'public/models/dev-character.glb');
    expect(fs.existsSync(glbPath)).toBe(true);

    const buf = fs.readFileSync(glbPath);
    expect(buf.subarray(0, 4).toString('ascii')).toBe('glTF');
    expect(buf.readUInt32LE(4)).toBe(2);

    const jsonByteLen = buf.readUInt32LE(12);
    const gltfJson = JSON.parse(buf.subarray(20, 20 + jsonByteLen).toString('utf-8'));

    const nodeNames = gltfJson.nodes.map((n: { name: string }) => n.name);
    expect(nodeNames).toEqual(
      expect.arrayContaining([
        'CharacterRoot',
        'Hips',
        'Chest',
        'Neck',
        'Head',
        'Jaw',
        'Eye_L',
        'Eye_R',
        'Eyelid_L',
        'Eyelid_R',
        'Brow_L',
        'Brow_R',
        'UpperArm_L',
        'ForeArm_L',
        'Hand_L',
        'UpperArm_R',
        'ForeArm_R',
        'Hand_R',
      ])
    );
    expect(gltfJson.skins[0].name).toBe('DevCharacterRig');
    expect(gltfJson.skins[0].joints.length).toBeGreaterThanOrEqual(20);
  });
});

describe('Form Validation & Rate Limiter', () => {
  beforeEach(() => {
    resetRateLimitStore();
  });

  it('validates contact enquiries strictly', () => {
    const bad = contactEnquirySchema.safeParse({
      fullName: 'A',
      email: 'not-an-email',
      phoneWhatsapp: '123',
      interestedService: '',
      projectBudget: '',
      projectDescription: 'Too short',
      consent: false,
    });
    expect(bad.success).toBe(false);

    const good = contactEnquirySchema.safeParse({
      fullName: 'Aarav Mehta',
      email: 'aarav@brandstudio.in',
      phoneWhatsapp: '+91 9876543210',
      interestedService: 'Video Editing & Post-Production',
      projectBudget: 'Custom Quote — Need Guidance',
      projectDescription: 'Looking for 4 commercial product ad edits and After Effects motion callouts.',
      preferredMeetingDate: '2026-11-15',
      preferredMeetingTime: '4:00 PM IST',
      referenceLink: 'https://drive.google.com/file/d/example',
      consent: true,
      website: '',
    });
    expect(good.success).toBe(true);
  });

  it('validates Asia/Kolkata booking requests strictly', () => {
    const good = bookingRequestSchema.safeParse({
      fullName: 'Priya Sharma',
      email: 'priya@agency.co',
      phoneWhatsapp: '+91 9811122233',
      topic: 'Monthly Social Media Retainer',
      preferredDate: '2026-11-20',
      preferredTime: '11:00 AM – 1:00 PM IST',
      timezone: 'Asia/Kolkata',
      consent: true,
    });
    expect(good.success).toBe(true);
  });

  it('enforces sliding-window IP rate limits', () => {
    const t0 = 1_700_000_000_000;
    expect(checkRateLimit('ip-1', 2, 60_000, t0).allowed).toBe(true);
    expect(checkRateLimit('ip-1', 2, 60_000, t0 + 1000).allowed).toBe(true);
    const blocked = checkRateLimit('ip-1', 2, 60_000, t0 + 2000);
    expect(blocked.allowed).toBe(false);
    expect(blocked.retryAfterSeconds).toBeGreaterThan(50);
  });
});
