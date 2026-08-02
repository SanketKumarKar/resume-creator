import React, { useEffect, useMemo, useRef, useState } from "react";
import { store } from "../resumeStore.js";
import { checkAiStatus, identifyProfession, parseResumeWithAi, enhanceBullets, generateSummary, enhanceDescription, suggestSkills } from "../aiClient.js";
import { exportToPdf } from "../pdfExport.js";
import { validateResumeJson } from "../jsonValidator.js";
import AppToolbar from "../components/layout/AppToolbar.jsx";
import FormEditor from "../components/editor/FormEditor.jsx";
import JsonEditor from "../components/editor/JsonEditor.jsx";
import PreviewPanel from "../components/layout/PreviewPanel.jsx";
import {
  createEmptyResume,
  emptyItemTemplates,
  normalizeResumeData,
  normalizeUploadPayload,
  readPath,
  safeParseJson,
  splitCsv,
  swapArrayItem,
  writePath,
} from "../utils/resumeUtils.js";

function App() {
  const [mode, setMode] = useState("form");
  const [template, setTemplate] = useState("classic");
  const [resume, setResume] = useState(() => normalizeResumeData(store.getDataRef()));
  const [jsonText, setJsonText] = useState(() => JSON.stringify(store.getDataRef(), null, 2));
  const [jsonErrors, setJsonErrors] = useState([]);
  const [jsonWarnings, setJsonWarnings] = useState([]);
  const [jsonStatus, setJsonStatus] = useState("Valid JSON — preview updated");
  const [aiAvailable, setAiAvailable] = useState(false);
  const [toast, setToast] = useState(null);
  const [bulkBusy, setBulkBusy] = useState(false);
  const [dragState, setDragState] = useState(null);
  const previewRef = useRef(null);
  const jsonSyncingRef = useRef(false);
  const toastTimerRef = useRef(null);

  useEffect(() => {
    const unsubscribe = store.onChange((nextData) => {
      const normalized = normalizeResumeData(nextData);
      setResume(normalized);
      jsonSyncingRef.current = true;
      setJsonText(JSON.stringify(normalized, null, 2));
    });

    void checkAiStatus().then((available) => setAiAvailable(Boolean(available)));
    const intervalId = window.setInterval(() => {
      void checkAiStatus().then((available) => setAiAvailable(Boolean(available)));
    }, 30000);

    return () => {
      unsubscribe();
      window.clearInterval(intervalId);
      if (toastTimerRef.current) {
        window.clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (jsonSyncingRef.current) {
      jsonSyncingRef.current = false;
      return;
    }

    const parsed = safeParseJson(jsonText);
    if (!parsed.ok) {
      setJsonErrors([parsed.error]);
      setJsonWarnings([]);
      setJsonStatus("Invalid JSON");
      return;
    }

    const normalized = Array.isArray(parsed.value) ? normalizeResumeData(parsed.value[0]) : normalizeResumeData(parsed.value);
    const validation = validateResumeJson(normalized);
    setJsonErrors(validation.errors);
    setJsonWarnings(validation.warnings);
    setJsonStatus(validation.valid ? "Valid JSON — preview updated" : "JSON has issues");
    setResume(normalized);
    store.setData(normalized);
  }, [jsonText]);

  const validationSummary = useMemo(() => {
    if (jsonErrors.length === 0 && jsonWarnings.length === 0) {
      return "No issues found";
    }
    return `${jsonErrors.length} error${jsonErrors.length === 1 ? "" : "s"}, ${jsonWarnings.length} warning${jsonWarnings.length === 1 ? "" : "s"}`;
  }, [jsonErrors.length, jsonWarnings.length]);

  function showToast(message, type = "info") {
    if (toastTimerRef.current) {
      window.clearTimeout(toastTimerRef.current);
    }

    setToast({ message, type });
    toastTimerRef.current = window.setTimeout(() => {
      setToast(null);
    }, 3000);
  }

  function commitResume(nextResume) {
    const normalized = normalizeResumeData(nextResume);
    setResume(normalized);
    store.setData(normalized);
    jsonSyncingRef.current = true;
    setJsonText(JSON.stringify(normalized, null, 2));
  }

  function updateField(path, value) {
    const next = structuredClone(resume);
    writePath(next, path, value);
    commitResume(next);
  }

  function updateCsvField(path, value) {
    updateField(path, splitCsv(value));
  }

  function handleSectionChange(path, value, type) {
    if (type === "csv") {
      updateCsvField(path, value);
      return;
    }
    updateField(path, value || null);
  }

  function handleAddItem(section) {
    const next = structuredClone(resume);
    next[section] = [...(next[section] || []), structuredClone(emptyItemTemplates[section] || {})];
    commitResume(next);
  }

  function handleRemoveItem(section, index) {
    const next = structuredClone(resume);
    next[section] = (next[section] || []).filter((_, currentIndex) => currentIndex !== index);
    commitResume(next);
  }

  function handleMoveItem(section, fromIndex, toIndex) {
    const items = resume[section] || [];
    if (toIndex < 0 || toIndex >= items.length) return;
    const next = structuredClone(resume);
    next[section] = swapArrayItem(items, fromIndex, toIndex);
    commitResume(next);
  }

  function handleAddBullet(basePath) {
    const next = structuredClone(resume);
    const bullets = readPath(next, basePath) || [];
    writePath(next, basePath, [...bullets, ""]);
    commitResume(next);
  }

  function handleRemoveBullet(basePath, index) {
    const next = structuredClone(resume);
    const bullets = readPath(next, basePath) || [];
    writePath(next, basePath, bullets.filter((_, currentIndex) => currentIndex !== index));
    commitResume(next);
  }

  function handleMoveBullet(basePath, fromIndex, toIndex) {
    const bullets = readPath(resume, basePath) || [];
    if (toIndex < 0 || toIndex >= bullets.length) return;
    const next = structuredClone(resume);
    writePath(next, basePath, swapArrayItem(bullets, fromIndex, toIndex));
    commitResume(next);
  }

  async function handleExportPdf() {
    const name = resume.personal_info?.full_name || "resume";
    const filename = name.replace(/[^a-z0-9]/gi, "_").toLowerCase();
    await exportToPdf(previewRef.current, filename);
    showToast("PDF downloaded!", "success");
  }

  async function handleBulkUpload(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    setBulkBusy(true);
    try {
      const rawText = await file.text();
      const parsed = JSON.parse(rawText);
      const resumes = normalizeUploadPayload(parsed);

      if (!resumes.length) {
        showToast("Uploaded JSON must contain one or more resume objects", "error");
        return;
      }

      showToast(`Starting bulk export of ${resumes.length} resumes...`, "info");
      const originalResume = normalizeResumeData(store.getDataRef());
      const originalTemplate = template;

      for (let index = 0; index < resumes.length; index += 1) {
        const nextResume = resumes[index];
        const nextTemplate = nextResume._template || originalTemplate;
        setTemplate(nextTemplate);
        commitResume(nextResume);
        await new Promise((resolve) => window.requestAnimationFrame(() => window.requestAnimationFrame(resolve)));
        const name = nextResume.personal_info?.full_name || `resume_${index + 1}`;
        const filename = name.replace(/[^a-z0-9]/gi, "_").toLowerCase();
        showToast(`Exporting ${index + 1}/${resumes.length}: ${filename}...`, "info");
        await exportToPdf(previewRef.current, filename);
      }

      setTemplate(originalTemplate);
      commitResume(originalResume);
      showToast("Bulk export completed!", "success");
    } catch (error) {
      console.error("Bulk upload error:", error);
      showToast("Invalid JSON file", "error");
    } finally {
      setBulkBusy(false);
      event.target.value = "";
    }
  }

  async function handleAutoDetect() {
    try {
      const result = await identifyProfession(resume);
      if (!result?.template) {
        throw new Error("No template detected");
      }
      setTemplate(result.template);
      showToast(`Detected ${result.template.replace("prof-", "")} template`, "success");
    } catch (error) {
      console.error("Auto-detect error:", error);
      showToast("Could not detect profession template", "error");
    }
  }

  async function handleAiSummary() {
    const summary = await generateSummary(resume);
    updateField("summary", summary);
    showToast("Summary generated!", "success");
  }

  async function handleAiSuggestSkills() {
    const suggestions = await suggestSkills(resume);
    const next = structuredClone(resume);
    const tech = next.technical_skills || {};
    for (const [category, skills] of Object.entries(suggestions)) {
      if (category === "soft_skills") {
        next.soft_skills = [...new Set([...(next.soft_skills || []), ...skills])];
      } else if (Array.isArray(tech[category])) {
        tech[category] = [...new Set([...(tech[category] || []), ...skills])];
      }
    }
    next.technical_skills = tech;
    commitResume(next);
    showToast("Skills suggested and added!", "success");
  }

  async function handleAiEnhanceDescription(path) {
    const description = readPath(resume, path);
    if (!description) {
      showToast("No description to enhance", "error");
      return;
    }
    const enhanced = await enhanceDescription(description);
    updateField(path, enhanced);
    showToast("Description enhanced!", "success");
  }

  async function handleAiEnhanceBullets(section, index, fieldName) {
    const item = resume[section]?.[index];
    const bullets = item?.[fieldName] || [];
    if (!bullets.length) {
      showToast("No bullets to enhance", "error");
      return;
    }

    const enhanced = await enhanceBullets(bullets, item.job_title, item.company);
    if (enhanced.length) {
      const next = structuredClone(resume);
      next[section][index][fieldName] = enhanced;
      commitResume(next);
      showToast(`${fieldName} enhanced!`, "success");
    }
  }

  function handleFieldDragStart(kind, path, index) {
    setDragState({ kind, path, index });
  }

  function handleFieldDrop(kind, path, index) {
    if (!dragState || dragState.kind !== kind || dragState.path !== path || dragState.index === index) {
      setDragState(null);
      return;
    }

    if (kind === "section") {
      handleMoveItem(path, dragState.index, index);
    } else {
      handleMoveBullet(path, dragState.index, index);
    }

    setDragState(null);
  }

  return (
    <div className="app-shell">
      <AppToolbar
        mode={mode}
        template={template}
        aiAvailable={aiAvailable}
        bulkBusy={bulkBusy}
        onModeChange={setMode}
        onTemplateChange={setTemplate}
        onAutoDetect={handleAutoDetect}
        onBulkUpload={handleBulkUpload}
        onExportPdf={handleExportPdf}
        onResetSample={() => commitResume(createEmptyResume())}
      />

      <main className="main-content">
        <aside className="editor-panel">
          <div className="editor-panel__header">
            <h1 className="editor-panel__title">Resume Editor</h1>
          </div>

          <div className="editor-panel__body">
            {mode === "json" ? (
              <JsonEditor
                value={jsonText}
                onChange={(event) => setJsonText(event.target.value)}
                status={jsonStatus}
                validationSummary={validationSummary}
                errors={jsonErrors}
                warnings={jsonWarnings}
                onValidate={() => {
                  const parsed = safeParseJson(jsonText);
                  if (!parsed.ok) {
                    showToast(parsed.error, "error");
                    return;
                  }
                  const normalized = Array.isArray(parsed.value) ? normalizeResumeData(parsed.value[0]) : normalizeResumeData(parsed.value);
                  const validation = validateResumeJson(normalized);
                  setJsonErrors(validation.errors);
                  setJsonWarnings(validation.warnings);
                  setJsonStatus(validation.valid ? "Valid JSON — preview updated" : "JSON has issues");
                  showToast(validation.valid ? "JSON is valid" : "JSON has issues", validation.valid && validation.warnings.length === 0 ? "success" : validation.valid ? "info" : "error");
                }}
                onParseWithAi={async () => {
                  const parsed = safeParseJson(jsonText);
                  if (!parsed.ok) {
                    showToast(parsed.error, "error");
                    return;
                  }
                  const text = typeof parsed.value === "string" ? parsed.value : JSON.stringify(parsed.value);
                  const aiParsed = await parseResumeWithAi(text);
                  commitResume(aiParsed);
                  showToast("Resume parsed successfully!", "success");
                }}
              />
            ) : (
              <FormEditor
                resume={resume}
                aiAvailable={aiAvailable}
                onFieldChange={handleSectionChange}
                onAddItem={handleAddItem}
                onRemoveItem={handleRemoveItem}
                onMoveItem={handleMoveItem}
                onAddBullet={handleAddBullet}
                onRemoveBullet={handleRemoveBullet}
                onMoveBullet={handleMoveBullet}
                onEnhanceBullets={handleAiEnhanceBullets}
                onEnhanceDescription={handleAiEnhanceDescription}
                onGenerateSummary={handleAiSummary}
                onSuggestSkills={handleAiSuggestSkills}
                onDragStart={handleFieldDragStart}
                onDrop={handleFieldDrop}
                dragState={dragState}
              />
            )}
          </div>
        </aside>

        <PreviewPanel resume={resume} template={template} previewRef={previewRef} />
      </main>

      {toast ? <div className={`toast toast--${toast.type}`}>{toast.message}</div> : null}
    </div>
  );
}

export default App;
