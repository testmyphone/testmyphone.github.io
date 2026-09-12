/* ==========================================================================
   TestLab — runner.js
   Orchestrates the diagnostic run: parses ?test=<id>, walks the ordered
   test queue, renders each test's chrome (instructions/controls/banner),
   invokes the test module's setup(), and hands off to report.js for the
   results screen. Depends on window.TestRegistry populated by js/tests/*.js
   and window.TestReport from report.js.
   ========================================================================== */
(function () {
  "use strict";

  var TEST_ORDER = [
    "microphone", "speaker", "earpiece",
    "touchscreen", "multitouch", "deadpixel",
    "accelerometer", "gyroscope", "proximity", "ambientlight", "vibration",
    "wifi", "cellular", "bluetooth",
    "camera", "flashlight", "buttons", "fingerprint", "usb", "chargingport",
    "battery", "gps", "storage", "headphonejack"
  ];

  var CATEGORY_LABEL = {
    audio: "Audio",
    display: "Display & Touch",
    sensors: "Sensors",
    connectivity: "Connectivity",
    hardware: "Hardware",
    device: "Device"
  };

  var CATEGORY_COUNT = { audio: 3, display: 3, sensors: 5, connectivity: 3, hardware: 6, device: 4 };

  var runnerMain = document.getElementById("runnerMain");
  var progressRow = document.getElementById("runnerProgressRow");
  var progressFill = document.getElementById("progressBarFill");
  var progressCounter = document.getElementById("progressCounter");
  var srAnnounce = document.getElementById("srAnnounce");
  var exitBtn = document.getElementById("exitRunnerBtn");

  var state = {
    queue: [],
    index: 0,
    results: [],
    singleTest: false,
    cleanups: []
  };

  function announce(text) {
    if (srAnnounce) srAnnounce.textContent = text;
  }

  function runCleanups() {
    state.cleanups.forEach(function (fn) {
      try { fn(); } catch (e) { /* ignore cleanup errors */ }
    });
    state.cleanups = [];
  }

  function getOrderedTests() {
    return TEST_ORDER.filter(function (id) { return window.TestRegistry && window.TestRegistry[id]; }).map(function (id) {
      return window.TestRegistry[id];
    });
  }

  function updateProgress() {
    if (!progressRow) return;
    if (state.singleTest) {
      progressRow.style.display = "none";
      return;
    }
    progressRow.style.display = "";
    var total = state.queue.length;
    var current = Math.min(state.index + 1, total);
    progressFill.style.width = total ? ((state.index / total) * 100) + "%" : "0%";
    progressCounter.textContent = "Test " + current + " of " + total;
  }

  /* ------------------------------------------------------------------ */
  /* Start screen                                                         */
  /* ------------------------------------------------------------------ */
  function renderStart() {
    runCleanups();
    if (progressRow) progressRow.style.display = "none";
    var last = window.TestReport ? window.TestReport.loadLastRun() : null;
    var lastHTML = "";
    if (last && last.results && last.results.length) {
      var summary = window.TestReport.computeSummary(last.results);
      var date = new Date(last.timestamp);
      lastHTML =
        '<div class="status-banner status-banner--info" style="justify-content:space-between; width:100%;">' +
        "<span>Last full run: " + date.toLocaleDateString() + " &middot; " + summary.scorePct + "% pass rate</span>" +
        '<button class="runner-toolbar-btn" id="viewLastRunBtn" type="button" style="color:var(--color-primary-dark);">View</button>' +
        "</div>";
    }

    var categoryChips = Object.keys(CATEGORY_LABEL)
      .map(function (cat) {
        return (
          '<span class="chip chip--pending" style="text-transform:none;">' + CATEGORY_LABEL[cat] + " &middot; " + CATEGORY_COUNT[cat] + "</span>"
        );
      })
      .join("");

    runnerMain.innerHTML =
      '<div class="runner-stage" style="text-align:center; align-items:center;">' +
      '<span class="eyebrow" style="margin-inline:auto;">24 Tests &middot; 6 Categories</span>' +
      '<h1 class="h-lg">Ready to Run the Full Diagnostic Suite?</h1>' +
      '<p class="body-lg" style="max-width:32rem; margin-inline:auto;">TestLab will walk through every test one at a time. Allow microphone, camera, and location access when your browser asks — nothing leaves your device.</p>' +
      '<div style="display:flex; flex-wrap:wrap; gap:8px; justify-content:center; padding-block:8px;">' + categoryChips + "</div>" +
      lastHTML +
      '<button class="btn btn--primary" id="startFullSuiteBtn" type="button" style="margin-top:8px;">Start Full Suite →</button>' +
      "</div>";

    var startBtn = document.getElementById("startFullSuiteBtn");
    if (startBtn) startBtn.addEventListener("click", function () { startQueue(getOrderedTests().map(function (t) { return t.id; })); });

    var viewLastBtn = document.getElementById("viewLastRunBtn");
    if (viewLastBtn && last) {
      viewLastBtn.addEventListener("click", function () {
        state.results = last.results;
        state.singleTest = false;
        renderResults();
      });
    }
  }

  /* ------------------------------------------------------------------ */
  /* Stage (single test) rendering                                       */
  /* ------------------------------------------------------------------ */
  function startQueue(ids) {
    state.queue = ids;
    state.index = 0;
    state.results = [];
    renderStage();
  }

  function currentTest() {
    return window.TestRegistry[state.queue[state.index]];
  }

  function setControlsMode(mode, testId) {
    var controls = document.getElementById("stageControls");
    if (!controls) return;
    if (mode === "unsupported") {
      controls.innerHTML =
        '<button class="btn btn--secondary btn--block" style="grid-column: 1 / -1;" id="ctrlUnsupportedBtn" type="button">Not Supported — Continue</button>';
      var b = document.getElementById("ctrlUnsupportedBtn");
      if (b) b.addEventListener("click", function () { decide("unsupported"); });
    } else {
      controls.innerHTML =
        '<button class="btn btn--secondary btn--sm" id="ctrlSkipBtn" type="button">Skip</button>' +
        '<button class="btn btn--ghost btn--sm" id="ctrlRetryBtn" type="button">Retry</button>' +
        '<button class="btn btn--sm" style="background:var(--color-danger-bg); color:var(--color-danger-text);" id="ctrlFailBtn" type="button">Fail</button>' +
        '<button class="btn btn--telemetry btn--sm" id="ctrlPassBtn" type="button">Pass</button>';
      document.getElementById("ctrlSkipBtn").addEventListener("click", function () { decide("skip"); });
      document.getElementById("ctrlRetryBtn").addEventListener("click", function () { retryCurrent(); });
      document.getElementById("ctrlFailBtn").addEventListener("click", function () { decide("fail"); });
      document.getElementById("ctrlPassBtn").addEventListener("click", function () { decide("pass"); });
    }
  }

  function buildCtx() {
    var bannerEl = document.getElementById("stageBanner");
    var readoutsEl = document.getElementById("stageReadouts");
    var hintEl = document.getElementById("stageHint");
    var instructionsEl = document.getElementById("stageInstructions");

    return {
      container: document.getElementById("stageVisual"),
      onCleanup: function (fn) { if (typeof fn === "function") state.cleanups.push(fn); },
      banner: function (type, html) {
        if (!bannerEl) return;
        if (!html) { bannerEl.innerHTML = ""; return; }
        bannerEl.innerHTML = '<div class="status-banner status-banner--' + type + '">' + html + "</div>";
      },
      unsupported: function (reason) {
        this.banner("unsupported", reason || "Not supported on this browser.");
        setControlsMode("unsupported");
      },
      info: function (html) { this.banner("info", html); },
      error: function (html) { this.banner("error", html); },
      readouts: function (obj) {
        if (!readoutsEl) return;
        var keys = Object.keys(obj || {});
        if (!keys.length) { readoutsEl.innerHTML = ""; return; }
        readoutsEl.innerHTML =
          '<div class="readout-grid">' +
          keys
            .map(function (k) {
              return '<div class="readout"><span class="readout__label">' + k + '</span><span class="readout__value tnum">' + obj[k] + "</span></div>";
            })
            .join("") +
          "</div>";
      },
      setHint: function (text) { if (hintEl) hintEl.textContent = text || ""; },
      setInstructions: function (arr) {
        if (!instructionsEl || !arr) return;
        instructionsEl.innerHTML = arr.map(function (s) { return "<li>" + s + "</li>"; }).join("");
      }
    };
  }

  function renderStage() {
    runCleanups();
    var test = currentTest();
    if (!test) { renderResults(); return; }
    updateProgress();

    var iconWrap = '<span style="width:44px;height:44px;border-radius:12px;background:var(--color-primary-tint);color:var(--color-primary);display:flex;align-items:center;justify-content:center;flex-shrink:0;">' + (test.icon || "") + "</span>";

    runnerMain.innerHTML =
      '<div class="runner-stage">' +
      '<div style="display:flex; align-items:center; gap:12px;">' +
      iconWrap +
      '<div><span class="eyebrow">' + (CATEGORY_LABEL[test.category] || test.category) + '</span><h1 class="h-md">' + test.name + "</h1></div>" +
      "</div>" +
      '<ol class="instruction-list" id="stageInstructions">' + (test.instructions || []).map(function (s) { return "<li>" + s + "</li>"; }).join("") + "</ol>" +
      '<div id="stageBanner"></div>' +
      '<div class="runner-visual-area" id="stageVisual"></div>' +
      '<div id="stageReadouts"></div>' +
      '<p class="body-sm" id="stageHint"></p>' +
      '<div class="runner-controls" id="stageControls"></div>' +
      "</div>";

    setControlsMode("normal");
    var ctx = buildCtx();
    try {
      test.setup(document.getElementById("stageVisual"), ctx);
    } catch (e) {
      ctx.error("This test hit an unexpected error: " + (e && e.message ? e.message : "unknown error") + ". You can still Skip or mark a manual result.");
    }
  }

  function retryCurrent() {
    renderStage();
  }

  function decide(status) {
    var test = currentTest();
    announce(test.name + ": " + status);
    state.results.push({ id: test.id, name: test.name, category: test.category, status: status });
    runCleanups();
    state.index++;
    if (state.index >= state.queue.length) {
      renderResults();
    } else {
      renderStage();
    }
  }

  /* ------------------------------------------------------------------ */
  /* Results                                                              */
  /* ------------------------------------------------------------------ */
  function renderResults() {
    if (progressRow) progressRow.style.display = "none";
    runnerMain.innerHTML = window.TestReport.renderResultsView(state.results, { singleTest: state.singleTest });
    window.TestReport.wireResultsView(runnerMain, state.results, {
      onRunAgain: function () {
        if (state.singleTest) {
          state.singleTest = false;
          history.replaceState(null, "", "./tests.html");
          renderStart();
        } else {
          startQueue(getOrderedTests().map(function (t) { return t.id; }));
        }
      }
    });
    if (!state.singleTest) window.TestReport.saveRun(state.results);
    announce("Diagnostics complete.");
  }

  /* ------------------------------------------------------------------ */
  /* Boot                                                                 */
  /* ------------------------------------------------------------------ */
  function init() {
    if (exitBtn) exitBtn.addEventListener("click", function () { window.location.href = "./index.html"; });

    var params = new URLSearchParams(window.location.search);
    var testId = params.get("test");
    if (testId && window.TestRegistry && window.TestRegistry[testId]) {
      state.singleTest = true;
      startQueue([testId]);
    } else {
      state.singleTest = false;
      renderStart();
    }
  }

  window.addEventListener("pagehide", runCleanups);
  document.addEventListener("DOMContentLoaded", init);
})();
