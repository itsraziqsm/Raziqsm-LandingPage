# raziqsm · portfolio

Bilingual (EN / ID) portfolio landing page with a scroll-driven project card stack, based on the "12 skills, one 3D studio" motion reference.

**Stack:** Astro 7 · Tailwind CSS v4 · GSAP + ScrollTrigger · Lenis · three.js · Instrument Serif / Inter Tight / JetBrains Mono

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:4321/Raziqsm-LandingPage/ (English) or http://localhost:4321/Raziqsm-LandingPage/id/ (Indonesian)

## Share online (Cloudflare Tunnel)

Serve the production build, not the dev server:

```bash
npm run online
```

This builds the site and serves it on port 4321. Open `https://<your-tunnel-host>/Raziqsm-LandingPage/`.
Add new tunnel hostnames to `server.allowedHosts` in `astro.config.mjs`.

## Edit content

- **All content (profile, projects, experience, toolkit, contact):** `src/data/portfolio.ts` — every text field takes `{ en, id }`
- **UI labels (buttons, headings) in both languages:** `src/i18n.ts`
- **Page layout / sections:** `src/layouts/Page.astro` (English at `/`, Indonesian at `/id/`)
- **Placeholder illustrations:** `src/components/Scene.astro`. Pass `image` to use a real render instead.
- **Project card:** `src/components/ProjectCard.astro`
- **Scroll / card-stack animation:** `src/scripts/showcase.ts`

## Zebo (mascot)

- `public/zebo/zebo.glb`: 3D model (meshopt-compressed), shown interactively in the hero. The head follows the cursor, the arm waves, and Zebo hops when clicked. Code: `src/scripts/zebo3d.ts`. three.js is lazy-loaded only for this.
- `public/zebo/{wave,hello,cheer,point,peek}.webp`: transparent stills rendered from the model, picked per project with `pose` in `src/data/portfolio.ts`.
- `public/zebo/sticker.webp`: flat 2D artwork used for the logo and favicon.
- New poses are offsets per node (head, ears, arms, tail) in `POSES` inside `zebo3d.ts`.

## Deploy (GitHub Pages)

`.github/workflows/deploy.yml` builds and deploys on every push to `main`.
Enable it once under **Settings → Pages → Source: GitHub Actions**.
The site will be served at https://itsraziqsm.github.io/Raziqsm-LandingPage/
