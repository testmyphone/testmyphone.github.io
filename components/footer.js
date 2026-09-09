// js/components/footer.js
// Multi-column footer with brand overview, navigation, and legal links.

export function renderFooter() {
  const year = new Date().getFullYear();
  return `
    <footer class="site-footer">
      <div class="footer-inner">
        <div class="footer-top">
          <div class="footer-brand">
            <span class="brand-name">DeviceCheck</span>
            <p>A free suite of browser-based hardware diagnostic tools. Every test runs on your device — nothing is uploaded or stored.</p>
          </div>

          <div class="footer-col">
            <h4>Test suite</h4>
            <ul>
              <li><a href="#tools">Display tests</a></li>
              <li><a href="#tools">Audio tests</a></li>
              <li><a href="#tools">Sensor tests</a></li>
              <li><a href="#tools">Camera tests</a></li>
              <li><a href="#tools">Network tests</a></li>
              <li><a href="#tools">Performance tests</a></li>
            </ul>
          </div>

          <div class="footer-col">
            <h4>Resources</h4>
            <ul>
              <li><a href="#how-it-works">How it works</a></li>
              <li><a href="#faq">FAQ</a></li>
              <li><a href="#tools">All 21 tools</a></li>
            </ul>
          </div>

          <div class="footer-col">
            <h4>Legal</h4>
            <ul>
              <li><a href="#">Privacy policy</a></li>
              <li><a href="#">Terms of use</a></li>
              <li><a href="#">Contact</a></li>
            </ul>
          </div>
        </div>

        <div class="footer-bottom">
          <span>&copy; ${year} DeviceCheck. All diagnostics run locally in your browser.</span>
          <span class="footer-legal">
            <a href="#">Privacy</a>
            <a href="#">Terms</a>
          </span>
        </div>
      </div>
    </footer>
  `;
}

export function mountFooter(rootSelector = "#footer-root") {
  const root = document.querySelector(rootSelector);
  if (!root) return;
  root.innerHTML = renderFooter();
}
