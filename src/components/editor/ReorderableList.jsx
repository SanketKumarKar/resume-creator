import React from "react";

export default function ReorderableList({
  items,
  sectionKey,
  renderItem,
  onRemove,
  onMove,
  dragState,
  onDragStart,
  onDrop,
}) {
  if (!items.length) {
    return <p style={{ color: "var(--text-tertiary)", fontSize: "var(--font-sm)" }}>No items added yet.</p>;
  }

  return (
    <div className="reorderable-list">
      {items.map((item, index) => {
        const isDragging = dragState?.kind === "section" && dragState.path === sectionKey && dragState.index === index;

        return (
          <div
            key={`${sectionKey}-${index}`}
            className={`list-item ${isDragging ? "is-dragging" : ""}`}
            draggable
            onDragStart={() => onDragStart("section", sectionKey, index)}
            onDragOver={(event) => event.preventDefault()}
            onDrop={() => onDrop("section", sectionKey, index)}
          >
            <div className="list-item__header">
              <span className="list-item__number">#{index + 1}</span>
              <div className="list-item__controls">
                <button className="list-item__move" type="button" onClick={() => onMove(sectionKey, index, index - 1)} aria-label="Move up">↑</button>
                <button className="list-item__move" type="button" onClick={() => onMove(sectionKey, index, index + 1)} aria-label="Move down">↓</button>
                <button className="list-item__remove" type="button" onClick={() => onRemove(sectionKey, index)}>✕</button>
              </div>
            </div>
            {renderItem(item, index)}
          </div>
        );
      })}
    </div>
  );
}
