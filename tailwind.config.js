export default {content: [
  './index.html',
  './src/**/*.{js,ts,jsx,tsx}'
],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: {
          50: '#f5f7ef',
          100: '#e8eedb',
          200: '#d2ddba',
          300: '#b3c491',
          400: '#93a86a',
          500: '#6b7f4a', // olive green from design
          600: '#5b6d3f',
          700: '#495734',
          800: '#3a462c',
          900: '#2f3925',
        },
        accent: {
          orange: '#ea580c',
          amber: '#f59e0b',
        },
        cream: {
          50: '#faf8f3',
          100: '#f3efe4',
          200: '#e9e3d3',
        },
        ink: {
          50: '#f6f7f6',
          100: '#eceeeb',
          200: '#dcdfda',
          300: '#b9bfb6',
          400: '#8b938a',
          500: '#5f665e',
          600: '#454b44',
          700: '#333833',
          800: '#22261f',
          900: '#171a16',
          950: '#0f120f',
        },
      },
      boxShadow: {
        card: '0 1px 2px rgba(23, 26, 22, 0.04), 0 8px 24px -12px rgba(23, 26, 22, 0.10)',
        lift: '0 8px 16px -6px rgba(23, 26, 22, 0.10), 0 24px 48px -20px rgba(23, 26, 22, 0.22)',
        header: '0 1px 0 rgba(23,26,22,0.06), 0 8px 24px -18px rgba(23,26,22,0.25)',
      },
      transitionTimingFunction: {
        premium: 'cubic-bezier(0.23, 1, 0.32, 1)',
      },
      keyframes: {
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
      },
      animation: {
        shimmer: 'shimmer 1.6s infinite',
      },
    },
  },
}
