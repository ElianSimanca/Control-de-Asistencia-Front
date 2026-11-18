/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          blue: '#1A365D',   // Azul marino del logo
          green: '#15803D',  // Verde del logo
          yellow: '#CA8A04', // Amarillo del logo
          red: '#B91C1C',    // Rojo del logo
        }
      },
    },
  },
  plugins: [],
}
