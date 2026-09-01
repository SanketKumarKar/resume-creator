/**
 * aiClient.js
 * Frontend API client for Gemini or local Ollama AI features.
 */

const API_BASE = "/api";

let _aiAvailable = null;

/**
 * Check whether the configured AI backend is available.
 * The backend selects Gemini when GEMINI_API_KEY is configured; otherwise it uses Ollama.
 */
export async function checkAiStatus() {
  try {
    const res = await fetch(`${API_BASE}/ai/status`);
    if (!res.ok) {
      _aiAvailable = false;
      return false;
    }
    const data = await res.json();
    _aiAvailable = Boolean(data.available);
    return _aiAvailable;
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

/**
 * Parse an unstructured resume using AI.
 * @param {string} rawContent
 * @returns {Promise<object>}
 */
export async function parseResumeWithAi(rawContent) {
  const res = await fetch(`${API_BASE}/ai/parse-resume`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ rawContent }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Failed to parse resume with AI");
  }

  return await res.json();
}

/**
 * Identify profession and suggest best template using AI.
 * Falls back to a client-side keyword heuristic if AI is unavailable or fails.
 * @param {object} resumeData
 * @returns {Promise<{ template: string, confidence: string, reason: string }>}
 */
export async function identifyProfession(resumeData) {
  try {
    const res = await fetch(`${API_BASE}/ai/identify-profession`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ resumeData }),
    });

    if (!res.ok) {
      throw new Error(`Server error ${res.status}`);
    }

    const data = await res.json();
    if (data.error) throw new Error(data.error);
    return data;
  } catch (err) {
    // Client-side fallback: keyword heuristic (no AI needed)
    console.warn("AI profession detection failed, using client heuristic:", err.message);
    return clientHeuristicTemplate(resumeData);
  }
}

/**
 * Client-side keyword heuristic — maps job title / summary keywords to template keys.
 * Never throws. Always returns a result.
 */
function clientHeuristicTemplate(data) {
  const text = [
    ...(data.work_experience || []).map(j => `${j.job_title || ""} ${j.company || ""}`),
    data.summary || "",
    data.objective || "",
    ...Object.values(data.technical_skills || {}).flat(),
    ...(data.soft_skills || []),
  ].join(" ").toLowerCase();

  if (/\b(nurse|nursing|rn|lpn|clinical|healthcare|medical|hospital|patient care)\b/.test(text))
    return { template: "prof-nurse", confidence: "low", reason: "Keyword match: nursing/healthcare" };
  if (/\b(teacher|professor|instructor|tutor|educator|classroom|curriculum|pedagogy|adjunct)\b/.test(text))
    return { template: "prof-teacher", confidence: "low", reason: "Keyword match: education/teaching" };
  if (/\b(accountant|accounting|auditor|cpa|cfa|finance manager|tax|bookkeeping|financial analyst|controller)\b/.test(text))
    return { template: "prof-accountant", confidence: "low", reason: "Keyword match: finance/accounting" };
  if (/\b(sales executive|account executive|account manager|business development|quota|revenue|crm|pipeline)\b/.test(text))
    return { template: "prof-sales", confidence: "low", reason: "Keyword match: sales/business development" };
  if (/\b(customer service|support agent|call center|help desk|client relations|customer success)\b/.test(text))
    return { template: "prof-customer-service", confidence: "low", reason: "Keyword match: customer service" };
  if (/\b(mechanical engineer|civil engineer|electrical engineer|chemical engineer|structural engineer|manufacturing)\b/.test(text))
    return { template: "prof-engineer", confidence: "low", reason: "Keyword match: engineering discipline" };
  if (/\b(developer|software engineer|programmer|devops|frontend|backend|fullstack|full.stack|data scientist|machine learning|ml|qa engineer)\b/.test(text))
    return { template: "prof-developer", confidence: "low", reason: "Keyword match: software development" };

  return { template: "classic", confidence: "low", reason: "No specific profession detected, using classic" };
}
