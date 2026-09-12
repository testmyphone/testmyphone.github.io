/* ==========================================================================
   TestLab — js/tests/connectivity.js
   Wi-Fi/network speed, cellular/SIM info, and Bluetooth device pairing.
   ========================================================================== */
window.TestRegistry = window.TestRegistry || {};

(function () {
  "use strict";

  var ICON_WIFI = window.TL.icon('<path d="M2 8.5a16 16 0 0 1 20 0"></path><path d="M5.5 12.5a11 11 0 0 1 13 0"></path><path d="M9 16.5a5.5 5.5 0 0 1 6 0"></path><circle cx="12" cy="20" r="1" fill="currentColor" stroke="none"></circle>');
  var ICON_CELLULAR = window.TL.icon('<rect x="4" y="14" width="3" height="6"></rect><rect x="10.5" y="10" width="3" height="10"></rect><rect x="17" y="5" width="3" height="15"></rect>');
  var ICON_BLUETOOTH = window.TL.icon('<path d="M7 7l10 10-5 5V2l5 5L7 17"></path>');

  function getConnection() {
    return navigator.connection || navigator.mozConnection || navigator.webkitConnection || null;
  }

  /* ---- Wi-Fi / network speed ---- */
  window.TestRegistry.wifi = {
    id: "wifi",
    category: "connectivity",
    name: "Wi-Fi & Network Speed",
    icon: ICON_WIFI,
    instructions: [
      "Stay connected to the network you want to test (Wi-Fi or cellular data).",
      "TestLab will report your connection type and run a quick latency check automatically.",
      "Lower latency (ms) generally means a more responsive connection.",
      "Tap Pass if you're online and the readouts look reasonable."
    ],
    setup: function (root, ctx) {
      var wrap = window.TL.h(
        '<div style="width:100%; display:flex; flex-direction:column; gap:12px; align-items:center;">' +
          '<div class="status-banner status-banner--info" id="onlineStatus" style="width:100%; justify-content:center;">Checking connection…</div>' +
          '<button class="btn btn--secondary btn--sm" id="retestBtn" type="button">Run Latency Check Again</button>' +
        "</div>"
      );
      root.appendChild(wrap);
      var onlineStatus = wrap.querySelector("#onlineStatus");
      var retestBtn = wrap.querySelector("#retestBtn");
      var conn = getConnection();

      function updateOnline() {
        var online = navigator.onLine;
        onlineStatus.textContent = online ? "Online" : "Offline";
        onlineStatus.className = "status-banner " + (online ? "status-banner--info" : "status-banner--error");
      }
      updateOnline();
      window.addEventListener("online", updateOnline);
      window.addEventListener("offline", updateOnline);

      function baseReadouts() {
        var r = {};
        if (conn) {
          r["Effective Type"] = conn.effectiveType || "—";
          r["Downlink"] = conn.downlink != null ? conn.downlink + " Mbps (est.)" : "—";
          r["Reported RTT"] = conn.rtt != null ? conn.rtt + " ms" : "—";
          r["Save Data"] = conn.saveData ? "On" : "Off";
        } else {
          r["Network Information API"] = "Not exposed by this browser";
        }
        return r;
      }

      function runLatencyCheck() {
        var readouts = baseReadouts();
        readouts["Measured Latency"] = "Testing…";
        ctx.readouts(readouts);
        var start = performance.now();
        fetch("./assets/favicon.svg", { cache: "no-store" })
          .then(function () {
            var ms = Math.round(performance.now() - start);
            readouts["Measured Latency"] = ms + " ms";
            ctx.readouts(readouts);
            ctx.setHint("✓ Latency check complete — tap Pass to confirm connectivity.");
          })
          .catch(function () {
            readouts["Measured Latency"] = "Failed (offline or blocked)";
            ctx.readouts(readouts);
            ctx.info("Couldn't reach the server for a latency check. If you're viewing this via a local file:// path, network calls are blocked — serve over HTTP(S) instead.");
          });
      }

      retestBtn.addEventListener("click", runLatencyCheck);
      runLatencyCheck();

      ctx.onCleanup(function () {
        window.removeEventListener("online", updateOnline);
        window.removeEventListener("offline", updateOnline);
      });
    }
  };

  /* ---- Cellular / SIM ---- */
  window.TestRegistry.cellular = {
    id: "cellular",
    category: "connectivity",
    name: "Cellular / SIM",
    icon: ICON_CELLULAR,
    instructions: [
      "Browsers deliberately don't expose carrier name, SIM status, or signal bars to web pages, for privacy reasons.",
      "If a general connection type is exposed below, TestLab will show it.",
      "Otherwise, check your phone's status bar for signal and carrier information directly.",
      "Confirm Pass if your phone shows a valid cellular connection when Wi-Fi is off."
    ],
    setup: function (root, ctx) {
      var conn = getConnection();
      var readouts = {};
      if (conn && conn.type) readouts["Connection Type"] = conn.type;
      if (conn && conn.effectiveType) readouts["Effective Type"] = conn.effectiveType;
      if (!Object.keys(readouts).length) {
        ctx.info("No carrier or connection-type information is exposed by this browser — this is a manual, informational check on virtually all mobile browsers.");
      } else {
        ctx.readouts(readouts);
      }
    }
  };

  /* ---- Bluetooth ---- */
  window.TestRegistry.bluetooth = {
    id: "bluetooth",
    category: "connectivity",
    name: "Bluetooth Radio",
    icon: ICON_BLUETOOTH,
    instructions: [
      'Tap "Scan for Devices" — your browser will show its native Bluetooth device picker.',
      "If you see nearby devices listed, your Bluetooth radio is working.",
      "You can close the picker without connecting to anything.",
      "Not available in Safari on iOS/macOS or Firefox — those will show as unsupported."
    ],
    setup: function (root, ctx) {
      if (!navigator.bluetooth || !navigator.bluetooth.requestDevice) {
        ctx.unsupported("The Web Bluetooth API is not available in this browser (notably Safari and Firefox).");
        return;
      }
      var wrap = window.TL.h('<div style="display:flex; justify-content:center;"><button class="btn btn--telemetry" id="btScanBtn" type="button">Scan for Devices</button></div>');
      root.appendChild(wrap);
      wrap.querySelector("#btScanBtn").addEventListener("click", function () {
        navigator.bluetooth
          .requestDevice({ acceptAllDevices: true })
          .then(function (device) {
            ctx.readouts({ "Device Found": device.name || device.id || "Unnamed device" });
            ctx.setHint("✓ Bluetooth radio responded — tap Pass to confirm.");
          })
          .catch(function (err) {
            if (err && err.name === "NotFoundError") {
              ctx.info("The picker opened but no device was selected — that still confirms the radio and API work.");
            } else {
              ctx.error("Bluetooth request failed: " + (err && err.message ? err.message : "unknown error"));
            }
          });
      });
    }
  };
})();
