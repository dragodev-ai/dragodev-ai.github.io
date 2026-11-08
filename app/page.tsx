import React from 'react';
import {
  getFeaturedProjects,
  getMarqueeProjects,
  getPublicProjects,
  projectsManifest,
} from '@/lib/content';
import { VideoHeroSection } from '@/components/hero/VideoHeroSection';
import { PortfolioMarquee } from '@/components/marquee/PortfolioMarquee';
import { AboutSection } from '@/components/about/AboutSection';
import { ServicesSection } from '@/components/services/ServicesSection';
import { PricingSection } from '@/components/pricing/PricingSection';
import { StackedProjectsSection } from '@/components/projects/StackedProjectsSection';
import { PortfolioExplorer } from '@/components/portfolio/PortfolioExplorer';
import { ContactAndBookingSection } from '@/components/contact/ContactAndBookingSection';
import { CinemaVideoPlayerModal } from '@/components/portfolio/CinemaVideoPlayerModal';
import { StudioFooter } from '@/components/navigation/StudioFooter';

export default function HomePage() {
  const allProjects = getPublicProjects();
  const featuredProjects = getFeaturedProjects();
  const { row1, row2 } = getMarqueeProjects();

  return (
    <main className="relative min-h-screen bg-[#070709]">
      {/* Showcase Video Hero (DEV_KUMAWAT_SAAS_WEB.mp4) */}
      <VideoHeroSection />

      {/* Phase 5: Dual-Row Opposite-Direction Infinite Portfolio Marquee */}
      <PortfolioMarquee row1={row1} row2={row2} />

      {/* Phase 7: Editorial About Me + Floating 3D Objects + Verified Resume PDF */}
      <AboutSection />

      {/* Phase 8: High-Contrast Rounded White Services Sheet */}
      <ServicesSection allProjects={allProjects} />

      {/* Phase 9: Configurable Custom-Quote Pricing */}
      <PricingSection />

      {/* Phase 10: Sticky Stacked Featured Projects */}
      <StackedProjectsSection
        featuredProjects={featuredProjects}
        allProjects={allProjects}
      />

      {/* Phase 11: Interactive Google Drive Portfolio Explorer Section */}
      <PortfolioExplorer
        projects={allProjects}
        categories={projectsManifest.categories}
        initialPageSize={12}
        heading="232+ CLIENT PROOFS"
      />

      {/* Phase 12: Contact Form, WhatsApp & Asia/Kolkata Call Booking */}
      <ContactAndBookingSection />

      <StudioFooter />

      {/* Phase 6.4: Global Cinema Video Player Modal */}
      <CinemaVideoPlayerModal allProjects={allProjects} />
    </main>
  );
}

