/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: ['class'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['-apple-system','BlinkMacSystemFont','"SF Pro Text"','"Segoe UI"','Roboto','Arial','Helvetica','sans-serif']
      },
      colors: {
        ios: { blue:'#0a5fa3', brown:'#5c3a12', orange:'#d68406', grey:'#e9eaec', text:'#111', subtle:'#6b7280' }
      },
      borderRadius: { '2xl': '22px' }
    }
  },
  plugins: []
}
