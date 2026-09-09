// js/components/header.js
// Reusable, persistent header with blur-on-scroll and mobile nav toggle.

export function renderHeader() {
  return `
    <header class="site-header" id="site-header">
      <div class="header-inner">
        <a href="#main" class="brand" aria-label="DeviceCheck home">
          <span class="brand-mark" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="3" y="4" width="18" height="12" rx="2" stroke="#fff" stroke-width="1.6"/>
              <path d="M8 20h8" stroke="#fff" stroke-width="1.6" stroke-linecap="round"/>
              <path d="M7.5 10l2 2 3-3.5" stroke="#fff" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </span>
          <span class="brand-name">DeviceCheck</span>
        </a>

        <nav class="main-nav" id="main-nav" aria-label="Primary">
          <a href="#tools">Test suite</a>
          <a href="#how-it-works">How it works</a>
          <a href="#faq">FAQ</a>
        </nav>

        <div class="header-actions">
          <a href="#tools" class="btn btn-primary btn-sm">Run a test</a>
          <button class="nav-toggle" id="nav-toggle" aria-expanded="false" aria-controls="main-nav" aria-label="Toggle navigation menu">
            <span></span>
          </button>
        </div>
      </div>
    </header>
  `;
}

export function mountHeader(rootSelector = "#header-root") {
  const root = document.querySelector(rootSelector);
  if (!root) return;
  root.innerHTML = renderHeader();

  const header = document.getElementById("site-header");
  const toggle = document.getElementById("nav-toggle");
  const nav = document.getElementById("main-nav");

  const onScroll = () => {
    header.classList.toggle("scrolled", window.scrollY > 8);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  toggle.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("open");
    toggle.setAttribute("aria-expanded", String(isOpen));
  });

  nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      nav.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
    });
  });
}
