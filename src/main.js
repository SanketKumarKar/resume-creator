/**
 * main.js
 * App entry point — wires everything together.
 */

import "./style.css";
import "./templates.css";
import { store } from "./resumeStore.js";
import { renderResume } from "./templateRenderer.js";
import { initJsonEditor, syncJsonEditor } from "./jsonEditor.js";
import { initFormEditor } from "./formEditor.js";
import { checkAiStatus, identifyProfession } from "./aiClient.js";
import { exportToPdf } from "./pdfExport.js";
import { initTemplateLibrary } from "./templateLibrary.js";

// ─── State ───────────────────────────────────────────────────────────────────

let currentMode = "form"; // 'form' | 'json'
let currentTemplate = "classic";
let templateLibraryApi = null;

// ─── DOM References ──────────────────────────────────────────────────────────

const editorBody = document.getElementById("editor-body");
const resumePaper = document.getElementById("resume-paper");
const modeFormBtn = document.getElementById("mode-form");
const modeJsonBtn = document.getElementById("mode-json");
const templateSelect = document.getElementById("template-select");
const exportPdfBtn = document.getElementById("export-pdf");
const bulkUploadBtn = document.getElementById("bulk-upload-json");
const aiStatusDot = document.getElementById("ai-status-dot");
const aiStatusText = document.getElementById("ai-status-text");
const toastContainer = document.getElementById("toast-container");
const autoDetectBtn = document.getElementById("auto-detect-template");
const templateLibrary = document.getElementById("template-library");

// ─── Initialize ──────────────────────────────────────────────────────────────

function init() {
  // Render initial preview
  updatePreview();

  if (templateLibrary) {
    void initTemplateLibrary(templateLibrary, handleTemplateGallerySelect)
      .then((api) => {
        templateLibraryApi = api;
        templateLibraryApi.setActiveTemplate(currentTemplate);
      })
      .catch((error) => {
        console.error("Template library failed to load:", error);
        templateLibrary.innerHTML = `<div class="template-library__empty">Unable to load template previews.</div>`;
      });
  }

  // Set up editor (default: form mode)
  switchMode("form");

  // Listen for store changes → update preview
  store.onChange(() => updatePreview());

  // Mode toggle
  modeFormBtn.addEventListener("click", () => switchMode("form"));
  modeJsonBtn.addEventListener("click", () => switchMode("json"));

  // Template select
  templateSelect.addEventListener("change", (e) => {
    setCurrentTemplate(e.target.value);
  });

  // Export PDF
  exportPdfBtn.addEventListener("click", handleExportPdf);

  // Bulk Upload JSON
  if (bulkUploadBtn) {
    bulkUploadBtn.addEventListener("change", handleBulkUpload);
  }

  // Auto-detect template button
  if (autoDetectBtn) {
    autoDetectBtn.addEventListener("click", handleAutoDetect);
  }

  // Check AI status
  checkAndDisplayAiStatus();

  // Periodically re-check AI status
  setInterval(checkAndDisplayAiStatus, 30000);
}

// ─── Mode Switching ──────────────────────────────────────────────────────────

let currentCleanup = null;

function setCurrentTemplate(templateKey, { syncSelect = true } = {}) {
  currentTemplate = templateKey;
  if (syncSelect) {
    templateSelect.value = templateKey;
  }
  if (templateLibraryApi) {
    templateLibraryApi.setActiveTemplate(templateKey);
  }
  updatePreview();
}

function handleTemplateGallerySelect(templateKey) {
  setCurrentTemplate(templateKey);
}

function switchMode(mode) {
  currentMode = mode;

  // Update toggle buttons
  modeFormBtn.classList.toggle("active", mode === "form");
  modeJsonBtn.classList.toggle("active", mode === "json");

  if (currentCleanup) {
    currentCleanup();
    currentCleanup = null;
  }

  // Clear and re-init editor
  editorBody.innerHTML = "";

  if (mode === "json") {
    currentCleanup = initJsonEditor(editorBody);
  } else {
    currentCleanup = initFormEditor(editorBody);
  }
}

// ─── Preview Rendering ──────────────────────────────────────────────────────

function updatePreview() {
  const data = store.getDataRef();
  const html = renderResume(data, currentTemplate);

  // Update template class on paper
  resumePaper.className = `resume-paper template-${currentTemplate}`;
  resumePaper.innerHTML = html;

  // Reset explicit height to measure natural content height
  resumePaper.style.minHeight = '297mm';

  // Wait for layout to update to measure sizes
  requestAnimationFrame(() => {
    // 210mm is exactly the width of the paper. We use it to get mm to px ratio safely
    const widthPx = resumePaper.offsetWidth;
    const pxPerMm = widthPx / 210;
    const pageHeightPx = 297 * pxPerMm;

    // Use scrollHeight to see the actual content length
    const contentHeight = resumePaper.scrollHeight;

    // Calculate how many pages we need, adding a 2px tolerance for float rounding
    const pages = Math.max(1, Math.ceil((contentHeight - 2) / pageHeightPx));

    // Force the paper min-height to snap to a multiple of A4 pages
    // so sidebars stretch perfectly to the bottom of the last page.
    resumePaper.style.minHeight = `${pages * 297}mm`;
  });
}

// ─── PDF Export ──────────────────────────────────────────────────────────────

async function handleExportPdf() {
  const btn = exportPdfBtn;
  const originalText = btn.innerHTML;
  btn.innerHTML = "⏳ Generating...";
  btn.disabled = true;

  try {
    const data = store.getDataRef();
    const name = data.personal_info?.full_name || "resume";
    const filename = name.replace(/[^a-z0-9]/gi, "_").toLowerCase();
    await exportToPdf(resumePaper, filename);
    showToast("PDF downloaded!", "success");
  } catch (err) {
    console.error("PDF export error:", err);
    showToast("Failed to export PDF", "error");
  } finally {
    btn.innerHTML = originalText;
    btn.disabled = false;
  }
}

// ─── Bulk JSON Upload ────────────────────────────────────────────────────────

async function handleBulkUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = async (e) => {
    try {
      const data = JSON.parse(e.target.result);
      if (!Array.isArray(data)) {
        showToast("Uploaded JSON must be an array of resumes", "error");
        return;
      }

      showToast(`Starting bulk export of ${data.length} resumes...`, "info");
      
      const originalData = store.getDataRef();
      const originalTemplate = currentTemplate;
      
      for (let i = 0; i < data.length; i++) {
        const resumeData = data[i];
        
        // Handle optional embedded template override if provided in json
        if (resumeData._template && templateSelect.querySelector(`option[value="${resumeData._template}"]`)) {
          setCurrentTemplate(resumeData._template);
        } else {
          setCurrentTemplate(originalTemplate);
        }
        
        store.setData(resumeData);
        // Wait for render to complete and DOM layout to settle
        await new Promise(resolve => setTimeout(resolve, 800)); 
        
        const name = resumeData.personal_info?.full_name || `resume_${i+1}`;
        const filename = name.replace(/[^a-z0-9]/gi, "_").toLowerCase();
        
        showToast(`Exporting ${i+1}/${data.length}: ${filename}...`, "info");
        await exportToPdf(resumePaper, filename);
      }
      
      setCurrentTemplate(originalTemplate);
      store.setData(originalData);
      switchMode(currentMode); // Reset editor state
      showToast("Bulk export completed!", "success");
      
    } catch (err) {
      console.error("Bulk upload error:", err);
      showToast("Invalid JSON file", "error");
    } finally {
      // Clear input so the same file can be uploaded again
      event.target.value = "";
    }
  };
  reader.readAsText(file);
}

// ─── AI Auto-Detect Template ─────────────────────────────────────────────────

async function handleAutoDetect() {
  const btn = autoDetectBtn;
  if (!btn) return;

  const originalHTML = btn.innerHTML;
  btn.innerHTML = "⏳ Detecting...";
  btn.disabled = true;

  try {
    const data = store.getDataRef();
    const result = await identifyProfession(data);
    
    if (result?.template) {
      setCurrentTemplate(result.template);
      
      const confidenceEmoji = result.confidence === "high" ? "🎯" : result.confidence === "medium" ? "✓" : "~";
      showToast(`${confidenceEmoji} Template set: ${getTemplateName(currentTemplate)} — ${result.reason || ""}`, "success");
    } else {
      showToast("Could not determine best template", "error");
    }
  } catch (err) {
    console.error("Auto-detect error:", err);
    showToast(`Auto-detect failed: ${err.message}`, "error");
  } finally {
    btn.innerHTML = originalHTML;
    btn.disabled = false;
  }
}

function getTemplateName(key) {
  const names = {
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
  return names[key] || key;
}

// ─── AI Status ───────────────────────────────────────────────────────────────

async function checkAndDisplayAiStatus() {
  const available = await checkAiStatus();
  aiStatusDot.className = `ai-status__dot ${available ? "online" : "offline"}`;
  aiStatusText.textContent = available ? "Gemma4 Online" : "AI Offline";

  // Show/hide the auto-detect button based on AI availability
  if (autoDetectBtn) {
    autoDetectBtn.style.display = available ? "" : "none";
  }
}

// ─── Toast Notifications ─────────────────────────────────────────────────────

export function showToast(message, type = "info") {
  const toast = document.createElement("div");
  toast.className = `toast toast--${type}`;
  toast.textContent = message;
  toastContainer.appendChild(toast);

  // Auto-remove after animation
  setTimeout(() => {
    if (toast.parentNode) toast.parentNode.removeChild(toast);
  }, 3200);
}

// ─── Start ───────────────────────────────────────────────────────────────────

init();
