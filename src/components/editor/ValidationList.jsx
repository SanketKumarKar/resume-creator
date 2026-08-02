import React from "react";

export default function ValidationList({ title, items, tone }) {
  return (
    <div className="validation-section">
      <div className="validation-section__title">{title}</div>
      <ul className={`validation-list validation-list--${tone}`}>
        {items.map((item) => <li key={item}>{item}</li>)}
      </ul>
    </div>
  );
}
