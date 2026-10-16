/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        pitch: {
          950: '#060A12',
          900: '#0B111E',
          850: '#0F172A',
          800: '#152037',
          750: '#1B2945',
          700: '#243557',
          600: '#334A75',
          500: '#4A6598',
        },
        brand: {
          green: '#10B981',
          greenLight: '#34D399',
          greenDark: '#059669',
          gold: '#F59E0B',
          navy: '#0B111E',
          card: '#131C2E',
          cardBorder: '#1E2D4A',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      animation: {
        'ladder-pulse': 'ladderGlow 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        ladderGlow: {
          '0%, 100%': { opacity: '1', boxShadow: '0 0 14px rgba(16, 185, 129, 0.35)' },
          '50%': { opacity: '0.88', boxShadow: '0 0 4px rgba(16, 185, 129, 0.15)' },
        }
      }
    },
  },
  plugins: [],
}
