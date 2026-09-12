# TestLab — Free Mobile Phone Hardware Diagnostic Suite

A static, front-end-only web app that runs 24 real hardware diagnostics
directly in the browser — microphone, speakers, camera, touch, sensors,
GPS, battery, connectivity, and more. No install, no sign-up, no backend,
no build step.

Built with **vanilla HTML, CSS, and JavaScript only** — no frameworks, no
bundlers, no npm dependencies. It runs by simply serving the files as-is.

## File structure

```
/
├── index.html                 ← marketing homepage with a live demo widget
├── tests.html                 ← the full-screen test runner
├── css/
│   ├── base.css                ← reset, design tokens, typography, utilities
│   ├── layout.css               ← grid, sections, containers, responsive rules
│   └── components.css           ← buttons, cards, nav, accordion, test-runner UI
├── js/
│   ├── main.js                  ← homepage: nav, FAQ accordion, scroll-reveal,
│   │                               test grid, and the 3 live hero demos
│   ├── runner.js                ← test orchestration / state machine
│   ├── report.js                ← scoring, results screen, download/print/share
│   └── tests/
│       ├── audio.js             ← microphone, speaker, earpiece
│       ├── display.js           ← touch dead-zones, multi-touch, dead pixels
│       ├── sensors.js           ← accelerometer, gyroscope, proximity,
│       │                          ambient light, vibration
│       ├── connectivity.js      ← Wi-Fi/network speed, cellular, Bluetooth
│       ├── hardware.js          ← camera, flashlight, buttons, biometrics,
│       │                          USB/OTG, charging port
│       └── device.js            ← battery, GPS, storage, headphone jack
├── assets/
│   └── favicon.svg
└── README.md
```

## Running it locally

Many of the hardware APIs used here (microphone, camera, geolocation,
motion/orientation sensors) only work in a **secure context** —
`https://` or `http://localhost`. Opening `index.html` directly from disk
via `file://` will load the page, but the browser will silently block
these APIs.

To test locally, serve the folder with any static server, for example:

```bash
# Python 3
python3 -m http.server 8000

# Node (if you have it)
npx serve .
```

Then open `http://localhost:8000` on the same device you want to test,
or on a phone on the same network using your computer's local IP
address (also fine, since `http://` on a private LAN is treated as a
secure-enough context by most mobile browsers for local testing —
though GitHub Pages' HTTPS is the more reliable option for real use).

## Deploying to GitHub Pages

1. Push this folder to a GitHub repository (all files at the repo root,
   or inside a subfolder — the site uses relative paths throughout so
   it works either way).
2. In the repository, go to **Settings → Pages**.
3. Under **Build and deployment**, set **Source** to "Deploy from a
   branch", pick your branch (e.g. `main`) and the `/ (root)` folder
   (or `/docs` if you placed the files there).
4. Save. GitHub will publish the site at
   `https://<your-username>.github.io/<repo-name>/` within a minute or
   two, automatically served over HTTPS — which is exactly what the
   hardware APIs need.

No further configuration, environment variables, or build step is
required.

## Running a single test directly

Every test can be linked to directly for sharing or embedding, e.g.:

```
tests.html?test=microphone
tests.html?test=camera
tests.html?test=gps
```

See `js/runner.js` for the full list of 24 test IDs (`TEST_ORDER`).

## Browser support notes

TestLab feature-detects every API it uses and marks a test **"Not
supported on this browser"** instead of reporting a false failure when
the underlying API doesn't exist. Notable gaps by browser:

- **Safari (iOS & macOS):** no Battery Status API, no Web Bluetooth, no
  WebUSB, no Vibration API, no AmbientLightSensor/ProximitySensor.
  Motion/orientation sensors require an explicit permission prompt
  (handled automatically).
- **Firefox (desktop & Android):** no Battery Status API, no Web
  Bluetooth, no WebUSB.
- **All browsers:** physical volume/power button presses, SIM/carrier
  identity, and exact torch/flash hardware state are not exposed to
  web pages at all — these are always manual, informational checks by
  design, and TestLab says so on-screen rather than pretending
  otherwise.

## Assumptions & notes

Because the attached mockup screenshot was the visual source of truth,
some values were inferred where the image was ambiguous or where the
brief and the image differed slightly:

- **Test count:** the brief's checklist enumerates 24 distinct tests
  (grouped as Audio ×3, Display & Touch ×3, Sensors ×5, Connectivity
  ×3, Hardware ×6, Device ×4). The UI uses "24 Tests" / "24+ Hardware
  Tests" throughout rather than the mockup's rounded "18+", since the
  full checklist was implemented.
- **Max content width:** used 1280px (matching the mockup's visual
  proportions) rather than the brief's suggested ~1200px.
- **Color tokens, type scale, radii, and shadows** are taken directly
  from the mockup's attached `DESIGN.md` (Indigo `#4F46E5` primary,
  teal `#14B8A6` secondary, Plus Jakarta Sans headings + Inter body).
- **Print stylesheet:** implemented as `@media print` rules inside
  `css/layout.css`/`css/components.css` (hiding chrome via a `.no-print`
  utility class) rather than a separate physical file, since the given
  file tree didn't list one — functionally equivalent for `window.print()`.
- **"Auto-pass" tests** (microphone, GPS, camera, etc.): rather than
  silently auto-advancing the runner, TestLab auto-detects a strong
  signal and highlights a hint ("✓ Signal detected — tap Pass to
  confirm") so the person always makes the final call, consistent with
  tests that can't be auto-detected at all.
- **Biometric test:** triggers a real (local-only) WebAuthn
  `navigator.credentials.create()` prompt to visually confirm Face
  ID/Touch ID/fingerprint UI appears; no credential is ever stored or
  sent anywhere.
- Footer/company links, testimonial names, and the partner "logo row"
  are placeholder content, since no real company details were supplied.
