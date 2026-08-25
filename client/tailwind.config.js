/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: {
          50: '#eef1ff',
          100: '#e0e4ff',
          200: '#c6ccff',
          300: '#a5abff',
          400: '#8781ff',
          500: '#6d5df5',
          600: '#5a3fe0',
          700: '#4b30c2',
          800: '#3d299c',
          900: '#33257c',
          950: '#1e1547',
        },
        accent: {
          400: '#c084fc',
          500: '#a855f7',
          600: '#9333ea',
        },
        navy: '#0F1230',
        success: '#10B981',
        warning: '#F59E0B',
        danger: '#EF4444',
      },
      boxShadow: {
        soft: '0 2px 8px rgba(15, 18, 48, 0.06)',
        card: '0 8px 30px rgba(30, 21, 71, 0.08)',
        glow: '0 0 40px rgba(109, 93, 245, 0.25)',
      },
      borderRadius: {
        xl2: '1.25rem',
      },
      backgroundImage: {
        'hero-gradient': 'linear-gradient(135deg, #4b30c2 0%, #6d5df5 45%, #a855f7 100%)',
        'card-gradient': 'linear-gradient(135deg, rgba(109,93,245,0.08) 0%, rgba(168,85,247,0.08) 100%)',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'fade-up': 'fadeUp 0.6s ease-out both',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        fadeUp: {
          '0%': { opacity: 0, transform: 'translateY(16px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};
