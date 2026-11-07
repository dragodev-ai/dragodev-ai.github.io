import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './three/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        studio: {
          bg: '#070709',
          surface: '#111116',
          elevated: '#181820',
          border: 'rgba(255, 255, 255, 0.08)',
          amber: '#F59E0B',
          violet: '#7C3AED',
          purple: '#9333EA',
          magenta: '#C026D3',
          paper: '#F7F6F2',
          ink: '#0A0A0C',
        },
      },
      fontFamily: {
        display: ['var(--font-display)', 'sans-serif'],
        condensed: ['var(--font-condensed)', 'sans-serif'],
        sans: ['var(--font-sans)', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      keyframes: {
        'marquee-ltr': {
          '0%': { transform: 'translate3d(-50%, 0, 0)' },
          '100%': { transform: 'translate3d(0%, 0, 0)' },
        },
        'marquee-rtl': {
          '0%': { transform: 'translate3d(0%, 0, 0)' },
          '100%': { transform: 'translate3d(-50%, 0, 0)' },
        },
      },
      animation: {
        'marquee-ltr': 'marquee-ltr 52s linear infinite',
        'marquee-rtl': 'marquee-rtl 56s linear infinite',
      },
    },
  },
  plugins: [],
};

export default config;
