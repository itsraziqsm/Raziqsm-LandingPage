# raziqsm · portfolio

Bilingual (EN / ID) portfolio landing page with a scroll-driven project card stack, based on the "12 skills, one 3D studio" motion reference.

**Stack:** Astro 7 · Tailwind CSS v4 · GSAP + ScrollTrigger · Lenis · three.js · Instrument Serif / Inter Tight / JetBrains Mono

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:4321/Raziqsm-LandingPage/ (Indonesian, default) or http://localhost:4321/Raziqsm-LandingPage/en/ (English)

## Production (home server)

The live site is https://raziqsm.warkophajisobirin.fun/Raziqsm-LandingPage/ (Indonesian) and `…/en/` (English),
served from a home server through a Cloudflare Tunnel. On the server, from an up-to-date `main`:

```bash
git pull
```

```bash
npm ci && npm run online
```

`npm run online` builds the site and serves the build (not the dev server) on port 4321, which the tunnel points to.
The site address lives in `site` (domain) and `base` (`/Raziqsm-LandingPage`) in `astro.config.mjs`; canonical links,
hreflang and the link-preview image (`public/og.jpg`) are built from them. Tunnel hostnames that may reach the server
are listed in `server.allowedHosts` in the same file.

## Edit content

- **All content (profile, projects, experience, toolkit, contact):** `src/data/portfolio.ts` — every text field takes `{ en, id }`
- **UI labels (buttons, headings) in both languages:** `src/i18n.ts`
- **Page layout / sections:** `src/layouts/Page.astro` (Indonesian at `/`, English at `/en/`; old `/id/` links redirect to `/`)
- **Placeholder illustrations:** `src/components/Scene.astro`. Pass `image` to use a real render instead.
- **Project card:** `src/components/ProjectCard.astro`
- **Scroll / card-stack animation:** `src/scripts/showcase.ts`

## Language switch

EN / ID switches without a page load (`src/scripts/langswitch.ts`): the other language's page is fetched once,
matched element by element (both come from the same template) and its text is swapped into the live page with a
blur-fade, while the URL, `<title>` and `<html lang>` follow and back / forward work. Scripts and Cloudflare's
Email Obfuscation spans are left out of the matching. If the two pages do not line up, it falls back to a normal
page load and returns to the same section.

## Work section layout

Set `WORK_LAYOUT` in `src/data/portfolio.ts`:

- `"stack"` (current): the pinned, scroll-driven GSAP card stack. Real projects first, then a "coming soon" card per field without a project.
- `"list"`: real projects only, as plain cards, no scroll lock.
- `"auto"`: `"list"` below `STACK_MIN` (3) real projects, `"stack"` from there on.

## Zeebo (mascot)

- `public/zeebo/zeebo.glb`: rigged 3D model (29 bones, meshopt-compressed), shown interactively in the hero. Code: `src/scripts/zeebo3d.ts`; three.js is lazy-loaded only for this (on phones only when "Lihat versi 3D" is tapped).
  - idle: breathing, head follows the cursor, ears and tail sway, natural blinks (fast close, short hold, slower open; also on quick head turns)
  - "waving excitedly" (2.8 s): plays when Zeebo appears and on every click / tap on its body
  - hover on Zeebo: happier face; mouse / pen can drag to spin it
- `public/zeebo/{wave,hello,cheer,point,think,peek,laptop}.webp`: transparent stills rendered from the model, picked per project with `pose` in `src/data/portfolio.ts`. Poses are body-frame bone offsets in `POSES` inside `zeebo3d.ts`.
- `public/zeebo/sticker.webp` / `sticker-sm.webp`: flat 2D artwork for the logo and favicon.

## Branches and release

- `main` is production: the home server serves `main` (see "Production").
- Every other branch is development.
- `.github/workflows/build-check.yml` builds every push (all branches) and every pull request into `main` to catch errors early. Nothing is deployed from GitHub.
- Release = bring a development branch into `main` (merge a pull request, or fast-forward `main`), then update the server as in "Production".
