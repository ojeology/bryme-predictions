/** @type {import('tailwindcss').Config} */
export default {
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
        fortegreen: {
          DEFAULT: '#00B140',
          neon: '#00E676',
          dark: '#008730',
          glow: 'rgba(0, 230, 118, 0.35)',
        },
        pitch: {
          950: '#04070F',
          900: '#070D1A',
          850: '#0C1527',
          800: '#121E36',
          750: '#182847',
          700: '#21355D',
          600: '#314C83',
        },
        gold: {
          400: '#FCD34D',
          500: '#F59E0B',
          600: '#D97706',
          glow: 'rgba(245, 158, 11, 0.4)',
        }
      },
      boxShadow: {
        'glow-green': '0 0 25px rgba(0, 230, 118, 0.35)',
        'glow-gold': '0 0 25px rgba(245, 158, 11, 0.4)',
        'glow-blue': '0 0 25px rgba(59, 130, 246, 0.35)',
        'card-subtle': '0 10px 30px -10px rgba(0, 0, 0, 0.5)',
      },
      animation: {
        'pulse-glow': 'pulseGlow 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'marquee': 'marquee 28s linear infinite',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { opacity: '1', filter: 'drop-shadow(0 0 12px rgba(0, 230, 118, 0.6))' },
          '50%': { opacity: '0.85', filter: 'drop-shadow(0 0 4px rgba(0, 230, 118, 0.2))' },
        },
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        }
      }
    },
  },
  plugins: [],
}
