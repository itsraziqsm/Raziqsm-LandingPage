import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { categories, skills } from "../data/skills";

gsap.registerPlugin(ScrollTrigger);

const pad = (n: number) => String(n).padStart(2, "0");
const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Where a card sits relative to the active one (d = index - active). */
function pose(d: number) {
  if (d === 0) return { xPercent: 0, yPercent: 0, rotation: 0, scale: 1, autoAlpha: 1, zIndex: 20 };
  if (d === 1) return { xPercent: 62, yPercent: 60, rotation: 3, scale: 0.5, autoAlpha: 1, zIndex: 19 };
  if (d === 2) return { xPercent: 70, yPercent: 74, rotation: 5, scale: 0.42, autoAlpha: 1, zIndex: 18 };
  if (d > 2) return { xPercent: 76, yPercent: 86, rotation: 6, scale: 0.38, autoAlpha: 0, zIndex: 10 };
  if (d === -1) return { xPercent: -92, yPercent: 14, rotation: -3, scale: 0.85, autoAlpha: 1, zIndex: 17 };
  return { xPercent: -130, yPercent: 20, rotation: -5, scale: 0.8, autoAlpha: 0, zIndex: 10 };
}

let toastTimer: number | undefined;
function toast(msg: string) {
  const el = document.getElementById("toast");
  if (!el) return;
  el.textContent = msg;
  el.classList.remove("opacity-0", "translate-y-2");
  clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => el.classList.add("opacity-0", "translate-y-2"), 1800);
}

async function copy(text: string, msg: string) {
  try {
    await navigator.clipboard.writeText(text);
    toast(msg);
  } catch {
    toast("copy failed — select the text manually");
  }
}

export function initShowcase() {
  const section = document.getElementById("showcase")!;
  const stage = document.getElementById("stage")!;
  const wrap = document.getElementById("stage-wrap")!;
  const cards = gsap.utils.toArray<HTMLElement>(".skill-card");
  const segs = gsap.utils.toArray<HTMLElement>(".seg");
  const counter = document.getElementById("counter")!;
  const catLabel = document.getElementById("cat-label")!;
  const catName = document.getElementById("cat-name")!;
  const catNum = document.getElementById("cat-num")!;
  const hint = document.getElementById("scroll-hint")!;
  const total = cards.length;

  // --- copy handlers -------------------------------------------------------
  document.querySelectorAll<HTMLButtonElement>(".terminal").forEach((btn) =>
    btn.addEventListener("click", () => copy(btn.dataset.command ?? "", "command copied ✓")),
  );
  document.getElementById("cta")?.addEventListener("click", () =>
    copy(skills.map((s) => `# ${s.name}\n${s.command}`).join("\n\n"), `${skills.length} install commands copied ✓`),
  );

  // --- fit the card stack into the viewport --------------------------------
  const fit = () => {
    const h = Math.max(...cards.map((c) => c.offsetHeight));
    const scale = Math.min(1, wrap.clientHeight / h);
    gsap.set(stage, { scale, height: h });
  };
  fit();
  window.addEventListener("resize", fit);

  // --- terminal typing ------------------------------------------------------
  let typing: gsap.core.Tween | null = null;
  const termState = (card: HTMLElement, state: "empty" | "full") => {
    const cmd = card.querySelector<HTMLElement>(".cmd")!;
    const done = card.querySelector<HTMLElement>(".done")!;
    const full = card.querySelector<HTMLElement>(".terminal")!.dataset.command ?? "";
    cmd.textContent = state === "full" ? full : "";
    cmd.classList.remove("caret");
    done.style.visibility = state === "full" ? "visible" : "hidden";
  };
  const typeInto = (card: HTMLElement) => {
    typing?.progress(1).kill();
    const cmd = card.querySelector<HTMLElement>(".cmd")!;
    const done = card.querySelector<HTMLElement>(".done")!;
    const full = card.querySelector<HTMLElement>(".terminal")!.dataset.command ?? "";
    if (reduced) return termState(card, "full");
    const o = { n: 0 };
    cmd.textContent = "";
    cmd.classList.add("caret");
    done.style.visibility = "hidden";
    typing = gsap.to(o, {
      n: full.length,
      duration: Math.min(1.1, 0.25 + full.length * 0.022),
      delay: 0.25,
      ease: "none",
      onUpdate: () => (cmd.textContent = full.slice(0, Math.round(o.n))),
      onComplete: () => {
        cmd.classList.remove("caret");
        gsap.fromTo(done, { autoAlpha: 0, y: 4 }, { autoAlpha: 1, y: 0, duration: 0.25 });
      },
    });
  };

  // --- state ----------------------------------------------------------------
  let active = -1;
  let activeCat = skills[0].category;

  const setCategory = (i: number) => {
    const cat = skills[i].category;
    if (cat === activeCat) return;
    activeCat = cat;
    const c = categories.find((x) => x.id === cat)!;
    const ci = categories.indexOf(c);
    const dir = i > active ? 1 : -1;
    gsap
      .timeline()
      .to(catName, { yPercent: -110 * dir, duration: reduced ? 0 : 0.22, ease: "power2.in" })
      .add(() => {
        catName.textContent = c.label;
        catNum.textContent = pad(ci + 1);
        catLabel.style.setProperty("--cat", c.color);
      })
      .fromTo(catName, { yPercent: 110 * dir }, { yPercent: 0, duration: reduced ? 0 : 0.35, ease: "power3.out" });
  };

  const go = (i: number, instant = false) => {
    if (i === active) return;
    setCategory(i);
    active = i;
    counter.textContent = pad(i + 1);

    cards.forEach((card, k) => {
      gsap.to(card, {
        ...pose(k - i),
        duration: instant || reduced ? 0 : 0.75,
        ease: "power3.inOut",
        overwrite: "auto",
      });
      if (k < i) termState(card, "full");
      else if (k > i) termState(card, "empty");
    });
    segs.forEach((s, k) =>
      gsap.to(s, { scaleX: k <= i ? 1 : 0, duration: instant || reduced ? 0 : 0.4, ease: "power2.out" }),
    );
    typeInto(cards[i]);
    gsap.to(hint, { autoAlpha: i === 0 ? 1 : 0, duration: 0.3 });
  };

  go(0, true);

  ScrollTrigger.create({
    trigger: section,
    start: "top top",
    end: () => `+=${window.innerHeight * 0.6 * (total - 1)}`,
    pin: true,
    snap: { snapTo: 1 / (total - 1), duration: { min: 0.15, max: 0.45 }, delay: 0.05, ease: "power1.inOut" },
    onUpdate: (self) => go(Math.round(self.progress * (total - 1))),
    invalidateOnRefresh: true,
  });

  // --- finale reveal ----------------------------------------------------------
  if (!reduced) {
    gsap.from("#finale h2", {
      y: 40,
      autoAlpha: 0,
      duration: 0.8,
      ease: "power3.out",
      scrollTrigger: { trigger: "#finale", start: "top 75%" },
    });
    gsap.from(".grid-card", {
      y: 24,
      autoAlpha: 0,
      duration: 0.6,
      stagger: 0.05,
      ease: "power3.out",
      scrollTrigger: { trigger: "#finale ul", start: "top 85%" },
    });
  }
}
