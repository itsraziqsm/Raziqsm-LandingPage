import type { L, Lang } from "./data/portfolio";

export const t = (l: L, lang: Lang) => l[lang];

/** Renders "*text*" segments as serif-italic accent spans. */
export const accent = (s: string, cls = "font-serif italic text-brand") =>
  s.replace(/\*(.+?)\*/g, `<em class="${cls}">$1</em>`);

export const ui = {
  nav: {
    work: { en: "Work", id: "Karya" },
    about: { en: "About", id: "Tentang" },
    contact: { en: "Contact", id: "Kontak" },
  },
  heroCta: { en: "See my work", id: "Lihat karya" },
  heroContact: { en: "Get in touch", id: "Hubungi aku" },
  scroll: { en: "scroll", id: "gulir" },
  workTitle: { en: "Selected work", id: "Karya pilihan" },
  terminal: { en: "build log", id: "build log" },
  visit: { en: "Visit", id: "Kunjungi" },
  gridTitle: {
    en: "{n} crafts.<br/>One *studio.*",
    id: "{n} bidang.<br/>Satu *studio.*",
  },
  aboutTitle: { en: "About *me*", id: "Tentang *aku*" },
  experience: { en: "Experience", id: "Pengalaman" },
  toolkitTitle: { en: "Tool*kit*", id: "Tool*kit*" },
  aiToolkit: { en: "AI toolkit · Claude Code skills I use", id: "AI toolkit · skill Claude Code yang aku pakai" },
  contactTitle: { en: "Let's build something *together.*", id: "Ayo bikin sesuatu *bareng.*" },
  contactText: {
    en: "Have a project, a role or just an idea? My inbox is open.",
    id: "Punya project, lowongan, atau sekadar ide? Inbox-ku terbuka.",
  },
  copyEmail: { en: "copy email", id: "salin email" },
  copied: { en: "email copied ✓", id: "email disalin ✓" },
  cv: { en: "Download CV", id: "Unduh CV" },
  cta: { en: "let's build something · say hi", id: "ayo kolaborasi · sapa aku" },
  rights: { en: "Built with Astro + GSAP.", id: "Dibuat dengan Astro + GSAP." },
  sample: { en: "sample content", id: "konten contoh" },
} satisfies Record<string, unknown>;
