// js/components/toolsGrid.js
// Holds the data for all 21 tools and renders the filterable grid.

import { renderToolCard } from "./toolCard.js";

export const CATEGORIES = [
  { key: "all", label: "All" },
  { key: "display", label: "Display" },
  { key: "audio", label: "Audio" },
  { key: "sensors", label: "Sensors" },
  { key: "camera", label: "Camera" },
  { key: "connectivity", label: "Network" },
  { key: "performance", label: "Performance" },
];

const CATEGORY_LABELS = {
  display: "Display",
  audio: "Audio",
  sensors: "Sensors",
  camera: "Camera",
  connectivity: "Network",
  performance: "Performance",
};

export const TOOLS = [
  // Screen & Display Tests
  { id: "multi-touch-test", category: "display", name: "Multi-Touch & Touchscreen Test", description: "Track simultaneous touch points and confirm your screen registers gestures accurately." },
  { id: "dead-pixel-test", category: "display", name: "Dead Pixel Test", description: "Cycle through solid colors full-screen to spot stuck or dead pixels." },
  { id: "refresh-rate-test", category: "display", name: "Refresh Rate Test (Hz)", description: "Measure your display's actual refresh rate using frame timing." },
  { id: "screen-burn-in", category: "display", name: "Screen Burn-In Check", description: "Display static patterns to check for visible ghosting or burn-in on OLED panels." },
  { id: "hdr-color-gamut", category: "display", name: "HDR & Color Gamut Test", description: "Preview HDR content and wide color gamut swatches to check panel support." },

  // Audio & Media Tests
  { id: "microphone-test", category: "audio", name: "Microphone Input Test", description: "Visualize live waveform and volume level to confirm your mic is picking up sound." },
  { id: "speaker-test", category: "audio", name: "Stereo Speaker Test", description: "Play isolated left and right channel tones to verify stereo output." },
  { id: "audio-frequency-test", category: "audio", name: "Audio Frequency Range Test", description: "Sweep tones from 20Hz to 20kHz to find the audible range of your speakers or ears." },

  // Built-In Sensors & Inputs
  { id: "accelerometer-gyroscope", category: "sensors", name: "Accelerometer & Gyroscope Test", description: "Read live motion and orientation data as you tilt or move the device." },
  { id: "ambient-light-sensor", category: "sensors", name: "Ambient Light Sensor Test", description: "Report live lux readings from your device's ambient light sensor." },
  { id: "magnetometer-test", category: "sensors", name: "Magnetometer (Compass) Test", description: "Show live heading data from the magnetometer to confirm compass accuracy." },
  { id: "proximity-sensor-test", category: "sensors", name: "Proximity Sensor Test", description: "Detect when an object is near the screen, the way it triggers during a call." },

  // Camera & Biometrics
  { id: "camera-test", category: "camera", name: "Front & Rear Camera Test", description: "Preview both cameras live and switch between them to check focus and exposure." },
  { id: "webauthn-biometric", category: "camera", name: "WebAuthn Biometric Check", description: "Confirm your device supports fingerprint or face unlock via the WebAuthn API." },

  // Connectivity & Location
  { id: "gps-geolocation", category: "connectivity", name: "GPS & Geolocation Accuracy", description: "Show your reported coordinates and accuracy radius from the Geolocation API." },
  { id: "network-speed-test", category: "connectivity", name: "Network Speed & Latency Test", description: "Measure download throughput and round-trip latency to a nearby endpoint." },
  { id: "bluetooth-scan", category: "connectivity", name: "Bluetooth Scan Capabilities", description: "Check whether your browser and device support scanning for nearby Bluetooth devices." },
  { id: "network-status-test", category: "connectivity", name: "Network Status Test", description: "Report connection type, effective speed, and online/offline state in real time." },

  // Performance & Battery Benchmarks
  { id: "cpu-js-speed-test", category: "performance", name: "CPU & JavaScript Speed Test", description: "Run a short computational benchmark to gauge single-thread JS performance." },
  { id: "gpu-3d-test", category: "performance", name: "GPU 3D Graphics Test", description: "Render a WebGL scene and measure sustained frame rate under load." },
  { id: "battery-status-test", category: "performance", name: "Battery Status API Test", description: "Read current battery level, charging state, and estimated time remaining." },
];

function renderFilterPills(activeCategory) {
  return CATEGORIES.map(
    (cat) => `
      <button
        class="filter-pill${cat.key === activeCategory ? " active" : ""}"
        data-category="${cat.key}"
        type="button"
        aria-pressed="${cat.key === activeCategory}"
      >${cat.label}</button>
    `
  ).join("");
}

function renderGrid(activeCategory) {
  const list =
    activeCategory === "all"
      ? TOOLS
      : TOOLS.filter((t) => t.category === activeCategory);

  if (list.length === 0) {
    return `<p class="no-results">No tests in this category yet.</p>`;
  }

  return list
    .map((tool) =>
      renderToolCard({ ...tool, categoryLabel: CATEGORY_LABELS[tool.category] })
    )
    .join("");
}

export function mountToolsGrid(rootSelector = "#tools-root") {
  const root = document.querySelector(rootSelector);
  if (!root) return;

  let activeCategory = "all";

  const paint = () => {
    root.innerHTML = `
      <div class="filter-pills" role="tablist" aria-label="Filter tools by category">
        ${renderFilterPills(activeCategory)}
      </div>
      <div class="tools-grid" id="tools-grid-list">
        ${renderGrid(activeCategory)}
      </div>
    `;

    root.querySelectorAll(".filter-pill").forEach((btn) => {
      btn.addEventListener("click", () => {
        activeCategory = btn.dataset.category;
        paint();
      });
    });

    root.querySelectorAll(".run-test-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const tool = TOOLS.find((t) => t.id === btn.dataset.toolId);
        root.dispatchEvent(
          new CustomEvent("run-test", { detail: tool, bubbles: true })
        );
      });
    });
  };

  paint();
}
