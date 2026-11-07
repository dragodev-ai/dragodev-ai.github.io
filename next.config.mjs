const isGithubPages = process.env.GITHUB_PAGES === 'true';
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

/** @type {import('next').NextConfig} */
const nextConfig = {
  devIndicators: false,
  transpilePackages: ['three'],
  ...(isGithubPages
    ? {
        output: 'export',
        trailingSlash: true,
        basePath,
      }
    : {}),
  images: {
    unoptimized: isGithubPages,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'drive.google.com',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
    ],
  },
  ...(!isGithubPages
    ? {
        headers: async () => [
          {
            source: '/videos/:path*',
            headers: [
              {
                key: 'Cache-Control',
                value: 'public, max-age=31536000, immutable',
              },
            ],
          },
          {
            source: '/models/:path*',
            headers: [
              {
                key: 'Cache-Control',
                value: 'public, max-age=31536000, immutable',
              },
            ],
          },
          {
            source: '/audio/:path*',
            headers: [
              {
                key: 'Cache-Control',
                value: 'public, max-age=86400, stale-while-revalidate=604800',
              },
            ],
          },
        ],
      }
    : {}),
};

export default nextConfig;
