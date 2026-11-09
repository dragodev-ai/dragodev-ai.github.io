'use client';

import React, { useMemo, useState } from 'react';
import {
  Film,
  Grid,
  Image as ImageIcon,
  List,
  Play,
  Search,
  SlidersHorizontal,
  X,
} from 'lucide-react';
import type { DriveCategoryNode, PortfolioProject } from '@/lib/content/types';
import { getFallbackPosterDataUri, getProjectThumbnailUrl } from '@/lib/content';
import { useStudioExperience } from '@/lib/audio/studio-audio-context';
import { warmProjectMedia } from '@/lib/google-drive/client-warm';

interface PortfolioExplorerProps {
  projects: PortfolioProject[];
  categories: DriveCategoryNode[];
  initialPageSize?: number;
  heading?: string;
  isStandalonePage?: boolean;
}

export function PortfolioExplorer({
  projects,
  categories,
  initialPageSize = 18,
  heading = 'COMPLETE PORTFOLIO ARCHIVE',
  isStandalonePage = false,
}: PortfolioExplorerProps) {
  const { openProject, playUiTick } = useStudioExperience();

  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('ALL');
  const [mediaFilter, setMediaFilter] = useState<'ALL' | 'video' | 'image'>('ALL');
  const [sortMode, setSortMode] = useState<'featured' | 'latest' | 'az'>('featured');
  const [layoutMode, setLayoutMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [visibleCount, setVisibleCount] = useState<number>(initialPageSize);
  const [failedImageIds, setFailedImageIds] = useState<Record<string, boolean>>({});

  const activeCategoryNode = useMemo(
    () => categories.find((c) => c.name === selectedCategory),
    [categories, selectedCategory]
  );

  const visibleProjects = useMemo(
    () => projects.filter((p) => !failedImageIds[p.id]),
    [projects, failedImageIds]
  );

  const categoryCounts = useMemo(() => {
    const map = new Map<string, number>();
    for (const p of visibleProjects) {
      map.set(p.category, (map.get(p.category) || 0) + 1);
    }
    return map;
  }, [visibleProjects]);

  const filteredProjects = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const list = visibleProjects.filter((p) => {
      if (selectedCategory !== 'ALL' && p.category !== selectedCategory) return false;
      if (selectedSubcategory !== 'ALL' && p.subcategory !== selectedSubcategory) return false;
      if (mediaFilter !== 'ALL' && p.mediaType !== mediaFilter) return false;
      if (q) {
        const hay = `${p.title} ${p.category} ${p.subcategory} ${p.fileName} ${p.verifiedLabel || ''}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });

    if (sortMode === 'latest') {
      return [...list].sort((a, b) => (b.modifiedTime || '').localeCompare(a.modifiedTime || ''));
    }
    if (sortMode === 'az') {
      return [...list].sort((a, b) => a.title.localeCompare(b.title));
    }
    return [...list].sort((a, b) => a.order - b.order);
  }, [visibleProjects, selectedCategory, selectedSubcategory, mediaFilter, searchQuery, sortMode]);

  const displayedProjects = filteredProjects.slice(0, visibleCount);

  const handleCategoryChange = (cat: string) => {
    playUiTick();
    setSelectedCategory(cat);
    setSelectedSubcategory('ALL');
    setVisibleCount(initialPageSize);
  };

  return (
    <section
      id={isStandalonePage ? 'work-archive' : 'explorer'}
      aria-label="Complete Google Drive Portfolio Explorer"
      data-testid="portfolio-explorer"
      className="relative bg-[#09090e] py-phi-4 sm:py-phi-5"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Golden Ratio Header */}
        <div className="mb-phi-3 flex flex-col justify-between gap-phi-2 border-b border-white/10 pb-phi-2 lg:flex-row lg:items-end">
          <div>
            <span className="mb-2 block font-mono text-phi-xs font-semibold uppercase text-[#7C9BFF]">
              VERIFIED CLIENT VAULT · {visibleProjects.length} REAL DELIVERIES
            </span>
            {isStandalonePage ? (
              <h1 className="break-words font-display text-phi-xl font-extrabold uppercase text-white">
                {heading}
              </h1>
            ) : (
              <h2 className="break-words font-display text-phi-xl font-extrabold uppercase text-white">
                {heading}
              </h2>
            )}
          </div>

          {/* Search Input + Grid/List + Sort Controls */}
          <div className="flex w-full flex-wrap items-center gap-3 lg:w-auto">
            <div className="relative min-w-0 flex-1 sm:min-w-[240px] sm:w-72">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              <input
                type="search"
                suppressHydrationWarning
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setVisibleCount(initialPageSize);
                }}
                placeholder="Search brand, reel, category..."
                aria-label="Search portfolio projects"
                data-testid="portfolio-search-input"
                className="w-full rounded-xl border border-white/15 bg-[#12121a] py-2.5 pl-10 pr-9 text-sm text-white placeholder-zinc-500 focus:border-[#3B63FF] focus:outline-none"
              />
              {searchQuery && (
                <button
                  type="button"
                  aria-label="Clear search"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            <div className="inline-flex items-center gap-1.5 rounded-xl border border-white/12 bg-[#12121a] px-2.5 py-2">
              <SlidersHorizontal className="h-3.5 w-3.5 text-zinc-400" />
              <select
                suppressHydrationWarning
                aria-label="Sort portfolio projects"
                data-testid="portfolio-sort-select"
                value={sortMode}
                onChange={(e) => setSortMode(e.target.value as 'featured' | 'latest' | 'az')}
                className="bg-transparent font-mono text-xs uppercase text-zinc-200 focus:outline-none"
              >
                <option value="featured" className="bg-[#12121a]">
                  Featured First
                </option>
                <option value="latest" className="bg-[#12121a]">
                  Latest Modified
                </option>
                <option value="az" className="bg-[#12121a]">
                  Title A–Z
                </option>
              </select>
            </div>

            {/* Layout Toggle */}
            <div
              role="group"
              aria-label="Layout toggle"
              className="inline-flex gap-1 rounded-xl border border-white/12 bg-[#12121a] p-1"
            >
              <button
                type="button"
                data-glow-btn=""
                aria-label="Grid layout"
                aria-pressed={layoutMode === 'grid'}
                data-testid="layout-grid-btn"
                onClick={() => setLayoutMode('grid')}
                className={`rounded-lg border p-1.5 transition ${
                  layoutMode === 'grid'
                    ? 'border-[#60A5FA]/50 bg-[#3B63FF] text-white'
                    : 'border-transparent text-zinc-400 hover:text-white'
                }`}
              >
                <Grid className="h-4 w-4" />
              </button>
              <button
                type="button"
                data-glow-btn=""
                aria-label="List layout"
                aria-pressed={layoutMode === 'list'}
                data-testid="layout-list-btn"
                onClick={() => setLayoutMode('list')}
                className={`rounded-lg border p-1.5 transition ${
                  layoutMode === 'list'
                    ? 'border-[#60A5FA]/50 bg-[#3B63FF] text-white'
                    : 'border-transparent text-zinc-400 hover:text-white'
                }`}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Real Google Drive Category Filter Bar */}
        <div
          role="tablist"
          aria-label="Google Drive Portfolio Categories"
          className="mb-4 flex flex-wrap gap-2"
        >
          <button
            type="button"
            role="tab"
            data-glow-btn=""
            aria-selected={selectedCategory === 'ALL'}
            data-testid="category-filter-ALL"
            onClick={() => handleCategoryChange('ALL')}
            className={`rounded-full border px-4 py-2 font-condensed text-xs font-bold uppercase tracking-[0.18em] transition active:scale-[0.97] ${
              selectedCategory === 'ALL'
                ? 'border-[#60A5FA]/60 bg-[#3B63FF] text-white shadow-[0_6px_22px_rgba(59,99,255,0.45)]'
                : 'border-white/12 bg-[#12121a] text-zinc-300 hover:text-white'
            }`}
          >
            ALL ({projects.length})
          </button>

          {categories.map((cat) => {
            const count = categoryCounts.get(cat.name) || 0;
            if (count === 0) return null;
            const active = selectedCategory === cat.name;
            return (
              <button
                key={cat.id}
                type="button"
                role="tab"
                data-glow-btn=""
                aria-selected={active}
                data-testid={`category-filter-${cat.name}`}
                onClick={() => handleCategoryChange(cat.name)}
                className={`rounded-full border px-4 py-2 font-condensed text-xs font-bold uppercase tracking-[0.16em] transition ${
                  active
                    ? 'border-[#60A5FA]/60 bg-[#3B63FF] text-white shadow-[0_6px_22px_rgba(59,99,255,0.45)]'
                    : 'border-white/12 bg-[#12121a] text-zinc-300 hover:text-white'
                }`}
              >
                {cat.name} ({count})
              </button>
            );
          })}
        </div>

        {/* Subcategory Pills (when a Drive folder with subfolders like Graphics or AD - Shoot is selected) + Media Type Filter */}
        <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {activeCategoryNode && activeCategoryNode.subcategories.length > 0 && (
              <>
                <span className="font-mono text-[11px] uppercase tracking-wider text-zinc-500">
                  SUBFOLDERS:
                </span>
                <button
                  type="button"
                  data-glow-btn=""
                  onClick={() => setSelectedSubcategory('ALL')}
                  className={`rounded-lg border px-3 py-1 font-mono text-xs ${
                    selectedSubcategory === 'ALL'
                      ? 'border-[#60A5FA]/50 bg-[#3B63FF]/20 text-blue-200'
                      : 'border-white/10 bg-white/5 text-zinc-300 hover:bg-white/10'
                  }`}
                >
                  All {activeCategoryNode.name}
                </button>
                {activeCategoryNode.subcategories.map((sub) => (
                  <button
                    key={sub.id}
                    type="button"
                    data-glow-btn=""
                    onClick={() => setSelectedSubcategory(sub.name)}
                    className={`rounded-lg border px-3 py-1 font-mono text-xs ${
                      selectedSubcategory === sub.name
                        ? 'border-[#60A5FA]/50 bg-[#3B63FF]/20 text-blue-200'
                        : 'border-white/10 bg-white/5 text-zinc-300 hover:bg-white/10'
                    }`}
                  >
                    {sub.name}
                  </button>
                ))}
              </>
            )}
          </div>

          <div className="flex items-center gap-2">
            {(['ALL', 'video', 'image'] as const).map((mf) => (
              <button
                key={mf}
                type="button"
                data-glow-btn=""
                onClick={() => {
                  setMediaFilter(mf);
                  setVisibleCount(initialPageSize);
                }}
                className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1 font-mono text-[11px] uppercase ${
                  mediaFilter === mf
                    ? 'border-[#60A5FA]/50 bg-[#3B63FF]/20 text-white'
                    : 'border-white/10 bg-white/[0.03] text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {mf === 'video' && <Film className="h-3 w-3" />}
                {mf === 'image' && <ImageIcon className="h-3 w-3" />}
                {mf === 'ALL' ? 'All Media' : mf === 'video' ? 'Videos Only' : 'Designs & Photos'}
              </button>
            ))}
          </div>
        </div>

        {/* Empty State */}
        {displayedProjects.length === 0 ? (
          <div
            data-glow=""
            className="rounded-3xl border border-white/10 bg-[#12121a] p-12 text-center"
          >
            <p className="font-sans text-lg font-semibold text-white">
              No portfolio items matched your current filter.
            </p>
            <button
              type="button"
              data-glow-btn=""
              onClick={() => {
                setSelectedCategory('ALL');
                setSelectedSubcategory('ALL');
                setMediaFilter('ALL');
                setSearchQuery('');
              }}
              className="mt-4 rounded-full border border-[#60A5FA]/50 bg-[#3B63FF] px-5 py-2.5 font-condensed text-xs font-bold uppercase tracking-[0.2em] text-white"
            >
              RESET FILTERS
            </button>
          </div>
        ) : layoutMode === 'grid' ? (
          <div
            data-testid="portfolio-grid"
            className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
          >
            {displayedProjects.map((project) => (
              <button
                key={project.id}
                type="button"
                data-glow=""
                onClick={() => openProject(project)}
                onMouseEnter={() => void warmProjectMedia(project)}
                onFocus={() => void warmProjectMedia(project)}
                onTouchStart={() => void warmProjectMedia(project)}
                data-testid={`explorer-card-${project.id}`}
                className="group flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#12121a] text-left transition duration-300 hover:-translate-y-1 hover:border-[#3B63FF]/60 hover:shadow-[0_18px_40px_rgba(59,99,255,0.2)]"
              >
                <div className="relative aspect-video w-full overflow-hidden bg-black">
                  <img
                    src={getProjectThumbnailUrl(project, 'w640')}
                    alt={`${project.title} — ${project.category}`}
                    loading="lazy"
                    decoding="async"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      if (project.mediaType === 'image') {
                        setFailedImageIds((prev) =>
                          prev[project.id] ? prev : { ...prev, [project.id]: true }
                        );
                        return;
                      }
                      e.currentTarget.src = getFallbackPosterDataUri(
                        project.title,
                        project.category
                      );
                    }}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#12121a] via-transparent to-transparent opacity-80" />
                  <span className="absolute left-3 top-3 rounded-full border border-white/15 bg-black/70 px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-zinc-200 backdrop-blur-md">
                    {project.subcategory ? `${project.category} · ${project.subcategory}` : project.category}
                  </span>
                  <span className="absolute bottom-3 right-3 flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-black/70 text-white transition group-hover:border-[#60A5FA] group-hover:bg-[#3B63FF]">
                    {project.mediaType === 'video' ? (
                      <Play className="h-4 w-4 fill-current" />
                    ) : (
                      <ImageIcon className="h-4 w-4" />
                    )}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-3 px-4 py-3.5">
                  <h3 className="line-clamp-1 font-sans text-sm font-bold text-white group-hover:text-blue-200 sm:text-base">
                    {project.title}
                  </h3>
                  <span className="shrink-0 font-mono text-[10px] tabular-nums text-zinc-500">
                    {project.year}
                  </span>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div
            data-glow=""
            data-testid="portfolio-list"
            className="divide-y divide-white/10 rounded-2xl border border-white/10 bg-[#12121a]"
          >
            {displayedProjects.map((project) => (
              <button
                key={project.id}
                type="button"
                onClick={() => openProject(project)}
                onMouseEnter={() => void warmProjectMedia(project)}
                onFocus={() => void warmProjectMedia(project)}
                onTouchStart={() => void warmProjectMedia(project)}
                className="group flex w-full items-center justify-between gap-4 p-4 text-left transition hover:bg-white/[0.03]"
              >
                <div className="flex min-w-0 items-center gap-4">
                  <div className="relative h-16 w-28 shrink-0 overflow-hidden rounded-xl bg-black">
                    <img
                      src={getProjectThumbnailUrl(project, 'w320')}
                      alt={project.title}
                      loading="lazy"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        if (project.mediaType === 'image') {
                          setFailedImageIds((prev) =>
                            prev[project.id] ? prev : { ...prev, [project.id]: true }
                          );
                          return;
                        }
                        e.currentTarget.src = getFallbackPosterDataUri(
                          project.title,
                          project.category
                        );
                      }}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-sans text-sm font-bold text-white group-hover:text-blue-200 sm:text-base">
                      {project.title}
                    </p>
                    <p className="mt-0.5 font-mono text-xs text-zinc-400">
                      {project.category}
                      {project.subcategory ? ` / ${project.subcategory}` : ''} · {project.year}
                    </p>
                  </div>
                </div>
                <span
                  data-glow-btn=""
                  className="shrink-0 rounded-full border border-white/15 px-3.5 py-1.5 font-condensed text-xs font-semibold uppercase tracking-[0.18em] text-zinc-200 group-hover:border-[#60A5FA] group-hover:bg-[#3B63FF] group-hover:text-white"
                >
                  {project.mediaType === 'video' ? 'WATCH' : 'VIEW'}
                </span>
              </button>
            ))}
          </div>
        )}

        {/* Incremental Lazy Load More Button */}
        {visibleCount < filteredProjects.length && (
          <div className="mt-10 flex flex-col items-center gap-2">
            <button
              type="button"
              data-glow-btn=""
              onClick={() => setVisibleCount((prev) => prev + 24)}
              data-testid="explorer-load-more"
              className="rounded-full border border-[#3B63FF]/55 bg-[#3B63FF]/20 px-8 py-3 font-condensed text-xs font-bold uppercase tracking-[0.22em] text-white transition hover:bg-[#3B63FF]"
            >
              LOAD MORE PROJECTS ({filteredProjects.length - visibleCount} REMAINING)
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
