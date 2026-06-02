/**
 * formEditor.js
 * Section-based form UI for editing resume data.
 * Includes AI enhance buttons and dynamic add/remove for arrays.
 */

import { store } from "./resumeStore.js";
import { enhanceBullets, generateSummary, enhanceDescription, suggestSkills, isAiAvailable } from "./aiClient.js";
import { showToast } from "./main.js";

let container = null;
let isUpdatingFromStore = false;

/** Initialize the form editor into a container */
export function initFormEditor(containerEl) {
  container = containerEl;
  renderForm();

  // Re-render when store changes from non-form sources
  store.onChange(() => {
    if (!isUpdatingFromStore) {
      renderForm();
    }
  });
}

function updateStore(path, value) {
  isUpdatingFromStore = true;
  store.setField(path, value);
  isUpdatingFromStore = false;
}

function renderForm() {
  const data = store.getDataRef();
  const info = data.personal_info || {};
  const aiAvail = isAiAvailable();

  container.innerHTML = `
    <div class="form-editor">

      ${renderSection("👤", "Personal Information", `
        <div class="form-row">
          ${field("Full Name", "personal_info.full_name", info.full_name, "Alexandra Chen")}
          ${field("Email", "personal_info.email", info.email, "email@example.com")}
        </div>
        <div class="form-row">
          ${field("Phone", "personal_info.phone", info.phone, "+1 (555) 123-4567")}
          ${field("City", "personal_info.city", info.city, "San Francisco")}
        </div>
        <div class="form-row">
          ${field("State", "personal_info.state", info.state, "CA")}
          ${field("Country", "personal_info.country", info.country, "USA")}
        </div>
        <div class="form-row">
          ${field("LinkedIn", "personal_info.linkedin", info.linkedin, "linkedin.com/in/yourname")}
          ${field("GitHub", "personal_info.github", info.github, "github.com/yourname")}
        </div>
        <div class="form-row">
          ${field("Portfolio", "personal_info.portfolio", info.portfolio, "yoursite.dev")}
          ${field("Website", "personal_info.website", info.website, "website.com")}
        </div>
      `)}

      ${renderSection("📝", "Professional Summary", `
        <div class="form-row--full form-group" style="display:flex;flex-direction:column;gap:4px;">
          <div style="display:flex;align-items:center;justify-content:space-between;">
            <label for="summary-field">Summary</label>
            ${aiAvail ? `<button class="ai-inline-btn" data-ai-action="generate-summary">✨ AI Generate<span class="spinner"></span></button>` : ""}
          </div>
          <textarea id="summary-field" data-path="summary" rows="4" placeholder="A brief professional summary...">${esc(data.summary || "")}</textarea>
        </div>
      `)}

      ${renderSection("💼", "Work Experience", `
        ${renderExperienceList(data.work_experience || [])}
        <button class="btn--add" data-add="work_experience">+ Add Experience</button>
      `)}

      ${renderSection("🎓", "Education", `
        ${renderEducationList(data.education || [])}
        <button class="btn--add" data-add="education">+ Add Education</button>
      `)}

      ${renderSection("⚡", "Technical Skills", `
        ${renderSkillsForm(data.technical_skills || {})}
        ${aiAvail ? `<button class="ai-inline-btn" data-ai-action="suggest-skills" style="margin-top:8px;">✨ AI Suggest Skills<span class="spinner"></span></button>` : ""}
      `)}

      ${renderSection("🚀", "Projects", `
        ${renderProjectsList(data.projects || [])}
        <button class="btn--add" data-add="projects">+ Add Project</button>
      `)}

      ${renderSection("📜", "Certifications", `
        ${renderCertsList(data.certifications || [])}
        <button class="btn--add" data-add="certifications">+ Add Certification</button>
      `)}

      ${renderSection("🏆", "Awards & Honors", `
        ${renderAwardsList(data.awards_honors || [])}
        <button class="btn--add" data-add="awards_honors">+ Add Award</button>
      `)}

      ${renderSection("🌐", "Languages", `
        ${renderLanguagesList(data.languages || [])}
        <button class="btn--add" data-add="languages">+ Add Language</button>
      `)}

      ${renderSection("🤝", "Volunteer Experience", `
        ${renderVolunteerList(data.volunteer_experience || [])}
        <button class="btn--add" data-add="volunteer_experience">+ Add Volunteer Experience</button>
      `)}

    </div>
  `;

  attachEventListeners();
}

// ─── Section Wrapper ─────────────────────────────────────────────────────────

function renderSection(icon, title, bodyHtml) {
  return `
    <div class="form-section">
      <div class="form-section__header">
        <div class="form-section__title"><span class="form-section__icon">${icon}</span> ${title}</div>
        <span class="form-section__toggle">▾</span>
      </div>
      <div class="form-section__body">
        ${bodyHtml}
      </div>
    </div>
  `;
}

// ─── Form Fields ─────────────────────────────────────────────────────────────

function field(label, path, value, placeholder = "") {
  return `
    <div class="form-group">
      <label>${label}</label>
      <input type="text" data-path="${path}" value="${esc(value || "")}" placeholder="${placeholder}" />
    </div>
  `;
}

function textareaField(label, path, value, placeholder = "", rows = 3) {
  return `
    <div class="form-group">
      <label>${label}</label>
      <textarea data-path="${path}" rows="${rows}" placeholder="${placeholder}">${esc(value || "")}</textarea>
    </div>
  `;
}

// ─── Experience ──────────────────────────────────────────────────────────────

function renderExperienceList(experiences) {
  if (!experiences.length) return '<p style="color:var(--text-tertiary);font-size:var(--font-sm);">No experience added yet.</p>';

  const aiAvail = isAiAvailable();

  return experiences
    .map(
      (exp, i) => `
    <div class="list-item">
      <div class="list-item__header">
        <span class="list-item__number">#${i + 1}</span>
        <button class="list-item__remove" data-remove="work_experience" data-index="${i}">✕</button>
      </div>
      <div class="form-row">
        ${field("Job Title", `work_experience.${i}.job_title`, exp.job_title, "Software Engineer")}
        ${field("Company", `work_experience.${i}.company`, exp.company, "Acme Corp")}
      </div>
      <div class="form-row">
        ${field("Location", `work_experience.${i}.location`, exp.location, "City, State")}
        ${field("Start Date", `work_experience.${i}.start_date`, exp.start_date, "Jan 2020")}
      </div>
      <div class="form-row">
        ${field("End Date", `work_experience.${i}.end_date`, exp.end_date, "Present")}
      </div>
      <div class="form-group">
        <div style="display:flex;align-items:center;justify-content:space-between;">
          <label>Responsibilities</label>
          ${aiAvail ? `<button class="ai-inline-btn" data-ai-action="enhance-bullets" data-section="work_experience" data-index="${i}" data-field="responsibilities">✨ AI Enhance<span class="spinner"></span></button>` : ""}
        </div>
        ${renderBulletList(`work_experience.${i}.responsibilities`, exp.responsibilities || [])}
        <button class="btn--add" data-add-bullet="work_experience.${i}.responsibilities">+ Add Bullet</button>
      </div>
      <div class="form-group">
        <div style="display:flex;align-items:center;justify-content:space-between;">
          <label>Achievements</label>
          ${aiAvail ? `<button class="ai-inline-btn" data-ai-action="enhance-bullets" data-section="work_experience" data-index="${i}" data-field="achievements">✨ AI Enhance<span class="spinner"></span></button>` : ""}
        </div>
        ${renderBulletList(`work_experience.${i}.achievements`, exp.achievements || [])}
        <button class="btn--add" data-add-bullet="work_experience.${i}.achievements">+ Add Bullet</button>
      </div>
    </div>
  `
    )
    .join("");
}

// ─── Education ───────────────────────────────────────────────────────────────

function renderEducationList(education) {
  if (!education.length) return '<p style="color:var(--text-tertiary);font-size:var(--font-sm);">No education added yet.</p>';

  return education
    .map(
      (edu, i) => `
    <div class="list-item">
      <div class="list-item__header">
        <span class="list-item__number">#${i + 1}</span>
        <button class="list-item__remove" data-remove="education" data-index="${i}">✕</button>
      </div>
      <div class="form-row">
        ${field("Degree", `education.${i}.degree`, edu.degree, "Bachelor of Science")}
        ${field("Field of Study", `education.${i}.field_of_study`, edu.field_of_study, "Computer Science")}
      </div>
      <div class="form-row">
        ${field("Institution", `education.${i}.institution`, edu.institution, "University Name")}
        ${field("Location", `education.${i}.location`, edu.location, "City, State")}
      </div>
      <div class="form-row">
        ${field("Start Date", `education.${i}.start_date`, edu.start_date, "Sep 2016")}
        ${field("End Date", `education.${i}.end_date`, edu.end_date, "Jun 2020")}
      </div>
      <div class="form-row">
        ${field("GPA", `education.${i}.gpa`, edu.gpa, "3.8")}
        ${field("Honors", `education.${i}.honors`, edu.honors, "Cum Laude")}
      </div>
    </div>
  `
    )
    .join("");
}

// ─── Skills ──────────────────────────────────────────────────────────────────

function renderSkillsForm(tech) {
  const categories = [
    { key: "programming_languages", label: "Programming Languages", placeholder: "Python, JavaScript, Go..." },
    { key: "frameworks_libraries", label: "Frameworks & Libraries", placeholder: "React, Express, FastAPI..." },
    { key: "databases", label: "Databases", placeholder: "PostgreSQL, MongoDB, Redis..." },
    { key: "cloud_platforms", label: "Cloud Platforms", placeholder: "AWS, GCP, Azure..." },
    { key: "tools_software", label: "Tools & Software", placeholder: "Docker, Git, Kubernetes..." },
    { key: "operating_systems", label: "Operating Systems", placeholder: "Linux, macOS, Windows..." },
    { key: "methodologies", label: "Methodologies", placeholder: "Agile, Scrum, CI/CD..." },
    { key: "other", label: "Other", placeholder: "Domain-specific skills..." },
  ];

  return categories
    .map(
      (c) => `
    <div class="form-group">
      <label>${c.label}</label>
      <input type="text" data-path="technical_skills.${c.key}" data-type="csv" value="${(tech[c.key] || []).join(", ")}" placeholder="${c.placeholder}" />
    </div>
  `
    )
    .join("");
}

// ─── Projects ────────────────────────────────────────────────────────────────

function renderProjectsList(projects) {
  if (!projects.length) return '<p style="color:var(--text-tertiary);font-size:var(--font-sm);">No projects added yet.</p>';

  const aiAvail = isAiAvailable();

  return projects
    .map(
      (p, i) => `
    <div class="list-item">
      <div class="list-item__header">
        <span class="list-item__number">#${i + 1}</span>
        <button class="list-item__remove" data-remove="projects" data-index="${i}">✕</button>
      </div>
      <div class="form-row">
        ${field("Name", `projects.${i}.name`, p.name, "Project Name")}
        ${field("URL", `projects.${i}.url`, p.url, "project-url.com")}
      </div>
      <div class="form-group">
        <div style="display:flex;align-items:center;justify-content:space-between;">
          <label>Description</label>
          ${aiAvail ? `<button class="ai-inline-btn" data-ai-action="enhance-description" data-path="projects.${i}.description">✨ AI Enhance<span class="spinner"></span></button>` : ""}
        </div>
        <textarea data-path="projects.${i}.description" rows="2" placeholder="Brief project description...">${esc(p.description || "")}</textarea>
      </div>
      <div class="form-row">
        ${field("Technologies", `projects.${i}.technologies_used`, (p.technologies_used || []).join(", "), "React, Node.js, PostgreSQL")}
        ${field("GitHub", `projects.${i}.github_link`, p.github_link, "github.com/user/project")}
      </div>
      <div class="form-row">
        ${field("Start Date", `projects.${i}.start_date`, p.start_date, "Jun 2023")}
        ${field("End Date", `projects.${i}.end_date`, p.end_date, "Present")}
      </div>
    </div>
  `
    )
    .join("");
}

// ─── Certifications ──────────────────────────────────────────────────────────

function renderCertsList(certs) {
  if (!certs.length) return '<p style="color:var(--text-tertiary);font-size:var(--font-sm);">No certifications added yet.</p>';

  return certs
    .map(
      (c, i) => `
    <div class="list-item">
      <div class="list-item__header">
        <span class="list-item__number">#${i + 1}</span>
        <button class="list-item__remove" data-remove="certifications" data-index="${i}">✕</button>
      </div>
      <div class="form-row">
        ${field("Name", `certifications.${i}.name`, c.name, "AWS Solutions Architect")}
        ${field("Issuer", `certifications.${i}.issuing_organization`, c.issuing_organization, "Amazon Web Services")}
      </div>
      <div class="form-row">
        ${field("Issue Date", `certifications.${i}.issue_date`, c.issue_date, "Mar 2023")}
        ${field("Expiry Date", `certifications.${i}.expiry_date`, c.expiry_date, "Mar 2026")}
      </div>
      <div class="form-row">
        ${field("Credential ID", `certifications.${i}.credential_id`, c.credential_id, "ABC-12345")}
      </div>
    </div>
  `
    )
    .join("");
}

// ─── Awards ──────────────────────────────────────────────────────────────────

function renderAwardsList(awards) {
  if (!awards.length) return '<p style="color:var(--text-tertiary);font-size:var(--font-sm);">No awards added yet.</p>';

  return awards
    .map(
      (a, i) => `
    <div class="list-item">
      <div class="list-item__header">
        <span class="list-item__number">#${i + 1}</span>
        <button class="list-item__remove" data-remove="awards_honors" data-index="${i}">✕</button>
      </div>
      <div class="form-row">
        ${field("Title", `awards_honors.${i}.title`, a.title, "Award Name")}
        ${field("Issuer", `awards_honors.${i}.issuer`, a.issuer, "Company/Organization")}
      </div>
      <div class="form-row">
        ${field("Date", `awards_honors.${i}.date`, a.date, "Q3 2023")}
      </div>
      ${textareaField("Description", `awards_honors.${i}.description`, a.description, "Brief description...", 2)}
    </div>
  `
    )
    .join("");
}

// ─── Languages ───────────────────────────────────────────────────────────────

function renderLanguagesList(languages) {
  if (!languages.length) return '<p style="color:var(--text-tertiary);font-size:var(--font-sm);">No languages added yet.</p>';

  return languages
    .map(
      (l, i) => `
    <div class="list-item">
      <div class="list-item__header">
        <span class="list-item__number">#${i + 1}</span>
        <button class="list-item__remove" data-remove="languages" data-index="${i}">✕</button>
      </div>
      <div class="form-row">
        ${field("Language", `languages.${i}.language`, l.language, "English")}
        ${field("Proficiency", `languages.${i}.proficiency`, l.proficiency, "Native / Fluent / Conversational")}
      </div>
    </div>
  `
    )
    .join("");
}

// ─── Volunteer ───────────────────────────────────────────────────────────────

function renderVolunteerList(volunteer) {
  if (!volunteer.length) return '<p style="color:var(--text-tertiary);font-size:var(--font-sm);">No volunteer experience added yet.</p>';

  return volunteer
    .map(
      (v, i) => `
    <div class="list-item">
      <div class="list-item__header">
        <span class="list-item__number">#${i + 1}</span>
        <button class="list-item__remove" data-remove="volunteer_experience" data-index="${i}">✕</button>
      </div>
      <div class="form-row">
        ${field("Role", `volunteer_experience.${i}.role`, v.role, "Volunteer Role")}
        ${field("Organization", `volunteer_experience.${i}.organization`, v.organization, "Organization Name")}
      </div>
      <div class="form-row">
        ${field("Start Date", `volunteer_experience.${i}.start_date`, v.start_date, "Sep 2020")}
        ${field("End Date", `volunteer_experience.${i}.end_date`, v.end_date, "Present")}
      </div>
      ${textareaField("Description", `volunteer_experience.${i}.description`, v.description, "Describe your volunteer work...", 2)}
    </div>
  `
    )
    .join("");
}

// ─── Bullet List ─────────────────────────────────────────────────────────────

function renderBulletList(basePath, bullets) {
  if (!bullets.length) return "";

  return `<div class="bullet-list">
    ${bullets
      .map(
        (b, i) => `
      <div class="bullet-item">
        <span class="bullet-item__marker">•</span>
        <input type="text" data-path="${basePath}.${i}" value="${esc(b)}" placeholder="Bullet point..." />
        <button class="bullet-item__remove" data-remove-bullet="${basePath}" data-index="${i}">✕</button>
      </div>
    `
      )
      .join("")}
  </div>`;
}

// ─── Event Listeners ─────────────────────────────────────────────────────────

function attachEventListeners() {
  // Section collapse/expand
  container.querySelectorAll(".form-section__header").forEach((header) => {
    header.addEventListener("click", () => {
      header.parentElement.classList.toggle("collapsed");
    });
  });

  // Input/textarea change
  container.querySelectorAll("input[data-path], textarea[data-path]").forEach((el) => {
    el.addEventListener("input", () => {
      const path = el.dataset.path;

      if (el.dataset.type === "csv") {
        // CSV field → split into array
        const arr = el.value
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
        updateStore(path, arr);
      } else if (path.match(/\.technologies_used$/)) {
        // Technologies used is also CSV
        const arr = el.value
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
        updateStore(path, arr);
      } else {
        updateStore(path, el.value || null);
      }
    });
  });

  // Add section item
  container.querySelectorAll("[data-add]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const section = btn.dataset.add;
      const data = store.getData();
      const arr = data[section] || [];
      arr.push(getEmptyItem(section));
      isUpdatingFromStore = true;
      store.setField(section, arr);
      isUpdatingFromStore = false;
      renderForm();
    });
  });

  // Remove section item
  container.querySelectorAll("[data-remove]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const section = btn.dataset.remove;
      const index = parseInt(btn.dataset.index);
      const data = store.getData();
      const arr = data[section] || [];
      arr.splice(index, 1);
      isUpdatingFromStore = true;
      store.setField(section, arr);
      isUpdatingFromStore = false;
      renderForm();
    });
  });

  // Add bullet
  container.querySelectorAll("[data-add-bullet]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const path = btn.dataset.addBullet;
      const parts = path.split(".");
      const data = store.getData();

      // Navigate to the array
      let obj = data;
      for (const part of parts) {
        const key = isNaN(part) ? part : parseInt(part);
        obj = obj[key];
      }

      if (Array.isArray(obj)) {
        obj.push("");
        isUpdatingFromStore = true;
        store.setData(data);
        isUpdatingFromStore = false;
        renderForm();
      }
    });
  });

  // Remove bullet
  container.querySelectorAll("[data-remove-bullet]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const path = btn.dataset.removeBullet;
      const index = parseInt(btn.dataset.index);
      const parts = path.split(".");
      const data = store.getData();

      let obj = data;
      for (const part of parts) {
        const key = isNaN(part) ? part : parseInt(part);
        obj = obj[key];
      }

      if (Array.isArray(obj)) {
        obj.splice(index, 1);
        isUpdatingFromStore = true;
        store.setData(data);
        isUpdatingFromStore = false;
        renderForm();
      }
    });
  });

  // ─── AI Actions ────────────────────────────────────────────────────────────

  container.querySelectorAll("[data-ai-action]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const action = btn.dataset.aiAction;
      btn.classList.add("loading");
      btn.disabled = true;

      try {
        if (action === "generate-summary") {
          const summary = await generateSummary(store.getDataRef());
          updateStore("summary", summary);
          showToast("Summary generated!", "success");
          renderForm();
        } else if (action === "enhance-bullets") {
          const section = btn.dataset.section;
          const index = parseInt(btn.dataset.index);
          const fieldName = btn.dataset.field;
          const data = store.getDataRef();
          const exp = data[section]?.[index];
          if (!exp) return;

          const bullets = exp[fieldName] || [];
          if (bullets.length === 0) {
            showToast("No bullets to enhance", "error");
            return;
          }

          const enhanced = await enhanceBullets(bullets, exp.job_title, exp.company);
          if (enhanced.length) {
            const fullData = store.getData();
            fullData[section][index][fieldName] = enhanced;
            isUpdatingFromStore = true;
            store.setData(fullData);
            isUpdatingFromStore = false;
            showToast(`${fieldName} enhanced!`, "success");
            renderForm();
          }
        } else if (action === "enhance-description") {
          const path = btn.dataset.path;
          const data = store.getDataRef();
          const parts = path.split(".");
          let val = data;
          for (const p of parts) {
            const k = isNaN(p) ? p : parseInt(p);
            val = val?.[k];
          }

          if (!val) {
            showToast("No description to enhance", "error");
            return;
          }

          const enhanced = await enhanceDescription(val);
          updateStore(path, enhanced);
          showToast("Description enhanced!", "success");
          renderForm();
        } else if (action === "suggest-skills") {
          const suggestions = await suggestSkills(store.getDataRef());
          // Merge suggestions into existing skills
          const data = store.getData();
          const tech = data.technical_skills || {};
          for (const [category, skills] of Object.entries(suggestions)) {
            if (category === "soft_skills") {
              data.soft_skills = [...new Set([...(data.soft_skills || []), ...skills])];
            } else if (tech[category]) {
              tech[category] = [...new Set([...tech[category], ...skills])];
            }
          }
          data.technical_skills = tech;
          isUpdatingFromStore = true;
          store.setData(data);
          isUpdatingFromStore = false;
          showToast("Skills suggested and added!", "success");
          renderForm();
        }
      } catch (err) {
        console.error("AI action error:", err);
        showToast(`AI error: ${err.message}`, "error");
      } finally {
        btn.classList.remove("loading");
        btn.disabled = false;
      }
    });
  });
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getEmptyItem(section) {
  const templates = {
    work_experience: {
      job_title: null, company: null, location: null,
      start_date: null, end_date: null, is_current: false,
      responsibilities: [], achievements: [],
    },
    education: {
      degree: null, field_of_study: null, institution: null,
      location: null, start_date: null, end_date: null,
      gpa: null, honors: null, relevant_coursework: [],
    },
    projects: {
      name: null, description: null, technologies_used: [],
      start_date: null, end_date: null, url: null, github_link: null,
    },
    certifications: {
      name: null, issuing_organization: null,
      issue_date: null, expiry_date: null, credential_id: null, url: null,
    },
    awards_honors: {
      title: null, issuer: null, date: null, description: null,
    },
    languages: {
      language: null, proficiency: null,
    },
    volunteer_experience: {
      role: null, organization: null,
      start_date: null, end_date: null, description: null,
    },
  };
  return templates[section] || {};
}

function esc(text) {
  if (!text) return "";
  const map = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" };
  return String(text).replace(/[&<>"']/g, (s) => map[s]);
}
