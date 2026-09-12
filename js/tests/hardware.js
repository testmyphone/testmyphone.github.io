/* ==========================================================================
   TestLab — js/tests/hardware.js
   Camera, flashlight, physical buttons, biometrics, USB/OTG, charging port.
   ========================================================================== */
window.TestRegistry = window.TestRegistry || {};

(function () {
  "use strict";

  var ICON_CAMERA = window.TL.icon('<path d="M4 8h3l2-3h6l2 3h3v11H4z"></path><circle cx="12" cy="13.5" r="3.5"></circle>');
  var ICON_FLASH = window.TL.icon('<path d="M9 2h6l1 4-2 2v12a2 2 0 0 1-4 0V8L8 6z"></path><line x1="8.5" y1="6" x2="15.5" y2="6"></line>');
  var ICON_BUTTONS = window.TL.icon('<rect x="3" y="3" width="7" height="7" rx="1.5"></rect><rect x="14" y="3" width="7" height="7" rx="1.5"></rect><rect x="3" y="14" width="7" height="7" rx="1.5"></rect><rect x="14" y="14" width="7" height="7" rx="1.5"></rect>');
  var ICON_FINGERPRINT = window.TL.icon('<path d="M12 3a7 7 0 0 0-7 7c0 3 1 5 1 8"></path><path d="M12 3a7 7 0 0 1 7 7c0 2 -0.3 3.5 -0.8 5"></path><path d="M8 20c-1-2-2-4-2-7a6 6 0 0 1 12 0c0 1.2-0.15 2.2-0.4 3.1"></path>');
  var ICON_USB = window.TL.icon('<circle cx="7" cy="17" r="2"></circle><circle cx="17" cy="6" r="2"></circle><path d="M7 15V9a3 3 0 0 1 3-3h5"></path><path d="M11 12h4"></path>');
  var ICON_CHARGE = window.TL.icon('<path d="M9 2v6"></path><path d="M15 2v6"></path><path d="M6 8h12v5a6 6 0 0 1-12 0V8z"></path><path d="M12 19v3"></path>');

  /* ---- Camera ---- */
  window.TestRegistry.camera = {
    id: "camera",
    category: "hardware",
    name: "Front & Rear Cameras",
    icon: ICON_CAMERA,
    instructions: [
      "Tap Enable Camera and allow access when prompted.",
      "Use Switch Camera to check both the front and rear lens.",
      "Tap Capture Frame to confirm the sensor produces a clean image.",
      "Tap Pass once both cameras show a live, focused preview."
    ],
    setup: function (root, ctx) {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        ctx.unsupported("Camera access (getUserMedia) is not available in this browser.");
        return;
      }
      var wrap = window.TL.h(
        '<div style="width:100%; display:flex; flex-direction:column; gap:10px; align-items:center;">' +
          '<video id="cameraPreview" class="camera-preview" autoplay playsinline muted></video>' +
          '<canvas id="captureCanvas" style="display:none;"></canvas>' +
          '<img id="captureThumb" style="display:none; max-width:120px; border-radius:8px; border:1px solid var(--color-border);" alt="Captured frame preview" />' +
          '<div style="display:flex; gap:8px; flex-wrap:wrap; justify-content:center;">' +
            '<button class="btn btn--telemetry btn--sm" id="camEnableBtn" type="button">Enable Camera</button>' +
            '<button class="btn btn--secondary btn--sm" id="camSwitchBtn" type="button" disabled>Switch Camera</button>' +
            '<button class="btn btn--secondary btn--sm" id="camCaptureBtn" type="button" disabled>Capture Frame</button>' +
          "</div>" +
        "</div>"
      );
      root.appendChild(wrap);
      var video = wrap.querySelector("#cameraPreview");
      var canvas = wrap.querySelector("#captureCanvas");
      var thumb = wrap.querySelector("#captureThumb");
      var enableBtn = wrap.querySelector("#camEnableBtn");
      var switchBtn = wrap.querySelector("#camSwitchBtn");
      var captureBtn = wrap.querySelector("#camCaptureBtn");
      var facing = "environment";
      var stream = null;

      function stopStream() {
        if (stream) { stream.getTracks().forEach(function (t) { t.stop(); }); stream = null; }
      }

      function start() {
        stopStream();
        navigator.mediaDevices
          .getUserMedia({ video: { facingMode: facing } })
          .then(function (s) {
            stream = s;
            video.srcObject = stream;
            switchBtn.disabled = false;
            captureBtn.disabled = false;
            enableBtn.textContent = "Camera Active";
            ctx.readouts({ Facing: facing === "environment" ? "Rear" : "Front", "Track Label": (stream.getVideoTracks()[0] && stream.getVideoTracks()[0].label) || "—" });
            ctx.setHint("✓ Live preview rendering — tap Pass once you've checked both cameras.");
          })
          .catch(function (err) {
            ctx.error("Camera access failed (" + (err && err.name ? err.name : "error") + "). Check permissions, or your device may not have a " + facing + " camera.");
          });
      }

      enableBtn.addEventListener("click", start);
      switchBtn.addEventListener("click", function () {
        facing = facing === "environment" ? "user" : "environment";
        start();
      });
      captureBtn.addEventListener("click", function () {
        if (!stream) return;
        canvas.width = video.videoWidth || 320;
        canvas.height = video.videoHeight || 240;
        var cctx = canvas.getContext("2d");
        cctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        thumb.src = canvas.toDataURL("image/png");
        thumb.style.display = "block";
      });

      ctx.onCleanup(stopStream);
    }
  };

  /* ---- Flashlight / torch ---- */
  window.TestRegistry.flashlight = {
    id: "flashlight",
    category: "hardware",
    name: "Flashlight / Torch",
    icon: ICON_FLASH,
    instructions: [
      "Tap Enable Rear Camera — this is required to access the torch hardware.",
      "Tap the toggle to turn the flashlight on and off.",
      "Confirm Pass if the physical LED lights up."
    ],
    setup: function (root, ctx) {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        ctx.unsupported("Camera access (required for torch control) is not available in this browser.");
        return;
      }
      var wrap = window.TL.h(
        '<div style="display:flex; flex-direction:column; align-items:center; gap:12px;">' +
          '<button class="btn btn--telemetry btn--sm" id="torchEnableBtn" type="button">Enable Rear Camera</button>' +
          '<button class="btn btn--secondary" id="torchToggleBtn" type="button" disabled>Turn On Flashlight</button>' +
        "</div>"
      );
      root.appendChild(wrap);
      var enableBtn = wrap.querySelector("#torchEnableBtn");
      var toggleBtn = wrap.querySelector("#torchToggleBtn");
      var stream = null, track = null, on = false;

      function stopStream() { if (stream) { stream.getTracks().forEach(function (t) { t.stop(); }); stream = null; } }

      enableBtn.addEventListener("click", function () {
        navigator.mediaDevices
          .getUserMedia({ video: { facingMode: "environment" } })
          .then(function (s) {
            stream = s;
            track = stream.getVideoTracks()[0];
            var caps = track.getCapabilities ? track.getCapabilities() : {};
            if (!caps.torch) {
              ctx.unsupported("This camera doesn't expose a torch control via MediaStreamTrack constraints (common on iOS Safari and many desktops).");
              return;
            }
            enableBtn.textContent = "Rear Camera Active";
            toggleBtn.disabled = false;
            ctx.setHint("Torch capability detected — tap the toggle.");
          })
          .catch(function (err) {
            ctx.error("Camera access failed (" + (err && err.name ? err.name : "error") + ").");
          });
      });

      toggleBtn.addEventListener("click", function () {
        if (!track) return;
        on = !on;
        track
          .applyConstraints({ advanced: [{ torch: on }] })
          .then(function () {
            toggleBtn.textContent = on ? "Turn Off Flashlight" : "Turn On Flashlight";
            if (on) ctx.setHint("✓ Torch on — tap Pass if the LED lit up.");
          })
          .catch(function () { ctx.error("Could not toggle torch constraint."); });
      });

      ctx.onCleanup(stopStream);
    }
  };

  /* ---- Physical buttons ---- */
  window.TestRegistry.buttons = {
    id: "buttons",
    category: "hardware",
    name: "Physical Buttons",
    icon: ICON_BUTTONS,
    instructions: [
      "Browsers cannot read physical volume or power button presses directly — this is an honest, manual check.",
      "Press each physical button on your phone (volume up, volume down, power) one at a time.",
      "Tap the matching card below to mark it as confirmed working.",
      "Tap Pass once every button you have has been confirmed."
    ],
    setup: function (root, ctx) {
      ctx.info("Volume and power buttons aren't exposed to web pages for security reasons — confirm each one manually below.");
      var keys = ["Volume Up", "Volume Down", "Power / Lock", "Home / App Switch"];
      var wrap = window.TL.h('<div class="tests-grid" id="buttonGrid" style="width:100%; grid-template-columns:repeat(2,1fr);"></div>');
      root.appendChild(wrap);
      var grid = wrap.querySelector("#buttonGrid");
      var confirmedCount = 0;
      keys.forEach(function (key) {
        var card = document.createElement("button");
        card.type = "button";
        card.className = "card";
        card.style.cssText = "padding:16px; text-align:left; font-weight:600; font-family:var(--font-heading); display:flex; align-items:center; justify-content:space-between; gap:8px;";
        card.innerHTML = "<span>" + key + '</span><span class="chip chip--pending">Tap to confirm</span>';
        card.addEventListener("click", function () {
          if (card.dataset.confirmed) return;
          card.dataset.confirmed = "1";
          card.querySelector(".chip").outerHTML = '<span class="chip chip--pass"><span class="chip__dot"></span>Confirmed</span>';
          confirmedCount++;
          if (confirmedCount === keys.length) ctx.setHint("✓ All buttons confirmed — tap Pass.");
        });
        grid.appendChild(card);
      });

      function onKey(e) {
        ctx.readouts({ "Last Key Event": e.key || e.code || "unknown" });
      }
      window.addEventListener("keydown", onKey);
      ctx.onCleanup(function () { window.removeEventListener("keydown", onKey); });
    }
  };

  /* ---- Fingerprint / biometrics ---- */
  window.TestRegistry.fingerprint = {
    id: "fingerprint",
    category: "hardware",
    name: "Biometric / Touch ID",
    icon: ICON_FINGERPRINT,
    instructions: [
      "TestLab checks whether your device reports a platform authenticator (Face ID, Touch ID, or Android fingerprint).",
      'Optionally tap "Test Biometric Prompt" to trigger your device\'s real biometric UI.',
      "Cancelling the prompt is normal and doesn't necessarily mean it's broken.",
      "Tap Pass if a platform authenticator is available and/or the prompt appeared correctly."
    ],
    setup: function (root, ctx) {
      if (!window.PublicKeyCredential) {
        ctx.unsupported("WebAuthn / PublicKeyCredential is not available in this browser.");
        return;
      }
      var wrap = window.TL.h('<div style="display:flex; justify-content:center;"><button class="btn btn--telemetry" id="bioPromptBtn" type="button" disabled>Checking availability…</button></div>');
      root.appendChild(wrap);
      var btn = wrap.querySelector("#bioPromptBtn");

      PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
        .then(function (available) {
          ctx.readouts({ "Platform Authenticator": available ? "Available" : "Not detected" });
          btn.disabled = false;
          btn.textContent = "Test Biometric Prompt";
          if (available) ctx.setHint("A platform authenticator was detected — try the prompt, then tap Pass.");
          else ctx.info("No platform authenticator was detected. Some Android/desktop browsers still allow testing the prompt below.");
        })
        .catch(function () {
          ctx.error("Could not check platform authenticator availability.");
        });

      btn.addEventListener("click", function () {
        var challenge = new Uint8Array(32);
        window.crypto.getRandomValues(challenge);
        var userId = new Uint8Array(16);
        window.crypto.getRandomValues(userId);
        navigator.credentials
          .create({
            publicKey: {
              challenge: challenge,
              rp: { name: "TestLab" },
              user: { id: userId, name: "testlab-user", displayName: "TestLab User" },
              pubKeyCredParams: [{ type: "public-key", alg: -7 }],
              authenticatorSelection: { authenticatorAttachment: "platform", userVerification: "required" },
              timeout: 30000
            }
          })
          .then(function () {
            ctx.setHint("✓ Biometric prompt succeeded — tap Pass to confirm.");
          })
          .catch(function (err) {
            ctx.info("Prompt closed (" + (err && err.name ? err.name : "cancelled") + "). Cancelling is normal — this doesn't necessarily mean the sensor failed.");
          });
      });
    }
  };

  /* ---- USB / OTG ---- */
  window.TestRegistry.usb = {
    id: "usb",
    category: "hardware",
    name: "USB / OTG Port",
    icon: ICON_USB,
    instructions: [
      "Connect a USB device via an OTG adapter if you have one.",
      'Tap "Open Device Picker" — your browser will list connected USB devices.',
      "Selecting a device confirms the port and API both work.",
      "Not available in Safari or Firefox — those will show as unsupported."
    ],
    setup: function (root, ctx) {
      if (!navigator.usb || !navigator.usb.requestDevice) {
        ctx.unsupported("The WebUSB API is not available in this browser (notably Safari and Firefox).");
        return;
      }
      var wrap = window.TL.h('<div style="display:flex; justify-content:center;"><button class="btn btn--telemetry" id="usbBtn" type="button">Open Device Picker</button></div>');
      root.appendChild(wrap);
      wrap.querySelector("#usbBtn").addEventListener("click", function () {
        navigator.usb
          .requestDevice({ filters: [] })
          .then(function (device) {
            ctx.readouts({ Device: device.productName || "Unnamed USB device", Vendor: "0x" + device.vendorId.toString(16) });
            ctx.setHint("✓ USB device selected — tap Pass to confirm.");
          })
          .catch(function () {
            ctx.info("No device was selected, or none are connected. If you don't have an OTG accessory to test with, confirm manually.");
          });
      });
    }
  };

  /* ---- Charging port ---- */
  window.TestRegistry.chargingport = {
    id: "chargingport",
    category: "hardware",
    name: "Charging Port",
    icon: ICON_CHARGE,
    instructions: [
      "TestLab reads your battery's charging state, which is the closest signal a browser can get to port health.",
      "Unplug your charger, wait a moment, then plug it back in.",
      "The status below should flip between Charging and Not Charging as you do this.",
      "Tap Pass if the state changes correctly when you plug/unplug."
    ],
    setup: function (root, ctx) {
      if (!navigator.getBattery) {
        ctx.unsupported("The Battery Status API is not available in this browser (notably Safari and Firefox).");
        return;
      }
      var batteryRef = null;
      navigator.getBattery().then(function (battery) {
        batteryRef = battery;
        function render() {
          ctx.readouts({
            "Charging": battery.charging ? "Yes" : "No",
            "Level": Math.round(battery.level * 100) + "%"
          });
          ctx.setHint("Plug/unplug your charger now — watch the Charging value change.");
        }
        render();
        battery.addEventListener("chargingchange", function () {
          render();
          ctx.setHint("✓ Charging state changed — tap Pass to confirm.");
        });
      });

      ctx.onCleanup(function () {
        /* Battery events are cleared automatically when the object is garbage collected;
           nothing to explicitly release here. */
        batteryRef = null;
      });
    }
  };
})();
