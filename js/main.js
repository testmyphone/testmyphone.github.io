/* ==========================================================================
   TestLab — main.js
   Homepage-only: nav/scroll effects, mobile menu, FAQ accordion,
   scroll-reveal animations, test grid rendering, and the 3 live hero demos
   (microphone meter, speaker tone + pan, touch canvas).
   ========================================================================== */
(function () {
  "use strict";

  var prefersReducedMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ------------------------------------------------------------------ */
  /* Icon library (24x24 viewBox unless noted, stroke=currentColor)      */
  /* ------------------------------------------------------------------ */
  var ICONS = {
    mic: '<rect x="9" y="2" width="6" height="12" rx="3"></rect><path d="M5 11a7 7 0 0 0 14 0"></path><line x1="12" y1="18" x2="12" y2="22"></line>',
    speaker: '<path d="M3 9v6h4l5 4V5L7 9H3z"></path><path d="M16 8a5 5 0 0 1 0 8"></path><path d="M19 5a9 9 0 0 1 0 14"></path>',
    ear: '<path d="M6 3h9a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z"></path><line x1="10" y1="18" x2="14" y2="18"></line>',
    touch: '<path d="M9 12V5a1.5 1.5 0 0 1 3 0v6"></path><path d="M12 11V4a1.5 1.5 0 0 1 3 0v7"></path><path d="M15 11.5V6a1.5 1.5 0 0 1 3 0v9c0 3.5-2.5 6-6 6h-1c-2 0-3-1-4-2.5L4.5 15a1.4 1.4 0 0 1 2-2L9 15"></path>',
    multitouch: '<circle cx="8" cy="8" r="3"></circle><circle cx="17" cy="8" r="3"></circle><path d="M5 20c0-3 1.5-5 3.5-5"></path><path d="M14 20c0-3 1.5-5 3.5-5"></path>',
    display: '<rect x="3" y="4" width="18" height="13" rx="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line>',
    gps: '<path d="M12 21s7-6.5 7-12a7 7 0 0 0-14 0c0 5.5 7 12 7 12z"></path><circle cx="12" cy="9" r="2.5"></circle>',
    accel: '<circle cx="12" cy="12" r="9"></circle><circle cx="14" cy="10" r="2.2" fill="currentColor" stroke="none"></circle>',
    gyro: '<ellipse cx="12" cy="12" rx="9" ry="4.2"></ellipse><ellipse cx="12" cy="12" rx="4.2" ry="9"></ellipse>',
    proximity: '<circle cx="7" cy="12" r="2"></circle><path d="M12 7a7 7 0 0 1 0 10"></path><path d="M16 4a12 12 0 0 1 0 16"></path>',
    light: '<circle cx="12" cy="12" r="4"></circle><line x1="12" y1="2" x2="12" y2="5"></line><line x1="12" y1="19" x2="12" y2="22"></line><line x1="2" y1="12" x2="5" y2="12"></line><line x1="19" y1="12" x2="22" y2="12"></line><line x1="4.5" y1="4.5" x2="6.5" y2="6.5"></line><line x1="17.5" y1="17.5" x2="19.5" y2="19.5"></line><line x1="4.5" y1="19.5" x2="6.5" y2="17.5"></line><line x1="17.5" y1="6.5" x2="19.5" y2="4.5"></line>',
    vibrate: '<rect x="8" y="4" width="8" height="16" rx="2"></rect><path d="M4 9v6"></path><path d="M20 9v6"></path><path d="M1 10v4"></path><path d="M23 10v4"></path>',
    flashlight: '<path d="M9 2h6l1 4-2 2v12a2 2 0 0 1-4 0V8L8 6z"></path><line x1="8.5" y1="6" x2="15.5" y2="6"></line>',
    battery: '<rect x="2" y="7" width="18" height="10" rx="2"></rect><line x1="22" y1="10" x2="22" y2="14"></line><path d="M8 10l-2 3h3l-2 3"></path>',
    charging: '<path d="M9 2v6"></path><path d="M15 2v6"></path><path d="M6 8h12v5a6 6 0 0 1-12 0V8z"></path><path d="M12 19v3"></path>',
    wifi: '<path d="M2 8.5a16 16 0 0 1 20 0"></path><path d="M5.5 12.5a11 11 0 0 1 13 0"></path><path d="M9 16.5a5.5 5.5 0 0 1 6 0"></path><circle cx="12" cy="20" r="1" fill="currentColor" stroke="none"></circle>',
    cellular: '<rect x="4" y="14" width="3" height="6"></rect><rect x="10.5" y="10" width="3" height="10"></rect><rect x="17" y="5" width="3" height="15"></rect>',
    bluetooth: '<path d="M7 7l10 10-5 5V2l5 5L7 17"></path>',
    fingerprint: '<path d="M12 3a7 7 0 0 0-7 7c0 3 1 5 1 8"></path><path d="M12 3a7 7 0 0 1 7 7c0 2 -0.3 3.5 -0.8 5"></path><path d="M8 20c-1-2-2-4-2-7a6 6 0 0 1 12 0c0 1.2-0.15 2.2-0.4 3.1"></path><path d="M12 21c-1.2-2-2-4.5-2-8a2 2 0 0 1 4 0c0 2 0.4 3.3 1 4.5"></path>',
    buttons: '<rect x="3" y="3" width="7" height="7" rx="1.5"></rect><rect x="14" y="3" width="7" height="7" rx="1.5"></rect><rect x="3" y="14" width="7" height="7" rx="1.5"></rect><rect x="14" y="14" width="7" height="7" rx="1.5"></rect>',
    usb: '<circle cx="7" cy="17" r="2"></circle><circle cx="17" cy="6" r="2"></circle><path d="M7 15V9a3 3 0 0 1 3-3h5"></path><path d="M11 12h4"></path>',
    headphone: '<path d="M4 13a8 8 0 0 1 16 0v5a2 2 0 0 1-2 2h-1v-6h3"></path><path d="M4 13v6h3v-6H4z"></path>',
    storage: '<ellipse cx="12" cy="5" rx="8" ry="3"></ellipse><path d="M4 5v14c0 1.7 3.6 3 8 3s8-1.3 8-3V5"></path><path d="M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3"></path>',
    camera: '<path d="M4 8h3l2-3h6l2 3h3v11H4z"></path><circle cx="12" cy="13.5" r="3.5"></circle>'
  };

  function svgIcon(name, size) {
    size = size || 20;
    return (
      '<svg viewBox="0 0 24 24" width="' + size + '" height="' + size + '" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      (ICONS[name] || "") +
      "</svg>"
    );
  }

  /* ------------------------------------------------------------------ */
  /* Test catalog (mirrors the runner's registry, for the homepage grid) */
  /* ------------------------------------------------------------------ */
  var CATEGORY_LABEL = {
    audio: "Audio",
    display: "Display & Touch",
    sensors: "Sensors",
    connectivity: "Connectivity",
    hardware: "Hardware",
    device: "Device"
  };

  var CATEGORY_COLOR = {
    audio: "#4F46E5",
    display: "#14B8A6",
    sensors: "#F59E0B",
    connectivity: "#0EA5E9",
    hardware: "#8B5CF6",
    device: "#10B981"
  };

  var TEST_CATALOG = [
    { id: "microphone", category: "audio", icon: "mic", name: "Microphone Recording", desc: "Live level meter and waveform using Web Audio's AnalyserNode." },
    { id: "speaker", category: "audio", icon: "speaker", name: "Stereo Speakers", desc: "Swept tone with independent left/right channel playback." },
    { id: "earpiece", category: "audio", icon: "ear", name: "Earpiece Speaker", desc: "Low-volume call-style tone for the top earpiece speaker." },
    { id: "touchscreen", category: "display", icon: "touch", name: "Touch & Dead Zones", desc: "Drag across the full screen to reveal unresponsive areas." },
    { id: "multitouch", category: "display", icon: "multitouch", name: "Multi-Touch Digitizer", desc: "Counts simultaneous touch points, up to 10 fingers." },
    { id: "deadpixel", category: "display", icon: "display", name: "Dead Pixels & OLED Burn-in", desc: "Full-screen color cycling to reveal stuck or dead pixels." },
    { id: "accelerometer", category: "sensors", icon: "accel", name: "Accelerometer", desc: "Tilt the phone and watch a live level bubble respond." },
    { id: "gyroscope", category: "sensors", icon: "gyro", name: "Gyroscope", desc: "Alpha/beta/gamma rotation readout from DeviceOrientation." },
    { id: "proximity", category: "sensors", icon: "proximity", name: "Proximity Sensor", desc: "Detects when the top of the phone is covered." },
    { id: "ambientlight", category: "sensors", icon: "light", name: "Ambient Light Sensor", desc: "Reads ambient lux where supported, manual check otherwise." },
    { id: "vibration", category: "sensors", icon: "vibrate", name: "Vibration Motor", desc: "Fires a haptic pattern via the Vibration API." },
    { id: "wifi", category: "connectivity", icon: "wifi", name: "Wi-Fi & Network Speed", desc: "Connection type, RTT, and a live latency check." },
    { id: "cellular", category: "connectivity", icon: "cellular", name: "Cellular / SIM", desc: "Reports exposed network type and connectivity info." },
    { id: "bluetooth", category: "connectivity", icon: "bluetooth", name: "Bluetooth Radio", desc: "Opens the native device chooser via Web Bluetooth." },
    { id: "camera", category: "hardware", icon: "camera", name: "Front & Rear Cameras", desc: "Live preview with a front/rear switch and frame capture." },
    { id: "flashlight", category: "hardware", icon: "flashlight", name: "Flashlight / Torch", desc: "Toggles the rear camera's torch constraint on and off." },
    { id: "buttons", category: "hardware", icon: "buttons", name: "Physical Buttons", desc: "On-screen key grid for manually confirming hardware buttons." },
    { id: "fingerprint", category: "hardware", icon: "fingerprint", name: "Biometric / Touch ID", desc: "Checks for a platform authenticator via WebAuthn." },
    { id: "usb", category: "hardware", icon: "usb", name: "USB / OTG Port", desc: "Opens the USB device picker via WebUSB where available." },
    { id: "chargingport", category: "hardware", icon: "charging", name: "Charging Port", desc: "Plug and unplug your charger to confirm state changes." },
    { id: "battery", category: "device", icon: "battery", name: "Battery Health", desc: "Charge level, charging state, and estimated time remaining." },
    { id: "gps", category: "device", icon: "gps", name: "GPS Location Accuracy", desc: "Live coordinates and reported accuracy radius in meters." },
    { id: "storage", category: "device", icon: "storage", name: "Storage Estimate", desc: "Available quota and usage via the Storage API." },
    { id: "headphonejack", category: "device", icon: "headphone", name: "Headphone Jack / Audio Out", desc: "Detects output devices and confirms audio routing." }
  ];

  /* ------------------------------------------------------------------ */
  /* Header scroll state + mobile menu                                   */
  /* ------------------------------------------------------------------ */
  function initHeader() {
    var header = document.getElementById("siteHeader");
    if (!header) return;
    function onScroll() {
      if (window.scrollY > 8) header.classList.add("is-scrolled");
      else header.classList.remove("is-scrolled");
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    var toggle = document.getElementById("mobileMenuToggle");
    var close = document.getElementById("mobileMenuClose");
    var menu = document.getElementById("mobileMenu");
    if (!toggle || !menu) return;

    function openMenu() {
      menu.classList.add("is-open");
      toggle.setAttribute("aria-expanded", "true");
      document.body.classList.add("has-mobile-menu-open");
    }
    function closeMenu() {
      menu.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
      document.body.classList.remove("has-mobile-menu-open");
    }
    toggle.addEventListener("click", openMenu);
    if (close) close.addEventListener("click", closeMenu);
    menu.querySelectorAll("[data-menu-link]").forEach(function (a) {
      a.addEventListener("click", closeMenu);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeMenu();
    });
  }

  /* ------------------------------------------------------------------ */
  /* FAQ accordion                                                        */
  /* ------------------------------------------------------------------ */
  function initAccordion() {
    var list = document.getElementById("faqList");
    if (!list) return;
    list.querySelectorAll(".accordion-item__trigger").forEach(function (trigger) {
      var panel = document.getElementById(trigger.getAttribute("aria-controls"));
      if (!panel) return;
      var inner = panel.querySelector(".accordion-item__panel-inner");
      trigger.addEventListener("click", function () {
        var isOpen = trigger.getAttribute("aria-expanded") === "true";
        trigger.setAttribute("aria-expanded", String(!isOpen));
        if (isOpen) {
          panel.style.height = panel.scrollHeight + "px";
          requestAnimationFrame(function () { panel.style.height = "0px"; });
        } else {
          panel.style.height = inner.offsetHeight + "px";
          panel.addEventListener("transitionend", function te() {
            if (trigger.getAttribute("aria-expanded") === "true") panel.style.height = "auto";
            panel.removeEventListener("transitionend", te);
          });
        }
      });
      trigger.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          trigger.click();
        }
      });
    });
  }

  /* ------------------------------------------------------------------ */
  /* Scroll-reveal via IntersectionObserver                              */
  /* ------------------------------------------------------------------ */
  function initReveal() {
    var items = document.querySelectorAll(".reveal");
    if (!items.length) return;
    if (prefersReducedMotion || !("IntersectionObserver" in window)) {
      items.forEach(function (el) { el.classList.add("is-visible"); });
      return;
    }
    items.forEach(function (el) {
      el.style.opacity = "0";
      el.style.transform = "translateY(16px)";
      el.style.transition = "opacity 0.5s ease, transform 0.5s ease";
    });
    var io = new IntersectionObserver(
      function (entries, obs) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.style.opacity = "1";
            entry.target.style.transform = "translateY(0)";
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    items.forEach(function (el) { io.observe(el); });
  }

  /* ------------------------------------------------------------------ */
  /* Test grid rendering + category filter                               */
  /* ------------------------------------------------------------------ */
  function renderTestGrid() {
    var grid = document.getElementById("testsGrid");
    if (!grid) return;

    var arrowIcon = '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="4" y1="12" x2="20" y2="12"></line><path d="M14 6l6 6-6 6"></path></svg>';

    function cardHTML(t) {
      var color = CATEGORY_COLOR[t.category] || "#4F46E5";
      return (
        '<div class="test-card card reveal" data-category="' + t.category + '">' +
        '<div class="test-card__head">' +
        '<span class="test-card__icon" style="background:' + color + '22; color:' + color + ';">' + svgIcon(t.icon, 22) + "</span>" +
        '<span class="chip chip--pending" style="text-transform:uppercase; font-size:10px;">' + CATEGORY_LABEL[t.category] + "</span>" +
        "</div>" +
        '<div class="test-card__name">' + t.name + "</div>" +
        '<p class="test-card__desc">' + t.desc + "</p>" +
        '<a class="test-card__run" href="./tests.html?test=' + t.id + '">Run test ' + arrowIcon + "</a>" +
        "</div>"
      );
    }

    var html = TEST_CATALOG.map(cardHTML).join("");
    grid.innerHTML = html;
    initReveal(); // newly injected cards also need observing

    var tabs = document.getElementById("categoryTabs");
    if (!tabs) return;
    tabs.querySelectorAll(".category-tab").forEach(function (tab) {
      tab.addEventListener("click", function () {
        tabs.querySelectorAll(".category-tab").forEach(function (t) { t.setAttribute("aria-pressed", "false"); });
        tab.setAttribute("aria-pressed", "true");
        var cat = tab.getAttribute("data-category");
        grid.querySelectorAll(".test-card").forEach(function (card) {
          var show = cat === "all" || card.getAttribute("data-category") === cat;
          card.style.display = show ? "" : "none";
        });
      });
    });
  }

  /* ------------------------------------------------------------------ */
  /* Hero demo: microphone level meter + waveform                        */
  /* ------------------------------------------------------------------ */
  function initMicDemo() {
    var btn = document.getElementById("heroMicBtn");
    var waveform = document.getElementById("heroWaveform");
    var statusText = document.getElementById("micStatusText");
    var badgeText = document.getElementById("micBadgeText");
    var badgeDot = document.getElementById("micBadgeDot");
    if (!btn || !waveform) return;

    var BAR_COUNT = 24;
    var bars = [];
    for (var i = 0; i < BAR_COUNT; i++) {
      var bar = document.createElement("span");
      bar.className = "waveform__bar";
      waveform.appendChild(bar);
      bars.push(bar);
    }

    var audioCtx = null, analyser = null, source = null, stream = null, rafId = null;
    var active = false;

    function stop() {
      active = false;
      if (rafId) cancelAnimationFrame(rafId);
      rafId = null;
      if (stream) stream.getTracks().forEach(function (t) { t.stop(); });
      stream = null;
      if (audioCtx) audioCtx.close().catch(function () {});
      audioCtx = null; analyser = null; source = null;
      bars.forEach(function (b) { b.style.height = "15%"; });
      btn.innerHTML = svgIcon("mic", 16) + " Enable Microphone Demo";
      statusText.textContent = "Tap to enable";
      badgeText.textContent = "Microphone Demo";
      badgeDot.style.background = "";
    }

    function draw() {
      if (!active || !analyser) return;
      var data = new Uint8Array(analyser.frequencyBinCount);
      analyser.getByteFrequencyData(data);
      var step = Math.floor(data.length / BAR_COUNT) || 1;
      var loudest = 0;
      for (var i = 0; i < BAR_COUNT; i++) {
        var v = data[i * step] || 0;
        loudest = Math.max(loudest, v);
        var pct = Math.max(8, Math.min(100, (v / 255) * 100));
        bars[i].style.height = pct + "%";
      }
      statusText.textContent = loudest > 40 ? "Signal detected ✓" : "Listening…";
      rafId = requestAnimationFrame(draw);
    }

    btn.addEventListener("click", function () {
      if (active) { stop(); return; }
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia || !window.AudioContext) {
        statusText.textContent = "Not supported in this browser";
        return;
      }
      statusText.textContent = "Requesting access…";
      navigator.mediaDevices
        .getUserMedia({ audio: true })
        .then(function (s) {
          stream = s;
          audioCtx = new (window.AudioContext || window.webkitAudioContext)();
          analyser = audioCtx.createAnalyser();
          analyser.fftSize = 128;
          source = audioCtx.createMediaStreamSource(stream);
          source.connect(analyser);
          active = true;
          btn.innerHTML = svgIcon("mic", 16) + " Stop Microphone Demo";
          badgeText.textContent = "Microphone Verified";
          badgeDot.style.background = "var(--color-secondary)";
          draw();
        })
        .catch(function () {
          statusText.textContent = "Microphone access denied";
        });
    });

    window.addEventListener("pagehide", stop);
  }

  /* ------------------------------------------------------------------ */
  /* Hero demo: speaker tone with L/R pan                                 */
  /* ------------------------------------------------------------------ */
  function initSpeakerDemo() {
    var btn = document.getElementById("heroSpeakerBtn");
    var left = document.getElementById("heroPanLeft");
    var center = document.getElementById("heroPanCenter");
    var right = document.getElementById("heroPanRight");
    if (!btn) return;

    var pan = 0;
    var audioCtx = null, osc = null, panner = null, gain = null, playing = false;

    function setPan(value, activeBtn) {
      pan = value;
      [left, center, right].forEach(function (b) { b.setAttribute("aria-pressed", "false"); });
      activeBtn.setAttribute("aria-pressed", "true");
      if (panner) panner.pan.value = pan;
    }
    if (left) left.addEventListener("click", function () { setPan(-1, left); });
    if (center) center.addEventListener("click", function () { setPan(0, center); });
    if (right) right.addEventListener("click", function () { setPan(1, right); });

    function stop() {
      playing = false;
      if (osc) { try { osc.stop(); } catch (e) {} }
      if (audioCtx) audioCtx.close().catch(function () {});
      audioCtx = null; osc = null; panner = null; gain = null;
      btn.innerHTML = svgIcon("speaker", 16) + " Play Tone";
    }

    btn.addEventListener("click", function () {
      if (playing) { stop(); return; }
      if (!window.AudioContext && !window.webkitAudioContext) {
        btn.textContent = "Not supported";
        return;
      }
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      osc = audioCtx.createOscillator();
      gain = audioCtx.createGain();
      gain.gain.value = 0.12;
      osc.frequency.value = 440;
      osc.type = "sine";
      if (audioCtx.createStereoPanner) {
        panner = audioCtx.createStereoPanner();
        panner.pan.value = pan;
        osc.connect(gain).connect(panner).connect(audioCtx.destination);
      } else {
        osc.connect(gain).connect(audioCtx.destination);
      }
      osc.start();
      playing = true;
      btn.innerHTML = svgIcon("speaker", 16) + " Stop Tone";
      osc.onended = stop;
    });

    window.addEventListener("pagehide", stop);
  }

  /* ------------------------------------------------------------------ */
  /* Hero demo: touch canvas glowing trail                                */
  /* ------------------------------------------------------------------ */
  function initTouchDemo() {
    var canvas = document.getElementById("heroTouchCanvas");
    var pointCount = document.getElementById("touchPointCount");
    if (!canvas) return;
    var ctx = canvas.getContext("2d");

    function resize() {
      var rect = canvas.getBoundingClientRect();
      var dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    window.addEventListener("resize", resize);

    var points = {};

    function fade() {
      ctx.fillStyle = "rgba(255,255,255,0.18)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      rafId = requestAnimationFrame(fade);
    }
    var rafId = requestAnimationFrame(fade);

    function drawPoint(x, y, color) {
      ctx.save();
      ctx.shadowColor = color;
      ctx.shadowBlur = 12;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(x, y, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    function handlePointer(e) {
      var rect = canvas.getBoundingClientRect();
      var touches = e.touches ? Array.prototype.slice.call(e.touches) : [e];
      pointCount.textContent = (e.touches ? e.touches.length : 1) + (e.touches && e.touches.length === 1 ? " point" : " points");
      touches.forEach(function (t, i) {
        var x = t.clientX - rect.left;
        var y = t.clientY - rect.top;
        drawPoint(x, y, i % 2 === 0 ? "#4F46E5" : "#14B8A6");
      });
    }

    canvas.addEventListener("mousemove", function (e) {
      if (e.buttons !== 1) return;
      handlePointer(e);
    });
    canvas.addEventListener("mousedown", handlePointer);
    canvas.addEventListener("touchstart", function (e) { handlePointer(e); }, { passive: true });
    canvas.addEventListener("touchmove", function (e) { handlePointer(e); }, { passive: true });
    canvas.addEventListener("touchend", function () { pointCount.textContent = "0 points"; });

    window.addEventListener("pagehide", function () { if (rafId) cancelAnimationFrame(rafId); });
  }

  /* ------------------------------------------------------------------ */
  /* Hero: device info line + progress ring + mini-row ticker             */
  /* ------------------------------------------------------------------ */
  function initHeroMisc() {
    var ua = document.getElementById("deviceUA");
    if (ua) {
      var browser = "Unknown browser";
      var ns = navigator.userAgent;
      if (/Edg\//.test(ns)) browser = "Edge";
      else if (/Chrome\//.test(ns)) browser = "Chrome";
      else if (/Firefox\//.test(ns)) browser = "Firefox";
      else if (/Safari\//.test(ns) && !/Chrome/.test(ns)) browser = "Safari";
      var platform = /Android/.test(ns) ? "Android" : /iPhone|iPad|iPod/.test(ns) ? "iOS" : (navigator.platform || "Desktop");
      ua.textContent = platform + " • " + browser;
    }

    var ring = document.getElementById("heroRing");
    if (ring) {
      var r = 21, circumference = 2 * Math.PI * r;
      ring.style.strokeDasharray = circumference.toFixed(1);
      var pct = 0;
      function animateRing() {
        pct = pct >= 68 ? 68 : pct + 2;
        var offset = circumference - (pct / 100) * circumference;
        ring.style.strokeDashoffset = offset.toFixed(1);
        if (pct < 68) requestAnimationFrame(animateRing);
      }
      if (prefersReducedMotion) {
        ring.style.strokeDashoffset = (circumference - 0.68 * circumference).toFixed(1);
      } else {
        requestAnimationFrame(animateRing);
      }
    }

    // Cosmetic status ticker for the mini row list (purely decorative demo)
    var rows = document.querySelectorAll("#heroMiniRows .mini-row");
    if (rows.length && !prefersReducedMotion) {
      var states = [
        ["chip--pass", "Passed"],
        ["chip--running", "Running"],
        ["chip--pending", "Queued"]
      ];
      setInterval(function () {
        rows.forEach(function (row) {
          var chip = row.querySelector(".chip");
          var next = states[Math.floor(Math.random() * states.length)];
          chip.className = "chip " + next[0];
          chip.innerHTML = '<span class="chip__dot"></span>' + next[1];
        });
      }, 3200);
    }
  }

  /* ------------------------------------------------------------------ */
  /* Misc: footer year, sample link copy                                  */
  /* ------------------------------------------------------------------ */
  function initMisc() {
    var year = document.getElementById("footerYear");
    if (year) year.textContent = new Date().getFullYear();

    var copyBtn = document.getElementById("copySampleLinkBtn");
    if (copyBtn) {
      copyBtn.addEventListener("click", function () {
        var url = window.location.origin + window.location.pathname.replace(/index\.html$/, "") + "#dashboard";
        function done() {
          var original = copyBtn.textContent;
          copyBtn.textContent = "Link Copied!";
          setTimeout(function () { copyBtn.textContent = original; }, 1800);
        }
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(url).then(done).catch(done);
        } else {
          done();
        }
      });
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    initHeader();
    initAccordion();
    renderTestGrid();
    initReveal();
    initMicDemo();
    initSpeakerDemo();
    initTouchDemo();
    initHeroMisc();
    initMisc();
  });
})();
