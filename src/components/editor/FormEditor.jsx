import React from "react";
import Field from "./Field.jsx";
import Section from "./Section.jsx";
import ReorderableList from "./ReorderableList.jsx";
import BulletSection from "./BulletSection.jsx";

export default function FormEditor({
  resume,
  aiAvailable,
  onFieldChange,
  onAddItem,
  onRemoveItem,
  onMoveItem,
  onAddBullet,
  onRemoveBullet,
  onMoveBullet,
  onEnhanceBullets,
  onEnhanceDescription,
  onGenerateSummary,
  onSuggestSkills,
  onDragStart,
  onDrop,
  dragState,
}) {
  const info = resume.personal_info || {};

  return (
    <div className="form-editor">
      <Section title="Personal Information" icon="👤">
        <div className="form-row">
          <Field label="Full Name" path="personal_info.full_name" value={info.full_name} onChange={onFieldChange} placeholder="Alexandra Chen" />
          <Field label="Email" path="personal_info.email" value={info.email} onChange={onFieldChange} placeholder="email@example.com" />
        </div>
        <div className="form-row">
          <Field label="Phone" path="personal_info.phone" value={info.phone} onChange={onFieldChange} placeholder="+1 (555) 123-4567" />
          <Field label="City" path="personal_info.city" value={info.city} onChange={onFieldChange} placeholder="San Francisco" />
        </div>
        <div className="form-row">
          <Field label="State" path="personal_info.state" value={info.state} onChange={onFieldChange} placeholder="CA" />
          <Field label="Country" path="personal_info.country" value={info.country} onChange={onFieldChange} placeholder="USA" />
        </div>
        <div className="form-row">
          <Field label="LinkedIn" path="personal_info.linkedin" value={info.linkedin} onChange={onFieldChange} placeholder="linkedin.com/in/yourname" />
          <Field label="GitHub" path="personal_info.github" value={info.github} onChange={onFieldChange} placeholder="github.com/yourname" />
        </div>
        <div className="form-row">
          <Field label="Portfolio" path="personal_info.portfolio" value={info.portfolio} onChange={onFieldChange} placeholder="yoursite.dev" />
          <Field label="Website" path="personal_info.website" value={info.website} onChange={onFieldChange} placeholder="website.com" />
        </div>
      </Section>

      <Section title="Professional Summary" icon="📝">
        <div className="form-group form-group--full">
          <div className="section-inline-header">
            <label>Summary</label>
            {aiAvailable ? <button className="ai-inline-btn" type="button" onClick={onGenerateSummary}>✨ AI Generate<span className="spinner" /></button> : null}
          </div>
          <textarea value={resume.summary || ""} onChange={(event) => onFieldChange("summary", event.target.value)} rows={4} placeholder="A brief professional summary..." />
        </div>
      </Section>

      <Section title="Work Experience" icon="💼">
        <ReorderableList
          items={resume.work_experience || []}
          sectionKey="work_experience"
          dragState={dragState}
          onDragStart={onDragStart}
          onDrop={onDrop}
          onRemove={onRemoveItem}
          onMove={onMoveItem}
          renderItem={(item, index) => (
            <>
              <div className="form-row">
                <Field label="Job Title" path={`work_experience.${index}.job_title`} value={item.job_title} onChange={onFieldChange} placeholder="Software Engineer" />
                <Field label="Company" path={`work_experience.${index}.company`} value={item.company} onChange={onFieldChange} placeholder="Acme Corp" />
              </div>
              <div className="form-row">
                <Field label="Location" path={`work_experience.${index}.location`} value={item.location} onChange={onFieldChange} placeholder="City, State" />
                <Field label="Start Date" path={`work_experience.${index}.start_date`} value={item.start_date} onChange={onFieldChange} placeholder="Jan 2020" />
              </div>
              <div className="form-row">
                <Field label="End Date" path={`work_experience.${index}.end_date`} value={item.end_date} onChange={onFieldChange} placeholder="Present" />
              </div>
              <BulletSection
                label="Responsibilities"
                basePath={`work_experience.${index}.responsibilities`}
                bullets={item.responsibilities || []}
                aiAvailable={aiAvailable}
                onAddBullet={onAddBullet}
                onRemoveBullet={onRemoveBullet}
                onMoveBullet={onMoveBullet}
                onFieldChange={onFieldChange}
                onEnhance={() => onEnhanceBullets("work_experience", index, "responsibilities")}
                dragState={dragState}
                onDragStart={onDragStart}
                onDrop={onDrop}
              />
              <BulletSection
                label="Achievements"
                basePath={`work_experience.${index}.achievements`}
                bullets={item.achievements || []}
                aiAvailable={aiAvailable}
                onAddBullet={onAddBullet}
                onRemoveBullet={onRemoveBullet}
                onMoveBullet={onMoveBullet}
                onFieldChange={onFieldChange}
                onEnhance={() => onEnhanceBullets("work_experience", index, "achievements")}
                dragState={dragState}
                onDragStart={onDragStart}
                onDrop={onDrop}
              />
            </>
          )}
        />
        <button className="btn--add" type="button" onClick={() => onAddItem("work_experience")}>+ Add Experience</button>
      </Section>

      <Section title="Education" icon="🎓">
        <ReorderableList
          items={resume.education || []}
          sectionKey="education"
          dragState={dragState}
          onDragStart={onDragStart}
          onDrop={onDrop}
          onRemove={onRemoveItem}
          onMove={onMoveItem}
          renderItem={(item, index) => (
            <>
              <div className="form-row">
                <Field label="Degree" path={`education.${index}.degree`} value={item.degree} onChange={onFieldChange} placeholder="Bachelor of Science" />
                <Field label="Field of Study" path={`education.${index}.field_of_study`} value={item.field_of_study} onChange={onFieldChange} placeholder="Computer Science" />
              </div>
              <div className="form-row">
                <Field label="Institution" path={`education.${index}.institution`} value={item.institution} onChange={onFieldChange} placeholder="University Name" />
                <Field label="Location" path={`education.${index}.location`} value={item.location} onChange={onFieldChange} placeholder="City, State" />
              </div>
              <div className="form-row">
                <Field label="Start Date" path={`education.${index}.start_date`} value={item.start_date} onChange={onFieldChange} placeholder="Sep 2016" />
                <Field label="End Date" path={`education.${index}.end_date`} value={item.end_date} onChange={onFieldChange} placeholder="Jun 2020" />
              </div>
              <div className="form-row">
                <Field label="GPA" path={`education.${index}.gpa`} value={item.gpa} onChange={onFieldChange} placeholder="3.8" />
                <Field label="Honors" path={`education.${index}.honors`} value={item.honors} onChange={onFieldChange} placeholder="Cum Laude" />
              </div>
            </>
          )}
        />
        <button className="btn--add" type="button" onClick={() => onAddItem("education")}>+ Add Education</button>
      </Section>

      <Section title="Technical Skills" icon="⚡">
        {Object.entries(resume.technical_skills || {}).map(([key, value]) => (
          <Field
            key={key}
            label={key.replace(/_/g, " ")}
            path={`technical_skills.${key}`}
            value={(value || []).join(", ")}
            onChange={onFieldChange}
            type="csv"
            placeholder={key === "programming_languages" ? "Python, JavaScript, Go..." : "React, Express, FastAPI..."}
          />
        ))}
        {aiAvailable ? <button className="ai-inline-btn" type="button" onClick={onSuggestSkills} style={{ marginTop: 8 }}>✨ AI Suggest Skills<span className="spinner" /></button> : null}
      </Section>

      <Section title="Projects" icon="🚀">
        <ReorderableList
          items={resume.projects || []}
          sectionKey="projects"
          dragState={dragState}
          onDragStart={onDragStart}
          onDrop={onDrop}
          onRemove={onRemoveItem}
          onMove={onMoveItem}
          renderItem={(item, index) => (
            <>
              <div className="form-row">
                <Field label="Name" path={`projects.${index}.name`} value={item.name} onChange={onFieldChange} placeholder="Project Name" />
                <Field label="URL" path={`projects.${index}.url`} value={item.url} onChange={onFieldChange} placeholder="project-url.com" />
              </div>
              <div className="form-group">
                <div className="section-inline-header">
                  <label>Description</label>
                  {aiAvailable ? <button className="ai-inline-btn" type="button" onClick={() => onEnhanceDescription(`projects.${index}.description`)}>✨ AI Enhance<span className="spinner" /></button> : null}
                </div>
                <textarea value={item.description || ""} onChange={(event) => onFieldChange(`projects.${index}.description`, event.target.value)} rows={2} placeholder="Brief project description..." />
              </div>
              <div className="form-row">
                <Field label="Technologies" path={`projects.${index}.technologies_used`} value={(item.technologies_used || []).join(", ")} onChange={onFieldChange} type="csv" placeholder="React, Node.js, PostgreSQL" />
                <Field label="GitHub" path={`projects.${index}.github_link`} value={item.github_link} onChange={onFieldChange} placeholder="github.com/user/project" />
              </div>
              <div className="form-row">
                <Field label="Start Date" path={`projects.${index}.start_date`} value={item.start_date} onChange={onFieldChange} placeholder="Jun 2023" />
                <Field label="End Date" path={`projects.${index}.end_date`} value={item.end_date} onChange={onFieldChange} placeholder="Present" />
              </div>
            </>
          )}
        />
        <button className="btn--add" type="button" onClick={() => onAddItem("projects")}>+ Add Project</button>
      </Section>

      <Section title="Certifications" icon="📜">
        <ReorderableList
          items={resume.certifications || []}
          sectionKey="certifications"
          dragState={dragState}
          onDragStart={onDragStart}
          onDrop={onDrop}
          onRemove={onRemoveItem}
          onMove={onMoveItem}
          renderItem={(item, index) => (
            <>
              <div className="form-row">
                <Field label="Name" path={`certifications.${index}.name`} value={item.name} onChange={onFieldChange} placeholder="AWS Solutions Architect" />
                <Field label="Issuer" path={`certifications.${index}.issuing_organization`} value={item.issuing_organization} onChange={onFieldChange} placeholder="Amazon Web Services" />
              </div>
              <div className="form-row">
                <Field label="Issue Date" path={`certifications.${index}.issue_date`} value={item.issue_date} onChange={onFieldChange} placeholder="Mar 2023" />
                <Field label="Expiry Date" path={`certifications.${index}.expiry_date`} value={item.expiry_date} onChange={onFieldChange} placeholder="Mar 2026" />
              </div>
              <div className="form-row">
                <Field label="Credential ID" path={`certifications.${index}.credential_id`} value={item.credential_id} onChange={onFieldChange} placeholder="ABC-12345" />
              </div>
            </>
          )}
        />
        <button className="btn--add" type="button" onClick={() => onAddItem("certifications")}>+ Add Certification</button>
      </Section>

      <Section title="Awards & Honors" icon="🏆">
        <ReorderableList
          items={resume.awards_honors || []}
          sectionKey="awards_honors"
          dragState={dragState}
          onDragStart={onDragStart}
          onDrop={onDrop}
          onRemove={onRemoveItem}
          onMove={onMoveItem}
          renderItem={(item, index) => (
            <>
              <div className="form-row">
                <Field label="Title" path={`awards_honors.${index}.title`} value={item.title} onChange={onFieldChange} placeholder="Award Name" />
                <Field label="Issuer" path={`awards_honors.${index}.issuer`} value={item.issuer} onChange={onFieldChange} placeholder="Company/Organization" />
              </div>
              <div className="form-row">
                <Field label="Date" path={`awards_honors.${index}.date`} value={item.date} onChange={onFieldChange} placeholder="Q3 2023" />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea value={item.description || ""} onChange={(event) => onFieldChange(`awards_honors.${index}.description`, event.target.value)} rows={2} placeholder="Brief description..." />
              </div>
            </>
          )}
        />
        <button className="btn--add" type="button" onClick={() => onAddItem("awards_honors")}>+ Add Award</button>
      </Section>

      <Section title="Languages" icon="🌐">
        <ReorderableList
          items={resume.languages || []}
          sectionKey="languages"
          dragState={dragState}
          onDragStart={onDragStart}
          onDrop={onDrop}
          onRemove={onRemoveItem}
          onMove={onMoveItem}
          renderItem={(item, index) => (
            <>
              <div className="form-row">
                <Field label="Language" path={`languages.${index}.language`} value={item.language} onChange={onFieldChange} placeholder="English" />
                <Field label="Proficiency" path={`languages.${index}.proficiency`} value={item.proficiency} onChange={onFieldChange} placeholder="Native / Fluent / Conversational" />
              </div>
            </>
          )}
        />
        <button className="btn--add" type="button" onClick={() => onAddItem("languages")}>+ Add Language</button>
      </Section>

      <Section title="Volunteer Experience" icon="🤝">
        <ReorderableList
          items={resume.volunteer_experience || []}
          sectionKey="volunteer_experience"
          dragState={dragState}
          onDragStart={onDragStart}
          onDrop={onDrop}
          onRemove={onRemoveItem}
          onMove={onMoveItem}
          renderItem={(item, index) => (
            <>
              <div className="form-row">
                <Field label="Role" path={`volunteer_experience.${index}.role`} value={item.role} onChange={onFieldChange} placeholder="Volunteer Role" />
                <Field label="Organization" path={`volunteer_experience.${index}.organization`} value={item.organization} onChange={onFieldChange} placeholder="Organization Name" />
              </div>
              <div className="form-row">
                <Field label="Start Date" path={`volunteer_experience.${index}.start_date`} value={item.start_date} onChange={onFieldChange} placeholder="Sep 2020" />
                <Field label="End Date" path={`volunteer_experience.${index}.end_date`} value={item.end_date} onChange={onFieldChange} placeholder="Present" />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea value={item.description || ""} onChange={(event) => onFieldChange(`volunteer_experience.${index}.description`, event.target.value)} rows={2} placeholder="Describe your volunteer work..." />
              </div>
            </>
          )}
        />
        <button className="btn--add" type="button" onClick={() => onAddItem("volunteer_experience")}>+ Add Volunteer Experience</button>
      </Section>
    </div>
  );
}
