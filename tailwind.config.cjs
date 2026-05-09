/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'ui-sans-serif', 'system-ui']
      },
      colors: {
        iim: {
          cream: '#F6EEDC',
          sand: '#E7D1AA',
          gold: '#C99648',
          brown: '#7A4E2D',
          coffee: '#2B2118',
          charcoal: '#14110D'
        }
      },
      boxShadow: {
        premium: '0 24px 80px rgba(20, 17, 13, 0.18)',
        glow: '0 0 42px rgba(201, 150, 72, 0.28)'
      }
    }
  },
  plugins: []
};
