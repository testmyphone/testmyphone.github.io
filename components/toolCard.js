// js/components/toolCard.js
// Renders a single tool card. Pure function — no DOM side effects.

const CATEGORY_ICONS = {
  display: `<path d="M3 5h18v11H3z" stroke="currentColor" stroke-width="1.6"/><path d="M8 19h8" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>`,
  audio: `<path d="M9 6v9a3 3 0 1 1-2-2.83" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/><path d="M9 6l8-2v9" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>`,
  sensors: `<circle cx="12" cy="12" r="2.5" stroke="currentColor" stroke-width="1.6"/><path d="M12 3v3M12 18v3M3 12h3M18 12h3" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>`,
  camera: `<rect x="3" y="7" width="18" height="12" rx="2" stroke="currentColor" stroke-width="1.6"/><circle cx="12" cy="13" r="3.2" stroke="currentColor" stroke-width="1.6"/><path d="M8 7l1.5-2.5h5L16 7" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>`,
  connectivity: `<path d="M4 10a11 11 0 0 1 16 0" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/><path d="M7 13.5a6.5 6.5 0 0 1 10 0" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/><circle cx="12" cy="18" r="1.4" fill="currentColor"/>`,
  performance: `<path d="M4 19V13M10 19V7M16 19v-9M22 19v-4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>`,
};

/**
 * @param {Object} tool
 * @param {string} tool.id
 * @param {string} tool.name
 * @param {string} tool.description
 * @param {string} tool.category  - category key, matches CATEGORY_ICONS + filter pills
 * @param {string} tool.categoryLabel - human readable category tag
 */
export function renderToolCard(tool) {
  const icon = CATEGORY_ICONS[tool.category] || CATEGORY_ICONS.performance;
  return `
    <article class="tool-card" data-category="${tool.category}" data-tool-id="${tool.id}">
      <div class="tool-card-top">
        <span class="tool-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">${icon}</svg>
        </span>
        <span class="tool-tag">${tool.categoryLabel}</span>
      </div>
      <h3>${tool.name}</h3>
      <p>${tool.description}</p>
      <div class="tool-card-foot">
        <button class="btn btn-outline btn-sm run-test-btn" type="button" data-tool-id="${tool.id}">
          Run test
        </button>
      </div>
    </article>
  `;
}
