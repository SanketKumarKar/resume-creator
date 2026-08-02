import { sampleResumeData } from "../sampleData.js";

export const templateOptions = [
  "classic",
  "modern",
  "minimal",
  "photo",
  "prof-developer",
  "prof-teacher",
  "prof-customer-service",
  "prof-accountant",
  "prof-sales",
  "prof-nurse",
  "prof-engineer",
];

export const emptyItemTemplates = {
  work_experience: {
    job_title: null,
    company: null,
    location: null,
    start_date: null,
    end_date: null,
    is_current: false,
    responsibilities: [],
    achievements: [],
  },
  education: {
    degree: null,
    field_of_study: null,
    institution: null,
    location: null,
    start_date: null,
    end_date: null,
    gpa: null,
    honors: null,
    relevant_coursework: [],
  },
  projects: {
    name: null,
    description: null,
    technologies_used: [],
    start_date: null,
    end_date: null,
    url: null,
    github_link: null,
  },
  certifications: {
    name: null,
    issuing_organization: null,
    issue_date: null,
    expiry_date: null,
    credential_id: null,
    url: null,
  },
  awards_honors: {
    title: null,
    issuer: null,
    date: null,
    description: null,
  },
  languages: {
    language: null,
    proficiency: null,
  },
  volunteer_experience: {
    role: null,
    organization: null,
    start_date: null,
    end_date: null,
    description: null,
  },
};

export function createEmptyResume() {
  return structuredClone(sampleResumeData);
}

export function normalizeResumeData(input) {
  if (!input || typeof input !== "object") {
    return structuredClone(sampleResumeData);
  }

  if (Array.isArray(input)) {
    return input.length ? normalizeResumeData(input[0]) : structuredClone(sampleResumeData);
  }

  let data = input;

  if (!data.personal_info && data.data && typeof data.data === "object") {
    data = data.data;
  } else if (!data.personal_info && data.resume && typeof data.resume === "object") {
    data = data.resume;
  }

  const normalized = {
    ...structuredClone(sampleResumeData),
    ...structuredClone(data),
  };

  normalized.personal_info = {
    ...structuredClone(sampleResumeData.personal_info),
    ...(data.personal_info || {}),
  };

  normalized.technical_skills = {
    ...structuredClone(sampleResumeData.technical_skills),
    ...(data.technical_skills || {}),
  };

  for (const key of [
    "education",
    "work_experience",
    "projects",
    "certifications",
    "awards_honors",
    "languages",
    "volunteer_experience",
    "publications",
    "soft_skills",
  ]) {
    if (Array.isArray(data[key])) {
      normalized[key] = structuredClone(data[key]);
    }
  }

  normalized.summary = data.summary ?? normalized.summary ?? null;
  normalized.objective = data.objective ?? normalized.objective ?? null;

  return normalized;
}

export function normalizeUploadPayload(rawPayload) {
  if (Array.isArray(rawPayload)) {
    return rawPayload.flatMap((item) => normalizeUploadPayload(item));
  }

  if (!rawPayload || typeof rawPayload !== "object") {
    return [];
  }

  if (Array.isArray(rawPayload.resumes)) {
    return rawPayload.resumes.flatMap((item) => normalizeUploadPayload(item));
  }

  if (Array.isArray(rawPayload.data) && rawPayload.data.every((item) => item && typeof item === "object")) {
    return rawPayload.data.flatMap((item) => normalizeUploadPayload(item));
  }

  if (rawPayload.personal_info || rawPayload.work_experience || rawPayload.education || rawPayload.summary || rawPayload.objective) {
    return [normalizeResumeData(rawPayload)];
  }

  if (rawPayload.data && typeof rawPayload.data === "object") {
    return normalizeUploadPayload(rawPayload.data);
  }

  if (rawPayload.resume && typeof rawPayload.resume === "object") {
    return normalizeUploadPayload(rawPayload.resume);
  }

  return [];
}

export function splitCsv(value) {
  return String(value || "")
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
}

export function swapArrayItem(array, fromIndex, toIndex) {
  const next = array.slice();
  const [item] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, item);
  return next;
}

export function safeParseJson(value) {
  try {
    return { ok: true, value: JSON.parse(value) };
  } catch (error) {
    return { ok: false, error: error.message };
  }
}

export function readPath(obj, path) {
  return path.split(".").reduce((current, part) => {
    if (current == null) return current;
    const key = Number.isNaN(Number(part)) ? part : Number(part);
    return current[key];
  }, obj);
}

export function writePath(obj, path, value) {
  const parts = path.split(".");
  let current = obj;
  for (let index = 0; index < parts.length - 1; index += 1) {
    const key = Number.isNaN(Number(parts[index])) ? parts[index] : Number(parts[index]);
    if (current[key] === undefined || current[key] === null) {
      current[key] = Number.isNaN(Number(parts[index + 1])) ? {} : [];
    }
    current = current[key];
  }
  const lastKey = Number.isNaN(Number(parts[parts.length - 1])) ? parts[parts.length - 1] : Number(parts[parts.length - 1]);
  current[lastKey] = value;
}
