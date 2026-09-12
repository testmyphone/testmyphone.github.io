/* ==========================================================================
   TestLab — js/tests/sensors.js
   Accelerometer, gyroscope, proximity, ambient light, and vibration.
   ========================================================================== */
window.TestRegistry = window.TestRegistry || {};

(function () {
  "use strict";

  var ICON_ACCEL = window.TL.icon('<circle cx="12" cy="12" r="9"></circle><circle cx="14" cy="10" r="2.2" fill="currentColor" stroke="none"></circle>');
  var ICON_GYRO = window.TL.icon('<ellipse cx="12" cy="12" rx="9" ry="4.2"></ellipse><ellipse cx="12" cy="12" rx="4.2" ry="9"></ellipse>');
  var ICON_PROX = window.TL.icon('<circle cx="7" cy="12" r="2"></circle><path d="M12 7a7 7 0 0 1 0 10"></path><path d="M16 4a12 12 0 0 1 0 16"></path>');
  var ICON_LIGHT = window.TL.icon('<circle cx="12" cy="12" r="4"></circle><line x1="12" y1="2" x2="12" y2="5"></line><line x1="12" y1="19" x2="12" y2="22"></line><line x1="2" y1="12" x2="5" y2="12"></line><line x1="19" y1="12" x2="22" y2="12"></line>');
  var ICON_VIBRATE = window.TL.icon('<rect x="8" y="4" width="8" height="16" rx="2"></rect><path d="M4 9v6"></path><path d="M20 9v6"></path><path d="M1 10v4"></path><path d="M23 10v4"></path>');

  function needsIOSMotionPermission() {
    return typeof DeviceMotionEvent !== "undefined" && typeof DeviceMotionEvent.requestPermission === "function";
  }
  function needsIOSOrientationPermission() {
    return typeof DeviceOrientationEvent !== "undefined" && typeof DeviceOrientationEvent.requestPermission === "function";
  }

  /* ---- Accelerometer ---- */
  window.TestRegistry.accelerometer = {
    id: "accelerometer",
    category: "sensors",
    name: "Accelerometer",
    icon: ICON_ACCEL,
    instructions: [
      "Tap Enable Motion and grant permission if asked.",
      "Tilt your phone left, right, forward, and back.",
      "The bubble should move opposite to the direction you tilt, like a spirit level.",
      "Tap Pass if the bubble tracks your movement smoothly."
    ],
    setup: function (root, ctx) {
      if (typeof DeviceMotionEvent === "undefined") {
        ctx.unsupported("DeviceMotionEvent is not available on this device or browser.");
        return;
      }
      var wrap = window.TL.h(
        '<div style="display:flex; flex-direction:column; align-items:center; gap:16px; width:100%;">' +
          '<div class="tilt-box"><div class="tilt-box__bubble" id="tiltBubble"></div></div>' +
          '<button class="btn btn--telemetry" id="enableMotionBtn" type="button">Enable Motion Sensors</button>' +
        "</div>"
      );
      root.appendChild(wrap);
      var bubble = wrap.querySelector("#tiltBubble");
      var enableBtn = wrap.querySelector("#enableMotionBtn");
      var listening = false;

      function onMotion(e) {
        var acc = e.accelerationIncludingGravity || e.acceleration;
        if (!acc || acc.x === null) return;
        var x = Math.max(-10, Math.min(10, acc.x || 0));
        var y = Math.max(-10, Math.min(10, acc.y || 0));
        bubble.style.transform = "translate(calc(-50% + " + (x * 8) + "px), calc(-50% - " + (y * 8) + "px))";
        ctx.readouts({ "X (m/s²)": x.toFixed(1), "Y (m/s²)": y.toFixed(1), "Z (m/s²)": (acc.z || 0).toFixed(1) });
        ctx.setHint("Live — tap Pass once the bubble tracks your tilt.");
      }

      function start() {
        window.addEventListener("devicemotion", onMotion);
        listening = true;
        enableBtn.textContent = "Motion Active";
        enableBtn.disabled = true;
      }

      enableBtn.addEventListener("click", function () {
        if (needsIOSMotionPermission()) {
          DeviceMotionEvent.requestPermission()
            .then(function (state) {
              if (state === "granted") start();
              else ctx.error("Motion permission was denied. You can re-enable it in your browser's site settings.");
            })
            .catch(function () { ctx.error("Could not request motion permission."); });
        } else {
          start();
        }
      });

      ctx.onCleanup(function () { if (listening) window.removeEventListener("devicemotion", onMotion); });
    }
  };

  /* ---- Gyroscope ---- */
  window.TestRegistry.gyroscope = {
    id: "gyroscope",
    category: "sensors",
    name: "Gyroscope",
    icon: ICON_GYRO,
    instructions: [
      "Tap Enable Orientation and grant permission if asked.",
      "Rotate your phone around each axis (like turning a steering wheel, then tipping it forward/back).",
      "Watch the alpha / beta / gamma readouts change.",
      "Tap Pass once rotation is reflected smoothly."
    ],
    setup: function (root, ctx) {
      if (typeof DeviceOrientationEvent === "undefined") {
        ctx.unsupported("DeviceOrientationEvent is not available on this device or browser.");
        return;
      }
      var wrap = window.TL.h(
        '<div style="display:flex; flex-direction:column; align-items:center; gap:16px; width:100%;">' +
          '<div class="dial-3d"><div class="dial-3d__needle" id="gyroNeedle"></div></div>' +
          '<button class="btn btn--telemetry" id="enableOrientBtn" type="button">Enable Orientation Sensors</button>' +
        "</div>"
      );
      root.appendChild(wrap);
      var needle = wrap.querySelector("#gyroNeedle");
      var enableBtn = wrap.querySelector("#enableOrientBtn");
      var listening = false;

      function onOrient(e) {
        var alpha = e.alpha || 0, beta = e.beta || 0, gamma = e.gamma || 0;
        needle.style.transform = "rotate(" + alpha + "deg)";
        ctx.readouts({ "Alpha (Z)": alpha.toFixed(1) + "°", "Beta (X)": beta.toFixed(1) + "°", "Gamma (Y)": gamma.toFixed(1) + "°" });
        ctx.setHint("Live — tap Pass once rotation tracks correctly.");
      }

      function start() {
        window.addEventListener("deviceorientation", onOrient);
        listening = true;
        enableBtn.textContent = "Orientation Active";
        enableBtn.disabled = true;
      }

      enableBtn.addEventListener("click", function () {
        if (needsIOSOrientationPermission()) {
          DeviceOrientationEvent.requestPermission()
            .then(function (state) {
              if (state === "granted") start();
              else ctx.error("Orientation permission was denied. Re-enable it in your browser's site settings.");
            })
            .catch(function () { ctx.error("Could not request orientation permission."); });
        } else {
          start();
        }
      });

      ctx.onCleanup(function () { if (listening) window.removeEventListener("deviceorientation", onOrient); });
    }
  };

  /* ---- Proximity ---- */
  window.TestRegistry.proximity = {
    id: "proximity",
    category: "sensors",
    name: "Proximity Sensor",
    icon: ICON_PROX,
    instructions: [
      "Most browsers don't expose the proximity sensor directly, so this is usually a manual check.",
      "Hold your phone as if answering a call, and cover the top of the screen (near the earpiece) with your hand.",
      "On a working phone, the screen would normally turn off during a real call at this point.",
      "Confirm Pass or Fail based on your device's known behavior, or the live reading below if supported."
    ],
    setup: function (root, ctx) {
      var wrap = window.TL.h(
        '<div style="display:flex; flex-direction:column; align-items:center; gap:14px; width:100%; text-align:center;">' +
          '<div class="card" style="padding:20px 24px; max-width:280px;">' +
            '<div style="font-family:var(--font-heading); font-weight:700; margin-bottom:6px;">Simulated Call Screen</div>' +
            '<div class="body-sm">Cover the top of your phone now</div>' +
          "</div>" +
        "</div>"
      );
      root.appendChild(wrap);

      if ("ProximitySensor" in window) {
        try {
          var sensor = new window.ProximitySensor();
          sensor.addEventListener("reading", function () {
            ctx.readouts({ Distance: sensor.distance != null ? sensor.distance + " cm" : "—", Near: sensor.near ? "Yes" : "No" });
            if (sensor.near) ctx.setHint("✓ Proximity detected — tap Pass to confirm.");
          });
          sensor.addEventListener("error", function () {
            ctx.info("The Proximity Sensor API is present but access was blocked — falling back to a manual check.");
          });
          sensor.start();
          ctx.onCleanup(function () { try { sensor.stop(); } catch (e) {} });
        } catch (e) {
          ctx.info("The Proximity Sensor API is not accessible here — this is a manual check on most browsers.");
        }
      } else {
        ctx.info("The Proximity Sensor API isn't exposed by this browser — this is a manual check on almost all phones today.");
      }
    }
  };

  /* ---- Ambient light ---- */
  window.TestRegistry.ambientlight = {
    id: "ambientlight",
    category: "sensors",
    name: "Ambient Light Sensor",
    icon: ICON_LIGHT,
    instructions: [
      "If your browser supports it, a live lux reading will appear below as you move your phone toward and away from light.",
      "If not supported, enable auto-brightness in your phone's display settings and cover/uncover the front of the screen.",
      "Confirm Pass if the screen brightness (or the lux reading) responds to changes in light."
    ],
    setup: function (root, ctx) {
      var wrap = window.TL.h('<div style="text-align:center; width:100%;"><div class="readout-grid" id="lightReadoutHolder"></div></div>');
      root.appendChild(wrap);

      if ("AmbientLightSensor" in window) {
        try {
          var sensor = new window.AmbientLightSensor();
          sensor.addEventListener("reading", function () {
            ctx.readouts({ Illuminance: Math.round(sensor.illuminance) + " lux" });
            ctx.setHint("Live lux reading — move to a brighter or darker area, then tap Pass.");
          });
          sensor.addEventListener("error", function () {
            ctx.info("Ambient Light Sensor access was blocked — this is a manual check on this browser.");
          });
          sensor.start();
          ctx.onCleanup(function () { try { sensor.stop(); } catch (e) {} });
        } catch (e) {
          ctx.info("The Ambient Light Sensor API is not accessible here — this is a manual check on most browsers (only some Chromium builds support it).");
        }
      } else {
        ctx.info("The Ambient Light Sensor API isn't exposed by this browser — this is a manual check based on your auto-brightness behavior.");
      }
    }
  };

  /* ---- Vibration ---- */
  window.TestRegistry.vibration = {
    id: "vibration",
    category: "sensors",
    name: "Vibration Motor",
    icon: ICON_VIBRATE,
    instructions: [
      "Make sure your phone isn't in silent/vibrate-off mode.",
      'Tap "Trigger Vibration" below.',
      "You should feel a short pattern: buzz, pause, buzz.",
      "Tap Pass if you felt it, or Fail if nothing happened."
    ],
    setup: function (root, ctx) {
      if (!("vibrate" in navigator)) {
        ctx.unsupported("The Vibration API is not available on this device or browser (notably, all iOS browsers).");
        return;
      }
      var wrap = window.TL.h('<div style="display:flex; justify-content:center;"><button class="btn btn--telemetry" id="vibrateBtn" type="button">Trigger Vibration</button></div>');
      root.appendChild(wrap);
      wrap.querySelector("#vibrateBtn").addEventListener("click", function () {
        var ok = navigator.vibrate([200, 100, 200]);
        ctx.setHint(ok ? "Pattern sent — did you feel it?" : "The browser rejected the vibration request.");
      });
    }
  };
})();
