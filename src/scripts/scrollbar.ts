// Custom scrollbar + Zeebo position marker.
// The native scrollbar is hidden (html.custom-sb) only once this runs, so a
// failed script never leaves the page without one.
import type Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const SECTIONS = ["top", "work", "all", "about", "toolkit", "contact"];
const TICKS = ["work", "about", "contact"];

export function initScrollbar(lenis: Lenis | null, sectionTop: (el: HTMLElement) => number) {
  const root = document.getElementById("scrollbar");
  const track = root?.querySelector<HTMLElement>(".sb-track");
  const thumb = root?.querySelector<HTMLElement>(".sb-thumb");
  const marker = root?.querySelector<HTMLElement>(".sb-marker");
  const label = root?.querySelector<HTMLElement>(".sb-label");
  if (!root || !track || !thumb || !marker || !label) return;
  document.documentElement.classList.add("custom-sb");
  root.dataset.touch = String(matchMedia("(pointer: coarse)").matches);

  const scroll = () => (lenis ? lenis.animatedScroll : window.scrollY);
  const scrollTo = (y: number, smooth: boolean) => {
    if (lenis) lenis.scrollTo(y, smooth ? { duration: 1 } : { immediate: true, force: true });
    else window.scrollTo({ top: y, behavior: smooth && !reduced ? "smooth" : "auto" });
  };

  // ── geometry ────────────────────────────────────────────
  let docMax = 1;
  let trackH = 1;
  let thumbH = 40;
  let room = 1; // how far the thumb can travel
  const measure = () => {
    docMax = Math.max(1, document.documentElement.scrollHeight - innerHeight);
    trackH = track.clientHeight || 1;
    thumbH = clamp((trackH * innerHeight) / (docMax + innerHeight), 36, trackH * 0.6);
    room = Math.max(1, trackH - thumbH);
    thumb.style.height = `${thumbH}px`;
    // section marks on the track
    root.querySelectorAll(".sb-tick").forEach((t) => t.remove());
    for (const id of TICKS) {
      const el = document.getElementById(id);
      if (!el) continue;
      const tick = document.createElement("span");
      tick.className = "sb-tick";
      tick.style.top = `${clamp(sectionTop(el) / docMax, 0, 1) * room + thumbH / 2}px`;
      root.append(tick);
    }
  };

  // ── which section is on screen (for the marker's label) ─
  let section = "";
  const currentSection = () => {
    let cur = "top";
    for (const id of SECTIONS) {
      const el = document.getElementById(id);
      if (el && sectionTop(el) - scroll() < innerHeight * 0.4) cur = id;
    }
    return cur;
  };
  const setLabel = (force = false) => {
    const s = currentSection();
    if (s === section && !force) return;
    section = s;
    label.textContent = root.querySelector(`[data-sb-label="${s}"]`)?.textContent ?? "";
  };

  // ── active state: shown while scrolling, hovering or dragging ─
  let idleTimer = 0;
  const wake = () => {
    root.dataset.active = "true";
    clearTimeout(idleTimer);
    idleTimer = window.setTimeout(() => {
      if (!dragging) root.dataset.active = "false";
    }, 1200);
  };

  // ── draw (every frame; cheap) ───────────────────────────
  let lean = 0;
  let lastY = scroll();
  const draw = () => {
    const y = scroll();
    const p = clamp(y / docMax, 0, 1);
    const ty = p * room;
    // Zeebo leans into the direction of travel, and swings back when it stops
    const v = y - lastY;
    lastY = y;
    if (Math.abs(v) > 0.5) wake();
    lean += (clamp(-v * 0.9, -18, 18) - lean) * (reduced ? 1 : 0.15);
    thumb.style.transform = `translate3d(0, ${ty}px, 0)`;
    marker.style.transform = `translate3d(0, calc(${ty + thumbH / 2}px - 50%), 0) rotate(${reduced ? 0 : lean}deg)`;
    setLabel();
  };

  // ── dragging the thumb / Zeebo, clicking the track ──────
  let dragging = false;
  let grab = 0;
  const startDrag = (e: PointerEvent) => {
    e.preventDefault();
    dragging = true;
    root.dataset.dragging = "true";
    const ty = clamp(scroll() / docMax, 0, 1) * room;
    grab = e.clientY - track.getBoundingClientRect().top - ty;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    wake();
  };
  const moveDrag = (e: PointerEvent) => {
    if (!dragging) return;
    const ty = e.clientY - track.getBoundingClientRect().top - grab;
    scrollTo(clamp(ty / room, 0, 1) * docMax, false);
    wake();
  };
  const endDrag = () => {
    if (!dragging) return;
    dragging = false;
    root.dataset.dragging = "false";
    wake();
  };
  for (const el of [thumb, marker]) {
    el.addEventListener("pointerdown", startDrag);
    el.addEventListener("pointermove", moveDrag);
    el.addEventListener("pointerup", endDrag);
    el.addEventListener("pointercancel", endDrag);
  }
  root.addEventListener("pointerdown", (e) => {
    if (e.target !== root && e.target !== track) return;
    const ty = e.clientY - track.getBoundingClientRect().top - thumbH / 2;
    scrollTo(clamp(ty / room, 0, 1) * docMax, true);
    wake();
  });
  root.addEventListener("pointerenter", wake);

  measure();
  setLabel(true);
  draw();
  gsap.ticker.add(draw);
  window.addEventListener("resize", measure);
  ScrollTrigger.addEventListener("refresh", measure);
  document.fonts?.ready.then(measure);
  window.addEventListener("langchange", () => {
    measure();
    setLabel(true);
  });
}
