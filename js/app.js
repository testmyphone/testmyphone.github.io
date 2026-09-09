// js/app.js — entry point: mounts components and wires up page interactions.

import { mountHeader } from "./components/header.js";
import { mountFooter } from "./components/footer.js";
import { mountToolsGrid } from "./components/toolsGrid.js";

document.addEventListener("DOMContentLoaded", () => {
  mountHeader("#header-root");
  mountFooter("#footer-root");
  mountToolsGrid("#tools-root");

  initLiveReadout();
  initFaqAccordion();
  initRunTestFeedback();
  initSmoothAnchors();
});

/* ----------------------------------------------------
   Live device readout (hero panel + quick scan card)
   ---------------------------------------------------- */
function initLiveReadout() {
  const set = (key, value) => {
    document.querySelectorAll(`[data-readout="${key}"]`).forEach((el) => {
      el.textContent = value;
    });
  };

  set("resolution", `${window.screen.width}×${window.screen.height}`);
  set("resolution2", `${window.screen.width}×${window.screen.height} px`);
  set("dpr", `${window.devicePixelRatio || 1}x`);

  const platform = detectPlatform();
  set("platform", platform);
  set("os", platform);

  set("cores", navigator.hardwareConcurrency ? `${navigator.hardwareConcurrency}` : "n/a");

  const connection =
    navigator.connection && navigator.connection.effectiveType
      ? navigator.connection.effectiveType.toUpperCase()
      : navigator.onLine
      ? "Online"
      : "Offline";
  set("connection", connection);
  set("connection2", navigator.onLine ? "Online" : "Offline");

  if (navigator.getBattery) {
    navigator.getBattery().then((battery) => {
      const pct = Math.round(battery.level * 100);
      set("battery", `${pct}%${battery.charging ? " (charging)" : ""}`);
    }).catch(() => set("battery", "n/a"));
  } else {
    set("battery", "n/a");
  }
}

function detectPlatform() {
  const ua = navigator.userAgent || "";
  if (/android/i.test(ua)) return "Android";
  if (/iphone|ipad|ipod/i.test(ua)) return "iOS";
  if (/mac os/i.test(ua)) return "macOS";
  if (/windows/i.test(ua)) return "Windows";
  if (/linux/i.test(ua)) return "Linux";
  return "Unknown";
}

/* ----------------------------------------------------
   FAQ accordion
   ---------------------------------------------------- */
function initFaqAccordion() {
  const items = document.querySelectorAll(".faq-item");
  items.forEach((item) => {
    const question = item.querySelector(".faq-question");
    question.addEventListener("click", () => {
      const isOpen = item.classList.contains("open");
      items.forEach((other) => {
        other.classList.remove("open");
        other.querySelector(".faq-question").setAttribute("aria-expanded", "false");
      });
      if (!isOpen) {
        item.classList.add("open");
        question.setAttribute("aria-expanded", "true");
      }
    });
  });
}

/* ----------------------------------------------------
   Run-test feedback (lightweight toast)
   ---------------------------------------------------- */
function initRunTestFeedback() {
  const toolsRoot = document.getElementById("tools-root");
  if (!toolsRoot) return;

  toolsRoot.addEventListener("run-test", (e) => {
    const tool = e.detail;
    if (!tool) return;
    showToast(`Launching: ${tool.name}`);
  });
}

let toastTimer = null;
function showToast(message) {
  let toast = document.getElementById("dc-toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "dc-toast";
    toast.setAttribute("role", "status");
    toast.setAttribute("aria-live", "polite");
    Object.assign(toast.style, {
      position: "fixed",
      bottom: "24px",
      left: "50%",
      transform: "translateX(-50%) translateY(20px)",
      background: "#312E81",
      color: "#fff",
      padding: "12px 20px",
      borderRadius: "999px",
      fontSize: "0.9rem",
      fontFamily: "IBM Plex Sans, sans-serif",
      boxShadow: "0 12px 30px -8px rgba(49,46,129,0.5)",
      opacity: "0",
      transition: "opacity 0.2s ease, transform 0.2s ease",
      zIndex: "300",
      pointerEvents: "none",
    });
    document.body.appendChild(toast);
  }

  toast.textContent = message;
  requestAnimationFrame(() => {
    toast.style.opacity = "1";
    toast.style.transform = "translateX(-50%) translateY(0)";
  });

  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateX(-50%) translateY(20px)";
  }, 2200);
}

/* ----------------------------------------------------
   Smooth-scroll for in-page anchors (progressive enhancement)
   ---------------------------------------------------- */
function initSmoothAnchors() {
  document.addEventListener("click", (e) => {
    const link = e.target.closest('a[href^="#"]');
    if (!link) return;
    const id = link.getAttribute("href").slice(1);
    const target = document.getElementById(id);
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  });
}
