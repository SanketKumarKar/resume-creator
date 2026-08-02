import React from "react";
import ValidationList from "./ValidationList.jsx";

export default function JsonEditor({ value, onChange, status, validationSummary, errors, warnings, onValidate, onParseWithAi }) {
  return (
    <div className="json-editor">
      <div className="json-editor__toolbar">
        <button className="btn btn--ai" type="button" onClick={onParseWithAi}>✨ Parse with AI</button>
        <button className="btn btn--secondary" type="button" onClick={onValidate}>🔍 Validate JSON</button>
      </div>
      <textarea
        className="json-editor__textarea"
        spellCheck={false}
        value={value}
        onChange={onChange}
        placeholder="Paste your resume JSON here..."
      />
      <div className={`json-editor__error ${errors.length ? "visible" : ""}`}>{errors.length ? `❌ ${errors[0]}` : ""}</div>
      <div className="json-editor__status visible">✓ {status} · {validationSummary}</div>
      <div className={`json-validation-panel ${errors.length || warnings.length ? "visible" : ""}`}>
        {errors.length ? <ValidationList title="Errors" items={errors} tone="errors" /> : null}
        {warnings.length ? <ValidationList title="Warnings" items={warnings} tone="warnings" /> : null}
      </div>
    </div>
  );
}
