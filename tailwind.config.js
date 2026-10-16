/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Outfit', 'Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        brand: {
          navy: '#0F172A',
          navyDeep: '#0A0F1D',
          navySurface: '#131C2E',
          card: '#162032',
          cardLight: '#FFFFFF',
          oddsBox: '#1A2438',
          oddsBoxLight: '#F1F5F9',
          oddsActive: '#2563EB',
          primary: '#2563EB',
          primaryDark: '#1D4ED8',
          primaryLight: '#3B82F6',
          emerald: '#10B981',
          gold: '#F59E0B',
          border: '#243248',
          borderLight: '#E2E8F0',
        }
      },
      boxShadow: {
        'brand-btn': '0 2px 8px rgba(37, 99, 235, 0.35)',
        'odds-active': '0 0 10px rgba(37, 99, 235, 0.4)',
      }
    },
  },
  plugins: [],
}
