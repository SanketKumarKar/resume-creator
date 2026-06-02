/**
 * aiClient.js
 * Frontend API client for Ollama/Gemma4 AI features.
 */

const API_BASE = "/api";

let _aiAvailable = null;

/**
 * Check if the AI backend (Ollama) is available.
 * Caches the result for 30 seconds.
 */
export async function checkAiStatus() {
  try {
    const res = await fetch(`${API_BASE}/ai/status`);
    if (!res.ok) {
      _aiAvailable = false;
      return false;
    }
    const data = await res.json();
    _aiAvailable = data.available;
    return data.available;
  } catch {
    _aiAvailable = false;
    return false;
  }
}

export function isAiAvailable() {
  return _aiAvailable;
}

/**
 * Enhance bullet points using AI.
 * @param {string[]} bullets
 * @param {string} [jobTitle]
 * @param {string} [company]
 * @returns {Promise<string[]>}
 */
export async function enhanceBullets(bullets, jobTitle, company) {
  const res = await fetch(`${API_BASE}/ai/enhance-bullets`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ bullets, jobTitle, company }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Failed to enhance bullets");
  }

  const data = await res.json();
  return data.enhanced_bullets || [];
}

/**
 * Generate a professional summary using AI.
 * @param {object} resumeData
 * @returns {Promise<string>}
 */
export async function generateSummary(resumeData) {
  const res = await fetch(`${API_BASE}/ai/generate-summary`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ resumeData }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Failed to generate summary");
  }

  const data = await res.json();
  return data.summary || "";
}

/**
 * Enhance a description using AI.
 * @param {string} description
 * @param {string} [context]
 * @returns {Promise<string>}
 */
export async function enhanceDescription(description, context) {
  const res = await fetch(`${API_BASE}/ai/enhance-description`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ description, context }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Failed to enhance description");
  }

  const data = await res.json();
  return data.enhanced_description || "";
}

/**
 * Suggest skills based on resume content.
 * @param {object} resumeData
 * @returns {Promise<object>}
 */
export async function suggestSkills(resumeData) {
  const res = await fetch(`${API_BASE}/ai/suggest-skills`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ resumeData }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Failed to suggest skills");
  }

  const data = await res.json();
  return data.suggested_skills || {};
}
