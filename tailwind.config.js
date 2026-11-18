/** @type {import('tailwindcss').Config} */
import { heroui } from "@heroui/react";

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}", // IMPORTANTE PARA HEROUI
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          blue: '#1A365D',
          green: '#15803D',
          yellow: '#CA8A04',
          red: '#B91C1C',
        }
      },
    },
  },
  darkMode: "class",
  plugins: [heroui()], // AQUÍ SE ACTIVA HEROUI
}
