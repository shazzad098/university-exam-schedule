export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx,html}",
    "./src/**/*.{vue,svelte}", // যদি অন্য framework ব্যবহার করেন
  ],
  theme: {
    extend: {},
  },
  future: {
    modernColorFormat: false, // এটি ঠিক আছে
  },
  plugins: [],
}
