// "Ask Zeebo" chat (placeholder): suggested questions get answers taken from
// the page (hidden blocks in ChatBot.astro, in the current language); free
// text gets a "still learning" reply. Swap `reply()` for a real AI call later.

const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export function initChat() {
  const root = document.getElementById("chat");
  const panel = document.getElementById("chat-panel");
  const toggle = document.getElementById("chat-toggle");
  const close = document.getElementById("chat-close");
  const log = document.getElementById("chat-log");
  const form = document.getElementById("chat-form") as HTMLFormElement | null;
  const input = document.getElementById("chat-input") as HTMLInputElement | null;
  if (!root || !panel || !toggle || !log || !form || !input) return;

  const setOpen = (open: boolean, focus = true) => {
    root.dataset.open = String(open);
    toggle.setAttribute("aria-expanded", String(open));
    panel.inert = !open;
    if (open) {
      root.dataset.seen = "true"; // hide the "new" dot
      if (focus && matchMedia("(pointer: fine)").matches) input.focus({ preventScroll: true });
    } else if (focus) toggle.focus({ preventScroll: true });
  };
  setOpen(false, false);
  toggle.addEventListener("click", () => setOpen(root.dataset.open !== "true"));
  close?.addEventListener("click", () => setOpen(false));
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && root.dataset.open === "true") setOpen(false);
  });

  const scrollDown = () => log.scrollTo({ top: log.scrollHeight, behavior: reduced ? "auto" : "smooth" });
  const bubble = (who: "me" | "bot", html: string | Node) => {
    const el = document.createElement("div");
    el.className = `msg ${who}`;
    if (typeof html === "string") el.textContent = html;
    else el.append(html);
    log.append(el);
    scrollDown();
    return el;
  };
  const answer = (id: string) => {
    const src = panel.querySelector(`[data-chat-a="${id}"]`);
    const frag = document.createDocumentFragment();
    src?.childNodes.forEach((n) => frag.append(n.cloneNode(true)));
    return frag;
  };

  let busy = false;
  /** placeholder brain: a known question id → its answer; anything else → "still learning" */
  const reply = async (id: string | null) => {
    busy = true;
    const typing = document.createElement("div");
    typing.className = "msg bot typing";
    typing.setAttribute("aria-label", panel.querySelector("[data-chat-typing]")?.textContent ?? "…");
    typing.innerHTML = "<i></i><i></i><i></i>";
    log.append(typing);
    scrollDown();
    await new Promise((r) => setTimeout(r, reduced ? 150 : 650 + Math.random() * 450));
    typing.remove();
    bubble("bot", answer(id ?? "learning"));
    busy = false;
  };

  panel.querySelectorAll<HTMLButtonElement>("[data-chat-q]").forEach((b) =>
    b.addEventListener("click", () => {
      if (busy) return;
      bubble("me", b.textContent?.trim() ?? "");
      reply(b.dataset.chatQ!);
    }),
  );
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const q = input.value.trim();
    if (!q || busy) return;
    input.value = "";
    bubble("me", q);
    reply(null);
  });
}
