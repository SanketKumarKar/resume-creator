const OLLAMA_URL = process.env.OLLAMA_URL || "http://localhost:11434/api/generate";
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "gemma4";

/**
 * Check if Ollama is running and available.
 * @returns {Promise<boolean>}
 */
export async function checkOllamaAvailable() {
  try {
    const res = await fetch("http://localhost:11434/api/tags", {
      method: "GET",
      signal: AbortSignal.timeout(3000),
    });
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * Call Ollama with a system prompt and user prompt.
 * Returns the parsed JSON response or raw text.
 *
 * @param {string} systemPrompt
 * @param {string} userPrompt
 * @param {object} [opts]
 * @param {boolean} [opts.json=true] - Whether to request JSON format
 * @param {number} [opts.temperature=0.3] - Temperature for generation
 * @returns {Promise<object|string>}
 */
export async function callOllama(systemPrompt, userPrompt, opts = {}) {
  const { json = true, temperature = 0.3 } = opts;

  const requestBody = {
    model: OLLAMA_MODEL,
    system: systemPrompt,
    prompt: userPrompt,
    stream: false,
    options: {
      temperature,
      seed: 42,
      top_k: 10,
      top_p: 0.9,
      num_ctx: 8192,
    },
  };

  // If json is true, we will parse the response locally instead of forcing Ollama's format="json"
  // which can cause reasoning models to cram their thoughts into a "thought" JSON key.


  const response = await fetch(OLLAMA_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    throw new Error(`Ollama responded with status: ${response.status}`);
  }

  const result = await response.json();
  const text = (result.response || "").trim();

  if (json) {
    return parseJsonResponse(text);
  }
  return text;
}

/**
 * Robust JSON parser — handles markdown fences, trailing commas, etc.
 */
function parseJsonResponse(text) {
  // Strip <think>...</think> blocks common in reasoning models
  let cleaned = text.replace(/<think>[\s\S]*?<\/think>/gi, "").trim();

  // Try to find a JSON markdown block first
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
    // Try array format
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
    throw new Error("Failed to parse Ollama JSON response");
  }
}
