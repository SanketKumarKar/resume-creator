/**
 * resumeStore.js
 * Central reactive data store for resume JSON.
 * Emits 'change' events whenever data is updated.
 */

import { sampleResumeData } from "./sampleData.js";

class ResumeStore {
  constructor() {
    this._data = structuredClone(sampleResumeData);
    this._listeners = new Set();
  }

  /** Get a deep clone of the current resume data */
  getData() {
    return structuredClone(this._data);
  }

  /** Get a direct reference (for read-only perf-sensitive rendering) */
  getDataRef() {
    return this._data;
  }

  /** Replace the entire resume data */
  setData(newData) {
    this._data = structuredClone(newData);
    this._notify();
  }

  /** Update a top-level field */
  setField(path, value) {
    const keys = path.split(".");
    let obj = this._data;
    for (let i = 0; i < keys.length - 1; i++) {
      const key = isNaN(keys[i]) ? keys[i] : parseInt(keys[i]);
      if (obj[key] === undefined || obj[key] === null) {
        obj[key] = {};
      }
      obj = obj[key];
    }
    const lastKey = isNaN(keys[keys.length - 1])
      ? keys[keys.length - 1]
      : parseInt(keys[keys.length - 1]);
    obj[lastKey] = value;
    this._notify();
  }

  /** Subscribe to data changes */
  onChange(listener) {
    this._listeners.add(listener);
    return () => this._listeners.delete(listener);
  }

  /** Notify all listeners */
  _notify() {
    for (const fn of this._listeners) {
      try {
        fn(this._data);
      } catch (err) {
        console.error("Store listener error:", err);
      }
    }
  }

  /** Reset to sample data */
  reset() {
    this._data = structuredClone(sampleResumeData);
    this._notify();
  }

  /** Load from raw JSON string */
  loadFromJson(jsonStr) {
    const parsed = JSON.parse(jsonStr); // may throw
    this._data = parsed;
    this._notify();
  }
}

export const store = new ResumeStore();
