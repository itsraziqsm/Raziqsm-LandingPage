# raziqsm · portfolio

Bilingual (EN / ID) portfolio landing page with a scroll-driven project card stack, based on the "12 skills, one 3D studio" motion reference.

**Stack:** Astro 7 · Tailwind CSS v4 · GSAP + ScrollTrigger · Lenis · three.js · Instrument Serif / Inter Tight / JetBrains Mono

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:4321/Raziqsm-LandingPage/ (Indonesian, default) or http://localhost:4321/Raziqsm-LandingPage/en/ (English)

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
- **Page layout / sections:** `src/layouts/Page.astro` (Indonesian at `/`, English at `/en/`; old `/id/` links redirect to `/`)
- **Placeholder illustrations:** `src/components/Scene.astro`. Pass `image` to use a real render instead.
- **Project card:** `src/components/ProjectCard.astro`
- **Scroll / card-stack animation:** `src/scripts/showcase.ts`

## Work section layout

Set `WORK_LAYOUT` in `src/data/portfolio.ts`:

- `"stack"` (current): the pinned, scroll-driven GSAP card stack. Real projects first, then a "coming soon" card per field without a project.
- `"list"`: real projects only, as plain cards, no scroll lock.
- `"auto"`: `"list"` below `STACK_MIN` (3) real projects, `"stack"` from there on.

## Zeebo (mascot)

- `public/zeebo/zeebo.glb`: 3D model (meshopt-compressed), shown interactively in the hero. The head follows the cursor, the arm waves, and Zeebo hops when clicked. Code: `src/scripts/zeebo3d.ts`. three.js is lazy-loaded only for this.
- `public/zeebo/{wave,hello,cheer,point,peek,think,laptop}.webp`: transparent stills rendered from the model, picked per project with `pose` in `src/data/portfolio.ts`.
- `public/zeebo/sticker.webp`: flat 2D artwork used for the logo and favicon.
- New poses are offsets per node (head, ears, arms, tail) in `POSES` inside `zeebo3d.ts`.

## Branches and release

- `main` is production: every push to `main` builds and deploys to GitHub Pages (`.github/workflows/deploy.yml`).
- Every other branch is development: pushes are built to catch errors, never deployed (`.github/workflows/build-check.yml`).
- Release = bring a development branch into `main` (merge a pull request, or fast-forward `main`).

One-time setup: **Settings → Pages → Source: GitHub Actions**. The site is served at https://itsraziqsm.github.io/Raziqsm-LandingPage/
