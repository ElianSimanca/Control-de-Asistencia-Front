/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Paleta basada en el logo
        brand: {
          blue: '#1A365D',   // Azul marino principal
          green: '#15803D',  // Verde (éxito)
          yellow: '#CA8A04', // Amarillo (advertencia)
          red: '#B91C1C',    // Rojo (peligro)
          dark: '#0F172A',   // Fondo oscuro general
          glass: 'rgba(255, 255, 255, 0.05)', // Fondo de cristal
        }
      },
      backdropBlur: {
        md: '12px',
      }
    },
  },
  plugins: [],
}
