// @ts-check
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";

// Production: https://raziqsm.warkophajisobirin.fun/Raziqsm-LandingPage/
// (home server behind a Cloudflare Tunnel, see "Production" in README.md)
export default defineConfig({
  site: "https://raziqsm.warkophajisobirin.fun",
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
