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
        serif: ['var(--font-serif)', 'serif'],
        condensed: ['var(--font-condensed)', 'sans-serif'],
        sans: ['var(--font-sans)', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      fontSize: {
        'phi-xs': ['0.688rem', { lineHeight: '1.382', letterSpacing: '0.22em' }],
        'phi-sm': ['0.875rem', { lineHeight: '1.618' }],
        'phi-base': ['clamp(1rem, 0.96rem + 0.22vw, 1.125rem)', { lineHeight: '1.618' }],
        'phi-md': [
          'clamp(1.25rem, 1.08rem + 0.65vw, 1.618rem)',
          { lineHeight: '1.382', letterSpacing: '-0.015em' },
        ],
        'phi-lg': [
          'clamp(1.618rem, 1.3rem + 1.3vw, 2.618rem)',
          { lineHeight: '1.08', letterSpacing: '-0.028em' },
        ],
        'phi-xl': [
          'clamp(2.35rem, 1.75rem + 2.8vw, 4.236rem)',
          { lineHeight: '0.96', letterSpacing: '-0.035em' },
        ],
      },
      spacing: {
        'phi-1': '1rem',
        'phi-2': '1.618rem',
        'phi-3': '2.618rem',
        'phi-4': '4.236rem',
        'phi-5': '6.854rem',
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

