/* ==========================================================================
   TestLab — js/tests/display.js
   Touchscreen dead-zone mapping, multi-touch digitizer, and full-screen
   dead-pixel / color-calibration cycling.
   ========================================================================== */
window.TestRegistry = window.TestRegistry || {};

(function () {
  "use strict";

  var ICON_TOUCH = window.TL.icon('<path d="M9 12V5a1.5 1.5 0 0 1 3 0v6"></path><path d="M12 11V4a1.5 1.5 0 0 1 3 0v7"></path><path d="M15 11.5V6a1.5 1.5 0 0 1 3 0v9c0 3.5-2.5 6-6 6h-1c-2 0-3-1-4-2.5L4.5 15a1.4 1.4 0 0 1 2-2L9 15"></path>');
  var ICON_MULTITOUCH = window.TL.icon('<circle cx="8" cy="8" r="3"></circle><circle cx="17" cy="8" r="3"></circle><path d="M5 20c0-3 1.5-5 3.5-5"></path><path d="M14 20c0-3 1.5-5 3.5-5"></path>');
  var ICON_DISPLAY = window.TL.icon('<rect x="3" y="4" width="18" height="13" rx="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line>');

  var GRID_COLS = 4, GRID_ROWS = 3;

  /* ---- Touchscreen dead-zone map ---- */
  window.TestRegistry.touchscreen = {
    id: "touchscreen",
    category: "display",
    name: "Touch & Dead Zones",
    icon: ICON_TOUCH,
    instructions: [
      "Drag your finger (or mouse) slowly across the entire box below.",
      "Every grid cell should light up green as you pass over it.",
      "Any cell that stays grey after a full pass may be a dead touch zone.",
      "Tap Pass once every cell has lit up, or Fail if some never respond."
    ],
    setup: function (root, ctx) {
      var wrap = window.TL.h(
        '<div style="width:100%; display:flex; flex-direction:column; gap:8px;">' +
          '<canvas id="touchCanvas" style="width:100%; height:220px; border-radius:12px; background:var(--color-surface); touch-action:none; cursor:crosshair;"></canvas>' +
          '<div class="body-sm" id="touchCoverage">0% of zones covered</div>' +
        "</div>"
      );
      root.appendChild(wrap);
      var canvas = wrap.querySelector("#touchCanvas");
      var coverageEl = wrap.querySelector("#touchCoverage");
      var cctx = canvas.getContext("2d");
      var visited = {};
      var dpr = window.devicePixelRatio || 1;

      function resize() {
        var rect = canvas.getBoundingClientRect();
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        cctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        drawGrid();
      }

      function cellSize() {
        var rect = canvas.getBoundingClientRect();
        return { w: rect.width / GRID_COLS, h: rect.height / GRID_ROWS };
      }

      function drawGrid() {
        var rect = canvas.getBoundingClientRect();
        cctx.clearRect(0, 0, rect.width, rect.height);
        var size = cellSize();
        for (var r = 0; r < GRID_ROWS; r++) {
          for (var c = 0; c < GRID_COLS; c++) {
            var key = r + "-" + c;
            cctx.fillStyle = visited[key] ? "rgba(20,184,166,0.28)" : "rgba(15,23,42,0.03)";
            cctx.fillRect(c * size.w, r * size.h, size.w - 2, size.h - 2);
          }
        }
      }

      function markPoint(x, y) {
        var size = cellSize();
        var c = Math.min(GRID_COLS - 1, Math.max(0, Math.floor(x / size.w)));
        var r = Math.min(GRID_ROWS - 1, Math.max(0, Math.floor(y / size.h)));
        visited[r + "-" + c] = true;
        drawGrid();
        cctx.save();
        cctx.shadowColor = "#4F46E5";
        cctx.shadowBlur = 14;
        cctx.fillStyle = "#4F46E5";
        cctx.beginPath();
        cctx.arc(x, y, 7, 0, Math.PI * 2);
        cctx.fill();
        cctx.restore();

        var covered = Object.keys(visited).length;
        var total = GRID_COLS * GRID_ROWS;
        var pct = Math.round((covered / total) * 100);
        coverageEl.textContent = pct + "% of zones covered (" + covered + "/" + total + ")";
        ctx.readouts({ Coverage: pct + "%" });
        if (pct === 100) ctx.setHint("✓ Every zone responded — tap Pass to confirm.");
      }

      function handle(e) {
        var rect = canvas.getBoundingClientRect();
        var points = e.touches ? Array.prototype.slice.call(e.touches) : [e];
        points.forEach(function (p) { markPoint(p.clientX - rect.left, p.clientY - rect.top); });
      }

      canvas.addEventListener("mousedown", handle);
      canvas.addEventListener("mousemove", function (e) { if (e.buttons === 1) handle(e); });
      canvas.addEventListener("touchstart", handle, { passive: true });
      canvas.addEventListener("touchmove", handle, { passive: true });
      window.addEventListener("resize", resize);
      resize();

      ctx.onCleanup(function () { window.removeEventListener("resize", resize); });
    }
  };

  /* ---- Multi-touch digitizer ---- */
  window.TestRegistry.multitouch = {
    id: "multitouch",
    category: "display",
    name: "Multi-Touch Digitizer",
    icon: ICON_MULTITOUCH,
    instructions: [
      "Place two or more fingers on the box below at the same time.",
      "The counter should match the number of fingers you're using.",
      "Try up to 5 fingers if your screen supports it.",
      "This test requires a touchscreen — desktop trackpads/mice cannot register multiple points."
    ],
    setup: function (root, ctx) {
      var maxTouchPoints = navigator.maxTouchPoints || 0;
      var wrap = window.TL.h(
        '<div style="width:100%; display:flex; flex-direction:column; align-items:center; gap:10px;">' +
          '<div id="multitouchArea" style="width:100%; height:200px; border-radius:12px; background:var(--color-surface); position:relative; touch-action:none; display:flex; align-items:center; justify-content:center;">' +
            '<div style="text-align:center;"><div style="font-family:var(--font-heading); font-size:40px; font-weight:800;" id="touchCountBig">0</div><div class="body-sm">fingers detected</div></div>' +
          "</div>" +
        "</div>"
      );
      root.appendChild(wrap);
      var area = wrap.querySelector("#multitouchArea");
      var big = wrap.querySelector("#touchCountBig");
      var dots = [];

      ctx.readouts({ "Reported Max Touch Points": maxTouchPoints || "Unknown" });

      if (!("ontouchstart" in window) && maxTouchPoints === 0) {
        ctx.info("No touchscreen was detected on this device/browser. If you're on a touch device, this may just mean touch events aren't exposed — confirm manually.");
      }

      function clearDots() {
        dots.forEach(function (d) { d.remove(); });
        dots = [];
      }

      function render(touches) {
        clearDots();
        big.parentElement.style.display = touches.length ? "none" : "flex";
        var rect = area.getBoundingClientRect();
        Array.prototype.forEach.call(touches, function (t, i) {
          var dot = document.createElement("div");
          dot.style.position = "absolute";
          dot.style.width = "36px";
          dot.style.height = "36px";
          dot.style.borderRadius = "50%";
          dot.style.left = (t.clientX - rect.left - 18) + "px";
          dot.style.top = (t.clientY - rect.top - 18) + "px";
          dot.style.background = i % 2 === 0 ? "rgba(79,70,229,0.25)" : "rgba(20,184,166,0.25)";
          dot.style.border = "2px solid " + (i % 2 === 0 ? "#4F46E5" : "#14B8A6");
          area.appendChild(dot);
          dots.push(dot);
        });
        big.textContent = touches.length;
        if (touches.length >= 2) ctx.setHint("✓ " + touches.length + "-point touch detected — tap Pass to confirm.");
      }

      function onTouch(e) { render(e.touches); }
      function onEnd(e) { render(e.touches); if (!e.touches.length) big.parentElement.style.display = "flex"; }

      area.addEventListener("touchstart", onTouch, { passive: true });
      area.addEventListener("touchmove", onTouch, { passive: true });
      area.addEventListener("touchend", onEnd, { passive: true });
      area.addEventListener("touchcancel", onEnd, { passive: true });

      ctx.onCleanup(clearDots);
    }
  };

  /* ---- Dead pixel / display color cycle ---- */
  window.TestRegistry.deadpixel = {
    id: "deadpixel",
    category: "display",
    name: "Dead Pixels & OLED Burn-in",
    icon: ICON_DISPLAY,
    instructions: [
      'Tap "Start Full-Screen Test" — your screen will fill with solid colors.',
      "Tap anywhere to advance through white, black, red, green, blue, and grey.",
      "Look closely for any pixel that doesn't change color, or any patch of discoloration.",
      "Tap the exit button (top corner) when finished, then confirm Pass or Fail."
    ],
    setup: function (root, ctx) {
      var colors = [
        { name: "White", value: "#FFFFFF", text: "#000" },
        { name: "Black", value: "#000000", text: "#fff" },
        { name: "Red", value: "#FF0000", text: "#fff" },
        { name: "Green", value: "#00FF00", text: "#000" },
        { name: "Blue", value: "#0000FF", text: "#fff" },
        { name: "Grey", value: "#808080", text: "#fff" }
      ];
      var wrap = window.TL.h('<div style="display:flex; justify-content:center;"><button class="btn btn--telemetry" id="startColorTest" type="button">Start Full-Screen Test</button></div>');
      root.appendChild(wrap);
      var overlay = null, idx = 0;

      function closeOverlay() {
        if (overlay) { overlay.remove(); overlay = null; }
        document.removeEventListener("keydown", onKey);
      }
      function onKey(e) { if (e.key === "Escape") closeOverlay(); }

      function showStep() {
        var color = colors[idx % colors.length];
        overlay.style.background = color.value;
        label.textContent = color.name + " — tap to advance (" + (idx % colors.length + 1) + "/" + colors.length + ")";
        label.style.color = color.text;
        exitBtn.style.color = color.text;
        exitBtn.style.borderColor = color.text;
      }

      var label, exitBtn;

      wrap.querySelector("#startColorTest").addEventListener("click", function () {
        overlay = document.createElement("div");
        overlay.className = "full-bleed-color";
        overlay.setAttribute("role", "dialog");
        overlay.setAttribute("aria-label", "Full screen color test");

        exitBtn = document.createElement("button");
        exitBtn.textContent = "Exit ✕";
        exitBtn.type = "button";
        exitBtn.style.cssText = "position:absolute; top:16px; right:16px; background:transparent; border:1.5px solid; border-radius:999px; padding:8px 16px; font-weight:600; font-size:13px;";
        exitBtn.addEventListener("click", function (e) { e.stopPropagation(); closeOverlay(); ctx.setHint("Color cycle closed — tap Pass or Fail based on what you saw."); });

        label = document.createElement("div");
        label.style.cssText = "position:absolute; bottom:24px; left:0; right:0; text-align:center; font-family:var(--font-heading); font-weight:700; font-size:14px;";

        overlay.appendChild(exitBtn);
        overlay.appendChild(label);
        overlay.addEventListener("click", function () { idx++; showStep(); });
        document.body.appendChild(overlay);
        document.addEventListener("keydown", onKey);
        idx = 0;
        showStep();
      });

      ctx.onCleanup(closeOverlay);
    }
  };
})();
