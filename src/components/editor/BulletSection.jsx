import React from "react";

export default function BulletSection({
  label,
  basePath,
  bullets,
  aiAvailable,
  onAddBullet,
  onRemoveBullet,
  onMoveBullet,
  onFieldChange,
  onEnhance,
  dragState,
  onDragStart,
  onDrop,
}) {
  return (
    <div className="form-group">
      <div className="section-inline-header">
        <label>{label}</label>
        <div className="section-inline-actions">
          {aiAvailable ? (
            <button className="ai-inline-btn" type="button" onClick={onEnhance}>
              ✨ AI Enhance<span className="spinner" />
            </button>
          ) : null}
          <button className="btn--add btn--add-inline" type="button" onClick={() => onAddBullet(basePath)}>
            + Add Bullet
          </button>
        </div>
      </div>
      <div className="bullet-list">
        {bullets.map((bullet, index) => {
          const isDragging = dragState?.kind === "bullet" && dragState.path === basePath && dragState.index === index;

          return (
            <div
              key={`${basePath}-${index}`}
              className={`bullet-item ${isDragging ? "is-dragging" : ""}`}
              draggable
              onDragStart={() => onDragStart("bullet", basePath, index)}
              onDragOver={(event) => event.preventDefault()}
              onDrop={() => onDrop("bullet", basePath, index)}
            >
              <span className="bullet-item__marker">•</span>
              <input
                type="text"
                value={bullet}
                onChange={(event) => onFieldChange(`${basePath}.${index}`, event.target.value)}
                placeholder="Bullet point..."
              />
              <div className="bullet-item__controls">
                <button className="bullet-item__move" type="button" onClick={() => onMoveBullet(basePath, index, index - 1)} aria-label="Move bullet up">↑</button>
                <button className="bullet-item__move" type="button" onClick={() => onMoveBullet(basePath, index, index + 1)} aria-label="Move bullet down">↓</button>
                <button className="bullet-item__remove" type="button" onClick={() => onRemoveBullet(basePath, index)}>✕</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
