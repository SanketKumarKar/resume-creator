# Resume Creator - User Manual

## Table of Contents

1. [Getting Started](#getting-started)
2. [Interface Overview](#interface-overview)
3. [Creating a Resume](#creating-a-resume)
4. [Using AI Features](#using-ai-features)
5. [Templates](#templates)
6. [Export Options](#export-options)
7. [Tips & Best Practices](#tips--best-practices)
8. [Troubleshooting](#troubleshooting)

---

## Getting Started

### System Requirements

- **Browser:** Chrome, Firefox, Edge, or Safari (latest versions)
- **Internet:** Required for initial load and AI features
- **Optional:** Gemini API key for cloud AI, or Ollama for local AI

### Quick Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure environment:
   ```bash
   cp server/.env.example server/.env
   ```

3. Run the application:
   ```bash
   npm run dev
   ```

4. Open http://localhost:5173 in your browser

---

## Interface Overview

The Resume Creator interface has three main areas:

### 1. Editor Panel (Left)

The left side contains your editing tools:

- **Form Editor**: Fill in fields with labels and inputs
- **JSON Editor**: Edit raw JSON data directly
- **Section Navigator**: Jump between resume sections

### 2. Preview Panel (Right)

The right side shows a live preview of your resume:

- Updates instantly as you type
- Shows exactly how the final PDF will look
- Toggle between different templates

### 3. Toolbar (Top)

The top toolbar provides:

- Template selection dropdown
- AI enhancement buttons (✨ sparkle icons)
- Export to PDF button
- JSON/Form mode toggle

---

## Creating a Resume

### Step 1: Fill in Personal Information

Start with the personal info section:

- **Full Name**: Your complete name
- **Email**: Professional email address
- **Phone**: Contact number
- **Address**: City, State (optional: full address)
- **LinkedIn**: Your LinkedIn profile URL
- **GitHub**: Your GitHub profile URL (for tech roles)
- **Portfolio**: Personal website or portfolio URL

### Step 2: Add Work Experience

Click "Add Position" to add work experience:

- **Job Title**: Your role (e.g., "Software Engineer")
- **Company**: Employer name
- **Location**: City, State
- **Dates**: Start and end months/years
- **Current Position**: Check if you still work here
- **Description**: Add bullet points describing your responsibilities and achievements

**Pro Tip**: Use the AI enhance button (✨) next to description fields to improve your bullet points automatically.

### Step 3: Add Education

Click "Add Education" for each degree:

- **Degree**: Bachelor's, Master's, PhD, etc.
- **Field of Study**: Major (e.g., Computer Science)
- **Institution**: School name
- **Location**: City, State
- **Graduation Date**: Month and year
- **GPA**: Optional (include if above 3.0)
- **Relevant Coursework**: List key courses

### Step 4: Add Skills

Add your technical and soft skills:

- **Technical Skills**: Programming languages, frameworks, tools
- **Soft Skills**: Communication, leadership, etc.

Use the AI suggest button to get skill recommendations based on your work experience.

### Step 5: Add Additional Sections

Optional sections you can add:

- **Summary**: Professional summary or objective
- **Projects**: Notable projects with descriptions
- **Certifications**: Professional certifications
- **Languages**: Spoken languages and proficiency
- **Awards**: Achievements and recognition

---

## Using AI Features

The AI features help you create better content faster.

### When AI is Available

Look for the "AI Engine: Ready" badge in the toolbar. If it shows "Offline," check your configuration.

### Available AI Actions

#### ✨ Enhance Bullet Points

Turn basic job descriptions into powerful achievement statements:

1. Click the sparkle ✨ button next to a description field
2. The AI rewrites your text to be more impactful
3. Review and accept the suggestion

**Before:**
> "I wrote code for the website."

**After:**
> "Developed responsive front-end components using React, improving user engagement by 40%."

#### ✨ Generate Summary

Create a compelling professional summary:

1. Fill in your work experience and education
2. Click the sparkle ✨ button in the Summary section
3. The AI generates a professional summary based on your background

#### ✨ Suggest Skills

Get skill recommendations:

1. Add your work experience first
2. Click the sparkle ✨ button in the Skills section
3. The AI suggests relevant technical and soft skills

#### ✨ Smart Template Selection

Let AI choose the best template:

1. Click the sparkle ✨ button next to the template dropdown
2. The AI analyzes your content and recommends the best template

### AI Provider Setup

**Option 1: Google Gemini API (Recommended)**

1. Get a free API key from https://aistudio.google.com/app/apikey
2. Add to your `.env` file:
   ```
   GEMINI_API_KEY=your_api_key_here
   ```
3. Restart the application

**Option 2: Local Ollama**

1. Install Ollama from https://ollama.com
2. Pull the model: `ollama pull gemma4`
3. Leave `GEMINI_API_KEY` empty in `.env`
4. Make sure Ollama is running

---

## Templates

Resume Creator offers multiple professional templates:

### Classic

- Traditional serif fonts
- Clean, corporate look
- Best for: Finance, legal, executive roles

### Modern

- Two-column layout
- Accent colors
- Best for: Marketing, creative, tech roles

### Minimal

- Simple, single-column
- Lots of white space
- Best for: Academic, research positions

### Profession-Specific Templates

- **Developer**: Tech-focused layout
- **Teacher**: Education-oriented design
- **Nurse**: Healthcare format
- **Accountant**: Finance template
- **Sales**: Business-focused
- **Customer Service**: Service industry
- **Engineer**: Technical resume

### Switching Templates

1. Click the template dropdown in the toolbar
2. Select a new template
3. The preview updates instantly

---

## Export Options

### PDF Export

The primary export format:

1. Click the "Export PDF" button
2. A PDF downloads automatically
3. Open and verify the output

**PDF Features:**
- ATS-friendly formatting
- Standard fonts for compatibility
- Proper page breaks
- Professional layout

### JSON Export

Export raw data:

1. Toggle to JSON Editor mode
2. Copy the JSON content
3. Save to a `.json` file

---

## Tips & Best Practices

### Content Tips

1. **Quantify achievements**: Use numbers and metrics
   - ✅ "Increased sales by 25%"
   - ❌ "Improved sales"

2. **Use action verbs**: Start bullets with strong verbs
   - Led, Developed, Created, Implemented, Reduced

3. **Keep it relevant**: Focus on recent, relevant experience

4. **Tailor for each job**: Customize your summary and skills

### Formatting Tips

1. **Consistent dates**: Use same format throughout (MM/YYYY)

2. **One page for early career**: 1-2 pages for 5+ years experience

3. **Proofread**: Check for typos and grammar errors

4. **White space**: Don't overcrowd the document

### AI Tips

1. **Provide context**: More work experience = better AI suggestions

2. **Review suggestions**: AI is a helper, not a replacement

3. **Iterate**: Use AI multiple times to refine content

---

## Troubleshooting

### AI Features Not Working

**Problem**: "AI Engine: Offline" shows in toolbar

**Solutions**:
1. Check `.env` configuration
2. If using Gemini: Verify API key is correct
3. If using Ollama: Ensure `ollama serve` is running
4. Restart the application

### PDF Export Issues

**Problem**: PDF is blank or malformed

**Solutions**:
1. Try a different browser (Chrome recommended)
2. Check browser console for errors
3. Ensure all required fields are filled
4. Try the Classic template

### Form Issues

**Problem**: Can't add or remove sections

**Solutions**:
1. Refresh the page
2. Check browser console for JavaScript errors
3. Try the JSON editor to make changes

### Performance Issues

**Problem**: Slow typing or lag

**Solutions**:
1. Close other browser tabs
2. Disable browser extensions
3. Use Chrome or Edge
4. Check system resources

### Port Already in Use

**Problem**: "Port 3001/5173 is already in use"

**Solutions**:
1. Change port in `.env` (BACKEND_PORT)
2. Change port in `vite.config.js` (frontend)
3. Find and stop the conflicting process

---

## Keyboard Shortcuts

| Action | Shortcut |
|--------|----------|
| Toggle JSON/Form mode | Ctrl + M |
| Export PDF | Ctrl + P |
| Save JSON | Ctrl + S |

---

## Need Help?

- Check the README at: https://github.com/SanketKumarKar/resume-parser
- Review technical documentation in `/docs`
- Open an issue on GitHub

---

*Resume Creator - Build professional resumes with AI assistance*