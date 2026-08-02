import React from "react";

export default function Field({ label, path, value, onChange, placeholder = "", type = "text" }) {
  return (
    <div className="form-group">
      <label>{label}</label>
      <input
        type="text"
        value={value || ""}
        onChange={(event) => onChange(path, event.target.value, type)}
        placeholder={placeholder}
      />
    </div>
  );
}
