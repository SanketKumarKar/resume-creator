import { Router } from "express";
import { callOllama, checkOllamaAvailable } from "./ollamaService.js";

const router = Router();

// ─── Health Check ────────────────────────────────────────────────────────────

router.get("/ai/status", async (req, res) => {
  const available = await checkOllamaAvailable();
  res.json({ available, model: process.env.OLLAMA_MODEL || "gemma4" });
});

// ─── Enhance Bullet Points ──────────────────────────────────────────────────

router.post("/ai/enhance-bullets", async (req, res) => {
  try {
    const { bullets, jobTitle, company } = req.body;

    if (!bullets || !Array.isArray(bullets) || bullets.length === 0) {
      return res.status(400).json({ error: "bullets array is required" });
    }

    const systemPrompt = `You are an expert resume writer. Your job is to rewrite resume bullet points to be more impactful, professional, and ATS-friendly.

RULES:
- Start each bullet with a strong action verb (Led, Developed, Designed, Implemented, Optimized, etc.)
- Include quantified results where possible (percentages, dollar amounts, time savings, team sizes)
- Keep bullets concise (1-2 lines max)
- Do NOT fabricate metrics — if the original has no numbers, improve the language but don't invent statistics
- Maintain the original meaning — enhance, don't change
- Use past tense for previous roles
- Return a JSON object with key "enhanced_bullets" containing an array of strings, one per input bullet, in the SAME order`;

    const userPrompt = `Enhance these resume bullet points${jobTitle ? ` for a ${jobTitle} role` : ""}${company ? ` at ${company}` : ""}:

${bullets.map((b, i) => `${i + 1}. ${b}`).join("\n")}

Return JSON: { "enhanced_bullets": ["...", "..."] }`;

    const result = await callOllama(systemPrompt, userPrompt);
    res.json({ enhanced_bullets: result.enhanced_bullets || [] });
  } catch (err) {
    console.error("Enhance bullets error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// ─── Generate Professional Summary ──────────────────────────────────────────

router.post("/ai/generate-summary", async (req, res) => {
  try {
    const { resumeData } = req.body;

    if (!resumeData) {
      return res.status(400).json({ error: "resumeData is required" });
    }

    const systemPrompt = `You are an expert resume writer. Generate a compelling, ATS-friendly professional summary paragraph.

RULES:
- Keep it to 2-4 sentences
- Highlight years of experience, key skills, and major achievements
- Use industry-standard keywords from the candidate's field
- Be specific and quantifiable where the data supports it
- Do NOT fabricate information — only use what is present in the resume data
- Return a JSON object with key "summary" containing the summary string`;

    // Build a condensed version of the resume for context
    const context = buildResumeContext(resumeData);
    const userPrompt = `Generate a professional summary for this candidate:

${context}

Return JSON: { "summary": "..." }`;

    const result = await callOllama(systemPrompt, userPrompt);
    res.json({ summary: result.summary || "" });
  } catch (err) {
    console.error("Generate summary error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// ─── Enhance Description ────────────────────────────────────────────────────

router.post("/ai/enhance-description", async (req, res) => {
  try {
    const { description, context } = req.body;

    if (!description) {
      return res.status(400).json({ error: "description is required" });
    }

    const systemPrompt = `You are an expert resume writer. Improve the given project/role description to be more professional, clear, and impactful.

RULES:
- Keep the same meaning and scope
- Make it concise but descriptive
- Use professional tone
- Include technical terms where appropriate
- Do NOT fabricate details
- Return a JSON object with key "enhanced_description" containing the improved text`;

    const userPrompt = `Improve this description${context ? ` (context: ${context})` : ""}:

"${description}"

Return JSON: { "enhanced_description": "..." }`;

    const result = await callOllama(systemPrompt, userPrompt);
    res.json({ enhanced_description: result.enhanced_description || "" });
  } catch (err) {
    console.error("Enhance description error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// ─── Suggest Skills ─────────────────────────────────────────────────────────

router.post("/ai/suggest-skills", async (req, res) => {
  try {
    const { resumeData } = req.body;

    if (!resumeData) {
      return res.status(400).json({ error: "resumeData is required" });
    }

    const systemPrompt = `You are an expert resume reviewer. Based on the candidate's work experience and projects, suggest additional relevant skills they likely have but haven't listed.

RULES:
- Only suggest skills that are strongly implied by their experience
- Categorize suggestions using: programming_languages, frameworks_libraries, databases, cloud_platforms, tools_software, methodologies, soft_skills
- Include 3-8 total suggestions across categories
- Do NOT suggest skills they already have listed
- Return a JSON object with key "suggested_skills" as an object where keys are categories and values are arrays of skill name strings`;

    const context = buildResumeContext(resumeData);
    const userPrompt = `Based on this resume, suggest missing skills:

${context}

Already listed skills: ${JSON.stringify(resumeData.technical_skills || {})}
Soft skills: ${JSON.stringify(resumeData.soft_skills || [])}

Return JSON: { "suggested_skills": { "category": ["skill1", "skill2"] } }`;

    const result = await callOllama(systemPrompt, userPrompt);
    res.json({ suggested_skills: result.suggested_skills || {} });
  } catch (err) {
    console.error("Suggest skills error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// ─── Helpers ────────────────────────────────────────────────────────────────

function buildResumeContext(data) {
  const parts = [];

  if (data.personal_info?.full_name) {
    parts.push(`Name: ${data.personal_info.full_name}`);
  }

  if (data.summary) {
    parts.push(`Current Summary: ${data.summary}`);
  }

  if (data.work_experience?.length) {
    parts.push("Work Experience:");
    data.work_experience.forEach((job) => {
      parts.push(`  - ${job.job_title || "Role"} at ${job.company || "Company"} (${job.start_date || ""} - ${job.end_date || ""})`);
      (job.responsibilities || []).forEach((r) => parts.push(`    • ${r}`));
      (job.achievements || []).forEach((a) => parts.push(`    ★ ${a}`));
    });
  }

  if (data.education?.length) {
    parts.push("Education:");
    data.education.forEach((edu) => {
      parts.push(`  - ${edu.degree || ""} in ${edu.field_of_study || ""} at ${edu.institution || ""}`);
    });
  }

  if (data.projects?.length) {
    parts.push("Projects:");
    data.projects.forEach((p) => {
      parts.push(`  - ${p.name || ""}: ${p.description || ""}`);
      if (p.technologies_used?.length) parts.push(`    Tech: ${p.technologies_used.join(", ")}`);
    });
  }

  const tech = data.technical_skills || {};
  const allSkills = Object.values(tech).flat().filter(Boolean);
  if (allSkills.length) {
    parts.push(`Technical Skills: ${allSkills.join(", ")}`);
  }

  return parts.join("\n");
}

export default router;
