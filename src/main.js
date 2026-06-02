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
import { checkAiStatus } from "./aiClient.js";
import { exportToPdf } from "./pdfExport.js";

// ─── State ───────────────────────────────────────────────────────────────────

let currentMode = "form"; // 'form' | 'json'
let currentTemplate = "classic"; // 'classic' | 'modern' | 'minimal'

// ─── DOM References ──────────────────────────────────────────────────────────

const editorBody = document.getElementById("editor-body");
const resumePaper = document.getElementById("resume-paper");
const modeFormBtn = document.getElementById("mode-form");
const modeJsonBtn = document.getElementById("mode-json");
const templateSelect = document.getElementById("template-select");
const exportPdfBtn = document.getElementById("export-pdf");
const aiStatusDot = document.getElementById("ai-status-dot");
const aiStatusText = document.getElementById("ai-status-text");
const toastContainer = document.getElementById("toast-container");

// ─── Initialize ──────────────────────────────────────────────────────────────

function init() {
  // Render initial preview
  updatePreview();

  // Set up editor (default: form mode)
  switchMode("form");

  // Listen for store changes → update preview
  store.onChange(() => updatePreview());

  // Mode toggle
  modeFormBtn.addEventListener("click", () => switchMode("form"));
  modeJsonBtn.addEventListener("click", () => switchMode("json"));

  // Template select
  templateSelect.addEventListener("change", (e) => {
    currentTemplate = e.target.value;
    updatePreview();
  });

  // Export PDF
  exportPdfBtn.addEventListener("click", handleExportPdf);

  // Check AI status
  checkAndDisplayAiStatus();

  // Periodically re-check AI status
  setInterval(checkAndDisplayAiStatus, 30000);
}

// ─── Mode Switching ──────────────────────────────────────────────────────────

function switchMode(mode) {
  currentMode = mode;

  // Update toggle buttons
  modeFormBtn.classList.toggle("active", mode === "form");
  modeJsonBtn.classList.toggle("active", mode === "json");

  // Clear and re-init editor
  editorBody.innerHTML = "";

  if (mode === "json") {
    initJsonEditor(editorBody);
  } else {
    initFormEditor(editorBody);
  }
}

// ─── Preview Rendering ──────────────────────────────────────────────────────

function updatePreview() {
  const data = store.getDataRef();
  const html = renderResume(data, currentTemplate);

  // Update template class on paper
  resumePaper.className = `resume-paper template-${currentTemplate}`;
  resumePaper.innerHTML = html;
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

// ─── AI Status ───────────────────────────────────────────────────────────────

async function checkAndDisplayAiStatus() {
  const available = await checkAiStatus();
  aiStatusDot.className = `ai-status__dot ${available ? "online" : "offline"}`;
  aiStatusText.textContent = available ? "Gemma4 Online" : "AI Offline";
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
