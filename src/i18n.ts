import type { L, Lang } from "./data/portfolio";

export const t = (l: L, lang: Lang) => l[lang];

/** Renders "*text*" segments as serif-italic accent spans. */
export const accent = (s: string, cls = "font-serif italic text-accent") =>
  s.replace(/\*(.+?)\*/g, `<em class="${cls}">$1</em>`);

export const ui = {
  nav: {
    work: { en: "Work", id: "Karya" },
    about: { en: "About", id: "Tentang" },
    contact: { en: "Contact", id: "Kontak" },
  },
  zeebo3d: { en: "View in 3D", id: "Lihat versi 3D" },
  zeebo3dLoading: { en: "Loading 3D…", id: "Memuat 3D…" },
  navLabel: { en: "Sections", id: "Bagian halaman" },
  menu: { en: "Menu", id: "Menu" },
  langLabel: { en: "Language", id: "Bahasa" },
  themeToDark: { en: "Switch to dark mode", id: "Ganti ke mode gelap" },
  themeToLight: { en: "Switch to light mode", id: "Ganti ke mode terang" },
  heroCta: { en: "See my work", id: "Lihat karya" },
  heroContact: { en: "Get in touch", id: "Hubungi aku" },
  scroll: { en: "scroll", id: "gulir" },
  workTitle: { en: "Selected work", id: "Karya pilihan" },
  workHeading: { en: "Selected *work*", id: "Karya *pilihan*" },
  terminal: { en: "build log", id: "build log" },
  visit: { en: "Visit", id: "Kunjungi" },
  gridTitle: {
    en: "{n} crafts.<br/>One *studio.*",
    id: "{n} bidang.<br/>Satu *studio.*",
  },
  fieldSoon: { en: "first case study coming soon", id: "studi kasus pertama segera hadir" },
  aboutTitle: { en: "About *me*", id: "Tentang *aku*" },
  experience: { en: "Experience", id: "Pengalaman" },
  toolkitTitle: { en: "Tool*kit*", id: "Tool*kit*" },
  aiToolkit: { en: "AI toolkit · Claude Code skills", id: "AI toolkit · skill Claude Code" },
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
  // chat (placeholder: answers come from this portfolio, no AI yet)
  chatOpen: { en: "Ask Zeebo", id: "Tanya Zeebo" },
  chatClose: { en: "Close chat", id: "Tutup obrolan" },
  chatStatus: { en: "Preview · answers from this portfolio", id: "Pratinjau · jawaban dari portfolio ini" },
  chatGreeting: {
    en: "Hi, I'm Zeebo! Ask me about the work here, or pick a question below.",
    id: "Hai, aku Zeebo! Tanya apa saja soal karya di sini, atau pilih pertanyaan di bawah.",
  },
  chatPlaceholder: { en: "Type a question…", id: "Ketik pertanyaan…" },
  chatSend: { en: "Send", id: "Kirim" },
  chatTyping: { en: "Zeebo is typing", id: "Zeebo sedang mengetik" },
  chatLearning: {
    en: "I'm still learning to answer free questions. For now, pick one of the questions above, or write to",
    id: "Aku masih belajar menjawab pertanyaan bebas. Untuk sekarang, pilih salah satu pertanyaan di atas, atau kirim email ke",
  },
  qServices: { en: "What do you offer?", id: "Layanan apa saja yang ada?" },
  qProjects: { en: "Which projects are done?", id: "Project apa saja yang sudah dikerjakan?" },
  qTools: { en: "Which tools do you use?", id: "Tools apa yang dipakai?" },
  qContact: { en: "How can I get in touch?", id: "Bagaimana cara menghubungi?" },
  aServicesIntro: { en: "Four fields, one studio:", id: "Empat bidang, satu studio:" },
  aProjectsMore: { en: "More case studies are coming soon.", id: "Studi kasus lainnya segera hadir." },
  aToolsIntro: { en: "Day to day:", id: "Sehari-hari:" },
  aContactIntro: { en: "Easiest is email:", id: "Paling mudah lewat email:" },
  aContactAlso: { en: "Or find me on", id: "Atau temui aku di" },
  // scroll position marker
  sbTop: { en: "Start", id: "Awal" },
  sample: { en: "sample content", id: "konten contoh" },
} satisfies Record<string, unknown>;
