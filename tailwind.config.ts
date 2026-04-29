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
        neon: {
          cyan: '#00D9FF',
          purple: '#9D4EDD',
          pink: '#FF006E',
          lime: '#39FF14',
        },
      },
      backgroundColor: {
        'dark-bg': '#0a0e27',
        'dark-card': '#1a1f3a',
      },
      borderColor: {
        'dark-border': '#2d3561',
      },
      textColor: {
        'foreground': '#e4e4e7',
      },
      backgroundImage: {
        'gradient-neon': 'linear-gradient(135deg, #00D9FF 0%, #9D4EDD 100%)',
        'gradient-dark': 'linear-gradient(135deg, #0a0e27 0%, #1a1f3a 100%)',
      },
      boxShadow: {
        'neon-cyan': '0 0 20px rgba(0, 217, 255, 0.5)',
        'neon-purple': '0 0 20px rgba(157, 78, 221, 0.5)',
        'neon-pink': '0 0 20px rgba(255, 0, 110, 0.5)',
      },
      animation: {
        'pulse-neon': 'pulse-neon 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite',
      },
      keyframes: {
        'pulse-neon': {
          '0%, 100%': { opacity: '1', boxShadow: '0 0 20px rgba(0, 217, 255, 0.5)' },
          '50%': { opacity: '0.8', boxShadow: '0 0 30px rgba(0, 217, 255, 0.8)' },
        },
        'glow': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
