/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: { paper: '#efeeea', panel: '#e7e6e1', ink: '#17191a', dark: '#181a1b', steel: '#80817e', line: '#d6d5d0' },
      fontFamily: { sans: ['Poppins', 'system-ui', 'sans-serif'] },
    },
  },
  plugins: [],
};
