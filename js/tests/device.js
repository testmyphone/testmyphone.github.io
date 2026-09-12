/* ==========================================================================
   TestLab — js/tests/device.js
   Battery health, GPS accuracy, storage estimate, headphone jack / audio out.
   ========================================================================== */
window.TestRegistry = window.TestRegistry || {};

(function () {
  "use strict";

  var ICON_BATTERY = window.TL.icon('<rect x="2" y="7" width="18" height="10" rx="2"></rect><line x1="22" y1="10" x2="22" y2="14"></line><path d="M8 10l-2 3h3l-2 3"></path>');
  var ICON_GPS = window.TL.icon('<path d="M12 21s7-6.5 7-12a7 7 0 0 0-14 0c0 5.5 7 12 7 12z"></path><circle cx="12" cy="9" r="2.5"></circle>');
  var ICON_STORAGE = window.TL.icon('<ellipse cx="12" cy="5" rx="8" ry="3"></ellipse><path d="M4 5v14c0 1.7 3.6 3 8 3s8-1.3 8-3V5"></path><path d="M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3"></path>');
  var ICON_HEADPHONE = window.TL.icon('<path d="M4 13a8 8 0 0 1 16 0v5a2 2 0 0 1-2 2h-1v-6h3"></path><path d="M4 13v6h3v-6H4z"></path>');

  function formatSeconds(s) {
    if (s === Infinity || s == null || isNaN(s)) return "—";
    var h = Math.floor(s / 3600);
    var m = Math.round((s % 3600) / 60);
    return h > 0 ? h + "h " + m + "m" : m + "m";
  }

  /* ---- Battery health ---- */
  window.TestRegistry.battery = {
    id: "battery",
    category: "device",
    name: "Battery Health",
    icon: ICON_BATTERY,
    instructions: [
      "TestLab reads your current battery level and charging state.",
      "If time-remaining estimates are supported, they'll appear below.",
      "Not available in Safari or Firefox, which removed the Battery Status API for privacy reasons.",
      "Tap Pass if the level and charging state look correct for your device."
    ],
    setup: function (root, ctx) {
      if (!navigator.getBattery) {
        ctx.unsupported("The Battery Status API is not available in this browser (notably Safari and Firefox).");
        return;
      }
      var wrap = window.TL.h('<div style="width:100%;"><div class="level-meter" style="height:20px;"><div class="level-meter__fill" id="batteryFill"></div></div></div>');
      root.appendChild(wrap);
      var fill = wrap.querySelector("#batteryFill");

      navigator.getBattery().then(function (battery) {
        function render() {
          fill.style.width = Math.round(battery.level * 100) + "%";
          ctx.readouts({
            Level: Math.round(battery.level * 100) + "%",
            Charging: battery.charging ? "Yes" : "No",
            "Time to Full": battery.charging ? formatSeconds(battery.chargingTime) : "—",
            "Time Remaining": !battery.charging ? formatSeconds(battery.dischargingTime) : "—"
          });
        }
        render();
        ["chargingchange", "levelchange", "chargingtimechange", "dischargingtimechange"].forEach(function (evt) {
          battery.addEventListener(evt, render);
        });
        ctx.setHint("Live battery data — tap Pass once the readings look right.");
      });
    }
  };

  /* ---- GPS ---- */
  window.TestRegistry.gps = {
    id: "gps",
    category: "device",
    name: "GPS Location Accuracy",
    icon: ICON_GPS,
    instructions: [
      "Ideally step outside or near a window for a stronger GPS fix.",
      'Tap "Get Location" and allow access when prompted.',
      "Check the reported accuracy radius — smaller values (in meters) mean a better fix.",
      "Tap Pass if you get a reasonable location and accuracy reading."
    ],
    setup: function (root, ctx) {
      if (!navigator.geolocation) {
        ctx.unsupported("Geolocation is not available in this browser.");
        return;
      }
      var wrap = window.TL.h(
        '<div style="display:flex; flex-direction:column; align-items:center; gap:12px;">' +
          '<div id="gpsPulse" style="width:60px; height:60px; border-radius:50%; background:var(--color-primary-tint); display:flex; align-items:center; justify-content:center;">' +
            window.TL.icon('<path d="M12 21s7-6.5 7-12a7 7 0 0 0-14 0c0 5.5 7 12 7 12z"></path><circle cx="12" cy="9" r="2.5"></circle>', 26) +
          "</div>" +
          '<button class="btn btn--telemetry" id="gpsBtn" type="button">Get Location</button>' +
        "</div>"
      );
      root.appendChild(wrap);
      var btn = wrap.querySelector("#gpsBtn");
      var pulse = wrap.querySelector("#gpsPulse");
      var watchId = null;

      btn.addEventListener("click", function () {
        btn.disabled = true;
        btn.textContent = "Locating…";
        pulse.style.animation = "pulseGrow 1.2s ease-in-out infinite";
        navigator.geolocation.getCurrentPosition(
          function (pos) {
            btn.disabled = false;
            btn.textContent = "Refresh Location";
            pulse.style.animation = "";
            ctx.readouts({
              Latitude: pos.coords.latitude.toFixed(5),
              Longitude: pos.coords.longitude.toFixed(5),
              "Accuracy": Math.round(pos.coords.accuracy) + " m"
            });
            ctx.setHint("✓ Location acquired — tap Pass if this looks correct.");
          },
          function (err) {
            btn.disabled = false;
            btn.textContent = "Try Again";
            pulse.style.animation = "";
            var msg = "Could not get your location.";
            if (err.code === err.PERMISSION_DENIED) msg = "Location permission was denied.";
            else if (err.code === err.TIMEOUT) msg = "Location request timed out — try again outdoors.";
            ctx.error(msg);
          },
          { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 }
        );
      });

      ctx.onCleanup(function () { if (watchId !== null) navigator.geolocation.clearWatch(watchId); });
    }
  };

  /* ---- Storage ---- */
  window.TestRegistry.storage = {
    id: "storage",
    category: "device",
    name: "Storage Estimate",
    icon: ICON_STORAGE,
    instructions: [
      "TestLab asks your browser how much storage quota is available and in use for this site.",
      "This reflects browser storage sandboxing, not your phone's total free space.",
      "Tap Pass once the estimate loads successfully."
    ],
    setup: function (root, ctx) {
      if (!navigator.storage || !navigator.storage.estimate) {
        ctx.unsupported("The Storage Estimate API is not available in this browser.");
        return;
      }
      var wrap = window.TL.h('<div style="width:100%;"><div class="level-meter"><div class="level-meter__fill" id="storageFill"></div></div></div>');
      root.appendChild(wrap);
      var fill = wrap.querySelector("#storageFill");

      function bytesTo(mb) { return (mb / (1024 * 1024)).toFixed(1) + " MB"; }

      navigator.storage
        .estimate()
        .then(function (est) {
          var usage = est.usage || 0;
          var quota = est.quota || 0;
          var pct = quota ? Math.min(100, (usage / quota) * 100) : 0;
          fill.style.width = pct + "%";
          ctx.readouts({ Used: bytesTo(usage), "Available Quota": bytesTo(quota), "Used %": pct.toFixed(2) + "%" });
          ctx.setHint("✓ Storage estimate loaded — tap Pass to confirm.");
        })
        .catch(function () {
          ctx.error("Could not read a storage estimate from this browser.");
        });
    }
  };

  /* ---- Headphone jack / audio output ---- */
  window.TestRegistry.headphonejack = {
    id: "headphonejack",
    category: "device",
    name: "Headphone Jack / Audio Out",
    icon: ICON_HEADPHONE,
    instructions: [
      "Plug in wired headphones (or connect Bluetooth audio) if you have them.",
      "Tap List Audio Outputs to see what your browser detects.",
      "Play the test tone and confirm audio actually routes to your headphones.",
      "Tap Pass if the expected output device is listed and audio is audible."
    ],
    setup: function (root, ctx) {
      if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
        ctx.unsupported("Device enumeration is not available in this browser.");
        return;
      }
      var wrap = window.TL.h(
        '<div style="display:flex; flex-direction:column; align-items:center; gap:12px; width:100%;">' +
          '<div style="display:flex; gap:8px; flex-wrap:wrap; justify-content:center;">' +
            '<button class="btn btn--secondary btn--sm" id="listOutputsBtn" type="button">List Audio Outputs</button>' +
            '<button class="btn btn--telemetry btn--sm" id="playJackToneBtn" type="button">Play Test Tone</button>' +
          "</div>" +
        "</div>"
      );
      root.appendChild(wrap);

      wrap.querySelector("#listOutputsBtn").addEventListener("click", function () {
        navigator.mediaDevices
          .enumerateDevices()
          .then(function (devices) {
            var outputs = devices.filter(function (d) { return d.kind === "audiooutput"; });
            if (!outputs.length) {
              ctx.info("No labeled audio outputs were found — many browsers hide device labels until microphone permission has been granted once.");
              return;
            }
            var readouts = {};
            outputs.forEach(function (d, i) { readouts["Output " + (i + 1)] = d.label || "Unlabeled device"; });
            ctx.readouts(readouts);
          })
          .catch(function () { ctx.error("Could not enumerate audio devices."); });
      });

      var audioCtx, osc, playing = false;
      var playBtn = wrap.querySelector("#playJackToneBtn");
      function stop() {
        playing = false;
        if (osc) { try { osc.stop(); } catch (e) {} }
        if (audioCtx) audioCtx.close().catch(function () {});
        playBtn.textContent = "Play Test Tone";
      }
      playBtn.addEventListener("click", function () {
        if (playing) { stop(); return; }
        if (!(window.AudioContext || window.webkitAudioContext)) { ctx.error("Web Audio is not available."); return; }
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        osc = audioCtx.createOscillator();
        var gain = audioCtx.createGain();
        gain.gain.value = 0.15;
        osc.frequency.value = 523.25;
        osc.connect(gain).connect(audioCtx.destination);
        osc.start();
        playing = true;
        playBtn.textContent = "Stop Tone";
        ctx.setHint("Confirm the tone is coming from your headphones, not the main speaker.");
      });

      ctx.onCleanup(stop);
    }
  };
})();
