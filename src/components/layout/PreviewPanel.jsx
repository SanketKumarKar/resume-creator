import React, { useEffect } from "react";
import { renderResume } from "../../templateRenderer.js";

export default function PreviewPanel({ resume, template, previewRef }) {
  useEffect(() => {
    if (!previewRef.current) return;
    const html = renderResume(resume, template);
    previewRef.current.className = `resume-paper template-${template}`;
    previewRef.current.innerHTML = html;
    previewRef.current.style.minHeight = "297mm";

    requestAnimationFrame(() => {
      const widthPx = previewRef.current?.offsetWidth || 0;
      const pxPerMm = widthPx / 210 || 1;
      const pageHeightPx = 297 * pxPerMm;
      const contentHeight = previewRef.current?.scrollHeight || 0;
      const pages = Math.max(1, Math.ceil((contentHeight - 2) / pageHeightPx));
      if (previewRef.current) {
        previewRef.current.style.minHeight = `${pages * 297}mm`;
      }
    });
  }, [previewRef, resume, template]);

  return (
    <section className="preview-panel">
      <div className="preview-panel__header">
        <span className="preview-panel__title">Live Preview</span>
      </div>
      <div className="preview-panel__body">
        <div ref={previewRef} className={`resume-paper template-${template}`} />
      </div>
    </section>
  );
}
