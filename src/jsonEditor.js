/**
 * jsonEditor.js
 * JSON textarea input mode — paste/edit raw JSON.
 * Includes schema validation panel and AI parse support.
 */

import { store } from "./resumeStore.js";
import { parseResumeWithAi } from "./aiClient.js";
import { showToast } from "./main.js";
import { validateResumeJson } from "./jsonValidator.js";

let textarea = null;
let errorEl = null;
let statusEl = null;
let validationPanel = null;
let debounceTimer = null;
let aiParseBtn = null;
let validateBtn = null;

/** Initialize the JSON editor into a container */
export function initJsonEditor(container) {
  container.innerHTML = `
    <div class="json-editor">
      <div class="json-editor__toolbar">
        <button id="json-ai-parse" class="btn btn--ai">✨ Parse with AI</button>
        <button id="json-validate-btn" class="btn btn--secondary">🔍 Validate JSON</button>
      </div>
      <textarea
        id="json-textarea"
        class="json-editor__textarea"
        spellcheck="false"
        placeholder="Paste your resume JSON or text here..."
      ></textarea>
      <div id="json-error" class="json-editor__error"></div>
      <div id="json-status" class="json-editor__status">✓ Valid JSON — preview updated</div>
      <div id="json-validation-panel" class="json-validation-panel"></div>
    </div>
  `;

  textarea = container.querySelector("#json-textarea");
  errorEl = container.querySelector("#json-error");
  statusEl = container.querySelector("#json-status");
  validationPanel = container.querySelector("#json-validation-panel");
  aiParseBtn = container.querySelector("#json-ai-parse");
  validateBtn = container.querySelector("#json-validate-btn");

  // Set initial content from store
  textarea.value = JSON.stringify(store.getData(), null, 2);

  // Listen for edits
  textarea.addEventListener("input", () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(parseAndUpdate, 400);
  });

  // AI Parse Button Click
  aiParseBtn.addEventListener("click", handleAiParse);

  // Validate Button Click
  validateBtn.addEventListener("click", handleValidate);

  // Listen for store changes from other sources (form editor, AI)
  const unsub = store.onChange(() => {
    // Only update if textarea is NOT focused (to avoid fighting with user typing)
    if (document.activeElement !== textarea) {
      if (textarea) textarea.value = JSON.stringify(store.getDataRef(), null, 2);
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

  return unsub;
}

async function handleAiParse() {
  const rawContent = textarea.value.trim();
  if (!rawContent) {
    showError("Please paste some text or JSON first.");
    return;
  }

  const loader = document.getElementById("ai-loader-overlay");
  loader.classList.remove("hidden");
  
  try {
    const parsedData = await parseResumeWithAi(rawContent);
    store.setData(parsedData);
    showStatus();
    showToast("Resume parsed successfully!", "success");
    // Auto-validate after AI parse
    renderValidationPanel(validateResumeJson(parsedData));
  } catch (err) {
    console.error("AI Parse Error:", err);
    showError(err.message || "Failed to parse resume with AI");
  } finally {
    loader.classList.add("hidden");
  }
}

function handleValidate() {
  const raw = textarea.value.trim();
  if (!raw) {
    showError("Nothing to validate — paste JSON first.");
    return;
  }

  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch (err) {
    showError(`JSON Syntax Error: ${err.message}`);
    renderValidationPanel({ valid: false, errors: [`JSON syntax error: ${err.message}`], warnings: [] });
    return;
  }

  hideError();
  const result = validateResumeJson(parsed);
  renderValidationPanel(result);

  if (result.valid && result.warnings.length === 0) {
    showToast("✓ JSON is valid with no issues!", "success");
  } else if (result.valid) {
    showToast(`JSON is valid with ${result.warnings.length} warning(s)`, "info");
  } else {
    showToast(`JSON has ${result.errors.length} error(s) — check validation panel`, "error");
  }
}

function renderValidationPanel(result) {
  if (!validationPanel) return;

  if (!result) {
    validationPanel.innerHTML = "";
    validationPanel.classList.remove("visible");
    return;
  }

  const { valid, errors, warnings } = result;
  const totalIssues = errors.length + warnings.length;

  let html = `
    <div class="validation-header">
      <span class="validation-status ${valid ? "valid" : "invalid"}">
        ${valid ? "✓ Schema Valid" : "✗ Schema Invalid"}
      </span>
      <span class="validation-counts">
        ${errors.length > 0 ? `<span class="val-count errors">${errors.length} error${errors.length !== 1 ? "s" : ""}</span>` : ""}
        ${warnings.length > 0 ? `<span class="val-count warnings">${warnings.length} warning${warnings.length !== 1 ? "s" : ""}</span>` : ""}
        ${totalIssues === 0 ? `<span class="val-count ok">No issues found</span>` : ""}
      </span>
    </div>
  `;

  if (errors.length > 0) {
    html += `<div class="validation-section">
      <div class="validation-section__title">❌ Errors (will break rendering)</div>
      <ul class="validation-list validation-list--errors">
        ${errors.map(e => `<li>${escHtml(e)}</li>`).join("")}
      </ul>
    </div>`;
  }

  if (warnings.length > 0) {
    html += `<div class="validation-section">
      <div class="validation-section__title">⚠️ Warnings (data may be incomplete)</div>
      <ul class="validation-list validation-list--warnings">
        ${warnings.map(w => `<li>${escHtml(w)}</li>`).join("")}
      </ul>
    </div>`;
  }

  if (totalIssues === 0) {
    html += `<div class="validation-ok">All fields look good! 🎉</div>`;
  }

  validationPanel.innerHTML = html;
  validationPanel.classList.add("visible");
}

function escHtml(text) {
  const map = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" };
  return String(text).replace(/[&<>"']/g, (s) => map[s]);
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
