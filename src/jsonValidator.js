/**
 * jsonValidator.js
 * Standalone resume JSON schema validator.
 * Returns structured errors and warnings for field-level feedback.
 */

/**
 * Validate a resume data object against the expected schema.
 * @param {any} data - The parsed resume JSON
 * @returns {{ valid: boolean, errors: string[], warnings: string[] }}
 */
export function validateResumeJson(data) {
  const errors = [];
  const warnings = [];

  if (!data || typeof data !== "object" || Array.isArray(data)) {
    errors.push("Root value must be a JSON object { ... }");
    return { valid: false, errors, warnings };
  }

  // ─── personal_info ───────────────────────────────────────────────────────
  if (data.personal_info !== undefined) {
    if (typeof data.personal_info !== "object" || Array.isArray(data.personal_info)) {
      errors.push("personal_info must be an object");
    } else {
      const pi = data.personal_info;
      if (!pi.full_name && !pi.email) {
        warnings.push("personal_info: at least full_name or email is recommended");
      }
      if (pi.email && typeof pi.email !== "string") {
        errors.push("personal_info.email must be a string");
      }
      if (pi.phone && typeof pi.phone !== "string") {
        errors.push("personal_info.phone must be a string");
      }
      if (pi.photoUrl && typeof pi.photoUrl !== "string") {
        errors.push("personal_info.photoUrl must be a string (URL or base64)");
      }
    }
  } else {
    warnings.push("personal_info is missing — name and contact info won't render");
  }

  // ─── summary / objective ────────────────────────────────────────────────
  if (data.summary !== undefined && data.summary !== null && typeof data.summary !== "string") {
    errors.push("summary must be a string");
  }
  if (data.objective !== undefined && data.objective !== null && typeof data.objective !== "string") {
    errors.push("objective must be a string");
  }

  // ─── work_experience ─────────────────────────────────────────────────────
  if (data.work_experience !== undefined) {
    if (!Array.isArray(data.work_experience)) {
      errors.push("work_experience must be an array");
    } else {
      data.work_experience.forEach((job, i) => {
        if (typeof job !== "object" || Array.isArray(job)) {
          errors.push(`work_experience[${i}] must be an object`);
          return;
        }
        if (!job.job_title) warnings.push(`work_experience[${i}]: job_title is missing`);
        if (!job.company) warnings.push(`work_experience[${i}]: company is missing`);
        if (job.responsibilities !== undefined && !Array.isArray(job.responsibilities)) {
          errors.push(`work_experience[${i}].responsibilities must be an array`);
        }
        if (job.achievements !== undefined && !Array.isArray(job.achievements)) {
          errors.push(`work_experience[${i}].achievements must be an array`);
        }
      });
    }
  }

  // ─── education ───────────────────────────────────────────────────────────
  if (data.education !== undefined) {
    if (!Array.isArray(data.education)) {
      errors.push("education must be an array");
    } else {
      data.education.forEach((edu, i) => {
        if (typeof edu !== "object" || Array.isArray(edu)) {
          errors.push(`education[${i}] must be an object`);
          return;
        }
        if (!edu.degree && !edu.field_of_study) {
          warnings.push(`education[${i}]: degree and field_of_study are both missing`);
        }
        if (!edu.institution) warnings.push(`education[${i}]: institution is missing`);
      });
    }
  }

  // ─── technical_skills ────────────────────────────────────────────────────
  if (data.technical_skills !== undefined) {
    if (typeof data.technical_skills !== "object" || Array.isArray(data.technical_skills)) {
      errors.push("technical_skills must be an object (not an array)");
    } else {
      const validKeys = [
        "programming_languages", "frameworks_libraries", "databases",
        "cloud_platforms", "tools_software", "operating_systems",
        "methodologies", "other",
      ];
      Object.entries(data.technical_skills).forEach(([key, val]) => {
        if (!Array.isArray(val)) {
          errors.push(`technical_skills.${key} must be an array of strings`);
        } else if (!validKeys.includes(key)) {
          warnings.push(`technical_skills.${key} is an unrecognized category key`);
        }
      });
    }
  }

  // ─── soft_skills ─────────────────────────────────────────────────────────
  if (data.soft_skills !== undefined && !Array.isArray(data.soft_skills)) {
    errors.push("soft_skills must be an array of strings");
  }

  // ─── projects ────────────────────────────────────────────────────────────
  if (data.projects !== undefined) {
    if (!Array.isArray(data.projects)) {
      errors.push("projects must be an array");
    } else {
      data.projects.forEach((p, i) => {
        if (typeof p !== "object" || Array.isArray(p)) {
          errors.push(`projects[${i}] must be an object`);
          return;
        }
        if (!p.name) warnings.push(`projects[${i}]: name is missing`);
        if (p.technologies_used !== undefined && !Array.isArray(p.technologies_used)) {
          errors.push(`projects[${i}].technologies_used must be an array`);
        }
      });
    }
  }

  // ─── certifications ──────────────────────────────────────────────────────
  if (data.certifications !== undefined) {
    if (!Array.isArray(data.certifications)) {
      errors.push("certifications must be an array");
    } else {
      data.certifications.forEach((c, i) => {
        if (typeof c !== "object" || Array.isArray(c)) {
          errors.push(`certifications[${i}] must be an object`);
          return;
        }
        if (!c.name) warnings.push(`certifications[${i}]: name is missing`);
      });
    }
  }

  // ─── awards_honors ───────────────────────────────────────────────────────
  if (data.awards_honors !== undefined && !Array.isArray(data.awards_honors)) {
    errors.push("awards_honors must be an array");
  }

  // ─── languages ───────────────────────────────────────────────────────────
  if (data.languages !== undefined) {
    if (!Array.isArray(data.languages)) {
      errors.push("languages must be an array");
    } else {
      data.languages.forEach((l, i) => {
        if (typeof l !== "object" || Array.isArray(l)) {
          errors.push(`languages[${i}] must be an object`);
        } else if (!l.language) {
          warnings.push(`languages[${i}]: language name is missing`);
        }
      });
    }
  }

  // ─── volunteer_experience ────────────────────────────────────────────────
  if (data.volunteer_experience !== undefined && !Array.isArray(data.volunteer_experience)) {
    errors.push("volunteer_experience must be an array");
  }

  if (data.extracurricular_activities !== undefined && !Array.isArray(data.extracurricular_activities)) {
    errors.push("extracurricular_activities must be an array");
  }
  if (data.interests_hobbies !== undefined && !Array.isArray(data.interests_hobbies)) {
    errors.push("interests_hobbies must be an array");
  }
  if (data.references !== undefined && !Array.isArray(data.references)) {
    errors.push("references must be an array");
  }
  if (data.additional_sections !== undefined && (typeof data.additional_sections !== "object" || Array.isArray(data.additional_sections))) {
    errors.push("additional_sections must be an object");
  }

  // ─── publications ────────────────────────────────────────────────────────
  if (data.publications !== undefined && !Array.isArray(data.publications)) {
    errors.push("publications must be an array");
  }

  // ─── Unknown top-level keys ──────────────────────────────────────────────
  const knownKeys = [
    "personal_info", "summary", "objective", "work_experience", "education",
    "technical_skills", "soft_skills", "projects", "certifications",
    "awards_honors", "languages", "volunteer_experience", "publications",
    "extracurricular_activities", "interests_hobbies", "references", "additional_sections",
  ];
  Object.keys(data).forEach((key) => {
    if (!knownKeys.includes(key)) {
      warnings.push(`Unknown top-level key: "${key}" (will be ignored by renderer)`);
    }
  });

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}
