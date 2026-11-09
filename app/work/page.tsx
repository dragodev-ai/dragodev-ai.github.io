import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
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
      <div className="mx-auto max-w-7xl px-4 pt-4 sm:px-8">
        <Link
          href="/"
          data-glow-btn=""
          className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-4 py-2 font-condensed text-xs font-bold uppercase tracking-[0.2em] text-zinc-200 transition hover:text-white"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          BACK TO STUDIO HOME
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

