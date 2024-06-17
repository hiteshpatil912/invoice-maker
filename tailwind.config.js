/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      animation: {
        'slow-bounce': 'bounce 4s infinite',
      },
    },
  },
  plugins: [],
}