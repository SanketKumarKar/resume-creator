const GEMINI_API_KEY = process.env.GEMINI_API_KEY?.trim();
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";
const GEMINI_API_VERSION = process.env.GEMINI_API_VERSION || "v1beta";

/**
 * Return Gemini configuration status without making an API request.
 * A configured Gemini key always takes priority over the local provider.
 * @returns {{available: boolean, model: string | null}}
 */
export function checkGeminiAvailable() {
  return { available: Boolean(GEMINI_API_KEY), model: GEMINI_API_KEY ? GEMINI_MODEL : null };
}

/**
 * Call Gemini API with a system prompt and user prompt.
 * Returns the parsed JSON response or raw text.
 *
 * @param {string} systemPrompt
 * @param {string} userPrompt
 * @param {object} [opts]
 * @param {boolean} [opts.json=true] - Whether to request JSON format
 * @param {number} [opts.temperature=0.3] - Temperature for generation
 * @returns {Promise<object|string>}
 */
export async function callGeminiAPI(systemPrompt, userPrompt, opts = {}) {
  if (!GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not configured in environment variables.");
  }

  const { json = true, temperature = 0.3 } = opts;

  const url = `https://generativelanguage.googleapis.com/${GEMINI_API_VERSION}/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

  const requestBody = {
    contents: [
      {
        role: "user",
        parts: [
          { text: `${systemPrompt}\n\n${userPrompt}` },
        ],
      },
    ],
    generationConfig: {
      temperature,
      topP: 0.95,
      topK: 40,
    },
  };

  if (json) {
    requestBody.generationConfig.responseMimeType = "application/json";
  }

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini API responded with status ${response.status}: ${errorText}`);
  }

  const result = await response.json();
  const text = result.candidates?.[0]?.content?.parts?.[0]?.text || "";

  if (json) {
    return parseJsonResponse(text);
  }
  return text;
}

/**
 * Robust JSON parser — handles markdown fences, trailing commas, etc.
 */
function parseJsonResponse(text) {
  let cleaned = text.trim();

  // Strip markdown code block markers
  const match = cleaned.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (match && match[1]) {
    cleaned = match[1].trim();
  }

  try {
    return JSON.parse(cleaned);
  } catch {
    // Try extracting between first { and last }
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");
    if (start >= 0 && end > start) {
      const candidate = cleaned.slice(start, end + 1);
      try {
        return JSON.parse(candidate);
      } catch {
        // Try array format
      }
    }
    const arrStart = cleaned.indexOf("[");
    const arrEnd = cleaned.lastIndexOf("]");
    if (arrStart >= 0 && arrEnd > arrStart) {
      const candidate = cleaned.slice(arrStart, arrEnd + 1);
      try {
        return JSON.parse(candidate);
      } catch {
        // fall through
      }
    }
    throw new Error("Failed to parse Gemini JSON response");
  }
}

export { GEMINI_API_KEY, GEMINI_MODEL };