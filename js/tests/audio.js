/* ==========================================================================
   TestLab — js/tests/audio.js
   Microphone, stereo speaker, and earpiece tests.
   Also defines the tiny shared TL helper namespace used by the other
   test modules (loaded first in tests.html).
   ========================================================================== */
window.TestRegistry = window.TestRegistry || {};
window.TL = window.TL || {};

window.TL.h = function (html) {
  var t = document.createElement("template");
  t.innerHTML = html.trim();
  return t.content.firstElementChild;
};

window.TL.icon = function (paths, size) {
  size = size || 20;
  return (
    '<svg viewBox="0 0 24 24" width="' + size + '" height="' + size + '" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    paths +
    "</svg>"
  );
};

(function () {
  "use strict";

  var ICON_MIC = window.TL.icon('<rect x="9" y="2" width="6" height="12" rx="3"></rect><path d="M5 11a7 7 0 0 0 14 0"></path><line x1="12" y1="18" x2="12" y2="22"></line>');
  var ICON_SPEAKER = window.TL.icon('<path d="M3 9v6h4l5 4V5L7 9H3z"></path><path d="M16 8a5 5 0 0 1 0 8"></path><path d="M19 5a9 9 0 0 1 0 14"></path>');
  var ICON_EAR = window.TL.icon('<path d="M6 3h9a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z"></path><line x1="10" y1="18" x2="14" y2="18"></line>');

  /* ---- Microphone ---- */
  window.TestRegistry.microphone = {
    id: "microphone",
    category: "audio",
    name: "Microphone Recording",
    icon: ICON_MIC,
    instructions: [
      'Tap "Enable Microphone" and allow access when your browser prompts you.',
      "Speak, clap, or whistle near the microphone.",
      "Watch the level meter and waveform respond.",
      "Tap Pass if the meter reacts clearly, or Fail if it stays flat."
    ],
    setup: function (root, ctx) {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia || !(window.AudioContext || window.webkitAudioContext)) {
        ctx.unsupported("This browser does not expose microphone access (getUserMedia) to web pages.");
        return;
      }
      var wrap = window.TL.h(
        '<div style="display:flex; flex-direction:column; gap:12px; width:100%;">' +
          '<div class="waveform" id="micWaveform"></div>' +
          '<div class="level-meter"><div class="level-meter__fill" id="micLevelFill"></div></div>' +
          '<button class="btn btn--telemetry btn--block" id="micEnableBtn" type="button">Enable Microphone</button>' +
        "</div>"
      );
      root.appendChild(wrap);
      var waveform = wrap.querySelector("#micWaveform");
      var levelFill = wrap.querySelector("#micLevelFill");
      var enableBtn = wrap.querySelector("#micEnableBtn");

      var BAR_COUNT = 32;
      var bars = [];
      for (var i = 0; i < BAR_COUNT; i++) {
        var b = document.createElement("span");
        b.className = "waveform__bar";
        waveform.appendChild(b);
        bars.push(b);
      }

      var audioCtx, analyser, source, stream, rafId, hinted = false;

      function draw() {
        var data = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(data);
        var step = Math.floor(data.length / BAR_COUNT) || 1;
        var peak = 0;
        for (var i = 0; i < BAR_COUNT; i++) {
          var v = data[i * step] || 0;
          peak = Math.max(peak, v);
          bars[i].style.height = Math.max(6, (v / 255) * 100) + "%";
        }
        var levelPct = Math.min(100, Math.round((peak / 255) * 100));
        levelFill.style.width = levelPct + "%";
        ctx.readouts({ "Peak Level": levelPct + "%", "Sample Rate": Math.round(audioCtx.sampleRate / 1000) + " kHz" });
        if (peak > 90 && !hinted) {
          hinted = true;
          ctx.setHint("✓ Strong signal detected — tap Pass to confirm.");
        }
        rafId = requestAnimationFrame(draw);
      }

      function stopStream() {
        if (rafId) cancelAnimationFrame(rafId);
        if (stream) stream.getTracks().forEach(function (t) { t.stop(); });
        if (audioCtx) audioCtx.close().catch(function () {});
        rafId = null; stream = null; audioCtx = null;
      }

      enableBtn.addEventListener("click", function () {
        enableBtn.disabled = true;
        enableBtn.textContent = "Requesting access…";
        navigator.mediaDevices
          .getUserMedia({ audio: true })
          .then(function (s) {
            stream = s;
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            analyser = audioCtx.createAnalyser();
            analyser.fftSize = 256;
            source = audioCtx.createMediaStreamSource(stream);
            source.connect(analyser);
            enableBtn.textContent = "Microphone Active";
            ctx.setHint("Listening… speak near the microphone.");
            draw();
          })
          .catch(function (err) {
            enableBtn.disabled = false;
            enableBtn.textContent = "Enable Microphone";
            ctx.error("Microphone access was blocked or denied (" + (err && err.name ? err.name : "error") + "). Check your browser's site permissions and try again.");
          });
      });

      ctx.onCleanup(stopStream);
    }
  };

  /* ---- Stereo speaker ---- */
  window.TestRegistry.speaker = {
    id: "speaker",
    category: "audio",
    name: "Stereo Speakers",
    icon: ICON_SPEAKER,
    instructions: [
      "Turn your volume up to a comfortable level.",
      "Tap Play — you should hear a steady tone.",
      "Switch between Left, Both, and Right to confirm each stereo channel.",
      "Tap Pass if you heard the tone clearly on both channels."
    ],
    setup: function (root, ctx) {
      if (!(window.AudioContext || window.webkitAudioContext)) {
        ctx.unsupported("Web Audio is not available in this browser.");
        return;
      }
      var wrap = window.TL.h(
        '<div style="display:flex; flex-direction:column; gap:16px; width:100%; align-items:center;">' +
          '<div class="pan-toggle" role="group" aria-label="Channel">' +
            '<button type="button" id="panLeft" aria-pressed="false">Left</button>' +
            '<button type="button" id="panCenter" aria-pressed="true">Both</button>' +
            '<button type="button" id="panRight" aria-pressed="false">Right</button>' +
          "</div>" +
          '<input type="range" id="volSlider" min="0" max="1" step="0.01" value="0.25" style="width:100%; max-width:280px;" aria-label="Tone volume" />' +
          '<button class="btn btn--telemetry" id="playToneBtn" type="button">Play Tone</button>' +
        "</div>"
      );
      root.appendChild(wrap);
      var left = wrap.querySelector("#panLeft"), center = wrap.querySelector("#panCenter"), right = wrap.querySelector("#panRight");
      var volSlider = wrap.querySelector("#volSlider");
      var playBtn = wrap.querySelector("#playToneBtn");
      var pan = 0, playing = false, audioCtx, osc, gain, panner;

      function setPan(v, btn) {
        pan = v;
        [left, center, right].forEach(function (b) { b.setAttribute("aria-pressed", "false"); });
        btn.setAttribute("aria-pressed", "true");
        if (panner) panner.pan.value = pan;
      }
      left.addEventListener("click", function () { setPan(-1, left); });
      center.addEventListener("click", function () { setPan(0, center); });
      right.addEventListener("click", function () { setPan(1, right); });
      volSlider.addEventListener("input", function () { if (gain) gain.gain.value = parseFloat(volSlider.value); });

      function stop() {
        playing = false;
        if (osc) { try { osc.stop(); } catch (e) {} }
        if (audioCtx) audioCtx.close().catch(function () {});
        playBtn.textContent = "Play Tone";
      }

      playBtn.addEventListener("click", function () {
        if (playing) { stop(); return; }
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        osc = audioCtx.createOscillator();
        gain = audioCtx.createGain();
        gain.gain.value = parseFloat(volSlider.value);
        osc.type = "sine";
        osc.frequency.value = 440;
        if (audioCtx.createStereoPanner) {
          panner = audioCtx.createStereoPanner();
          panner.pan.value = pan;
          osc.connect(gain).connect(panner).connect(audioCtx.destination);
        } else {
          osc.connect(gain).connect(audioCtx.destination);
        }
        osc.start();
        playing = true;
        playBtn.textContent = "Stop Tone";
      });

      ctx.onCleanup(stop);
    }
  };

  /* ---- Earpiece ---- */
  window.TestRegistry.earpiece = {
    id: "earpiece",
    category: "audio",
    name: "Earpiece Speaker",
    icon: ICON_EAR,
    instructions: [
      "Hold your phone up to your ear as if taking a call.",
      "Tap Play — a quiet tone plays, intended for the earpiece (top) speaker.",
      "Confirm manually which speaker you heard it from — browsers cannot force output to a specific speaker on every device."
    ],
    setup: function (root, ctx) {
      if (!(window.AudioContext || window.webkitAudioContext)) {
        ctx.unsupported("Web Audio is not available in this browser.");
        return;
      }
      ctx.info("Browsers can't force audio to the earpiece specifically — most phones route quiet, close-range playback there automatically. Confirm manually.");
      var wrap = window.TL.h('<div style="display:flex; justify-content:center;"><button class="btn btn--telemetry" id="earpieceBtn" type="button">Play Quiet Tone</button></div>');
      root.appendChild(wrap);
      var btn = wrap.querySelector("#earpieceBtn");
      var audioCtx, osc, gain, playing = false;

      function stop() {
        playing = false;
        if (osc) { try { osc.stop(); } catch (e) {} }
        if (audioCtx) audioCtx.close().catch(function () {});
        btn.textContent = "Play Quiet Tone";
      }

      btn.addEventListener("click", function () {
        if (playing) { stop(); return; }
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        osc = audioCtx.createOscillator();
        gain = audioCtx.createGain();
        gain.gain.value = 0.05;
        osc.type = "sine";
        osc.frequency.value = 880;
        osc.connect(gain).connect(audioCtx.destination);
        osc.start();
        playing = true;
        btn.textContent = "Stop Tone";
      });

      ctx.onCleanup(stop);
    }
  };
})();
