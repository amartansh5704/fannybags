/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#50207A',      // Deep Purple
        accent: '#FF48B9',       // Neon Pink
        success: '#12CE6A',      // Electric Green
        softPink: '#F9C8E8',     // Soft Pink
      },
      fontFamily: {
        sans: ['Inter Variable', 'Poppins', 'sans-serif'],
        heyam: ["Heyam", "sans-serif"],
      },
    },
  },
  plugins: [],
}