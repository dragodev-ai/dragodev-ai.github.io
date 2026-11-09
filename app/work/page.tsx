import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, ArrowUpRight } from 'lucide-react';
import { getPublicProjects, projectsManifest } from '@/lib/content';
import { PortfolioExplorer } from '@/components/portfolio/PortfolioExplorer';
import { CinemaVideoPlayerModal } from '@/components/portfolio/CinemaVideoPlayerModal';
import { StudioFooter } from '@/components/navigation/StudioFooter';

export const metadata: Metadata = {
  title: 'Complete Work & Video Portfolio Archive',
  description:
    'Browse all 230+ verified Google Drive video edits, commercial shoots, AI productions, motion graphics, brand designs, and photography by Dev Kumawat.',
  alternates: {
    canonical: '/work',
  },
};

export default function WorkPortfolioPage() {
  const allProjects = getPublicProjects();

  return (
    <main className="relative min-h-screen bg-transparent pt-24">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 pt-4 sm:px-8">
        <Link
          href="/"
          data-glow-btn=""
          className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-[#070D22]/85 px-4 py-2.5 font-condensed text-xs font-bold uppercase tracking-[0.2em] text-white shadow-[0_8px_24px_rgba(0,0,0,0.45)] backdrop-blur-xl transition hover:border-white/45"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          BACK TO STUDIO HOME
        </Link>

        <Link
          href="/#contact"
          data-glow-btn=""
          data-cta-gold=""
          className="btn-cta-gold inline-flex items-center gap-2 rounded-full px-5 py-2.5 font-condensed text-xs font-extrabold uppercase tracking-[0.2em]"
        >
          HIRE ME NOW
          <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <PortfolioExplorer
        projects={allProjects}
        categories={projectsManifest.categories}
        initialPageSize={24}
        heading="COMPLETE WORK ARCHIVE"
        isStandalonePage
      />

      <StudioFooter />
      <CinemaVideoPlayerModal allProjects={allProjects} />
    </main>
  );
}

