import type { Metadata } from 'next';
import { Syne, Oswald, Plus_Jakarta_Sans, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { profileContent, siteConfigContent, socialLinksContent } from '@/lib/content';
import { StudioExperienceProvider } from '@/lib/audio/studio-audio-context';
import { FixedGlassNavbar } from '@/components/navigation/FixedGlassNavbar';
import { FloatingWhatsAppButton } from '@/components/contact/FloatingWhatsAppButton';

const fontDisplay = Syne({
  subsets: ['latin'],
  weight: ['700', '800'],
  variable: '--font-display',
  display: 'swap',
});

const fontCondensed = Oswald({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-condensed',
  display: 'swap',
});

const fontSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-sans',
  display: 'swap',
});

const fontMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '600'],
  variable: '--font-mono',
  display: 'swap',
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: siteConfigContent.siteTitle,
    template: `%s | ${siteConfigContent.siteName}`,
  },
  description: siteConfigContent.siteDescription,
  keywords: siteConfigContent.keywords,
  authors: [{ name: profileContent.name }],
  creator: profileContent.name,
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: siteConfigContent.locale,
    url: siteUrl,
    siteName: siteConfigContent.siteName,
    title: siteConfigContent.siteTitle,
    description: siteConfigContent.siteDescription,
    images: [
      {
        url: '/assets/dev-studio-portrait.jpg',
        width: 900,
        height: 1000,
        alt: 'Dev Kumawat — DEV STUDIO Immersive 3D Creative Portfolio',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: siteConfigContent.siteTitle,
    description: siteConfigContent.siteDescription,
    images: ['/assets/dev-studio-portrait.jpg'],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const personJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: profileContent.name,
    jobTitle: profileContent.roles,
    email: `mailto:${profileContent.contact.email}`,
    telephone: profileContent.contact.phone,
    image: `${siteUrl}${profileContent.portraitUrl}`,
    url: siteUrl,
    address: {
      '@type': 'PostalAddress',
      addressLocality: profileContent.location.city,
      addressRegion: profileContent.location.state,
      addressCountry: profileContent.location.country,
    },
    alumniOf: {
      '@type': 'CollegeOrUniversity',
      name: profileContent.education.institution,
    },
    sameAs: socialLinksContent.socials.map((s) => s.url),
  };

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${fontDisplay.variable} ${fontCondensed.variable} ${fontSans.variable} ${fontMono.variable}`}
    >
      <head>
        <link rel="preconnect" href="https://drive.google.com" crossOrigin="anonymous" />
        <link
          rel="preconnect"
          href="https://drive.usercontent.google.com"
          crossOrigin="anonymous"
        />
        <link rel="preload" as="image" href="/videos/dev-kumawat-hero-poster.jpg" />
      </head>
      <body
        suppressHydrationWarning
        className="min-h-screen bg-[#070709] font-sans text-zinc-100 antialiased"
      >
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-xl focus:bg-purple-600 focus:px-4 focus:py-2 focus:text-sm focus:font-bold focus:text-white"
        >
          Skip to main content
        </a>

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
        />

        <StudioExperienceProvider>
          <FixedGlassNavbar />
          <div id="main-content">{children}</div>
          <FloatingWhatsAppButton />
        </StudioExperienceProvider>
      </body>
    </html>
  );
}

