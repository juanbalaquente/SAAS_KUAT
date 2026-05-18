/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        barbearia: '#E8593C',
        lavajato: '#E8A020',
        adega: '#4CAF70',
      },
    },
  },
  plugins: [],
}
