import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Dewgong icy palette
        ice: {
          50:  '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
        frost: {
          50:  '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
        },
        dewgong: {
          light: '#cce8f4',
          mid:   '#5bb8e8',
          dark:  '#1a6fa8',
          deep:  '#0d3d5e',
          white: '#f0f8ff',
        },
      },
      backgroundImage: {
        'ice-gradient': 'linear-gradient(135deg, #e0f2fe 0%, #bae6fd 30%, #f0f9ff 60%, #e0f2fe 100%)',
        'frost-gradient': 'linear-gradient(180deg, #0c4a6e 0%, #075985 50%, #0369a1 100%)',
        'card-gradient': 'linear-gradient(145deg, #f0f9ff, #bae6fd)',
        'dewgong-header': 'linear-gradient(135deg, #0c4a6e 0%, #0369a1 40%, #0ea5e9 100%)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'ice': '0 4px 20px rgba(14, 165, 233, 0.15)',
        'ice-lg': '0 8px 40px rgba(14, 165, 233, 0.25)',
        'card': '0 2px 12px rgba(12, 74, 110, 0.12)',
        'card-hover': '0 8px 30px rgba(12, 74, 110, 0.22)',
      },
      animation: {
        'shimmer': 'shimmer 2s linear infinite',
        'float': 'float 3s ease-in-out infinite',
        'pulse-ice': 'pulse-ice 2s ease-in-out infinite',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        'pulse-ice': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
      },
    },
  },
  plugins: [],
}
export default config
