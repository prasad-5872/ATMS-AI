/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        control: {
          bg: '#0B1220',
          panel: '#111A2C',
          panelAlt: '#16223B',
          border: '#1F2A44',
          borderLight: '#2D3D60',
          accent: '#22D3EE',
          red: '#EF4444',
          amber: '#F59E0B',
          green: '#22C55E',
          muted: '#8A99AD',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      keyframes: {
        pulseSignal: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.8', transform: 'scale(1.05)' },
        },
        scanline: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(1000%)' },
        }
      },
      animation: {
        'pulse-signal': 'pulseSignal 2s infinite ease-in-out',
        'scan': 'scanline 8s linear infinite',
      }
    },
  },
  plugins: [],
}
