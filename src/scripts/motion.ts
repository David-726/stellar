/** Small, progressive enhancements: the document remains readable without JS. */
function initMotion() {
  if (document.body.dataset.motionReady) return;
  document.body.dataset.motionReady = "true";

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
  const revealTargets = Array.from(document.querySelectorAll<HTMLElement>(
    ".post-item, .archive-list > li, .bio-row, .intro-section > nav, .section-label, .about-card, .article-header, .site-footer, .post-nav",
  ));
  const article = document.querySelector<HTMLElement>("[data-article-body]");
  const progress = document.querySelector<HTMLElement>("[data-reading-progress]");
  const backToTop = document.querySelector<HTMLButtonElement>("[data-back-to-top]");
  const navigation = document.querySelector<HTMLElement>(".site-nav");
  const hero = document.querySelector<HTMLElement>(".hero-frame");
  const heroImage = hero?.querySelector<HTMLElement>("[data-hero-image]");
  let revealObserver: IntersectionObserver | undefined;
  let frame = 0;
  let pointerActive = false;
  let pointerX = 0;
  let pointerY = 0;

  const clamp = (value: number, min = 0, max = 1) => Math.min(max, Math.max(min, value));

  function clearReveals() {
    revealObserver?.disconnect();
    revealObserver = undefined;
    revealTargets.forEach((element) => {
      delete element.dataset.reveal;
      element.style.removeProperty("--reveal-delay");
    });
  }

  function setupReveals() {
    clearReveals();
    if (reducedMotion.matches || !("IntersectionObserver" in window)) return;

    try {
      revealObserver = new IntersectionObserver((entries) => {
        if (reducedMotion.matches) return;
        // Delay belongs to this viewport batch, never to an article's list index.
        entries.filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
          .forEach((entry, index) => {
            const element = entry.target as HTMLElement;
            element.style.setProperty("--reveal-delay", `${Math.min(index * 40, 160)}ms`);
            element.dataset.reveal = "visible";
            revealObserver?.unobserve(element);
          });
      }, { rootMargin: "0px 0px -20px 0px", threshold: 0 });

      revealTargets.forEach((element) => {
        if (element.getBoundingClientRect().top >= window.innerHeight - 20 &&
            !element.contains(document.activeElement)) {
          element.dataset.reveal = "pending";
          revealObserver?.observe(element);
        }
      });
    } catch {
      // An enhancement must never leave the page's content inaccessible.
      clearReveals();
    }
  }

  document.addEventListener("focusin", (event) => {
    if (!(event.target instanceof Element)) return;
    let pending = event.target.closest<HTMLElement>('[data-reveal="pending"]');
    while (pending) {
      revealObserver?.unobserve(pending);
      // Remove the state entirely so a keyboard user does not wait for a fade.
      delete pending.dataset.reveal;
      pending.style.removeProperty("--reveal-delay");
      pending = pending.parentElement?.closest<HTMLElement>('[data-reveal="pending"]') ?? null;
    }
  });

  function focusMain() {
    const main = document.querySelector<HTMLElement>("#main-content");
    if (!main) return;
    if (!main.hasAttribute("tabindex")) main.tabIndex = -1;
    main.focus({ preventScroll: true });
  }

  function resetHero() {
    pointerActive = false;
    if (!hero) return;
    ["--hero-x", "--hero-y", "--hero-scroll"].forEach((name) => hero.style.setProperty(name, "0px"));
    ["--hero-rotate-x", "--hero-rotate-y"].forEach((name) => hero.style.setProperty(name, "0deg"));
  }

  function updateFrame() {
    frame = 0;
    const scrollY = Math.max(0, window.scrollY);
    const viewportHeight = window.innerHeight;
    // Finish layout reads before applying visual updates.
    const articleRect = article?.getBoundingClientRect();
    const navHeight = navigation?.getBoundingClientRect().height ?? 0;
    const canMoveHero = !!heroImage && !reducedMotion.matches && finePointer.matches;
    const heroRect = canMoveHero ? hero?.getBoundingClientRect() : undefined;

    document.body.classList.toggle("is-scrolled", scrollY > 20);

    if (progress && articleRect) {
      const readingDistance = articleRect.height - viewportHeight + navHeight;
      const amount = readingDistance > 0
        ? clamp((navHeight - articleRect.top) / readingDistance)
        : (articleRect.bottom <= viewportHeight ? 1 : 0);
      progress.style.transform = `scaleX(${amount})`;
    }

    if (backToTop) {
      const visible = scrollY > 400;
      if (!visible && document.activeElement === backToTop) focusMain();
      backToTop.classList.toggle("is-visible", visible);
      backToTop.tabIndex = visible ? 0 : -1;
      backToTop.setAttribute("aria-hidden", String(!visible));
    }

    if (hero && heroRect && heroRect.width > 0 && heroRect.height > 0) {
      const x = pointerActive ? clamp((pointerX - heroRect.left) / heroRect.width * 2 - 1, -1, 1) : 0;
      const y = pointerActive ? clamp((pointerY - heroRect.top) / heroRect.height * 2 - 1, -1, 1) : 0;
      const inView = heroRect.bottom > 0 && heroRect.top < viewportHeight;
      const drift = inView ? clamp((viewportHeight / 2 - (heroRect.top + heroRect.height / 2)) / viewportHeight * 16, -8, 8) : 0;
      hero.style.setProperty("--hero-x", `${(x * 4).toFixed(2)}px`);
      hero.style.setProperty("--hero-y", `${(y * 4).toFixed(2)}px`);
      hero.style.setProperty("--hero-rotate-x", `${(-y * 1.2).toFixed(2)}deg`);
      hero.style.setProperty("--hero-rotate-y", `${(x * 1.2).toFixed(2)}deg`);
      hero.style.setProperty("--hero-scroll", `${drift.toFixed(2)}px`);
    }
  }

  function scheduleFrame() {
    if (!frame) frame = window.requestAnimationFrame(updateFrame);
  }

  backToTop?.addEventListener("click", () => {
    focusMain();
    window.scrollTo({ top: 0, behavior: reducedMotion.matches ? "auto" : "smooth" });
  });

  hero?.addEventListener("pointermove", (event) => {
    if (reducedMotion.matches || !finePointer.matches || event.pointerType === "touch") return;
    pointerActive = true;
    pointerX = event.clientX;
    pointerY = event.clientY;
    scheduleFrame();
  }, { passive: true });
  hero?.addEventListener("pointerleave", () => {
    pointerActive = false;
    scheduleFrame();
  }, { passive: true });
  hero?.addEventListener("pointercancel", () => {
    pointerActive = false;
    scheduleFrame();
  }, { passive: true });

  window.addEventListener("scroll", scheduleFrame, { passive: true });
  window.addEventListener("resize", scheduleFrame, { passive: true });
  window.addEventListener("pageshow", scheduleFrame);
  window.addEventListener("load", scheduleFrame, { once: true });
  // Image loads and webfont swaps can change article height without scrolling.
  document.addEventListener("load", scheduleFrame, { capture: true, passive: true });
  if ("ResizeObserver" in window) {
    const layoutObserver = new ResizeObserver(scheduleFrame);
    [document.body, article, navigation, hero].forEach((element) => {
      if (element) layoutObserver.observe(element);
    });
  }
  document.fonts?.ready.then(scheduleFrame).catch(() => {});

  reducedMotion.addEventListener("change", () => {
    resetHero();
    setupReveals();
    scheduleFrame();
  });
  finePointer.addEventListener("change", () => {
    resetHero();
    scheduleFrame();
  });

  setupReveals();
  resetHero();
  updateFrame();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initMotion, { once: true });
} else {
  initMotion();
}

export {};
