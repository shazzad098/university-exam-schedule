// vite.config.js
import { defineConfig } from "file:///D:/Projects/university-exam-schedule/node_modules/vite/dist/node/index.js";
import tailwindcss from "file:///D:/Projects/university-exam-schedule/node_modules/@tailwindcss/vite/dist/index.mjs";
var vite_config_default = defineConfig({
  base: "./",
  // <--- এই লাইনটি যোগ করুন
  plugins: [tailwindcss()],
  server: { port: 3e3 },
  build: {
    cssMinify: true,
    // Important for Tailwind v4
    rollupOptions: {
      output: {
        manualChunks: {
          "vendor": ["jspdf", "xlsx"]
        }
      }
    }
  },
  css: {
    postcss: {
      plugins: []
    }
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJEOlxcXFxQcm9qZWN0c1xcXFx1bml2ZXJzaXR5LWV4YW0tc2NoZWR1bGVcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkQ6XFxcXFByb2plY3RzXFxcXHVuaXZlcnNpdHktZXhhbS1zY2hlZHVsZVxcXFx2aXRlLmNvbmZpZy5qc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vRDovUHJvamVjdHMvdW5pdmVyc2l0eS1leGFtLXNjaGVkdWxlL3ZpdGUuY29uZmlnLmpzXCI7Ly8gdml0ZS5jb25maWcuanNcclxuaW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndml0ZSdcclxuaW1wb3J0IHRhaWx3aW5kY3NzIGZyb20gJ0B0YWlsd2luZGNzcy92aXRlJ1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKHtcclxuICBiYXNlOiAnLi8nLCAvLyA8LS0tIFx1MDk4Rlx1MDk4NyBcdTA5QjJcdTA5QkVcdTA5ODdcdTA5QThcdTA5OUZcdTA5QkYgXHUwOUFGXHUwOUNCXHUwOTk3IFx1MDk5NVx1MDlCMFx1MDlDMVx1MDlBOFxyXG4gIHBsdWdpbnM6IFt0YWlsd2luZGNzcygpXSxcclxuICBzZXJ2ZXI6IHsgcG9ydDogMzAwMCB9LFxyXG4gIGJ1aWxkOiB7XHJcbiAgICBjc3NNaW5pZnk6IHRydWUsIC8vIEltcG9ydGFudCBmb3IgVGFpbHdpbmQgdjRcclxuICAgIHJvbGx1cE9wdGlvbnM6IHtcclxuICAgICAgb3V0cHV0OiB7XHJcbiAgICAgICAgbWFudWFsQ2h1bmtzOiB7XHJcbiAgICAgICAgICAndmVuZG9yJzogWydqc3BkZicsICd4bHN4J11cclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9LFxyXG4gIGNzczoge1xyXG4gICAgcG9zdGNzczoge1xyXG4gICAgICBwbHVnaW5zOiBbXVxyXG4gICAgfVxyXG4gIH1cclxufSkiXSwKICAibWFwcGluZ3MiOiAiO0FBQ0EsU0FBUyxvQkFBb0I7QUFDN0IsT0FBTyxpQkFBaUI7QUFFeEIsSUFBTyxzQkFBUSxhQUFhO0FBQUEsRUFDMUIsTUFBTTtBQUFBO0FBQUEsRUFDTixTQUFTLENBQUMsWUFBWSxDQUFDO0FBQUEsRUFDdkIsUUFBUSxFQUFFLE1BQU0sSUFBSztBQUFBLEVBQ3JCLE9BQU87QUFBQSxJQUNMLFdBQVc7QUFBQTtBQUFBLElBQ1gsZUFBZTtBQUFBLE1BQ2IsUUFBUTtBQUFBLFFBQ04sY0FBYztBQUFBLFVBQ1osVUFBVSxDQUFDLFNBQVMsTUFBTTtBQUFBLFFBQzVCO0FBQUEsTUFDRjtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBQUEsRUFDQSxLQUFLO0FBQUEsSUFDSCxTQUFTO0FBQUEsTUFDUCxTQUFTLENBQUM7QUFBQSxJQUNaO0FBQUEsRUFDRjtBQUNGLENBQUM7IiwKICAibmFtZXMiOiBbXQp9Cg==
