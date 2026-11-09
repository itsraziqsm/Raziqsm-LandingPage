# raziqsm · skills

Scroll-driven landing page that turns the "12 skills, one 3D studio" motion piece into a website.

**Stack:** Astro 7 · Tailwind CSS v4 · GSAP + ScrollTrigger · Instrument Serif / Inter Tight / JetBrains Mono

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:4321/Raziqsm-LandingPage/

## Edit content

- **Skills, categories, colors:** `src/data/skills.ts`
- **Placeholder illustrations:** `src/components/Scene.astro`. Pass `image` to use a real render instead.
- **Card layout:** `src/components/SkillCard.astro`
- **Scroll / card-stack animation:** `src/scripts/showcase.ts`

## Deploy (GitHub Pages)

`.github/workflows/deploy.yml` builds and deploys on every push to `main`.
Enable it once under **Settings → Pages → Source: GitHub Actions**.
The site will be served at https://itsraziqsm.github.io/Raziqsm-LandingPage/
