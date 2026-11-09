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
  name: "Zeboo",
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
// Zebo. `model` is the interactive 3D version used in the hero.
// `poses` are transparent stills rendered from that model (public/zebo/),
// picked per project with `pose`. `sticker` is the flat 2D artwork (logo).
export const mascot = {
  name: "Zebo",
  model: "zebo/zebo.glb",
  sticker: "zebo/sticker.webp",
  defaultPose: "wave",
  poses: {
    wave: "zebo/wave.webp",
    hello: "zebo/hello.webp",
    cheer: "zebo/cheer.webp",
    point: "zebo/point.webp",
    peek: "zebo/peek.webp",
  } as Record<string, string>,
};

// ── work categories ──────────────────────────────────────────
export type CategoryId = "landing" | "mobile" | "sysinfo" | "media";

export interface Category {
  id: CategoryId;
  label: L;
  color: string;
  tint: string;
  /** used for the "coming soon" card when the category has no project yet */
  prop: Prop;
  pose: string;
}

export const categories: Category[] = [
  { id: "landing", label: { en: "Landing Page", id: "Landing Page" }, color: "#f26b2c", tint: "#f6d9c8", prop: "monitor", pose: "hello" },
  { id: "mobile", label: { en: "Mobile App", id: "Aplikasi Mobile" }, color: "#7559f2", tint: "#dcd8f6", prop: "phone", pose: "point" },
  { id: "sysinfo", label: { en: "Information System", id: "Sistem Informasi" }, color: "#1d9467", tint: "#d3e9dc", prop: "sheet", pose: "wave" },
  { id: "media", label: { en: "Media", id: "Media" }, color: "#1688c4", tint: "#d4e6f2", prop: "camera", pose: "cheer" },
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
  pose?: string; // Zebo pose key (see `mascot.poses`)
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

/** Real projects (in category order) first, then a "coming soon" card per empty category. */
const byCategory = (p: Project) => categories.findIndex((c) => c.id === p.category);
export const workItems: Project[] = [
  ...[...projects].sort((a, b) => byCategory(a) - byCategory(b)),
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
