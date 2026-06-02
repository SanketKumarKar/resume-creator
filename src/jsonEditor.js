/**
 * jsonEditor.js
 * JSON textarea input mode — paste/edit raw JSON.
 */

import { store } from "./resumeStore.js";

let textarea = null;
let errorEl = null;
let statusEl = null;
let debounceTimer = null;

/** Initialize the JSON editor into a container */
export function initJsonEditor(container) {
  container.innerHTML = `
    <div class="json-editor">
      <textarea
        id="json-textarea"
        class="json-editor__textarea"
        spellcheck="false"
        placeholder="Paste your resume JSON here..."
      ></textarea>
      <div id="json-error" class="json-editor__error"></div>
      <div id="json-status" class="json-editor__status">✓ Valid JSON — preview updated</div>
    </div>
  `;

  textarea = container.querySelector("#json-textarea");
  errorEl = container.querySelector("#json-error");
  statusEl = container.querySelector("#json-status");

  // Set initial content from store
  textarea.value = JSON.stringify(store.getData(), null, 2);

  // Listen for edits
  textarea.addEventListener("input", () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(parseAndUpdate, 400);
  });

  // Listen for store changes from other sources (form editor, AI)
  store.onChange(() => {
    // Only update if textarea is NOT focused (to avoid fighting with user typing)
    if (document.activeElement !== textarea) {
      textarea.value = JSON.stringify(store.getDataRef(), null, 2);
    }
  });

  // Tab key inserts 2 spaces instead of moving focus
  textarea.addEventListener("keydown", (e) => {
    if (e.key === "Tab") {
      e.preventDefault();
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      textarea.value =
        textarea.value.substring(0, start) + "  " + textarea.value.substring(end);
      textarea.selectionStart = textarea.selectionEnd = start + 2;
    }
  });
}

function parseAndUpdate() {
  const raw = textarea.value.trim();
  if (!raw) {
    hideError();
    hideStatus();
    return;
  }

  try {
    let parsed = JSON.parse(raw);
    
    // Auto-unwrap common nested structures like { filename, data: { ... } }
    if (parsed && typeof parsed === 'object' && !parsed.personal_info) {
      if (parsed.data && typeof parsed.data === 'object' && parsed.data.personal_info !== undefined) {
        parsed = parsed.data;
      } else if (parsed.resume && typeof parsed.resume === 'object') {
        parsed = parsed.resume;
      }
    }

    store.setData(parsed);
    hideError();
    showStatus();
  } catch (err) {
    showError(err.message);
    hideStatus();
  }
}

function showError(msg) {
  errorEl.textContent = `❌ ${msg}`;
  errorEl.classList.add("visible");
}

function hideError() {
  errorEl.classList.remove("visible");
}

function showStatus() {
  statusEl.classList.add("visible");
  setTimeout(() => statusEl.classList.remove("visible"), 2000);
}

function hideStatus() {
  statusEl.classList.remove("visible");
}

/** Force-sync textarea with current store data */
export function syncJsonEditor() {
  if (textarea) {
    textarea.value = JSON.stringify(store.getData(), null, 2);
  }
}
