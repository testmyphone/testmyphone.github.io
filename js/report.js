/* ==========================================================================
   TestLab — report.js
   Score calculation, results-screen markup, download/print/share actions,
   and localStorage persistence of the last completed run.
   ========================================================================== */
(function () {
  "use strict";

  var STORAGE_KEY = "testlab_last_run";

  var STATUS_CHIP = {
    pass: '<span class="chip chip--pass"><span class="chip__dot"></span>Passed</span>',
    fail: '<span class="chip chip--fail"><span class="chip__dot"></span>Failed</span>',
    skip: '<span class="chip chip--pending"><span class="chip__dot"></span>Skipped</span>',
    unsupported: '<span class="chip chip--unsupported"><span class="chip__dot"></span>Unsupported</span>'
  };

  function computeSummary(results) {
    var total = results.length;
    var pass = 0, fail = 0, skip = 0, unsupported = 0;
    results.forEach(function (r) {
      if (r.status === "pass") pass++;
      else if (r.status === "fail") fail++;
      else if (r.status === "skip") skip++;
      else if (r.status === "unsupported") unsupported++;
    });
    var scoreBase = total - unsupported; // unsupported tests don't count against the score
    var scorePct = scoreBase > 0 ? Math.round((pass / scoreBase) * 100) : 0;
    return { total: total, pass: pass, fail: fail, skip: skip, unsupported: unsupported, scorePct: scorePct };
  }

  function scoreColor(pct) {
    if (pct >= 80) return "var(--color-success)";
    if (pct >= 50) return "var(--color-warning)";
    return "var(--color-danger)";
  }

  function saveRun(results) {
    try {
      var payload = { timestamp: Date.now(), results: results };
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch (e) {
      /* localStorage unavailable (private mode, quota) — fail silently */
    }
  }

  function loadLastRun() {
    try {
      var raw = window.localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  function clearRun() {
    try { window.localStorage.removeItem(STORAGE_KEY); } catch (e) {}
  }

  function ringMarkup(pct, size) {
    size = size || 140;
    var r = (size - 16) / 2;
    var c = 2 * Math.PI * r;
    var offset = c - (Math.min(100, Math.max(0, pct)) / 100) * c;
    return (
      '<svg width="' + size + '" height="' + size + '" viewBox="0 0 ' + size + " " + size + '" style="transform:rotate(-90deg);">' +
      '<circle class="progress-ring__track" cx="' + size / 2 + '" cy="' + size / 2 + '" r="' + r + '"></circle>' +
      '<circle class="progress-ring__value" cx="' + size / 2 + '" cy="' + size / 2 + '" r="' + r + '" style="--ring-color:' + scoreColor(pct) + "; stroke-dasharray:" + c.toFixed(1) + "; stroke-dashoffset:" + offset.toFixed(1) + ';"></circle>' +
      "</svg>"
    );
  }

  function renderResultsView(results, opts) {
    opts = opts || {};
    var s = computeSummary(results);
    var listHTML = results
      .map(function (r) {
        return (
          '<div class="mini-row"><span class="mini-row__name">' + r.name + "</span>" + (STATUS_CHIP[r.status] || "") + "</div>"
        );
      })
      .join("");

    return (
      '<div class="runner-stage">' +
      '<div class="results-shell">' +
      '<div style="position:relative; width:140px; height:140px; display:flex; align-items:center; justify-content:center;">' +
      ringMarkup(s.scorePct, 140) +
      '<div style="position:absolute; text-align:center;"><div style="font-family:var(--font-heading); font-size:32px; font-weight:800;">' + s.scorePct + '%</div><div class="body-sm">Pass rate</div></div>' +
      "</div>" +
      '<div>' +
      '<h1 class="h-md">' + (opts.singleTest ? "Test Complete" : "Diagnostic Complete") + "</h1>" +
      '<p class="body-md">' + s.pass + " passed &middot; " + s.fail + " failed &middot; " + s.skip + " skipped &middot; " + s.unsupported + " unsupported" + "</p>" +
      "</div>" +
      '<div class="results-list" role="list" aria-label="Test results">' + listHTML + "</div>" +
      '<div class="results-actions no-print">' +
      '<button class="btn btn--secondary btn--sm" type="button" id="reportDownloadBtn">' +
      '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3v12"></path><path d="M7 11l5 5 5-5"></path><line x1="4" y1="21" x2="20" y2="21"></line></svg>' +
      "Download Report</button>" +
      '<button class="btn btn--secondary btn--sm" type="button" id="reportPrintBtn">' +
      '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="6" y="9" width="12" height="7" rx="1"></rect><path d="M6 9V4h12v5"></path><path d="M8 16v4h8v-4"></path></svg>' +
      "Print / Save PDF</button>" +
      '<button class="btn btn--secondary btn--sm" type="button" id="reportShareBtn">' +
      '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="6" cy="12" r="2.2"></circle><circle cx="18" cy="6" r="2.2"></circle><circle cx="18" cy="18" r="2.2"></circle><line x1="7.9" y1="10.9" x2="16.1" y2="7.1"></line><line x1="7.9" y1="13.1" x2="16.1" y2="16.9"></line></svg>' +
      "Share</button>" +
      "</div>" +
      '<div class="results-actions no-print">' +
      '<button class="btn btn--primary btn--sm" type="button" id="reportRunAgainBtn">' +
      '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 4v5h5"></path><path d="M20 20v-5h-5"></path><path d="M5 9a8 8 0 0 1 14-3"></path><path d="M19 15a8 8 0 0 1-14 3"></path></svg>' +
      (opts.singleTest ? "Run Full Suite" : "Run Again") + "</button>" +
      '<a class="btn btn--ghost btn--sm" href="./index.html">Back to Home</a>' +
      "</div>" +
      "</div>" +
      "</div>"
    );
  }

  function downloadJSON(results) {
    var s = computeSummary(results);
    var payload = {
      generatedBy: "TestLab",
      generatedAt: new Date().toISOString(),
      userAgent: navigator.userAgent,
      summary: s,
      results: results
    };
    var blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = "testlab-report-" + new Date().toISOString().slice(0, 10) + ".json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
  }

  function shareResults(results) {
    var s = computeSummary(results);
    var text = "TestLab diagnostic report: " + s.pass + "/" + s.total + " tests passed (" + s.scorePct + "% pass rate).";
    if (navigator.share) {
      navigator.share({ title: "TestLab Report", text: text, url: window.location.href }).catch(function () {});
    } else if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text + " " + window.location.href);
    }
  }

  function wireResultsView(container, results, callbacks) {
    callbacks = callbacks || {};
    var downloadBtn = container.querySelector("#reportDownloadBtn");
    var printBtn = container.querySelector("#reportPrintBtn");
    var shareBtn = container.querySelector("#reportShareBtn");
    var runAgainBtn = container.querySelector("#reportRunAgainBtn");
    if (downloadBtn) downloadBtn.addEventListener("click", function () { downloadJSON(results); });
    if (printBtn) printBtn.addEventListener("click", function () { window.print(); });
    if (shareBtn) {
      shareBtn.addEventListener("click", function () {
        shareResults(results);
        if (!navigator.share) {
          var original = shareBtn.textContent;
          shareBtn.textContent = "Copied to clipboard";
          setTimeout(function () { shareBtn.innerHTML = original; }, 1800);
        }
      });
    }
    if (runAgainBtn && callbacks.onRunAgain) runAgainBtn.addEventListener("click", callbacks.onRunAgain);
  }

  window.TestReport = {
    STORAGE_KEY: STORAGE_KEY,
    computeSummary: computeSummary,
    saveRun: saveRun,
    loadLastRun: loadLastRun,
    clearRun: clearRun,
    renderResultsView: renderResultsView,
    wireResultsView: wireResultsView,
    downloadJSON: downloadJSON
  };
})();
