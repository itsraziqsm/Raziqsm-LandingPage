// @ts-check
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";

// GitHub Pages: https://itsraziqsm.github.io/Raziqsm-LandingPage/
export default defineConfig({
  site: "https://itsraziqsm.github.io",
  base: "/Raziqsm-LandingPage",
  devToolbar: { enabled: false },
  vite: {
    plugins: [tailwindcss()],
    // three.js is lazy-loaded in its own chunk for the hero Zebo
    build: { chunkSizeWarningLimit: 700 },
  },
});
