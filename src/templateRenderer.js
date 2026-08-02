/**
 * templateRenderer.js
 * Renders resume data into semantic, ATS-friendly HTML.
 * Supports 3 templates: classic, modern, minimal.
 */

const esc = (text) => {
  if (!text) return "";
  const map = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" };
  return String(text).replace(/[&<>"']/g, (s) => map[s]);
};

const hasContent = (arr) => Array.isArray(arr) && arr.length > 0 && arr.some((item) => {
  if (typeof item === "string") return item.trim().length > 0;
  if (typeof item === "object" && item !== null) {
    return Object.values(item).some((v) => v !== null && v !== undefined && v !== "" && !(Array.isArray(v) && v.length === 0));
  }
  return !!item;
});

const hasSkills = (tech) => {
  if (!tech) return false;
  return Object.values(tech).some((arr) => Array.isArray(arr) && arr.length > 0);
};

// ─── Shared Section Builders ─────────────────────────────────────────────────

function buildContactInfo(info) {
  const items = [];
  if (info.email) items.push(esc(info.email));
  if (info.phone) items.push(esc(info.phone));
  const location = [info.city, info.state, info.country].filter(Boolean).join(", ");
  if (location) items.push(esc(location));
  return items;
}

function buildLinks(info) {
  const links = [];
  if (info.linkedin) links.push({ label: "LinkedIn", url: info.linkedin });
  if (info.github) links.push({ label: "GitHub", url: info.github });
  if (info.portfolio) links.push({ label: "Portfolio", url: info.portfolio });
  if (info.website) links.push({ label: "Website", url: info.website });
  return links;
}

function buildExperienceHtml(jobs) {
  return jobs
    .map((job) => {
      const allBullets = [...(job.responsibilities || []), ...(job.achievements || [])];
      return `
      <div class="resume-entry">
        <div class="resume-entry-header">
          <h3>${esc(job.job_title || "")}</h3>
          <span class="resume-entry-dates">${esc(job.start_date || "")}${job.start_date || job.end_date ? " – " : ""}${esc(job.end_date || "")}</span>
        </div>
        <div class="resume-entry-subtitle">${esc(job.company || "")}${job.location ? `, ${esc(job.location)}` : ""}</div>
        ${allBullets.length > 0 ? `<ul>${allBullets.map((b) => `<li>${esc(b)}</li>`).join("")}</ul>` : ""}
      </div>`;
    })
    .join("");
}

function buildEducationHtml(education) {
  return education
    .map((edu) => {
      const degreeField = [edu.degree, edu.field_of_study].filter(Boolean).join(" in ");
      return `
      <div class="resume-entry">
        <div class="resume-entry-header">
          <h3>${esc(degreeField)}</h3>
          <span class="resume-entry-dates">${esc(edu.start_date || "")}${edu.start_date || edu.end_date ? " – " : ""}${esc(edu.end_date || "")}</span>
        </div>
        <div class="resume-entry-subtitle">${esc(edu.institution || "")}${edu.location ? `, ${esc(edu.location)}` : ""}</div>
        ${edu.gpa ? `<p style="font-size:9pt;margin-top:2px;">GPA: ${esc(edu.gpa)}${edu.honors ? ` | ${esc(edu.honors)}` : ""}</p>` : ""}
        ${hasContent(edu.relevant_coursework) ? `<p style="font-size:9pt;margin-top:2px;">Coursework: ${edu.relevant_coursework.map(esc).join(", ")}</p>` : ""}
      </div>`;
    })
    .join("");
}

function buildSkillsHtml(tech, softSkills) {
  const categories = [
    { key: "programming_languages", label: "Languages" },
    { key: "frameworks_libraries", label: "Frameworks" },
    { key: "databases", label: "Databases" },
    { key: "cloud_platforms", label: "Cloud" },
    { key: "tools_software", label: "Tools" },
    { key: "operating_systems", label: "OS" },
    { key: "methodologies", label: "Methodologies" },
    { key: "other", label: "Other" },
  ];

  const rows = categories
    .filter((c) => tech[c.key] && tech[c.key].length > 0)
    .map(
      (c) =>
        `<div class="resume-skill-row">
          <span class="resume-skill-category">${esc(c.label)}:</span>
          <span class="resume-skill-list">${tech[c.key].map(esc).join(", ")}</span>
        </div>`
    );

  if (hasContent(softSkills)) {
    rows.push(
      `<div class="resume-skill-row">
        <span class="resume-skill-category">Soft Skills:</span>
        <span class="resume-skill-list">${softSkills.map(esc).join(", ")}</span>
      </div>`
    );
  }

  return `<div class="resume-skills-grid">${rows.join("")}</div>`;
}

function buildProjectsHtml(projects) {
  return projects
    .map((p) => {
      const tech = hasContent(p.technologies_used) ? p.technologies_used.map(esc).join(", ") : "";
      return `
      <div class="resume-entry">
        <div class="resume-entry-header">
          <h3>${esc(p.name || "")}${p.github_link ? ` <a href="${esc(p.github_link)}" style="font-weight:normal;font-size:9pt;">[GitHub]</a>` : ""}${p.url ? ` <a href="${esc(p.url)}" style="font-weight:normal;font-size:9pt;">[Link]</a>` : ""}</h3>
          <span class="resume-entry-dates">${esc(p.start_date || "")}${p.start_date || p.end_date ? " – " : ""}${esc(p.end_date || "")}</span>
        </div>
        ${p.description ? `<p>${esc(p.description)}</p>` : ""}
        ${tech ? `<p style="font-size:9pt;margin-top:2px;"><strong>Tech:</strong> ${tech}</p>` : ""}
      </div>`;
    })
    .join("");
}

function buildCertificationsHtml(certs) {
  return certs
    .map(
      (c) => `
      <div class="resume-entry">
        <div class="resume-entry-header">
          <h3>${esc(c.name || "")}</h3>
          <span class="resume-entry-dates">${esc(c.issue_date || "")}</span>
        </div>
        <div class="resume-entry-subtitle">${esc(c.issuing_organization || "")}${c.credential_id ? ` | ID: ${esc(c.credential_id)}` : ""}</div>
      </div>`
    )
    .join("");
}

function buildAwardsHtml(awards) {
  return awards
    .map(
      (a) => `
      <div class="resume-entry">
        <div class="resume-entry-header">
          <h3>${esc(a.title || "")}</h3>
          <span class="resume-entry-dates">${esc(a.date || "")}</span>
        </div>
        ${a.issuer ? `<div class="resume-entry-subtitle">${esc(a.issuer)}</div>` : ""}
        ${a.description ? `<p>${esc(a.description)}</p>` : ""}
      </div>`
    )
    .join("");
}

function buildLanguagesHtml(languages) {
  return languages
    .map((l) => `<span>${esc(l.language || "")}${l.proficiency ? ` (${esc(l.proficiency)})` : ""}</span>`)
    .join(" · ");
}

function buildVolunteerHtml(volunteer) {
  return volunteer
    .map(
      (v) => `
      <div class="resume-entry">
        <div class="resume-entry-header">
          <h3>${esc(v.role || "")}</h3>
          <span class="resume-entry-dates">${esc(v.start_date || "")}${v.start_date || v.end_date ? " – " : ""}${esc(v.end_date || "")}</span>
        </div>
        <div class="resume-entry-subtitle">${esc(v.organization || "")}</div>
        ${v.description ? `<p>${esc(v.description)}</p>` : ""}
      </div>`
    )
    .join("");
}

function buildPublicationsHtml(pubs) {
  return pubs
    .map(
      (p) => `
      <div class="resume-entry">
        <div class="resume-entry-header">
          <h3>${esc(p.title || "")}${p.url ? ` <a href="${esc(p.url)}" style="font-weight:normal;font-size:9pt;">[Link]</a>` : ""}</h3>
          <span class="resume-entry-dates">${esc(p.date || "")}</span>
        </div>
        ${p.publisher ? `<div class="resume-entry-subtitle">${esc(p.publisher)}</div>` : ""}
        ${p.description ? `<p>${esc(p.description)}</p>` : ""}
      </div>`
    )
    .join("");
}

function buildFlexibleEntry(item) {
  if (item === null || item === undefined) return "";
  if (typeof item === "string") return esc(item);
  if (typeof item !== "object") return esc(String(item));

  const parts = [];
  if (item.title) parts.push(`<strong>${esc(item.title)}</strong>`);
  if (item.name && item.name !== item.title) parts.push(`<strong>${esc(item.name)}</strong>`);
  if (item.role) parts.push(esc(item.role));
  if (item.organization) parts.push(esc(item.organization));
  if (item.description) parts.push(esc(item.description));

  const remaining = Object.entries(item)
    .filter(([key, value]) => !["title", "name", "role", "organization", "description"].includes(key) && value !== null && value !== undefined && value !== "")
    .map(([key, value]) => `${esc(key.replace(/_/g, " "))}: ${Array.isArray(value) ? value.map(esc).join(", ") : esc(value)}`);

  return [...parts, ...remaining].join(" · ");
}

function buildGenericSectionHtml(title, items) {
  if (!hasContent(items)) return "";

  return `<div class="resume-section">
    <h2 class="resume-section-title">${esc(title)}</h2>
    <ul class="resume-generic-list">
      ${items.map((item) => `<li>${buildFlexibleEntry(item)}</li>`).join("")}
    </ul>
  </div>`;
}

function buildAdditionalSectionsHtml(data) {
  let html = "";

  html += buildGenericSectionHtml("Extracurricular Activities", data.extracurricular_activities);
  html += buildGenericSectionHtml("Interests & Hobbies", data.interests_hobbies);
  html += buildGenericSectionHtml("References", data.references);

  if (data.additional_sections && typeof data.additional_sections === "object" && !Array.isArray(data.additional_sections)) {
    for (const [sectionTitle, sectionValue] of Object.entries(data.additional_sections)) {
      const title = sectionTitle.replace(/_/g, " ");
      if (Array.isArray(sectionValue)) {
        html += buildGenericSectionHtml(title, sectionValue);
      } else if (sectionValue && typeof sectionValue === "object") {
        const entries = Object.entries(sectionValue)
          .map(([key, value]) => `<li><strong>${esc(key.replace(/_/g, " "))}:</strong> ${Array.isArray(value) ? value.map(esc).join(", ") : esc(value)}</li>`)
          .join("");

        if (entries) {
          html += `<div class="resume-section"><h2 class="resume-section-title">${esc(title)}</h2><ul class="resume-generic-list">${entries}</ul></div>`;
        }
      } else if (sectionValue) {
        html += `<div class="resume-section"><h2 class="resume-section-title">${esc(title)}</h2><p class="resume-summary">${esc(sectionValue)}</p></div>`;
      }
    }
  }

  return html;
}

// ═══════════════════════════════════════════════════════════════════════════
// Template: Classic
// ═══════════════════════════════════════════════════════════════════════════

function renderClassic(data) {
  const info = data.personal_info || {};
  const contact = buildContactInfo(info);
  const links = buildLinks(info);

  let html = `<div class="resume-header">
    <h1>${esc(info.full_name || "Your Name")}</h1>
    ${contact.length ? `<div class="resume-contact-row">${contact.map((c) => `<span>${c}</span>`).join("")}</div>` : ""}
    ${links.length ? `<div class="resume-contact-row resume-links-row">${links.map((l) => `<span><a href="${esc(l.url)}">${esc(l.label)}</a></span>`).join("")}</div>` : ""}
  </div>`;

  // Summary
  if (data.summary || data.objective) {
    html += `<div class="resume-section">
      <h2 class="resume-section-title">Professional Summary</h2>
      <p class="resume-summary">${esc(data.summary || data.objective)}</p>
    </div>`;
  }

  // Experience
  if (hasContent(data.work_experience)) {
    html += `<div class="resume-section">
      <h2 class="resume-section-title">Work Experience</h2>
      ${buildExperienceHtml(data.work_experience)}
    </div>`;
  }

  // Education
  if (hasContent(data.education)) {
    html += `<div class="resume-section">
      <h2 class="resume-section-title">Education</h2>
      ${buildEducationHtml(data.education)}
    </div>`;
  }

  // Skills
  if (hasSkills(data.technical_skills)) {
    html += `<div class="resume-section">
      <h2 class="resume-section-title">Technical Skills</h2>
      ${buildSkillsHtml(data.technical_skills, data.soft_skills)}
    </div>`;
  }

  // Projects
  if (hasContent(data.projects)) {
    html += `<div class="resume-section">
      <h2 class="resume-section-title">Projects</h2>
      ${buildProjectsHtml(data.projects)}
    </div>`;
  }

  // Certifications
  if (hasContent(data.certifications)) {
    html += `<div class="resume-section">
      <h2 class="resume-section-title">Certifications</h2>
      ${buildCertificationsHtml(data.certifications)}
    </div>`;
  }

  // Awards
  if (hasContent(data.awards_honors)) {
    html += `<div class="resume-section">
      <h2 class="resume-section-title">Awards & Honors</h2>
      ${buildAwardsHtml(data.awards_honors)}
    </div>`;
  }

  // Publications
  if (hasContent(data.publications)) {
    html += `<div class="resume-section">
      <h2 class="resume-section-title">Publications</h2>
      ${buildPublicationsHtml(data.publications)}
    </div>`;
  }

  // Languages
  if (hasContent(data.languages)) {
    html += `<div class="resume-section">
      <h2 class="resume-section-title">Languages</h2>
      <p>${buildLanguagesHtml(data.languages)}</p>
    </div>`;
  }

  // Volunteer
  if (hasContent(data.volunteer_experience)) {
    html += `<div class="resume-section">
      <h2 class="resume-section-title">Volunteer Experience</h2>
      ${buildVolunteerHtml(data.volunteer_experience)}
    </div>`;
  }

  return html;
}

// ═══════════════════════════════════════════════════════════════════════════
// Template: Modern (two-column sidebar)
// ═══════════════════════════════════════════════════════════════════════════

function renderModern(data) {
  const info = data.personal_info || {};
  const links = buildLinks(info);

  // ─── Sidebar ───
  let sidebar = `<h1>${esc(info.full_name || "Your Name")}</h1>`;

  // Contact in sidebar
  const contactItems = [];
  if (info.email) contactItems.push(`<span>📧 ${esc(info.email)}</span>`);
  if (info.phone) contactItems.push(`<span>📱 ${esc(info.phone)}</span>`);
  const location = [info.city, info.state].filter(Boolean).join(", ");
  if (location) contactItems.push(`<span>📍 ${esc(location)}</span>`);
  links.forEach((l) => contactItems.push(`<span><a href="${esc(l.url)}">${esc(l.label)}</a></span>`));

  if (contactItems.length) {
    sidebar += `<div class="resume-contact-col">${contactItems.join("")}</div>`;
  }

  // Skills in sidebar
  if (hasSkills(data.technical_skills)) {
    sidebar += `<div class="sidebar-section">
      <h2 class="resume-section-title">Skills</h2>
      ${buildSkillsHtml(data.technical_skills, data.soft_skills)}
    </div>`;
  }

  // Languages in sidebar
  if (hasContent(data.languages)) {
    sidebar += `<div class="sidebar-section">
      <h2 class="resume-section-title">Languages</h2>
      ${data.languages.map((l) => `<div class="sidebar-item">${esc(l.language || "")}${l.proficiency ? ` — ${esc(l.proficiency)}` : ""}</div>`).join("")}
    </div>`;
  }

  // Certifications in sidebar
  if (hasContent(data.certifications)) {
    sidebar += `<div class="sidebar-section">
      <h2 class="resume-section-title">Certifications</h2>
      ${data.certifications.map((c) => `<div class="sidebar-item"><strong>${esc(c.name || "")}</strong><br/>${esc(c.issuing_organization || "")}${c.issue_date ? ` (${esc(c.issue_date)})` : ""}</div>`).join("")}
    </div>`;
  }

  // ─── Main ───
  let main = "";

  if (data.summary || data.objective) {
    main += `<div class="resume-section">
      <h2 class="resume-section-title">About</h2>
      <p class="resume-summary">${esc(data.summary || data.objective)}</p>
    </div>`;
  }

  if (hasContent(data.work_experience)) {
    main += `<div class="resume-section">
      <h2 class="resume-section-title">Experience</h2>
      ${buildExperienceHtml(data.work_experience)}
    </div>`;
  }

  if (hasContent(data.education)) {
    main += `<div class="resume-section">
      <h2 class="resume-section-title">Education</h2>
      ${buildEducationHtml(data.education)}
    </div>`;
  }

  if (hasContent(data.projects)) {
    main += `<div class="resume-section">
      <h2 class="resume-section-title">Projects</h2>
      ${buildProjectsHtml(data.projects)}
    </div>`;
  }

  if (hasContent(data.awards_honors)) {
    main += `<div class="resume-section">
      <h2 class="resume-section-title">Awards</h2>
      ${buildAwardsHtml(data.awards_honors)}
    </div>`;
  }

  if (hasContent(data.publications)) {
    main += `<div class="resume-section">
      <h2 class="resume-section-title">Publications</h2>
      ${buildPublicationsHtml(data.publications)}
    </div>`;
  }

  if (hasContent(data.volunteer_experience)) {
    main += `<div class="resume-section">
      <h2 class="resume-section-title">Volunteering</h2>
      ${buildVolunteerHtml(data.volunteer_experience)}
    </div>`;
  }

  return `<div class="resume-sidebar">${sidebar}</div><div class="resume-main">${main}</div>`;
}

// ═══════════════════════════════════════════════════════════════════════════
// Template: Minimal
// ═══════════════════════════════════════════════════════════════════════════

function renderMinimal(data) {
  const info = data.personal_info || {};
  const contact = buildContactInfo(info);
  const links = buildLinks(info);

  let html = `<div class="resume-header">
    <h1>${esc(info.full_name || "Your Name")}</h1>
    ${contact.length ? `<div class="resume-contact-row">${contact.map((c) => `<span>${c}</span>`).join("")}</div>` : ""}
    ${links.length ? `<div class="resume-contact-row resume-links-row">${links.map((l) => `<span><a href="${esc(l.url)}">${esc(l.label)}</a></span>`).join("")}</div>` : ""}
  </div>`;

  if (data.summary || data.objective) {
    html += `<div class="resume-section">
      <h2 class="resume-section-title">Summary</h2>
      <p class="resume-summary">${esc(data.summary || data.objective)}</p>
    </div>`;
  }

  if (hasContent(data.work_experience)) {
    html += `<div class="resume-section">
      <h2 class="resume-section-title">Experience</h2>
      ${buildExperienceHtml(data.work_experience)}
    </div>`;
  }

  if (hasContent(data.education)) {
    html += `<div class="resume-section">
      <h2 class="resume-section-title">Education</h2>
      ${buildEducationHtml(data.education)}
    </div>`;
  }

  if (hasSkills(data.technical_skills)) {
    html += `<div class="resume-section">
      <h2 class="resume-section-title">Skills</h2>
      ${buildSkillsHtml(data.technical_skills, data.soft_skills)}
    </div>`;
  }

  if (hasContent(data.projects)) {
    html += `<div class="resume-section">
      <h2 class="resume-section-title">Projects</h2>
      ${buildProjectsHtml(data.projects)}
    </div>`;
  }

  if (hasContent(data.certifications)) {
    html += `<div class="resume-section">
      <h2 class="resume-section-title">Certifications</h2>
      ${buildCertificationsHtml(data.certifications)}
    </div>`;
  }

  if (hasContent(data.awards_honors)) {
    html += `<div class="resume-section">
      <h2 class="resume-section-title">Honors</h2>
      ${buildAwardsHtml(data.awards_honors)}
    </div>`;
  }

  if (hasContent(data.publications)) {
    html += `<div class="resume-section">
      <h2 class="resume-section-title">Publications</h2>
      ${buildPublicationsHtml(data.publications)}
    </div>`;
  }

  if (hasContent(data.languages)) {
    html += `<div class="resume-section">
      <h2 class="resume-section-title">Languages</h2>
      <p>${buildLanguagesHtml(data.languages)}</p>
    </div>`;
  }

  if (hasContent(data.volunteer_experience)) {
    html += `<div class="resume-section">
      <h2 class="resume-section-title">Volunteering</h2>
      ${buildVolunteerHtml(data.volunteer_experience)}
    </div>`;
  }

  return html;
}

// ═══════════════════════════════════════════════════════════════════════════
// Template: Photo
// ═══════════════════════════════════════════════════════════════════════════

function renderPhoto(data) {
  const info = data.personal_info || {};
  const links = buildLinks(info);

  // ─── Sidebar ───
  let sidebar = ``;

  if (info.photoUrl) {
    sidebar += `<div class="resume-photo-container"><img src="${esc(info.photoUrl)}" alt="Profile Photo" class="resume-photo" /></div>`;
  }

  sidebar += `<h1>${esc(info.full_name || "Your Name")}</h1>`;

  // Contact in sidebar
  const contactItems = [];
  if (info.email) contactItems.push(`<span>📧 ${esc(info.email)}</span>`);
  if (info.phone) contactItems.push(`<span>📱 ${esc(info.phone)}</span>`);
  const location = [info.city, info.state].filter(Boolean).join(", ");
  if (location) contactItems.push(`<span>📍 ${esc(location)}</span>`);
  links.forEach((l) => contactItems.push(`<span><a href="${esc(l.url)}">${esc(l.label)}</a></span>`));

  if (contactItems.length) {
    sidebar += `<div class="resume-contact-col">${contactItems.join("")}</div>`;
  }

  // Skills in sidebar
  if (hasSkills(data.technical_skills)) {
    sidebar += `<div class="sidebar-section">
      <h2 class="resume-section-title">Skills</h2>
      ${buildSkillsHtml(data.technical_skills, data.soft_skills)}
    </div>`;
  }

  // Languages in sidebar
  if (hasContent(data.languages)) {
    sidebar += `<div class="sidebar-section">
      <h2 class="resume-section-title">Languages</h2>
      ${data.languages.map((l) => `<div class="sidebar-item">${esc(l.language || "")}${l.proficiency ? ` — ${esc(l.proficiency)}` : ""}</div>`).join("")}
    </div>`;
  }

  // Certifications in sidebar
  if (hasContent(data.certifications)) {
    sidebar += `<div class="sidebar-section">
      <h2 class="resume-section-title">Certifications</h2>
      ${data.certifications.map((c) => `<div class="sidebar-item"><strong>${esc(c.name || "")}</strong><br/>${esc(c.issuing_organization || "")}${c.issue_date ? ` (${esc(c.issue_date)})` : ""}</div>`).join("")}
    </div>`;
  }

  // ─── Main ───
  let main = "";

  if (data.summary || data.objective) {
    main += `<div class="resume-section">
      <h2 class="resume-section-title">About</h2>
      <p class="resume-summary">${esc(data.summary || data.objective)}</p>
    </div>`;
  }

  if (hasContent(data.work_experience)) {
    main += `<div class="resume-section">
      <h2 class="resume-section-title">Experience</h2>
      ${buildExperienceHtml(data.work_experience)}
    </div>`;
  }

  if (hasContent(data.education)) {
    main += `<div class="resume-section">
      <h2 class="resume-section-title">Education</h2>
      ${buildEducationHtml(data.education)}
    </div>`;
  }

  if (hasContent(data.projects)) {
    main += `<div class="resume-section">
      <h2 class="resume-section-title">Projects</h2>
      ${buildProjectsHtml(data.projects)}
    </div>`;
  }

  if (hasContent(data.awards_honors)) {
    main += `<div class="resume-section">
      <h2 class="resume-section-title">Awards</h2>
      ${buildAwardsHtml(data.awards_honors)}
    </div>`;
  }

  if (hasContent(data.publications)) {
    main += `<div class="resume-section">
      <h2 class="resume-section-title">Publications</h2>
      ${buildPublicationsHtml(data.publications)}
    </div>`;
  }

  if (hasContent(data.volunteer_experience)) {
    main += `<div class="resume-section">
      <h2 class="resume-section-title">Volunteering</h2>
      ${buildVolunteerHtml(data.volunteer_experience)}
    </div>`;
  }

  return `<div class="resume-sidebar">${sidebar}</div><div class="resume-main">${main}</div>`;
}

// ─── Public API ──────────────────────────────────────────────────────────────

// ═══════════════════════════════════════════════════════════════════════════
// Template: prof-developer (Software Developer)
// Dark-purple sidebar, code-centric layout, projects & skills first
// ═══════════════════════════════════════════════════════════════════════════

function renderProfDeveloper(data) {
  const info = data.personal_info || {};
  const links = buildLinks(info);

  let sidebar = `<h1>${esc(info.full_name || "Your Name")}</h1>`;
  if (info.job_title) sidebar += `<div class="prof-title">${esc(info.job_title)}</div>`;

  const contactItems = [];
  if (info.email) contactItems.push(`<span>📧 ${esc(info.email)}</span>`);
  if (info.phone) contactItems.push(`<span>📱 ${esc(info.phone)}</span>`);
  const location = [info.city, info.state].filter(Boolean).join(", ");
  if (location) contactItems.push(`<span>📍 ${esc(location)}</span>`);
  links.forEach((l) => contactItems.push(`<span><a href="${esc(l.url)}">${esc(l.label)}</a></span>`));
  if (contactItems.length) sidebar += `<div class="resume-contact-col">${contactItems.join("")}</div>`;

  // Technical Skills in sidebar (primary value for devs)
  if (hasSkills(data.technical_skills)) {
    sidebar += `<div class="sidebar-section"><h2 class="resume-section-title">Tech Stack</h2>${buildSkillsHtml(data.technical_skills, data.soft_skills)}</div>`;
  }
  if (hasContent(data.certifications)) {
    sidebar += `<div class="sidebar-section"><h2 class="resume-section-title">Certifications</h2>${data.certifications.map((c) => `<div class="sidebar-item"><strong>${esc(c.name || "")}</strong><br/>${esc(c.issuing_organization || "")}${c.issue_date ? ` (${esc(c.issue_date)})` : ""}</div>`).join("")}</div>`;
  }
  if (hasContent(data.languages)) {
    sidebar += `<div class="sidebar-section"><h2 class="resume-section-title">Languages</h2>${data.languages.map((l) => `<div class="sidebar-item">${esc(l.language || "")}${l.proficiency ? ` — ${esc(l.proficiency)}` : ""}</div>`).join("")}</div>`;
  }

  let main = "";
  if (data.summary || data.objective) {
    main += `<div class="resume-section"><h2 class="resume-section-title">About</h2><p class="resume-summary">${esc(data.summary || data.objective)}</p></div>`;
  }
  if (hasContent(data.work_experience)) {
    main += `<div class="resume-section"><h2 class="resume-section-title">Experience</h2>${buildExperienceHtml(data.work_experience)}</div>`;
  }
  if (hasContent(data.projects)) {
    main += `<div class="resume-section"><h2 class="resume-section-title">Projects</h2>${buildProjectsHtml(data.projects)}</div>`;
  }
  if (hasContent(data.education)) {
    main += `<div class="resume-section"><h2 class="resume-section-title">Education</h2>${buildEducationHtml(data.education)}</div>`;
  }
  if (hasContent(data.awards_honors)) {
    main += `<div class="resume-section"><h2 class="resume-section-title">Awards</h2>${buildAwardsHtml(data.awards_honors)}</div>`;
  }
  if (hasContent(data.volunteer_experience)) {
    main += `<div class="resume-section"><h2 class="resume-section-title">Open Source / Volunteering</h2>${buildVolunteerHtml(data.volunteer_experience)}</div>`;
  }

  return `<div class="resume-sidebar">${sidebar}</div><div class="resume-main">${main}</div>`;
}

// ═══════════════════════════════════════════════════════════════════════════
// Template: prof-teacher (Teacher / Educator)
// Warm amber tones, education first, leadership sections
// ═══════════════════════════════════════════════════════════════════════════

function renderProfTeacher(data) {
  const info = data.personal_info || {};
  const contact = buildContactInfo(info);
  const links = buildLinks(info);

  let html = `<div class="resume-header">
    <h1>${esc(info.full_name || "Your Name")}</h1>
    ${contact.length ? `<div class="resume-contact-row">${contact.map((c) => `<span>${c}</span>`).join("")}</div>` : ""}
    ${links.length ? `<div class="resume-contact-row resume-links-row">${links.map((l) => `<span><a href="${esc(l.url)}">${esc(l.label)}</a></span>`).join("")}</div>` : ""}
  </div>`;

  if (data.summary || data.objective) {
    html += `<div class="resume-section"><h2 class="resume-section-title">Teaching Philosophy</h2><p class="resume-summary">${esc(data.summary || data.objective)}</p></div>`;
  }
  // Education first for teachers
  if (hasContent(data.education)) {
    html += `<div class="resume-section"><h2 class="resume-section-title">Education & Credentials</h2>${buildEducationHtml(data.education)}</div>`;
  }
  if (hasContent(data.certifications)) {
    html += `<div class="resume-section"><h2 class="resume-section-title">Licenses & Certifications</h2>${buildCertificationsHtml(data.certifications)}</div>`;
  }
  if (hasContent(data.work_experience)) {
    html += `<div class="resume-section"><h2 class="resume-section-title">Teaching Experience</h2>${buildExperienceHtml(data.work_experience)}</div>`;
  }
  if (hasSkills(data.technical_skills)) {
    html += `<div class="resume-section"><h2 class="resume-section-title">Skills & Competencies</h2>${buildSkillsHtml(data.technical_skills, data.soft_skills)}</div>`;
  }
  if (hasContent(data.volunteer_experience)) {
    html += `<div class="resume-section"><h2 class="resume-section-title">Extracurricular & Leadership</h2>${buildVolunteerHtml(data.volunteer_experience)}</div>`;
  }
  if (hasContent(data.awards_honors)) {
    html += `<div class="resume-section"><h2 class="resume-section-title">Awards & Recognition</h2>${buildAwardsHtml(data.awards_honors)}</div>`;
  }
  if (hasContent(data.publications)) {
    html += `<div class="resume-section"><h2 class="resume-section-title">Publications & Research</h2>${buildPublicationsHtml(data.publications)}</div>`;
  }
  if (hasContent(data.languages)) {
    html += `<div class="resume-section"><h2 class="resume-section-title">Languages</h2><p>${buildLanguagesHtml(data.languages)}</p></div>`;
  }

  return html;
}

// ═══════════════════════════════════════════════════════════════════════════
// Template: prof-customer-service (Customer Service Representative)
// Teal/cyan accent, soft skills prominent, two-column
// ═══════════════════════════════════════════════════════════════════════════

function renderProfCustomerService(data) {
  const info = data.personal_info || {};
  const links = buildLinks(info);

  let sidebar = `<h1>${esc(info.full_name || "Your Name")}</h1>`;
  const contactItems = [];
  if (info.email) contactItems.push(`<span>📧 ${esc(info.email)}</span>`);
  if (info.phone) contactItems.push(`<span>📱 ${esc(info.phone)}</span>`);
  const location = [info.city, info.state].filter(Boolean).join(", ");
  if (location) contactItems.push(`<span>📍 ${esc(location)}</span>`);
  links.forEach((l) => contactItems.push(`<span><a href="${esc(l.url)}">${esc(l.label)}</a></span>`));
  if (contactItems.length) sidebar += `<div class="resume-contact-col">${contactItems.join("")}</div>`;

  // Soft skills prominent
  if (hasContent(data.soft_skills)) {
    sidebar += `<div class="sidebar-section"><h2 class="resume-section-title">Key Strengths</h2>${data.soft_skills.map((s) => `<div class="sidebar-item">✔ ${esc(s)}</div>`).join("")}</div>`;
  }
  if (hasSkills(data.technical_skills)) {
    sidebar += `<div class="sidebar-section"><h2 class="resume-section-title">Tools & Systems</h2>${buildSkillsHtml(data.technical_skills, [])}</div>`;
  }
  if (hasContent(data.languages)) {
    sidebar += `<div class="sidebar-section"><h2 class="resume-section-title">Languages</h2>${data.languages.map((l) => `<div class="sidebar-item">${esc(l.language || "")}${l.proficiency ? ` — ${esc(l.proficiency)}` : ""}</div>`).join("")}</div>`;
  }
  if (hasContent(data.certifications)) {
    sidebar += `<div class="sidebar-section"><h2 class="resume-section-title">Certifications</h2>${data.certifications.map((c) => `<div class="sidebar-item"><strong>${esc(c.name || "")}</strong></div>`).join("")}</div>`;
  }

  let main = "";
  if (data.summary || data.objective) {
    main += `<div class="resume-section"><h2 class="resume-section-title">Professional Profile</h2><p class="resume-summary">${esc(data.summary || data.objective)}</p></div>`;
  }
  if (hasContent(data.work_experience)) {
    main += `<div class="resume-section"><h2 class="resume-section-title">Work Experience</h2>${buildExperienceHtml(data.work_experience)}</div>`;
  }
  if (hasContent(data.education)) {
    main += `<div class="resume-section"><h2 class="resume-section-title">Education</h2>${buildEducationHtml(data.education)}</div>`;
  }
  if (hasContent(data.awards_honors)) {
    main += `<div class="resume-section"><h2 class="resume-section-title">Awards & Recognition</h2>${buildAwardsHtml(data.awards_honors)}</div>`;
  }
  if (hasContent(data.volunteer_experience)) {
    main += `<div class="resume-section"><h2 class="resume-section-title">Community Involvement</h2>${buildVolunteerHtml(data.volunteer_experience)}</div>`;
  }

  return `<div class="resume-sidebar">${sidebar}</div><div class="resume-main">${main}</div>`;
}

// ═══════════════════════════════════════════════════════════════════════════
// Template: prof-accountant (Accountant / Finance)
// Navy/slate, clean serif, certifications & credentials prominent
// ═══════════════════════════════════════════════════════════════════════════

function renderProfAccountant(data) {
  const info = data.personal_info || {};
  const contact = buildContactInfo(info);
  const links = buildLinks(info);

  let html = `<div class="resume-header">
    <h1>${esc(info.full_name || "Your Name")}</h1>
    ${contact.length ? `<div class="resume-contact-row">${contact.map((c) => `<span>${c}</span>`).join("")}</div>` : ""}
    ${links.length ? `<div class="resume-contact-row resume-links-row">${links.map((l) => `<span><a href="${esc(l.url)}">${esc(l.label)}</a></span>`).join("")}</div>` : ""}
  </div>`;

  if (data.summary || data.objective) {
    html += `<div class="resume-section"><h2 class="resume-section-title">Professional Summary</h2><p class="resume-summary">${esc(data.summary || data.objective)}</p></div>`;
  }
  if (hasContent(data.certifications)) {
    html += `<div class="resume-section"><h2 class="resume-section-title">Licenses & Professional Certifications</h2>${buildCertificationsHtml(data.certifications)}</div>`;
  }
  if (hasContent(data.work_experience)) {
    html += `<div class="resume-section"><h2 class="resume-section-title">Professional Experience</h2>${buildExperienceHtml(data.work_experience)}</div>`;
  }
  if (hasContent(data.education)) {
    html += `<div class="resume-section"><h2 class="resume-section-title">Education</h2>${buildEducationHtml(data.education)}</div>`;
  }
  if (hasSkills(data.technical_skills)) {
    html += `<div class="resume-section"><h2 class="resume-section-title">Core Competencies</h2>${buildSkillsHtml(data.technical_skills, data.soft_skills)}</div>`;
  }
  if (hasContent(data.awards_honors)) {
    html += `<div class="resume-section"><h2 class="resume-section-title">Awards & Achievements</h2>${buildAwardsHtml(data.awards_honors)}</div>`;
  }
  if (hasContent(data.languages)) {
    html += `<div class="resume-section"><h2 class="resume-section-title">Languages</h2><p>${buildLanguagesHtml(data.languages)}</p></div>`;
  }
  if (hasContent(data.volunteer_experience)) {
    html += `<div class="resume-section"><h2 class="resume-section-title">Professional Affiliations</h2>${buildVolunteerHtml(data.volunteer_experience)}</div>`;
  }

  return html;
}

// ═══════════════════════════════════════════════════════════════════════════
// Template: prof-sales (Sales Executive)
// Bold red accent, achievements-first, metrics-driven bullets
// ═══════════════════════════════════════════════════════════════════════════

function renderProfSales(data) {
  const info = data.personal_info || {};
  const links = buildLinks(info);

  let sidebar = `<h1>${esc(info.full_name || "Your Name")}</h1>`;
  const contactItems = [];
  if (info.email) contactItems.push(`<span>📧 ${esc(info.email)}</span>`);
  if (info.phone) contactItems.push(`<span>📱 ${esc(info.phone)}</span>`);
  const location = [info.city, info.state].filter(Boolean).join(", ");
  if (location) contactItems.push(`<span>📍 ${esc(location)}</span>`);
  links.forEach((l) => contactItems.push(`<span><a href="${esc(l.url)}">${esc(l.label)}</a></span>`));
  if (contactItems.length) sidebar += `<div class="resume-contact-col">${contactItems.join("")}</div>`;

  if (hasContent(data.soft_skills)) {
    sidebar += `<div class="sidebar-section"><h2 class="resume-section-title">Sales Strengths</h2>${data.soft_skills.map((s) => `<div class="sidebar-item">🎯 ${esc(s)}</div>`).join("")}</div>`;
  }
  if (hasSkills(data.technical_skills)) {
    sidebar += `<div class="sidebar-section"><h2 class="resume-section-title">Tools & Platforms</h2>${buildSkillsHtml(data.technical_skills, [])}</div>`;
  }
  if (hasContent(data.certifications)) {
    sidebar += `<div class="sidebar-section"><h2 class="resume-section-title">Certifications</h2>${data.certifications.map((c) => `<div class="sidebar-item"><strong>${esc(c.name || "")}</strong><br/>${esc(c.issuing_organization || "")}</div>`).join("")}</div>`;
  }
  if (hasContent(data.languages)) {
    sidebar += `<div class="sidebar-section"><h2 class="resume-section-title">Languages</h2>${data.languages.map((l) => `<div class="sidebar-item">${esc(l.language || "")}${l.proficiency ? ` — ${esc(l.proficiency)}` : ""}</div>`).join("")}</div>`;
  }

  let main = "";
  if (data.summary || data.objective) {
    main += `<div class="resume-section"><h2 class="resume-section-title">Executive Profile</h2><p class="resume-summary">${esc(data.summary || data.objective)}</p></div>`;
  }
  if (hasContent(data.work_experience)) {
    main += `<div class="resume-section"><h2 class="resume-section-title">Sales Experience</h2>${buildExperienceHtml(data.work_experience)}</div>`;
  }
  if (hasContent(data.awards_honors)) {
    main += `<div class="resume-section"><h2 class="resume-section-title">Key Achievements</h2>${buildAwardsHtml(data.awards_honors)}</div>`;
  }
  if (hasContent(data.education)) {
    main += `<div class="resume-section"><h2 class="resume-section-title">Education</h2>${buildEducationHtml(data.education)}</div>`;
  }
  if (hasContent(data.volunteer_experience)) {
    main += `<div class="resume-section"><h2 class="resume-section-title">Leadership & Volunteering</h2>${buildVolunteerHtml(data.volunteer_experience)}</div>`;
  }

  return `<div class="resume-sidebar">${sidebar}</div><div class="resume-main">${main}</div>`;
}

// ═══════════════════════════════════════════════════════════════════════════
// Template: prof-nurse (Nurse / Healthcare)
// Clean green, clinical layout, licenses first, compact
// ═══════════════════════════════════════════════════════════════════════════

function renderProfNurse(data) {
  const info = data.personal_info || {};
  const contact = buildContactInfo(info);
  const links = buildLinks(info);

  let html = `<div class="resume-header">
    <h1>${esc(info.full_name || "Your Name")}</h1>
    ${contact.length ? `<div class="resume-contact-row">${contact.map((c) => `<span>${c}</span>`).join("")}</div>` : ""}
    ${links.length ? `<div class="resume-contact-row resume-links-row">${links.map((l) => `<span><a href="${esc(l.url)}">${esc(l.label)}</a></span>`).join("")}</div>` : ""}
  </div>`;

  if (data.summary || data.objective) {
    html += `<div class="resume-section"><h2 class="resume-section-title">Clinical Profile</h2><p class="resume-summary">${esc(data.summary || data.objective)}</p></div>`;
  }
  // Licenses and credentials first
  if (hasContent(data.certifications)) {
    html += `<div class="resume-section"><h2 class="resume-section-title">Licenses & Certifications</h2>${buildCertificationsHtml(data.certifications)}</div>`;
  }
  if (hasContent(data.work_experience)) {
    html += `<div class="resume-section"><h2 class="resume-section-title">Clinical Experience</h2>${buildExperienceHtml(data.work_experience)}</div>`;
  }
  if (hasContent(data.education)) {
    html += `<div class="resume-section"><h2 class="resume-section-title">Education</h2>${buildEducationHtml(data.education)}</div>`;
  }
  if (hasSkills(data.technical_skills)) {
    html += `<div class="resume-section"><h2 class="resume-section-title">Clinical Skills</h2>${buildSkillsHtml(data.technical_skills, data.soft_skills)}</div>`;
  }
  if (hasContent(data.awards_honors)) {
    html += `<div class="resume-section"><h2 class="resume-section-title">Awards & Recognition</h2>${buildAwardsHtml(data.awards_honors)}</div>`;
  }
  if (hasContent(data.volunteer_experience)) {
    html += `<div class="resume-section"><h2 class="resume-section-title">Volunteer & Community Service</h2>${buildVolunteerHtml(data.volunteer_experience)}</div>`;
  }
  if (hasContent(data.languages)) {
    html += `<div class="resume-section"><h2 class="resume-section-title">Languages</h2><p>${buildLanguagesHtml(data.languages)}</p></div>`;
  }

  return html;
}

// ═══════════════════════════════════════════════════════════════════════════
// Template: prof-engineer (Mechanical/Civil/Electrical Engineer)
// Steel blue-grey sidebar, structured layout, technical focus
// ═══════════════════════════════════════════════════════════════════════════

function renderProfEngineer(data) {
  const info = data.personal_info || {};
  const links = buildLinks(info);

  let sidebar = `<h1>${esc(info.full_name || "Your Name")}</h1>`;
  const contactItems = [];
  if (info.email) contactItems.push(`<span>📧 ${esc(info.email)}</span>`);
  if (info.phone) contactItems.push(`<span>📱 ${esc(info.phone)}</span>`);
  const location = [info.city, info.state].filter(Boolean).join(", ");
  if (location) contactItems.push(`<span>📍 ${esc(location)}</span>`);
  links.forEach((l) => contactItems.push(`<span><a href="${esc(l.url)}">${esc(l.label)}</a></span>`));
  if (contactItems.length) sidebar += `<div class="resume-contact-col">${contactItems.join("")}</div>`;

  if (hasSkills(data.technical_skills)) {
    sidebar += `<div class="sidebar-section"><h2 class="resume-section-title">Technical Skills</h2>${buildSkillsHtml(data.technical_skills, [])}</div>`;
  }
  if (hasContent(data.soft_skills)) {
    sidebar += `<div class="sidebar-section"><h2 class="resume-section-title">Competencies</h2>${data.soft_skills.map((s) => `<div class="sidebar-item">▸ ${esc(s)}</div>`).join("")}</div>`;
  }
  if (hasContent(data.certifications)) {
    sidebar += `<div class="sidebar-section"><h2 class="resume-section-title">Certifications</h2>${data.certifications.map((c) => `<div class="sidebar-item"><strong>${esc(c.name || "")}</strong><br/>${esc(c.issuing_organization || "")}${c.issue_date ? ` (${esc(c.issue_date)})` : ""}</div>`).join("")}</div>`;
  }
  if (hasContent(data.languages)) {
    sidebar += `<div class="sidebar-section"><h2 class="resume-section-title">Languages</h2>${data.languages.map((l) => `<div class="sidebar-item">${esc(l.language || "")}${l.proficiency ? ` — ${esc(l.proficiency)}` : ""}</div>`).join("")}</div>`;
  }

  let main = "";
  if (data.summary || data.objective) {
    main += `<div class="resume-section"><h2 class="resume-section-title">Engineering Profile</h2><p class="resume-summary">${esc(data.summary || data.objective)}</p></div>`;
  }
  if (hasContent(data.work_experience)) {
    main += `<div class="resume-section"><h2 class="resume-section-title">Professional Experience</h2>${buildExperienceHtml(data.work_experience)}</div>`;
  }
  if (hasContent(data.projects)) {
    main += `<div class="resume-section"><h2 class="resume-section-title">Engineering Projects</h2>${buildProjectsHtml(data.projects)}</div>`;
  }
  if (hasContent(data.education)) {
    main += `<div class="resume-section"><h2 class="resume-section-title">Education</h2>${buildEducationHtml(data.education)}</div>`;
  }
  if (hasContent(data.awards_honors)) {
    main += `<div class="resume-section"><h2 class="resume-section-title">Awards</h2>${buildAwardsHtml(data.awards_honors)}</div>`;
  }
  if (hasContent(data.volunteer_experience)) {
    main += `<div class="resume-section"><h2 class="resume-section-title">Volunteer Experience</h2>${buildVolunteerHtml(data.volunteer_experience)}</div>`;
  }

  return `<div class="resume-sidebar">${sidebar}</div><div class="resume-main">${main}</div>`;
}

// ─── Renderer Map ─────────────────────────────────────────────────────────

const renderers = {
  classic: renderClassic,
  modern: renderModern,
  minimal: renderMinimal,
  photo: renderPhoto,
  "prof-developer": renderProfDeveloper,
  "prof-teacher": renderProfTeacher,
  "prof-customer-service": renderProfCustomerService,
  "prof-accountant": renderProfAccountant,
  "prof-sales": renderProfSales,
  "prof-nurse": renderProfNurse,
  "prof-engineer": renderProfEngineer,
};

/**
 * Render resume data to HTML using the specified template.
 * @param {object} data - Resume JSON data
 * @param {string} template - Template name
 * @returns {string} HTML string to inject into .resume-paper
 */
export function renderResume(data, template = "classic") {
  const renderer = renderers[template] || renderers.classic;
  const resumeData = data || {};
  return renderer(resumeData) + buildAdditionalSectionsHtml(resumeData);
}
