import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { captureDom, initLangSwitch } from "./langswitch";
import "lenis/dist/lenis.css";

gsap.registerPlugin(ScrollTrigger);
// dev only: lets tests slow animations down (gsap.globalTimeline.timeScale)
if (import.meta.env.DEV) (window as unknown as { gsap: typeof gsap }).gsap = gsap;

const pad = (n: number) => String(n).padStart(2, "0");
const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const D = (s: number) => (reduced ? 0 : s);

/** Where a card sits relative to the active one (d = index - active). */
function pose(d: number) {
  if (d === 0) return { xPercent: 0, yPercent: 0, rotation: 0, scale: 1, autoAlpha: 1, zIndex: 20 };
  if (d === 1) return { xPercent: 62, yPercent: 60, rotation: 3, scale: 0.5, autoAlpha: 1, zIndex: 19 };
  if (d === 2) return { xPercent: 70, yPercent: 74, rotation: 5, scale: 0.42, autoAlpha: 1, zIndex: 18 };
  if (d > 2) return { xPercent: 76, yPercent: 86, rotation: 6, scale: 0.38, autoAlpha: 0, zIndex: 10 };
  if (d === -1) return { xPercent: -92, yPercent: 14, rotation: -3, scale: 0.85, autoAlpha: 1, zIndex: 17 };
  return { xPercent: -130, yPercent: 20, rotation: -5, scale: 0.8, autoAlpha: 0, zIndex: 10 };
}

/** Smooth scrolling, driven by GSAP's ticker so ScrollTrigger stays in sync. */
let lenis: Lenis | null = null;
type ScrollGuard = (d: { deltaY: number; event: WheelEvent | TouchEvent }) => boolean;
/** Set by the card stack (see initWork): may swallow a wheel / touch event. */
let stackGuard: ScrollGuard | null = null;
function initLenis() {
  if (reduced) return;
  lenis = new Lenis({
    lerp: 0.1,
    wheelMultiplier: 1,
    // Lenis also drives touch scrolling, so a fast swipe has no native
    // momentum that could fly through the card stack.
    syncTouch: true,
    virtualScroll: (d) => (stackGuard ? stackGuard(d as Parameters<ScrollGuard>[0]) : true),
  });
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((time) => lenis!.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
}

/** Scroll to a position: through Lenis when it's on, natively otherwise. */
function scrollToY(y: number, duration = 0.6) {
  if (lenis) lenis.scrollTo(y, { duration, easing: (t) => 1 - Math.pow(1 - t, 3) });
  else window.scrollTo({ top: y, behavior: reduced ? "auto" : "smooth" });
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

function initCopy() {
  document.querySelectorAll<HTMLElement>("[data-copy]").forEach((btn) =>
    btn.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(btn.dataset.copy ?? "");
        toast(btn.dataset.toast ?? "copied ✓");
      } catch {
        toast("✕");
      }
    }),
  );
}

/** set by the language switch's fallback (a real page load) to come back to the same section */
const SECTION_KEY = "goto-section";

/** Page position of a section's top. A pinned section is position: fixed while
 *  pinned, so its own rect reads "here"; use its pin-spacer wrapper instead. */
function sectionTop(el: HTMLElement) {
  const box = el.parentElement?.classList.contains("pin-spacer") ? el.parentElement : el;
  return box.getBoundingClientRect().top + window.scrollY;
}

/** In-page links (#work, #about, #contact …) scroll there without adding a
 *  #hash to the URL. */
function initAnchors() {
  document.addEventListener("click", (e) => {
    const a = (e.target as Element | null)?.closest?.<HTMLAnchorElement>('a[href^="#"]');
    if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey) return;
    const id = a.getAttribute("href")!.slice(1);
    const el = id ? document.getElementById(id) : null;
    if (!el) return;
    e.preventDefault();
    const y = sectionTop(el);
    if (lenis) lenis.scrollTo(y, { duration: 1.1 });
    else window.scrollTo({ top: y, behavior: reduced ? "auto" : "smooth" });
  });
}

/**
 * The page always opens at the top: no browser scroll restoration (set in
 * <head>) and no #hash jumps. Only a language switch made a moment ago brings
 * the visitor back to the section they were reading.
 */
function initStartPosition() {
  let target: string | null = null;
  try {
    target = sessionStorage.getItem(SECTION_KEY);
    sessionStorage.removeItem(SECTION_KEY);
  } catch {}
  if (location.hash) history.replaceState(history.state, "", location.pathname + location.search);
  const go = () => {
    const el = target ? document.getElementById(target) : null;
    const y = el ? sectionTop(el) : 0;
    if (lenis) lenis.scrollTo(y, { immediate: true, force: true });
    else window.scrollTo(0, y);
  };
  go();
  // again once ScrollTrigger has added the pinned section's height
  ScrollTrigger.addEventListener("refresh", function once() {
    ScrollTrigger.removeEventListener("refresh", once);
    go();
  });
  ScrollTrigger.refresh();
  // and once more after load, in case the browser moved the page meanwhile
  // (it can still act on a #hash or a restored position from the first request)
  if (document.readyState !== "complete") window.addEventListener("load", () => requestAnimationFrame(go), { once: true });
}

function initWork() {
  const section = document.getElementById("work");
  if (!section) return;
  const cards = gsap.utils.toArray<HTMLElement>(".work-card");
  if (!cards.length) return;

  // ── terminal typing (both modes) ──────────────────────────
  let typing: gsap.core.Tween | null = null;
  const parts = (card: HTMLElement) => ({
    cmd: card.querySelector<HTMLElement>(".cmd")!,
    done: card.querySelector<HTMLElement>(".done")!,
    full: card.querySelector<HTMLElement>(".terminal")!.dataset.command ?? "",
  });
  const termState = (card: HTMLElement, state: "empty" | "full") => {
    const { cmd, done, full } = parts(card);
    cmd.textContent = state === "full" ? full : "";
    cmd.classList.remove("caret");
    done.style.visibility = state === "full" ? "visible" : "hidden";
  };
  const typeInto = (card: HTMLElement) => {
    typing?.progress(1).kill();
    if (reduced) return termState(card, "full");
    const { cmd, done, full } = parts(card);
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

  // ── list mode: few projects, cards in normal flow, no scroll lock ──
  if (section.classList.contains("is-list")) {
    cards.forEach((card) => {
      if (reduced) return;
      termState(card, "empty");
      ScrollTrigger.create({ trigger: card, start: "top 75%", once: true, onEnter: () => typeInto(card) });
      gsap.from(card, { y: 40, opacity: 0, duration: 0.8, ease: "power3.out", scrollTrigger: { trigger: card, start: "top 90%" } });
    });
    return;
  }

  // ── stack mode: pinned, one card per scroll step ──────────
  const stage = document.getElementById("stage")!;
  const wrap = document.getElementById("stage-wrap")!;
  const segs = gsap.utils.toArray<HTMLElement>(".seg");
  const counter = document.getElementById("counter");
  const counterWrap = document.getElementById("counter-wrap");
  const catLabel = document.getElementById("cat-label")!;
  const catName = document.getElementById("cat-name")!;
  const catNum = document.getElementById("cat-num")!;
  const catClip = document.getElementById("cat-clip")!;
  const hint = document.getElementById("scroll-hint")!;
  const total = cards.length;

  // shrink the big category label when it is wider than its line (long names, narrow phones)
  const fitLabel = () => {
    catClip.style.fontSize = "";
    const over = catName.offsetWidth / catClip.clientWidth;
    if (over > 1) catClip.style.fontSize = `${(parseFloat(getComputedStyle(catClip).fontSize) / over) * 0.98}px`;
  };

  // fit the card stack into the viewport
  const fit = () => {
    fitLabel();
    const h = Math.max(...cards.map((c) => c.offsetHeight));
    const scale = Math.min(1, wrap.clientHeight / h);
    gsap.set(stage, { scale, height: h });
    // the "scroll" hint sits just below the card: hide it when there is no room
    hint.style.display = wrap.clientHeight - h * scale < 36 ? "none" : "";
  };
  fit();
  window.addEventListener("resize", fit);
  document.fonts?.ready.then(fit);

  let active = -1;
  let activeCat = cards[0].dataset.catIndex;

  const setCategory = (i: number, dir: number) => {
    const card = cards[i];
    if (card.dataset.catIndex === activeCat) return;
    activeCat = card.dataset.catIndex;
    gsap
      .timeline()
      .to(catName, { yPercent: -110 * dir, duration: D(0.22), ease: "power2.in" })
      .add(() => {
        catName.textContent = card.dataset.catLabel ?? "";
        catNum.textContent = pad(Number(card.dataset.catIndex) + 1);
        catLabel.style.setProperty("--cat", card.dataset.catColor ?? "");
        catLabel.style.setProperty("--cat-deep", card.dataset.catDeep ?? "");
        fitLabel();
      })
      .fromTo(catName, { yPercent: 110 * dir }, { yPercent: 0, duration: D(0.35), ease: "power3.out" });
  };

  const go = (i: number, instant = false) => {
    if (i === active) return;
    setCategory(i, i > active ? 1 : -1);
    active = i;
    if (counter) counter.textContent = pad(i + 1);
    cards.forEach((card, k) => {
      card.inert = k !== i; // only the front card is reachable by keyboard / screen readers
      gsap.to(card, { ...pose(k - i), duration: instant ? 0 : D(0.75), ease: "power3.inOut", overwrite: "auto" });
      if (k < i) termState(card, "full");
      else if (k > i) termState(card, "empty");
    });
    segs.forEach((s, k) => gsap.to(s, { scaleX: k <= i ? 1 : 0, duration: instant ? 0 : D(0.4), ease: "power2.out" }));
    typeInto(cards[i]);
    gsap.to(hint, { autoAlpha: i === 0 ? 1 : 0, duration: 0.3 });
  };

  go(0, true);
  // new language: the big label shows the text for the card on screen
  window.addEventListener("langchange", () => {
    const card = cards[Math.max(0, active)];
    catName.textContent = card.dataset.catLabel ?? "";
    fit();
  });

  const st = ScrollTrigger.create({
    trigger: section,
    start: "top top",
    end: () => `+=${window.innerHeight * 0.6 * (total - 1)}`,
    pin: true,
    onUpdate: (self) => go(Math.round(self.progress * (total - 1))),
    invalidateOnRefresh: true,
  });

  // the "01 / 08" counter in the header only makes sense while the stack is on screen
  if (counterWrap) {
    ScrollTrigger.create({
      trigger: section,
      start: "top 50%",
      end: () => st.end + window.innerHeight * 0.5,
      onToggle: (self) => {
        counterWrap.dataset.show = String(self.isActive);
        counterWrap.setAttribute("aria-hidden", String(!self.isActive));
      },
    });
  }

  // ── scroll brake: one gesture = one card ──────────────────
  // However fast the visitor scrolls, the stack moves one card at a time and
  // never skips cards. Momentum arriving from above / below stops at the
  // first / last card.
  //
  // Wheel / trackpad: a card change needs *intent*, not just "any event":
  //  - a fresh push: after a pause, or a delta that jumps up (momentum only decays),
  //  - or steady input (mouse wheel kept spinning, slow trackpad drag) once the
  //    previous card has been on screen for HOLD_MS.
  // Decaying trackpad momentum and tiny tail deltas never count, so they can
  // neither skip cards nor keep the brake locked. A fresh push that arrives
  // while a card is still moving is queued and runs right after.
  // Touch: one swipe = one card.
  if (lenis) {
    const l = lenis;
    const STEP_S = 0.7; // card change duration
    const QUIET_MS = 200; // no wheel events for this long = the next event is a new gesture
    const HOLD_MS = 250; // steady input moves on only after the card has shown this long
    const TINY = 4; // |delta| below this is momentum tail: ignored
    // time-based, not onComplete: a step tween can be cut short (a tap stops
    // Lenis, the settle-snap replaces it) and must never leave the brake stuck
    let busyUntil = 0;
    let dest = 0; // where the running card change is heading
    let quietUntil = 0; // touch: blocks a swipe right after momentum was caught at an edge
    let lastWheelAt = 0;
    let prev1 = 0; // |delta| of the previous wheel event
    let prev2 = 0; // ... and the one before
    let queued = 0; // a step (+1 / -1) waiting for the current change to finish
    let caught = false; // momentum was just stopped at the stack's edge: wait for a fresh push
    let queueTimer = 0;
    let swipe = 0;
    let swipeUsed = false;
    const stepSize = () => (st.end - st.start) / (total - 1);
    const indexAt = (y: number) => Math.round((y - st.start) / stepSize());
    // during a card change Lenis' target is still travelling: use the destination
    const pos = () => (performance.now() < busyUntil ? dest : l.targetScroll);
    const goTo = (y: number) => {
      dest = y;
      busyUntil = performance.now() + STEP_S * 1000 + 40;
      l.scrollTo(y, { duration: STEP_S, easing: (t) => 1 - Math.pow(1 - t, 3), force: true });
      clearTimeout(queueTimer);
      queueTimer = window.setTimeout(runQueued, STEP_S * 1000 + 60);
    };
    const step = (dir: number) => {
      const next = indexAt(pos()) + dir;
      if (next < 0 || next > total - 1) return false;
      goTo(st.start + next * stepSize());
      return true;
    };
    function runQueued() {
      const dir = queued;
      queued = 0;
      if (dir) step(dir);
    }

    stackGuard = ({ deltaY, event }) => {
      const type = event.type;
      if (type === "touchstart") {
        swipe = 0;
        swipeUsed = false;
        return true;
      }
      if (!deltaY) return true;
      const now = performance.now();
      const dir = Math.sign(deltaY);
      const y = pos();
      const { start, end } = st;
      const free = now > busyUntil;
      const swallow = () => {
        if (event.cancelable) event.preventDefault();
        return false;
      };

      // wheel intent (computed for every wheel event so the history stays current)
      const isWheel = type.includes("wheel");
      let fresh = false;
      let steady = false;
      if (isWheel) {
        const a = Math.abs(deltaY);
        fresh = now - lastWheelAt > QUIET_MS || (a >= TINY && a > prev1 * 1.25 + 1);
        steady = a >= TINY && a >= prev1 && prev1 >= prev2 && prev2 >= TINY;
        prev2 = prev1;
        prev1 = a;
        lastWheelAt = now;
      }

      // outside the stack: only catch momentum that would carry across its edge
      if (y < start - 1 || y > end + 1) {
        const crosses = dir > 0 ? y < start && y + deltaY > start : y > end && y + deltaY < end;
        if (!crosses) return true;
        queued = 0;
        caught = isWheel;
        goTo(dir > 0 ? start : end);
        quietUntil = now + QUIET_MS;
        return swallow();
      }

      // inside the stack
      const atEdge = dir > 0 ? indexAt(y) >= total - 1 : indexAt(y) <= 0;

      if (isWheel) {
        // leaving the stack needs a fresh push once the last (or first) card has landed,
        // so a long spin / drag stops at the edge card instead of flying past it
        if (atEdge) return fresh && free ? true : swallow();
        if (caught && !fresh) return swallow(); // the momentum that carried us in is not a new push
        caught = false;
        const intent = fresh || (steady && now > busyUntil + HOLD_MS);
        if (!intent) return swallow(); // decaying momentum, tiny tail, or too soon
        if (free) step(dir);
        else if (fresh) queued = dir; // remember one push made mid-change
        return swallow();
      }

      // touch
      const ready = free && now > quietUntil;
      if (atEdge && ready && !swipeUsed) return true; // a fresh swipe leaves the stack
      if (type === "touchmove") {
        swipe += deltaY;
        if (!swipeUsed && !atEdge && ready && Math.abs(swipe) > 24) {
          swipeUsed = true;
          step(dir);
        }
      }
      return swallow(); // rest of the swipe, and touchend inertia
    };
  }

  // Snap to the nearest card once scrolling settles (keyboard, scrollbar).
  // Done by hand (instead of ScrollTrigger's `snap`) so the tween goes through Lenis.
  let snapTimer: number | undefined;
  const snap = () => {
    clearTimeout(snapTimer);
    snapTimer = window.setTimeout(() => {
      const y = window.scrollY;
      if (y <= st.start + 2 || y >= st.end - 2) return;
      const step = (st.end - st.start) / (total - 1);
      const target = st.start + Math.round((y - st.start) / step) * step;
      if (Math.abs(target - y) > 2) scrollToY(target, 0.45);
    }, 140);
  };
  // fires 140ms after the last scroll event, i.e. once Lenis has fully settled
  if (lenis) lenis.on("scroll", snap);
  else window.addEventListener("scroll", snap, { passive: true });
}

/**
 * Liquid pill: the active background of a segmented control (desktop nav,
 * language switch) is one black pill that flows from item to item instead of
 * jumping.
 *  1. stretch - the leading edge runs ahead to the new item (the pill thins a little)
 *  2. catch up - the trailing edge follows with an elastic, jelly-like settle
 *  3. nothing active - the drop shrinks and fades; it grows back on return
 * Hovering another item makes the pill lean towards it (surface tension).
 */
export function createLiquidPill(container: HTMLElement) {
  const pill = container.querySelector<HTMLElement>(".nav-pill");
  if (!pill) return null;
  const items = [...container.querySelectorAll<HTMLAnchorElement>("a")];
  let current: HTMLElement | null = null;
  let shown = false;
  let tl: gsap.core.Timeline | null = null;
  const box = (a: HTMLElement) => ({ x: a.offsetLeft, w: a.offsetWidth });

  const moveTo = (target: HTMLElement | null, instant = false) => {
    if (target === current && (target !== null) === shown) return;
    tl?.kill();
    current = target;

    if (!target) {
      // leave: the drop shrinks into nothing
      shown = false;
      tl = gsap.timeline().to(pill, { scaleX: 0.4, scaleY: 0.6, opacity: 0, duration: reduced || instant ? 0 : 0.35, ease: "power2.in" });
      return;
    }
    const to = box(target);
    if (!shown || reduced || instant) {
      // appear: a drop that swells into the pill (or just sit there on first paint)
      shown = true;
      gsap.set(pill, { x: to.x, width: to.w });
      if (instant || reduced) {
        gsap.set(pill, { scaleX: 1, scaleY: 1, opacity: 1 });
        return;
      }
      tl = gsap.timeline().fromTo(
        pill,
        { scaleX: 0.3, scaleY: 0.5, opacity: 0 },
        { scaleX: 1, scaleY: 1, opacity: 1, duration: 0.7, ease: "elastic.out(1, 0.5)" },
      );
      return;
    }

    const fromX = gsap.getProperty(pill, "x") as number;
    const fromW = gsap.getProperty(pill, "width") as number;
    const right = to.x > fromX;
    // 1. stretch: cover both the old and the new item, the leading edge first
    const spanX = right ? fromX : to.x;
    const spanW = right ? to.x + to.w - fromX : fromX + fromW - to.x;
    tl = gsap
      .timeline()
      .to(pill, { x: spanX, width: spanW, scaleY: 0.86, duration: 0.2, ease: "power2.in" })
      // 2. catch up: the trailing edge follows, overshoots a little and settles like jelly
      .to(pill, { x: to.x, width: to.w, duration: 0.65, ease: "elastic.out(1, 0.6)" })
      .to(pill, { scaleY: 1, duration: 0.5, ease: "elastic.out(1.2, 0.4)" }, "<");
  };

  /** the items changed size (new language, fonts): ease the pill onto the active one */
  const refresh = (animate = true) => {
    if (!current || !shown) return;
    tl?.kill();
    const to = box(current);
    if (!animate || reduced) gsap.set(pill, { x: to.x, width: to.w, scaleX: 1, scaleY: 1, opacity: 1 });
    else tl = gsap.timeline().to(pill, { x: to.x, width: to.w, scaleX: 1, scaleY: 1, opacity: 1, duration: 0.6, ease: "elastic.out(1, 0.6)" });
  };

  // hover: lean towards the hovered item
  items.forEach((a) => {
    a.addEventListener("pointerenter", () => {
      if (reduced || !shown || !current || a === current || tl?.isActive()) return;
      const from = box(current);
      const dir = a.offsetLeft > from.x ? 1 : -1;
      gsap.to(pill, { x: from.x + dir * 5, width: from.w + 6, duration: 0.35, ease: "power2.out", overwrite: "auto" });
    });
    a.addEventListener("pointerleave", () => {
      if (!shown || !current || tl?.isActive()) return;
      const from = box(current);
      gsap.to(pill, { x: from.x, width: from.w, duration: 0.6, ease: "elastic.out(1, 0.5)", overwrite: "auto" });
    });
  });

  // keep it in place when the layout changes
  window.addEventListener("resize", () => refresh(false));
  document.fonts?.ready.then(() => refresh(false));
  // the pill can only be measured once its container is laid out (the mobile menu is hidden at first)
  new ResizeObserver(() => refresh(false)).observe(container);

  return { moveTo, refresh };
}

/** The EN / ID switches (header + mobile menu): liquid pill that follows the language. */
function initLangPills() {
  document.querySelectorAll<HTMLElement>(".lang-switch").forEach((group) => {
    const pill = createLiquidPill(group);
    if (!pill) return;
    const linkFor = (lang: string) => group.querySelector<HTMLElement>(`a[data-lang-link="${lang}"]`);
    pill.moveTo(linkFor(document.documentElement.lang), true);
    window.addEventListener("langswitchstart", (e) => pill.moveTo(linkFor((e as CustomEvent).detail.lang)));
  });
}

/** Desktop nav pill, addressed by section id. */
function initNavPill() {
  const nav = document.getElementById("desktop-nav");
  if (!nav) return null;
  const p = createLiquidPill(nav);
  if (!p) return null;
  const links = [...nav.querySelectorAll<HTMLAnchorElement>("a[data-nav]")];
  return {
    moveTo: (id: string) => p.moveTo((id && links.find((l) => l.getAttribute("href") === `#${id}`)) || null),
    refresh: p.refresh,
  };
}

/** Mobile menu: a panel under the header with the section links and language. */
function initMenu() {
  const btn = document.getElementById("menu-toggle");
  const panel = document.getElementById("menu-panel");
  if (!btn || !panel) return;
  const set = (open: boolean) => {
    btn.setAttribute("aria-expanded", String(open));
    panel.dataset.open = String(open);
    panel.inert = !open;
  };
  set(false);
  btn.addEventListener("click", () => set(btn.getAttribute("aria-expanded") !== "true"));
  // section links close the menu; the language switch keeps it open (the text changes in place)
  panel.querySelectorAll("a:not([data-lang-link])").forEach((a) => a.addEventListener("click", () => set(false)));
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && btn.getAttribute("aria-expanded") === "true") {
      set(false);
      btn.focus();
    }
  });
  document.addEventListener("pointerdown", (e) => {
    const t = e.target as Node;
    if (!panel.contains(t) && !btn.contains(t)) set(false);
  });
  // leaving the phone layout closes it
  matchMedia("(min-width: 768px)").addEventListener("change", () => set(false));

  // highlight the section currently on screen (panel + desktop nav)
  const links = gsap.utils.toArray<HTMLAnchorElement>("[data-nav]");
  const pill = initNavPill();
  window.addEventListener("langchange", () => pill?.refresh());
  // after a click, ignore the sections the page scrolls *through* on its way
  let clickTarget = "";
  let clickUntil = 0;
  const mark = (id: string, fromClick = false) => {
    if (!fromClick && performance.now() < clickUntil && id !== clickTarget) return;
    links.forEach((l) => l.toggleAttribute("data-active", l.getAttribute("href") === `#${id}`));
    pill?.moveTo(id);
  };
  links.forEach((l) =>
    l.addEventListener("click", () => {
      clickTarget = l.getAttribute("href")!.slice(1);
      clickUntil = performance.now() + 1600;
      mark(clickTarget, true);
    }),
  );
  const ids = [...new Set(links.map((l) => l.getAttribute("href")!.slice(1)))];
  ids.forEach((id, i) => {
    const el = document.getElementById(id);
    if (!el) return;
    const next = el.nextElementSibling;
    ScrollTrigger.create({
      trigger: el,
      start: "top 50%",
      // "work" also covers the all-work grid that follows it
      endTrigger: id === "work" && next?.id === "all" ? next : el,
      end: "bottom 50%",
      onToggle: (self) => self.isActive && mark(id),
      // above the first section (the hero) nothing is active. (A trigger on the
      // hero itself never fires at scroll 0, the very top of the page.)
      onLeaveBack: i === 0 ? () => mark("") : undefined,
    });
  });
}

function initReveals() {
  const cta = document.getElementById("sticky-cta");
  if (cta) {
    const show = (on: boolean) => {
      cta.inert = !on;
      cta.classList.toggle("opacity-0", !on);
      cta.classList.toggle("translate-y-24", !on);
    };
    ScrollTrigger.create({
      trigger: "#all",
      start: "top 60%",
      endTrigger: "#contact",
      end: "top 90%",
      onToggle: (self) => show(self.isActive),
    });
  }

  if (reduced) return;

  // opacity (not autoAlpha/visibility) so content that has not been revealed yet
  // can still be reached with the Tab key
  gsap.from(".hero-in", { y: 30, opacity: 0, duration: 0.9, stagger: 0.12, ease: "power3.out" });

  gsap.utils.toArray<HTMLElement>(".reveal").forEach((el) =>
    gsap.from(el, {
      y: 30,
      opacity: 0,
      duration: 0.8,
      ease: "power3.out",
      scrollTrigger: { trigger: el, start: "top 88%" },
    }),
  );
  gsap.from(".grid-card", {
    y: 24,
    opacity: 0,
    duration: 0.6,
    stagger: 0.05,
    ease: "power3.out",
    scrollTrigger: { trigger: "#all ul", start: "top 85%" },
  });
}

/**
 * Interactive 3D Zeebo in the hero (three.js + the GLB ≈ 500 KB over the wire).
 * - touch screens, Save-Data, 2G: never automatic. The still image stays and
 *   the 3D version loads when Zeebo or the "View in 3D" button is tapped.
 * - desktop: loads once the page has finished loading and the browser is idle,
 *   so it never competes with the first paint.
 */
function initZeebo() {
  const el = document.getElementById("zeebo-3d");
  const btn = document.getElementById("zeebo-3d-btn") as HTMLButtonElement | null;
  if (!el?.dataset.src) return;
  if (!document.createElement("canvas").getContext("webgl2")) return; // keep the still image

  let started = false;
  const start = async () => {
    if (started) return;
    started = true;
    if (btn) {
      btn.disabled = true;
      btn.dataset.state = "loading";
    }
    try {
      const { mountZeebo } = await import("./zeebo3d");
      const zeebo = mountZeebo(el, {
        src: el.dataset.src!,
        pose: "wave",
        yaw: -0.15,
        onReady: () => {
          el.querySelector<HTMLElement>(".zeebo-still")?.classList.add("opacity-0");
          btn?.remove();
          // say hi: wave excitedly once Zeebo appears (then again on every click / tap)
          window.setTimeout(() => zeebo.wave(), 700);
        },
      });
    } catch {
      // offline / chunk failed: let the visitor try again
      started = false;
      if (btn) {
        btn.disabled = false;
        btn.dataset.state = "";
      }
    }
  };

  const conn = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
  const onDemand =
    matchMedia("(pointer: coarse)").matches ||
    !matchMedia("(hover: hover)").matches ||
    !!conn?.saveData ||
    /(^|-)2g$/.test(conn?.effectiveType ?? "");

  if (onDemand) {
    if (btn) {
      btn.hidden = false;
      btn.addEventListener("click", start);
    }
    el.addEventListener("click", start);
    return;
  }

  const idle = (fn: () => void) =>
    "requestIdleCallback" in window ? requestIdleCallback(fn, { timeout: 2500 }) : window.setTimeout(fn, 1200);
  const whenVisible = () => {
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        start();
      },
      { rootMargin: "200px" },
    );
    io.observe(el);
  };
  if (document.readyState === "complete") idle(whenVisible);
  else window.addEventListener("load", () => idle(whenVisible), { once: true });
}

/** Light / dark toggle. The initial theme is set by an inline script in <head>. */
function initTheme() {
  const btn = document.getElementById("theme-toggle");
  if (!btn) return;
  const root = document.documentElement;
  const meta = document.querySelector('meta[name="theme-color"]');
  const label = () =>
    btn.setAttribute("aria-label", (root.dataset.theme === "dark" ? btn.dataset.labelLight : btn.dataset.labelDark) ?? "");
  const apply = (theme: "light" | "dark", save: boolean) => {
    root.classList.add("theme-anim");
    root.dataset.theme = theme;
    meta?.setAttribute("content", theme === "dark" ? "#131110" : "#f3ece4");
    label();
    window.setTimeout(() => root.classList.remove("theme-anim"), 450);
    if (save) {
      try {
        localStorage.setItem("theme", theme);
      } catch {}
    }
  };
  label();
  window.addEventListener("langchange", label);
  // light by default; dark only after the visitor picks it (remembered)
  btn.addEventListener("click", () => apply(root.dataset.theme === "dark" ? "light" : "dark", true));
}

export function initPage() {
  captureDom(); // before anything below adds or moves elements
  initTheme();
  initLenis();
  initZeebo();
  initCopy();
  initLangSwitch();
  initLangPills();
  initAnchors();
  initWork();
  initMenu();
  initReveals();
  initStartPosition();
}
