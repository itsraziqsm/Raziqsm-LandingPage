// Smooth language switch: no page load. The other language's page (same
// template, so the same element tree) is fetched once and its text is swapped
// into the live page with a blur-fade. Scroll position, the 3D Zeebo, the card
// on screen and the theme stay as they are; the URL, <title> and <html lang>
// follow, and the browser's back / forward buttons switch back.
//
// Safety net: if anything does not line up (structure, network), it falls back
// to a normal page load.
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

type Lang = "id" | "en";

/** body elements in document order, recorded before any script changed the DOM */
let liveEls: Element[] = [];
/** static pages (as served) by path */
const pages = new Map<string, Promise<Document>>();
let currentPath = location.pathname;
let busy = false;

/** attributes that carry text (or a language-specific URL) */
const ATTRS = ["aria-label", "title", "alt", "href", "data-label-dark", "data-label-light", "data-cat-label", "data-toast"];

const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * Elements that take part in the matching. Left out: scripts, and what
 * Cloudflare rewrites on the way (Email Obfuscation serves an email as
 * <span class="__cf_email__"> and its own script swaps that span for plain
 * text before ours run, so the live page has fewer elements than the HTML).
 */
const elements = (root: ParentNode) => [...root.querySelectorAll("*")].filter((e) => !e.matches("script, noscript, .__cf_email__"));

/** Call first thing on load, before other scripts add or move elements. */
export function captureDom() {
  liveEls = elements(document.body);
}

const parse = (html: string) => new DOMParser().parseFromString(html, "text/html");
function load(path: string) {
  let p = pages.get(path);
  if (!p) {
    p = fetch(path, { credentials: "same-origin" }).then((r) => {
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      return r.text().then(parse);
    });
    p.catch(() => pages.delete(path));
    pages.set(path, p);
  }
  return p;
}

const pathOf = (lang: string) => {
  const a = document.querySelector<HTMLAnchorElement>(`a[data-lang-link="${lang}"]`);
  return a ? new URL(a.href, location.href).pathname : null;
};
const textNodes = (el: Node) => [...el.childNodes].filter((n) => n.nodeType === Node.TEXT_NODE) as Text[];
const sameTexts = (a: Element, b: Element) => {
  const x = textNodes(a);
  const y = textNodes(b);
  return x.length === y.length && x.every((n, i) => n.nodeValue === y[i].nodeValue);
};
const onScreen = (el: Element) => {
  const r = el.getBoundingClientRect();
  if (r.width === 0 || r.bottom < 0 || r.top > innerHeight) return false;
  return el.checkVisibility ? el.checkVisibility({ opacityProperty: true, visibilityProperty: true }) : true;
};

/** remember the section on screen, for the fallback (a real page load) */
function rememberSection() {
  let current = "top";
  for (const id of ["top", "work", "all", "about", "toolkit", "contact"]) {
    const el = document.getElementById(id);
    if (el && el.getBoundingClientRect().top < innerHeight * 0.4) current = id;
  }
  try {
    if (current !== "top") sessionStorage.setItem("goto-section", current);
  } catch {}
}
function fallback(path: string) {
  rememberSection();
  location.assign(path);
}

export async function switchLanguage(lang: Lang, push = true) {
  const path = pathOf(lang);
  if (!path || busy || lang === document.documentElement.lang) return;
  busy = true;
  try {
    let from: Document, to: Document;
    try {
      [from, to] = await Promise.all([load(currentPath), load(path)]);
    } catch {
      return fallback(path);
    }
    // both sides as served (never the live DOM, which scripts have changed)
    const A = elements(from.body);
    const B = elements(to.body);
    if (A.length !== B.length || A.length !== liveEls.length || A.some((a, i) => a.tagName !== B[i].tagName || liveEls[i].tagName !== a.tagName)) {
      return fallback(path);
    }

    // what changes: text nodes and text attributes, element by element
    const textOps: (() => void)[] = [];
    const attrOps: (() => void)[] = [];
    const changed = new Set<Element>();
    A.forEach((a, i) => {
      const b = B[i];
      const live = liveEls[i];
      if (!live.isConnected) return;
      if (!sameTexts(a, b)) {
        changed.add(live);
        textOps.push(() => {
          const ln = textNodes(live);
          const bn = textNodes(b);
          if (ln.length === bn.length) ln.forEach((n, k) => (n.nodeValue = bn[k].nodeValue));
          else if (!live.children.length) live.textContent = b.textContent;
          else live.innerHTML = b.innerHTML;
        });
      }
      for (const name of ATTRS) {
        const va = a.getAttribute(name);
        const vb = b.getAttribute(name);
        if (va === vb) continue;
        attrOps.push(() => (vb === null ? live.removeAttribute(name) : live.setAttribute(name, vb)));
      }
    });

    const apply = () => {
      textOps.forEach((f) => f());
      attrOps.forEach((f) => f());
      // document-level bits
      document.documentElement.lang = lang;
      document.title = to.title;
      for (const sel of ['meta[name="description"]', 'meta[property="og:title"]', 'meta[property="og:description"]', 'meta[property="og:url"]', 'meta[property="og:locale"]']) {
        const v = to.querySelector(sel)?.getAttribute("content");
        if (v != null) document.querySelector(sel)?.setAttribute("content", v);
      }
      const canon = to.querySelector('link[rel="canonical"]')?.getAttribute("href");
      if (canon) document.querySelector('link[rel="canonical"]')?.setAttribute("href", canon);
      // language switch state (the liquid pills listen to "langchange")
      document.querySelectorAll<HTMLAnchorElement>("a[data-lang-link]").forEach((a) => {
        const on = a.dataset.langLink === lang;
        a.toggleAttribute("data-active", on);
        if (on) a.setAttribute("aria-current", "true");
        else a.removeAttribute("aria-current");
      });
      currentPath = path;
      if (push) history.pushState({ lang }, "", path + location.search);
      window.dispatchEvent(new CustomEvent("langchange", { detail: { lang } }));
      ScrollTrigger.refresh();
    };

    // animate only what is on screen; the outermost changed element of each group
    const roots = [...changed].filter((el) => {
      for (let p = el.parentElement; p; p = p.parentElement) if (changed.has(p)) return false;
      return true;
    });
    const visible = reduced ? [] : roots.filter(onScreen).sort((x, y) => x.getBoundingClientRect().top - y.getBoundingClientRect().top);

    // move the language pills right away, the text follows
    window.dispatchEvent(new CustomEvent("langswitchstart", { detail: { lang } }));
    if (!visible.length) {
      apply();
      return;
    }
    // remember each element's own inline opacity, to hand it back afterwards
    const saved = visible.map((el) => (el as HTMLElement).style.opacity);
    const opac = visible.map((el) => parseFloat(getComputedStyle(el).opacity) || 1);
    await new Promise<void>((done) => {
      gsap
        .timeline({ onComplete: done })
        .to(visible, { opacity: 0, filter: "blur(6px)", duration: 0.22, ease: "power1.in", stagger: { amount: 0.12 } })
        .add(apply)
        .fromTo(
          visible,
          { opacity: 0, filter: "blur(6px)" },
          {
            opacity: (i) => opac[i],
            filter: "blur(0px)",
            duration: 0.42,
            ease: "power2.out",
            stagger: { amount: 0.18 },
            onComplete() {
              visible.forEach((el, i) => {
                const s = (el as HTMLElement).style;
                s.filter = "";
                s.opacity = saved[i];
              });
            },
          },
        );
    });
  } finally {
    busy = false;
  }
}

export function initLangSwitch() {
  const links = [...document.querySelectorAll<HTMLAnchorElement>("a[data-lang-link]")];
  links.forEach((a) => {
    a.addEventListener("click", (e) => {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return; // new tab etc.: a normal link
      e.preventDefault();
      switchLanguage(a.dataset.langLink as Lang);
    });
    // fetch the other language early
    const warm = () => {
      const p = pathOf(a.dataset.langLink!);
      if (p) load(p).catch(() => {});
    };
    a.addEventListener("pointerenter", warm, { once: true });
    a.addEventListener("touchstart", warm, { once: true, passive: true });
    a.addEventListener("focus", warm, { once: true });
  });
  // and when the browser is idle anyway
  const other = document.documentElement.lang === "en" ? "id" : "en";
  const idle = (fn: () => void) => ("requestIdleCallback" in window ? requestIdleCallback(fn, { timeout: 4000 }) : setTimeout(fn, 2500));
  idle(() => {
    const p = pathOf(other);
    if (p) load(p).catch(() => {});
  });

  // back / forward between the two languages
  history.replaceState({ lang: document.documentElement.lang }, "");
  window.addEventListener("popstate", (e) => {
    const lang = (e.state?.lang as Lang | undefined) ?? (/\/en\/?$/.test(location.pathname) ? "en" : "id");
    if (lang !== document.documentElement.lang) switchLanguage(lang, false);
  });
}
