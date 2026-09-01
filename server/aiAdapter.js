import { checkOllamaAvailable, callOllama, OLLAMA_MODEL } from "./ollamaService.js";
import { checkGeminiAvailable, callGeminiAPI, GEMINI_MODEL } from "./geminiService.js";

function usesGemini() {
  return checkGeminiAvailable().available;
}

/**
 * Get the configured AI provider and its availability.
 * Gemini is selected whenever GEMINI_API_KEY is non-empty; otherwise Ollama is used.
 */
export async function getAIStatus() {
  const gemini = checkGeminiAvailable();

  if (gemini.available) {
    return {
      available: true,
      provider: "gemini",
      model: GEMINI_MODEL,
      gemini,
      ollama: { available: false, model: OLLAMA_MODEL },
    };
  }

  const ollamaAvailable = await checkOllamaAvailable();
  return {
    available: ollamaAvailable,
    provider: "ollama",
    model: OLLAMA_MODEL,
    gemini,
    ollama: { available: ollamaAvailable, model: OLLAMA_MODEL },
  };
}

/**
 * Call Gemini when GEMINI_API_KEY is configured; otherwise call local Ollama.
 */
export async function callAI(systemPrompt, userPrompt, opts = {}) {
  if (usesGemini()) {
    return callGeminiAPI(systemPrompt, userPrompt, opts);
  }

  return callOllama(systemPrompt, userPrompt, opts);
}

export async function isAIAvailable(provider = "auto") {
  if (provider === "gemini") return checkGeminiAvailable().available;
  if (provider === "ollama") return checkOllamaAvailable();
  return (await getAIStatus()).available;
}
