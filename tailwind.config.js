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
        sporty: {
          red: '#E41B23',
          redHover: '#C62828',
          redLight: '#FFEBEE',
          dark: '#111418',
          card: '#1B1F24',
          cardLight: '#FFFFFF',
          oddsBox: '#222831',
          oddsBoxLight: '#F3F4F6',
          border: '#2A303C',
          borderLight: '#E5E7EB',
          green: '#00A826',
          yellow: '#FFB800',
        }
      },
      boxShadow: {
        'sporty-btn': '0 2px 8px rgba(228, 27, 35, 0.35)',
        'odds-active': '0 0 10px rgba(228, 27, 35, 0.4)',
      }
    },
  },
  plugins: [],
}
