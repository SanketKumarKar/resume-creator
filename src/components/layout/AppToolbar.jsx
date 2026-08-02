import React from "react";
import { templateOptions } from "../../utils/resumeUtils.js";

export default function AppToolbar({
  mode,
  template,
  aiAvailable,
  bulkBusy,
  onModeChange,
  onTemplateChange,
  onAutoDetect,
  onBulkUpload,
  onExportPdf,
  onResetSample,
}) {
  return (
    <header className="toolbar">
      <div className="toolbar__brand">
        <span className="toolbar__logo">ResumeForge</span>
        <span className="toolbar__version">v2.0 React</span>
      </div>
      <div className="toolbar__center">
        <div className="mode-toggle">
          <button className={`mode-toggle__btn ${mode === "form" ? "active" : ""}`} onClick={() => onModeChange("form")}>Form</button>
          <button className={`mode-toggle__btn ${mode === "json" ? "active" : ""}`} onClick={() => onModeChange("json")}>JSON</button>
        </div>
        <div className="template-select">
          <select value={template} onChange={(event) => onTemplateChange(event.target.value)}>
            {templateOptions.map((option) => (
              <option key={option} value={option}>{option.replace("prof-", "profession: ").replace(/[-_]/g, " ")}</option>
            ))}
          </select>
        </div>
        <button className="btn btn--ai btn--sm" onClick={onAutoDetect} disabled={!aiAvailable}>🤖 Auto-Detect</button>
        <div className="ai-status">
          <span className={`ai-status__dot ${aiAvailable ? "online" : "offline"}`}></span>
          <span>{aiAvailable ? "AI Engine: Ready" : "AI Engine: Offline"}</span>
        </div>
      </div>
      <div className="toolbar__actions">
        <button className="btn btn--ghost btn--sm" onClick={onResetSample}>Reset Sample</button>
        <label className="btn btn--secondary" htmlFor="bulk-upload-json" style={{ cursor: "pointer" }}>
          📂 Bulk Upload JSON
        </label>
        <input id="bulk-upload-json" type="file" accept=".json" onChange={onBulkUpload} style={{ display: "none" }} />
        <button className="btn btn--primary" onClick={onExportPdf} disabled={bulkBusy}>📄 Export PDF</button>
      </div>
    </header>
  );
}
