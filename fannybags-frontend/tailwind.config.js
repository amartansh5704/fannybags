/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'fb-purple': '#50207A',
        'fb-pink': '#FF48B9',
        'fb-green': '#12CE6A',
        'fb-dark': '#0a0a0a',
        'fb-surface': '#1a1a1a',
      },
      backgroundColor: {
        'fb-dark': '#0a0a0a',
        'fb-surface': '#1a1a1a',
      },
      textColor: {
        'fb-pink': '#FF48B9',
      },
    },
  },
  plugins: [],
}