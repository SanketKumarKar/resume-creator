/**
 * templateLibrary.js
 * Renders the attached resume template images as a searchable gallery.
 */

const API_BASE = "/api";

function titleCase(text) {
  return String(text)
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function inferTemplateFamily(fileName) {
  const lower = fileName.toLowerCase();

  if (lower.startsWith("developer")) return "developer";
  if (lower.startsWith("designer")) return "designer";
  if (lower.startsWith("account")) return "accountant";
  if (lower.startsWith("admin")) return "classic";
  if (lower.startsWith("it")) return "engineer";
  if (lower.startsWith("picture")) return "photo";
  if (lower.startsWith("mac")) return "modern";
  if (lower.startsWith("fresh")) return "minimal";
  if (lower.startsWith("general")) return "classic";
  if (lower.startsWith("new")) return "modern";

  return "classic";
}

function rendererLabel(rendererKey) {
  const labels = {
    classic: "Classic",
    modern: "Modern",
    minimal: "Minimal",
    photo: "Photo",
    "prof-developer": "Software Developer",
    "prof-teacher": "Teacher",
    "prof-customer-service": "Customer Service",
    "prof-accountant": "Accountant",
    "prof-sales": "Sales Executive",
    "prof-nurse": "Nurse",
    "prof-engineer": "Engineer",
  };

  return labels[rendererKey] || titleCase(rendererKey);
}

function familyToRendererKey(family) {
  const mapping = {
    developer: "prof-developer",
    designer: "modern",
    accountant: "prof-accountant",
    engineer: "prof-engineer",
    photo: "photo",
    modern: "modern",
    minimal: "minimal",
    classic: "classic",
  };

  return mapping[family] || "classic";
}

function groupTemplates(templates) {
  return templates.reduce((groups, item) => {
    const groupKey = item.family || "classic";
    if (!groups[groupKey]) {
      groups[groupKey] = [];
    }
    groups[groupKey].push(item);
    return groups;
  }, {});
}

export async function initTemplateLibrary(container, onSelect) {
  const response = await fetch(`${API_BASE}/template-library`);
  if (!response.ok) {
    throw new Error("Unable to load template library");
  }

  const data = await response.json();
  const templates = Array.isArray(data.templates) ? data.templates : [];
  const groups = groupTemplates(templates);

  let activeRendererKey = "classic";
  let searchQuery = "";

  container.innerHTML = `
    <div class="template-library__header">
      <div>
        <div class="template-library__title">Template Gallery</div>
        <div class="template-library__meta">${templates.length} image templates from Resume_Formats</div>
      </div>
      <div class="template-library__meta">Click a thumbnail to apply the closest matching resume layout</div>
    </div>
    <div class="template-library__controls">
      <input id="template-library-search" class="template-library__search" type="search" placeholder="Search templates" />
    </div>
    <div id="template-library-grid" class="template-library__content" role="list"></div>
  `;

  const searchInput = container.querySelector("#template-library-search");
  const grid = container.querySelector("#template-library-grid");

  function renderGrid() {
    const filteredTemplates = templates.filter((item) => {
      const haystack = `${item.fileName} ${item.family} ${item.rendererKey}`.toLowerCase();
      return haystack.includes(searchQuery);
    });

    if (!filteredTemplates.length) {
      grid.innerHTML = `<div class="template-library__empty">No templates match your search.</div>`;
      return;
    }

    const grouped = groupTemplates(filteredTemplates);
    grid.innerHTML = Object.entries(grouped)
      .map(([family, items]) => {
        return `
          <section class="template-library__group">
            <div class="template-library__group-title">${titleCase(family)} · ${rendererLabel(items[0].rendererKey)}</div>
            <div class="template-library__cards">
              ${items
                .map(
                  (item) => `
                    <button
                      type="button"
                      class="template-card${item.rendererKey === activeRendererKey ? " is-active" : ""}"
                      data-renderer-key="${item.rendererKey}"
                      data-file-name="${item.fileName}"
                      aria-label="Select ${item.fileName}"
                    >
                      <div class="template-card__preview">
                        <img src="${item.url}" alt="${item.fileName}" loading="lazy" />
                        <span class="template-card__badge">${titleCase(item.family)}</span>
                      </div>
                      <div class="template-card__name">${item.fileName}</div>
                      <div class="template-card__family">${rendererLabel(item.rendererKey)}</div>
                    </button>
                  `
                )
                .join("")}
            </div>
          </section>
        `;
      })
      .join("");

    grid.querySelectorAll(".template-card").forEach((card) => {
      card.addEventListener("click", () => {
        activeRendererKey = card.dataset.rendererKey || "classic";
        onSelect(activeRendererKey);
        renderGrid();
      });
    });
  }

  searchInput.addEventListener("input", () => {
    searchQuery = searchInput.value.trim().toLowerCase();
    renderGrid();
  });

  renderGrid();

  return {
    setActiveTemplate(templateKey) {
      activeRendererKey = templateKey || "classic";
      renderGrid();
    },
    getTemplates() {
      return templates.slice();
    },
  };
}
