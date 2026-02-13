/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: "#002A4E",
        "brand-dark": "#001F3A",
        "brand-light": "#E5F2FF",
      },
    },
  },
  plugins: [],
};