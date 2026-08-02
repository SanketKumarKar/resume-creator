import React, { useState } from "react";

export default function Section({ title, icon, children }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className={`form-section ${collapsed ? "collapsed" : ""}`}>
      <div className="form-section__header" onClick={() => setCollapsed((current) => !current)}>
        <div className="form-section__title">
          <span className="form-section__icon">{icon}</span> {title}
        </div>
        <span className="form-section__toggle">▾</span>
      </div>
      <div className="form-section__body">{children}</div>
    </div>
  );
}
