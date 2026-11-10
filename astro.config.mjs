// @ts-check
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";

// GitHub Pages: https://itsraziqsm.github.io/Raziqsm-LandingPage/
export default defineConfig({
  site: "https://itsraziqsm.github.io",
  base: "/Raziqsm-LandingPage",
  devToolbar: { enabled: false },
  // Hosts allowed to reach `npm run dev` / `npm run preview` besides localhost
  // (e.g. a Cloudflare Tunnel). Does not affect the built site.
  server: { allowedHosts: ["raziqsm.warkophajisobirin.fun"] },
  vite: {
    plugins: [tailwindcss()],
    // three.js is lazy-loaded in its own chunk for the hero Zebo
    build: { chunkSizeWarningLimit: 700 },
  },
});
