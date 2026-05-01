import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        accent: {
          DEFAULT: '#7c3aed',
          light: '#a78bfa',
          dark: '#5b21b6',
        },
        slate: {
          900: '#0f172a',
          800: '#1e293b',
          700: '#334155',
          200: '#e2e8f0',
          100: '#f1f5f9',
        },
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      borderRadius: {
        'xl': '12px',
        '2xl': '16px',
      },
      boxShadow: {
        'soft': '0 2px 8px rgba(0, 0, 0, 0.04)',
        'card': '0 4px 20px rgba(124, 58, 237, 0.08)',
        'card-hover': '0 8px 30px rgba(124, 58, 237, 0.12)',
      },
    },
  },
  plugins: [],
};

export default config;
