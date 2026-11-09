// ─────────────────────────────────────────────────────────────
//  All portfolio content lives here. Everything is SAMPLE content —
//  replace it with your own. Text fields take { en, id }.
// ─────────────────────────────────────────────────────────────

export type Lang = "en" | "id";
export type L = { en: string; id: string };

export type Prop =
  | "monitor"
  | "filmstrip"
  | "boards"
  | "curve"
  | "camera"
  | "burst"
  | "turntable"
  | "trees"
  | "canvas"
  | "blocks"
  | "layers"
  | "grid";

// ── profile ──────────────────────────────────────────────────
export const profile = {
  handle: "raziqsm",
  name: "Raziq",
  role: { en: "Creative Developer", id: "Creative Developer" } as L,
  location: { en: "Jakarta, Indonesia", id: "Jakarta, Indonesia" } as L,
  available: true,
  availability: { en: "Open for freelance · Q1 2027", id: "Terbuka untuk freelance · Q1 2027" } as L,
  // headline: text between *asterisks* is rendered in the serif-italic accent
  headline: {
    en: "I build *web, motion & 3D* experiences people remember.",
    id: "Aku membangun pengalaman *web, motion & 3D* yang membekas.",
  } as L,
  intro: {
    en: "Sample bio — a creative developer blending code, motion design and 3D to ship landing pages, products and brand moments.",
    id: "Contoh bio — creative developer yang memadukan kode, motion design, dan 3D untuk landing page, produk, dan momen brand.",
  } as L,
  stats: [
    { value: "5+", label: { en: "years building", id: "tahun berkarya" } as L },
    { value: "40+", label: { en: "projects shipped", id: "project selesai" } as L },
    { value: "20+", label: { en: "happy clients", id: "klien puas" } as L },
  ],
  email: "hello@raziqsm.com",
  cv: "#", // e.g. "/Raziqsm-LandingPage/cv.pdf" once you add public/cv.pdf
  socials: [
    { label: "GitHub", href: "https://github.com/itsraziqsm" },
    { label: "LinkedIn", href: "#" },
    { label: "Instagram", href: "#" },
    { label: "Threads", href: "#" },
    { label: "Dribbble", href: "#" },
  ],
};

// ── mascot ───────────────────────────────────────────────────
// Transparent images in public/zebo/. Add more poses here and pick them
// per project with `pose`.
export const mascot = {
  name: "Zebo",
  defaultPose: "wave",
  poses: {
    wave: "zebo/wave.webp",
  } as Record<string, string>,
};

// ── work categories ──────────────────────────────────────────
export type CategoryId = "web" | "motion" | "3d" | "brand";

export interface Category {
  id: CategoryId;
  label: L;
  color: string;
  tint: string;
}

export const categories: Category[] = [
  { id: "web", label: { en: "Web", id: "Web" }, color: "#f26b2c", tint: "#f6d9c8" },
  { id: "motion", label: { en: "Motion", id: "Motion" }, color: "#7559f2", tint: "#dcd8f6" },
  { id: "3d", label: { en: "3D", id: "3D" }, color: "#1d9467", tint: "#d3e9dc" },
  { id: "brand", label: { en: "Brand", id: "Brand" }, color: "#1688c4", tint: "#d4e6f2" },
];

export const categoryOf = (id: CategoryId) => categories.find((c) => c.id === id)!;

// ── projects ─────────────────────────────────────────────────
export interface Project {
  title: string;
  client: string;
  year: string;
  url: string; // shown in the browser bar + linked
  category: CategoryId;
  role: L;
  description: L;
  stack: string[];
  /** typed in the terminal block */
  command: string;
  result: L;
  prop: Prop; // placeholder illustration
  image?: string; // real screenshot, e.g. "/Raziqsm-LandingPage/work/nusa.jpg"
  pose?: string; // Zebo pose key (see `mascot.poses`)
  badge?: L;
  chip?: string;
}

export const projects: Project[] = [
  {
    title: "Nusa Coffee",
    client: "Nusa Coffee Co.",
    year: "2026",
    url: "nusacoffee.example",
    category: "web",
    role: { en: "Design + Development", id: "Desain + Development" },
    description: {
      en: "E-commerce landing page with scroll-driven product storytelling.",
      id: "Landing page e-commerce dengan storytelling produk berbasis scroll.",
    },
    stack: ["Astro", "GSAP", "Shopify"],
    command: "npm run deploy -- --prod",
    result: { en: "+38% conversion in 30 days", id: "+38% konversi dalam 30 hari" },
    prop: "monitor",
    badge: { en: "Featured", id: "Unggulan" },
    chip: "new /checkout-flow",
  },
  {
    title: "Kanal Dashboard",
    client: "Kanal Logistics",
    year: "2025",
    url: "app.kanal.example",
    category: "web",
    role: { en: "Frontend Lead", id: "Frontend Lead" },
    description: {
      en: "Real-time fleet dashboard for 2,000+ trucks across Java.",
      id: "Dashboard armada real-time untuk 2.000+ truk di seluruh Jawa.",
    },
    stack: ["Next.js", "TypeScript", "Mapbox"],
    command: "pnpm build && pnpm test",
    result: { en: "load time 4.1s → 0.9s", id: "waktu muat 4,1d → 0,9d" },
    prop: "grid",
  },
  {
    title: "Ritme Launch Film",
    client: "Ritme Audio",
    year: "2026",
    url: "ritme.example/launch",
    category: "motion",
    role: { en: "Motion Designer", id: "Motion Designer" },
    description: {
      en: "45-second product launch film, beat-synced to the brand's own track.",
      id: "Film peluncuran produk 45 detik, sinkron dengan beat lagu brand.",
    },
    stack: ["After Effects", "Remotion", "Figma"],
    command: "npx remotion render launch",
    result: { en: "1.2M views on launch week", id: "1,2 juta views di minggu peluncuran" },
    prop: "filmstrip",
  },
  {
    title: "Pulse UI Kit",
    client: "Personal",
    year: "2025",
    url: "github.com/itsraziqsm/pulse",
    category: "motion",
    role: { en: "Creator", id: "Kreator" },
    description: {
      en: "Open-source micro-interaction library: 60 easing presets, scroll recipes.",
      id: "Library micro-interaction open-source: 60 preset easing, resep scroll.",
    },
    stack: ["GSAP", "React", "Storybook"],
    command: "npm i @raziqsm/pulse",
    result: { en: "★ 2.4K on GitHub", id: "★ 2,4K di GitHub" },
    prop: "curve",
  },
  {
    title: "Batik Configurator",
    client: "Wastra Studio",
    year: "2026",
    url: "wastra.example/configure",
    category: "3d",
    role: { en: "3D + WebGL Developer", id: "3D + WebGL Developer" },
    description: {
      en: "Interactive 3D configurator to design batik patterns on real garments.",
      id: "Konfigurator 3D interaktif untuk mendesain motif batik di pakaian asli.",
    },
    stack: ["Three.js", "Blender", "WebGL"],
    command: "blender -b scene.blend -E CYCLES",
    result: { en: "avg. session 6m 12s", id: "rata-rata sesi 6m 12d" },
    prop: "turntable",
    chip: "> add a pattern",
  },
  {
    title: "Isometric City",
    client: "Personal",
    year: "2025",
    url: "city.raziqsm.example",
    category: "3d",
    role: { en: "Creator", id: "Kreator" },
    description: {
      en: "A tiny explorable isometric Jakarta, built in a weekend jam.",
      id: "Jakarta isometrik mini yang bisa dijelajahi, dibuat saat weekend jam.",
    },
    stack: ["Three.js", "Vite", "Blender"],
    command: "vite build --mode jam",
    result: { en: "Awwwards honorable mention", id: "Awwwards honorable mention" },
    prop: "blocks",
  },
  {
    title: "Lumbung Identity",
    client: "Lumbung Fintech",
    year: "2024",
    url: "lumbung.example",
    category: "brand",
    role: { en: "Brand + Motion System", id: "Sistem Brand + Motion" },
    description: {
      en: "Logo, motion language and component library for a fintech rebrand.",
      id: "Logo, bahasa motion, dan library komponen untuk rebrand fintech.",
    },
    stack: ["Figma", "After Effects", "Lottie"],
    command: "figma export --tokens",
    result: { en: "rolled out to 3 apps", id: "dipakai di 3 aplikasi" },
    prop: "boards",
  },
  {
    title: "Senja Festival",
    client: "Senja Music Fest",
    year: "2024",
    url: "senjafest.example",
    category: "brand",
    role: { en: "Visual Identity", id: "Identitas Visual" },
    description: {
      en: "Festival identity, stage visuals and a generative poster series.",
      id: "Identitas festival, visual panggung, dan seri poster generatif.",
    },
    stack: ["p5.js", "Figma", "TouchDesigner"],
    command: "node posters.js --count 120",
    result: { en: "120 unique posters generated", id: "120 poster unik dihasilkan" },
    prop: "canvas",
  },
];

// ── experience ───────────────────────────────────────────────
export const experience: { period: string; role: L; org: string; note: L }[] = [
  {
    period: "2024 — now",
    role: { en: "Freelance Creative Developer", id: "Creative Developer Freelance" },
    org: "Independent",
    note: { en: "Web, motion and 3D for brands and startups.", id: "Web, motion, dan 3D untuk brand dan startup." },
  },
  {
    period: "2022 — 2024",
    role: { en: "Frontend Engineer", id: "Frontend Engineer" },
    org: "Sample Studio",
    note: { en: "Led interactive campaigns for 15+ clients.", id: "Memimpin kampanye interaktif untuk 15+ klien." },
  },
  {
    period: "2020 — 2022",
    role: { en: "Motion Designer", id: "Motion Designer" },
    org: "Sample Agency",
    note: { en: "Product films, social content, brand motion.", id: "Film produk, konten sosial, motion brand." },
  },
];

// ── toolkit ──────────────────────────────────────────────────
export const tools: { group: L; items: string[] }[] = [
  { group: { en: "Code", id: "Kode" }, items: ["TypeScript", "Astro", "React", "Next.js", "Tailwind"] },
  { group: { en: "Motion", id: "Motion" }, items: ["GSAP", "After Effects", "Remotion", "Lottie"] },
  { group: { en: "3D", id: "3D" }, items: ["Blender", "Three.js", "WebGL", "Spline"] },
  { group: { en: "Design", id: "Desain" }, items: ["Figma", "Illustrator", "Photoshop"] },
];

/** Claude Code skills from the original reference — shown as an "AI toolkit". */
export const aiSkills: { name: string; repo: string; category: L }[] = [
  { name: "hyperframes", repo: "heygen-com/hyperframes", category: { en: "Video", id: "Video" } },
  { name: "remotion skills", repo: "remotion-dev/skills", category: { en: "Video", id: "Video" } },
  { name: "OpenMontage", repo: "calesthio/OpenMontage", category: { en: "Video", id: "Video" } },
  { name: "gsap-skills", repo: "greensock/gsap-skills", category: { en: "Motion", id: "Motion" } },
  { name: "video-shotcraft", repo: "Vincentwei1021/video-shotcraft", category: { en: "Motion", id: "Motion" } },
  { name: "motionmaxxing", repo: "Tejashmakwana/motionmaxxing", category: { en: "Motion", id: "Motion" } },
  { name: "blender mcp", repo: "ahujasid/blender-mcp", category: { en: "Blender", id: "Blender" } },
  { name: "blender-skills", repo: "arjun988/blender-skills", category: { en: "Blender", id: "Blender" } },
  { name: "dream-loop", repo: "achimala/dream-loop", category: { en: "Blender", id: "Blender" } },
  { name: "threejs-game-skills", repo: "majidmanzarpour/threejs-game-skills", category: { en: "3D web", id: "3D web" } },
  { name: "anatomy", repo: "wharesryan22/anatomy", category: { en: "3D web", id: "3D web" } },
  { name: "3dviz-pro-max", repo: "viettranx/3dviz-pro-max", category: { en: "3D web", id: "3D web" } },
];
