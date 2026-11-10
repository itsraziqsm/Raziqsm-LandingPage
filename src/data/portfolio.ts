// ─────────────────────────────────────────────────────────────
//  All portfolio content lives here. Text fields take { en, id }.
//  Categories without a project automatically get a "coming soon" card.
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
  | "grid"
  | "phone"
  | "sheet";

// ── profile ──────────────────────────────────────────────────
export const profile = {
  handle: "raziqsm",
  name: "Zeebo",
  // TODO: pick your role title
  role: { en: "Web & Creative Developer", id: "Web & Creative Developer" } as L,
  location: { en: "Internet only", id: "Hanya via internet" } as L,
  available: true,
  availability: {
    en: "Open for freelance, projects, study & competitions",
    id: "Terbuka untuk freelance, project, belajar & kompetisi",
  } as L,
  // headline: text between *asterisks* is rendered in the serif-italic accent
  headline: {
    en: "Delivering *solutions* for your needs and interests.",
    id: "Memberikan *solusi* atas kebutuhan dan kepentingan Anda.",
  } as L,
  intro: {
    en: "Building solutions that combine user comfort with interactive experiences.",
    id: "Menghadirkan solusi yang memadukan kenyamanan pengguna dan pengalaman yang interaktif.",
  } as L,
  stats: [
    { value: "6+", label: { en: "months building", id: "bulan berkarya" } as L },
    { value: "10+", label: { en: "projects", id: "project" } as L },
    { value: "5+", label: { en: "clients", id: "klien" } as L },
  ],
  email: "itsraziqsm@gmail.com",
  cv: "", // e.g. "/Raziqsm-LandingPage/cv.pdf" once you add public/cv.pdf — empty hides the button
  socials: [
    { label: "LinkedIn", href: "https://www.linkedin.com/in/raziq-nasrullah-09737331b/" },
    { label: "GitHub", href: "https://github.com/itsraziqsm" },
    { label: "Instagram", href: "https://www.instagram.com/rajikk_23/" },
    { label: "Threads", href: "https://www.threads.com/@rajikk_23" },
  ],
};

// ── mascot ───────────────────────────────────────────────────
// Zeebo. `model` is the interactive 3D version used in the hero.
// `poses` are transparent stills rendered from that model (public/zeebo/),
// picked per project with `pose`. `sticker` is the flat 2D artwork (logo).
export const mascot = {
  name: "Zeebo",
  model: "zeebo/zeebo.glb",
  sticker: "zeebo/sticker.webp",
  stickerSmall: "zeebo/sticker-sm.webp", // header logo
  marker: "zeebo/peek-sm.webp", // scroll position marker next to the scrollbar
  defaultPose: "wave",
  poses: {
    wave: "zeebo/wave.webp",
    hello: "zeebo/hello.webp",
    cheer: "zeebo/cheer.webp",
    point: "zeebo/point.webp",
    peek: "zeebo/peek.webp",
    think: "zeebo/think.webp",
    laptop: "zeebo/laptop.webp", // rendered with a laptop prop
  } as Record<string, string>,
};

// ── work categories ──────────────────────────────────────────
export type CategoryId = "landing" | "mobile" | "sysinfo" | "media";

export interface Category {
  id: CategoryId;
  label: L;
  /** bright colour: decoration, and text in dark mode */
  color: string;
  /** darker shade with ≥ 4.5 : 1 contrast: text in light mode, backgrounds under white text */
  deep: string;
  tint: string;
  /** one line on what you offer in this field (shown in the fields grid) */
  blurb: L;
  /** used for the "coming soon" card when the category has no project yet */
  prop: Prop;
  pose: string;
}

export const categories: Category[] = [
  { id: "landing", label: { en: "Landing Page", id: "Landing Page" }, color: "#f26b2c", deep: "#b9430b", tint: "#f6d9c8", prop: "monitor", pose: "hello",
    blurb: { en: "Company profiles and campaign pages that load fast and read clearly.", id: "Profil perusahaan dan halaman kampanye yang cepat dan jelas." } },
  { id: "mobile", label: { en: "Mobile App", id: "Aplikasi Mobile" }, color: "#7559f2", deep: "#694bf1", tint: "#dcd8f6", prop: "phone", pose: "point",
    blurb: { en: "Android apps for day-to-day operations.", id: "Aplikasi Android untuk kebutuhan operasional harian." } },
  { id: "sysinfo", label: { en: "Information System", id: "Sistem Informasi" }, color: "#1d9467", deep: "#187854", tint: "#d3e9dc", prop: "sheet", pose: "laptop",
    blurb: { en: "Internal systems that bring data and reports into one place.", id: "Sistem internal yang menyatukan data dan laporan dalam satu pintu." } },
  { id: "media", label: { en: "Media", id: "Media" }, color: "#1688c4", deep: "#1270a2", tint: "#d4e6f2", prop: "camera", pose: "cheer",
    blurb: { en: "Podcast and video production, from recording to the final cut.", id: "Produksi podcast dan video, dari rekaman sampai hasil akhir." } },
];

export const categoryOf = (id: CategoryId) => categories.find((c) => c.id === id)!;

// ── projects ─────────────────────────────────────────────────
export interface Project {
  title: string;
  client: string;
  year: string;
  url?: string; // shown in the browser bar + linked; omit if none
  category: CategoryId;
  role: L;
  description: L;
  stack: string[];
  /** typed in the terminal block */
  command: string;
  result?: L;
  prop: Prop; // placeholder illustration
  image?: string; // real screenshot (2:1), e.g. "/Raziqsm-LandingPage/work/sikertas.webp"
  pose?: string; // Zeebo pose key (see `mascot.poses`)
  badge?: L;
  chip?: string;
  /** generated "coming soon" card */
  soon?: boolean;
}

export const projects: Project[] = [
  {
    title: "SIKerTas",
    client: "Kantor Akuntan Publik",
    year: "2026",
    category: "sysinfo",
    // TODO: your role on this project
    role: { en: "Developer", id: "Developer" },
    description: {
      en: "Mid-level accounting needs, all through a single door.",
      id: "Keperluan akuntansi tingkat menengah dalam satu pintu.",
    },
    stack: ["Go", "Tailwind", "Excelize"],
    command: "go run ./cmd/sikertas",
    prop: "sheet",
    pose: "wave",
  },
];

const byCategory = (p: Project) => categories.findIndex((c) => c.id === p.category);
const realProjects = [...projects].sort((a, b) => byCategory(a) - byCategory(b));

/**
 * Layout of the "Selected work" section:
 * - "stack": pinned, scroll-driven GSAP card stack. Real projects first, then a
 *   "coming soon" card for every field without a project yet.
 * - "list":  real projects only, in normal flow, no scroll lock.
 * - "auto":  "list" below STACK_MIN real projects, "stack" from there on.
 */
export const WORK_LAYOUT: "stack" | "list" | "auto" = "stack";
export const STACK_MIN = 3;
export const stackMode =
  WORK_LAYOUT === "stack" || (WORK_LAYOUT === "auto" && realProjects.length >= STACK_MIN);

/** All-work grid: real projects (in category order) first, then a "coming soon"
 *  card per empty category. */
export const workItems: Project[] = [
  ...realProjects,
  ...categories
    .filter((c) => !projects.some((p) => p.category === c.id))
    .map((c): Project => (
    {
      title: "", // rendered as the category label
      client: "",
      year: "",
      category: c.id,
      role: { en: "Coming soon", id: "Segera hadir" },
      description: { en: "Case study coming soon.", id: "Studi kasus segera hadir." },
      stack: [],
      command: "git commit -m \"wip\"",
      result: { en: "coming soon", id: "segera hadir" },
      prop: c.prop,
      pose: c.pose,
      soon: true,
    })),
];

/** Cards of the work section: in the stack, real projects + "coming soon" cards
 *  (so there is something to scroll through); in the list, real projects only. */
export const stackItems: Project[] = stackMode || !realProjects.length ? workItems : realProjects;

// ── experience ───────────────────────────────────────────────
export const experience: { period: L; role: L; org: string; note: L }[] = [
  {
    period: { en: "2026 — now", id: "2026 — sekarang" },
    role: { en: "Staff", id: "Staf" },
    org: "Pemko Medan · Prokopim",
    note: { en: "Podcast & videography.", id: "Podcast & videografi." },
  },
  {
    period: { en: "2025 — now", id: "2025 — sekarang" },
    role: { en: "Freelance Web Developer", id: "Web Freelancer" },
    org: "Personal",
    note: {
      en: "Information systems, company profiles, Android apps.",
      id: "Sistem informasi, profil perusahaan, aplikasi Android.",
    },
  },
];

// ── toolkit ──────────────────────────────────────────────────
// Groups with no items are hidden.
export const tools: { group: L; items: string[] }[] = [
  { group: { en: "Code", id: "Kode" }, items: ["Go", "Tailwind CSS", "Excelize"] },
  { group: { en: "Motion", id: "Motion" }, items: [] },
  { group: { en: "3D", id: "3D" }, items: [] },
  { group: { en: "Design", id: "Desain" }, items: [] },
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

// ── helpers ──────────────────────────────────────────────────
export const projectHref = (p: Project) => (p.url ? (p.url.startsWith("http") ? p.url : `https://${p.url}`) : undefined);
export const projectTitle = (p: Project, lang: Lang) => (p.soon ? categoryOf(p.category).label[lang] : p.title);
/** text for the fake browser bar */
export const projectBar = (p: Project) =>
  p.url?.replace(/^https?:\/\//, "") ?? (p.soon ? "coming-soon" : p.title.toLowerCase().replace(/\s+/g, "-"));

/** inline style exposing a category's colours as CSS variables (see .cat-text / .cat-bg) */
export const catVars = (c: Category) => `--cat:${c.color};--cat-deep:${c.deep}`;
