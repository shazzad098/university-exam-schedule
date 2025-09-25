/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  // ---> সমস্যার সমাধান এই অংশে <---
  future: {
    // আধুনিক কালার ফরম্যাট (oklch) বন্ধ করে দিন
    modernColorFormat: false,
  },
  plugins: [],
}