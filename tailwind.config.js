/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: { extend: {
    colors: { cream: '#FAF7F2', sand: '#F2ECE4', clay: '#C5A38A', earth: '#9E7B62', ink: '#2C2420' },
    fontFamily: { serif: ['Cormorant Garamond', 'serif'], sans: ['Noto Sans', 'sans-serif'] }
  }},
  plugins: []
}
