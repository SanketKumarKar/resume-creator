import { Router } from "express";
import { callAI, getAIStatus } from "./aiAdapter.js";

const router = Router();

// ─── Health Check ────────────────────────────────────────────────────────────

router.get("/ai/status", async (req, res) => {
  const status = await getAIStatus();
  res.json({
    available: status.available,
    provider: status.provider,
    model: status.model,
    gemini: status.gemini,
    ollama: status.ollama,
  });
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

    const result = await callAI(systemPrompt, userPrompt);
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

    const result = await callAI(systemPrompt, userPrompt);
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

    const result = await callAI(systemPrompt, userPrompt);
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

    const result = await callAI(systemPrompt, userPrompt);
    res.json({ suggested_skills: result.suggested_skills || {} });
  } catch (err) {
    console.error("Suggest skills error:", err.message);
    res.status(500).json({ error: err.message });
  }
});
// ─── Parse Resume ─────────────────────────────────────────────────────────────

router.post("/ai/parse-resume", async (req, res) => {
  try {
    const { rawContent } = req.body;

    if (!rawContent) {
      return res.status(400).json({ error: "rawContent is required" });
    }

    const systemPrompt = `You are an expert resume parser and writer. Your job is to extract, clean, and map unstructured resume text or JSON into the specific JSON schema provided.

RULES:
- Fix grammatical errors and rewrite bullet points to be ATS-friendly.
- Do NOT hallucinate. Do not invent any experience, metrics, jobs, skills, or schools that are not present in the input.
- Map any photo URL found to "personal_info.photoUrl".
- Maintain the original meaning.
- Start each work experience bullet with a strong action verb in the past tense (unless it's a current role).
- CRITICAL: Output ONLY raw JSON. Do NOT wrap your output in markdown code blocks (e.g. \`\`\`json). The response must start precisely with { and end with }.

SCHEMA TO FOLLOW STRICTLY (Return ONLY valid JSON matching this structure):
{
  "personal_info": {
    "full_name": "string",
    "email": "string",
    "phone": "string",
    "city": "string",
    "state": "string",
    "country": "string",
    "linkedin": "string",
    "github": "string",
    "portfolio": "string",
    "photoUrl": "string or null"
  },
  "summary": "string",
  "education": [
    {
      "degree": "string",
      "field_of_study": "string",
      "institution": "string",
      "start_date": "string",
      "end_date": "string",
      "gpa": "string"
    }
  ],
  "work_experience": [
    {
      "job_title": "string",
      "company": "string",
      "location": "string",
      "start_date": "string",
      "end_date": "string",
      "is_current": true,
      "responsibilities": ["string"],
      "achievements": ["string"]
    }
  ],
  "technical_skills": {
    "programming_languages": ["string"],
    "frameworks_libraries": ["string"],
    "databases": ["string"],
    "cloud_platforms": ["string"],
    "tools_software": ["string"],
    "operating_systems": ["string"],
    "methodologies": ["string"],
    "other": ["string"]
  },
  "soft_skills": ["string"],
  "projects": [
    {
      "name": "string",
      "description": "string",
      "technologies_used": ["string"],
      "url": "string",
      "github_link": "string"
    }
  ],
  "certifications": [
    {
      "name": "string",
      "issuing_organization": "string",
      "issue_date": "string"
    }
  ],
  "awards_honors": [
    {
      "title": "string",
      "date": "string",
      "issuer": "string",
      "description": "string"
    }
  ],
  "languages": [
    {
      "language": "string",
      "proficiency": "string"
    }
  ]
}`;

    const userPrompt = `Parse and improve the following resume data. 

IMPORTANT INSTRUCTION: Return ONLY the raw JSON object. Do NOT wrap your response in markdown code blocks like \`\`\`json. The very first character of your response MUST be { and the last must be }.

Resume Data:
${rawContent.substring(0, 15000)}`;

    const result = await callAI(systemPrompt, userPrompt);
    res.json(result);
  } catch (err) {
    console.error("Parse resume error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// ─── Identify Profession / Auto-Select Template ─────────────────────────────

const VALID_TEMPLATES = [
  "classic", "modern", "minimal", "photo",
  "prof-developer", "prof-teacher", "prof-customer-service",
  "prof-accountant", "prof-sales", "prof-nurse", "prof-engineer",
];

/**
 * Keyword heuristic fallback — no AI needed.
 */
function heuristicTemplateFromData(data) {
  const text = [
    ...(data.work_experience || []).map(j => `${j.job_title || ""} ${j.company || ""}`),
    data.summary || "",
    data.objective || "",
    ...Object.values(data.technical_skills || {}).flat(),
    ...(data.soft_skills || []),
  ].join(" ").toLowerCase();

  if (/\b(nurse|nursing|rn|lpn|clinical|healthcare|medical|hospital|patient care)\b/.test(text)) return "prof-nurse";
  if (/\b(teacher|professor|instructor|tutor|educator|classroom|curriculum|pedagogy|adjunct)\b/.test(text)) return "prof-teacher";
  if (/\b(accountant|accounting|auditor|cpa|cfa|finance manager|tax|bookkeeping|financial analyst|controller)\b/.test(text)) return "prof-accountant";
  if (/\b(sales executive|account executive|account manager|business development|quota|revenue target|crm|pipeline|closing)\b/.test(text)) return "prof-sales";
  if (/\b(customer service|support agent|call center|help desk|client relations|customer success)\b/.test(text)) return "prof-customer-service";
  if (/\b(mechanical engineer|civil engineer|electrical engineer|chemical engineer|structural engineer|systems engineer|manufacturing)\b/.test(text)) return "prof-engineer";
  if (/\b(developer|software engineer|programmer|devops|frontend|backend|fullstack|full.stack|data scientist|machine learning|ml engineer|qa engineer|sre|site reliability)\b/.test(text)) return "prof-developer";
  return "classic";
}

router.post("/ai/identify-profession", async (req, res) => {
  const { resumeData } = req.body;
  if (!resumeData) {
    return res.status(400).json({ error: "resumeData is required" });
  }

  const jobTitles = (resumeData.work_experience || []).map(j => j.job_title || "").filter(Boolean).join(", ") || "Not specified";
  const context = buildResumeContext(resumeData);

  const systemPrompt = `You are a resume analyst. Return ONLY a valid JSON object, no markdown, no explanation.
Pick the best template key for the candidate from this list:
classic, modern, minimal, photo, prof-developer, prof-teacher, prof-customer-service, prof-accountant, prof-sales, prof-nurse, prof-engineer

JSON format: {"template":"<key>","confidence":"high","reason":"one sentence"}`;

  const userPrompt = `Job titles: ${jobTitles}
Summary: ${resumeData.summary || resumeData.objective || "N/A"}
${context}
Return JSON:`;

  // Layer 1: Try AI with JSON parsing
  try {
    const result = await callAI(systemPrompt, userPrompt);
    if (result && VALID_TEMPLATES.includes(result.template)) {
      return res.json({
        template: result.template,
        confidence: result.confidence || "medium",
        reason: result.reason || `AI matched template: ${result.template}`,
      });
    }
    // Got a result but template key wasn't valid — scan values
    if (result) {
      const blob = JSON.stringify(result).toLowerCase();
      const found = VALID_TEMPLATES.find(t => blob.includes(t));
      if (found) {
        return res.json({ template: found, confidence: "medium", reason: `AI suggested: ${found}` });
      }
    }
  } catch (_jsonErr) {
    // Layer 2: JSON parse failed — get raw text and scan for template key
    try {
      const rawText = await callAI(systemPrompt, userPrompt, { json: false });
      const lower = rawText.toLowerCase();
      const found = VALID_TEMPLATES.find(t => lower.includes(t));
      if (found) {
        return res.json({ template: found, confidence: "medium", reason: `Extracted from AI response` });
      }
    } catch (_rawErr) {
      // fall through to heuristic
    }
  }

  // Layer 3: Pure keyword heuristic — never fails
  const template = heuristicTemplateFromData(resumeData);
  res.json({
    template,
    confidence: "low",
    reason: `Matched by keyword heuristic (job title: ${jobTitles})`,
  });
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
