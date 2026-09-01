# Resume Creator - Technical Manual

## Architecture Overview

Resume Creator is a full-stack web application built with a React frontend and Express backend. The application provides AI-assisted resume editing with support for multiple AI providers (Google Gemini and local Ollama).

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Frontend (React)                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │ Form Editor  │  │ JSON Editor  │  │ Preview Panel        │  │
│  │              │  │              │  │ (Template Renderer)  │  │
│  └──────┬───────┘  └──────┬───────┘  └──────────┬───────────┘  │
│         │                 │                      │               │
│         └─────────────────┼──────────────────────┘               │
│                           │                                      │
│                    resumeStore.js (State)                        │
│                           │                                      │
│                    aiClient.js (API)                             │
└───────────────────────────┼─────────────────────────────────────┘
                            │ HTTP /api/*
┌───────────────────────────┼─────────────────────────────────────┐
│                     Backend (Express)                            │
│                           │                                      │
│  ┌────────────────────────┼────────────────────────────────┐    │
│  │                    aiRoutes.js                           │    │
│  │  /ai/enhance-bullets                                     │    │
│  │  /ai/generate-summary                                    │    │
│  │  /ai/enhance-description                                 │    │
│  │  /ai/suggest-skills                                      │    │
│  │  /ai/parse-resume                                        │    │
│  │  /ai/identify-profession                                 │    │
│  │  /ai/status                                              │    │
│  └────────────────────────┬────────────────────────────────┘    │
│                           │                                      │
│  ┌────────────────────────┼────────────────────────────────┐    │
│  │                   aiAdapter.js                           │    │
│  │         Provider Selection Logic                         │    │
│  │              │             │                             │    │
│  │   ┌──────────┘             └──────────┐                 │    │
│  │   │                                   │                 │    │
│  │ geminiService.js              ollamaService.js          │    │
│  └──────────────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────────────┘
```

---

## Technology Stack

### Frontend
- **React 19** - UI framework
- **Vite 8** - Build tool and dev server
- **html2pdf.js** - PDF generation (CDN-loaded)

### Backend
- **Node.js** - Runtime environment
- **Express 5** - Web framework
- **dotenv** - Environment configuration
- **cors** - Cross-origin support

### AI Providers
- **Google Gemini API** - Cloud AI service (default when API key configured)
- **Ollama** - Local AI runtime (fallback when no API key)

---

## Project Structure

```
resume-creator/
├── src/                          # Frontend source
│   ├── main.js                   # React entry point
│   ├── app/
│   │   └── App.jsx               # Main application component
│   ├── components/
│   │   ├── layout/
│   │   │   ├── AppToolbar.jsx    # Top toolbar with template selector
│   │   │   └── PreviewPanel.jsx  # Resume preview renderer
│   │   └── editor/
│   │       ├── FormEditor.jsx    # Form-based resume editor
│   │       ├── JsonEditor.jsx    # Raw JSON editor
│   │       ├── BulletSection.jsx # Bullet point lists
│   │       ├── Field.jsx         # Reusable input field
│   │       ├── ReorderableList.jsx # Drag-to-reorder lists
│   │       ├── Section.jsx       # Collapsible section wrapper
│   │       └── ValidationList.jsx # Validation feedback
│   ├── utils/
│   │   └── resumeUtils.js        # Data normalization, path helpers
│   ├── resumeStore.js            # Central state management
│   ├── templateRenderer.js       # HTML generation from JSON
│   ├── aiClient.js               # Backend API client
│   ├── pdfExport.js              # PDF generation wrapper
│   ├── style.css                 # Application styles
│   └── templates.css             # Resume template styles
│
├── server/                       # Backend source
│   ├── index.js                  # Express server entry
│   ├── aiRoutes.js               # AI API endpoints
│   ├── aiAdapter.js              # Provider selection logic
│   ├── geminiService.js          # Gemini API client
│   ├── ollamaService.js          # Ollama API client
│   ├── .env.example              # Environment template
│   └── .gitignore                # Ignore server-local files
│
├── Resume_Formats/               # Template preview images
├── index.html                    # HTML shell
├── package.json                  # Dependencies
├── vite.config.js                # Vite configuration
└── README.md                     # Project documentation
```

---

## Core Components

### Frontend Components

#### App.jsx
**Purpose:** Main orchestration component

**Responsibilities:**
- Manages application state via `resumeStore`
- Coordinates between editor and preview
- Handles template selection
- Manages bulk export operations

**Key State:**
```javascript
{
  resumeData: Object,      // Current resume JSON
  activeTemplate: string,  // Selected template key
  editMode: 'form'|'json', // Editor mode
  aiAvailable: boolean     // AI service status
}
```

#### FormEditor.jsx
**Purpose:** Form-based resume editing

**Features:**
- Dynamic field rendering based on schema
- Collapsible sections
- Add/remove list items
- AI enhancement triggers

**Props:**
```javascript
{
  resumeData: Object,
  onChange: Function,
  onEnhanceBullets: Function,
  onGenerateSummary: Function,
  onSuggestSkills: Function
}
```

#### JsonEditor.jsx
**Purpose:** Raw JSON editing

**Features:**
- Text area for JSON input
- Auto-formatting
- Schema validation
- Nested payload unwrapping

#### PreviewPanel.jsx
**Purpose:** Live resume preview

**Features:**
- Real-time rendering
- Template switching
- Print-optimized styles

#### templateRenderer.js
**Purpose:** Generate HTML from resume JSON

**Function Signature:**
```javascript
function renderResumeHTML(resumeData, templateKey)
```

**Supported Templates:**
- `classic` - Traditional single-column
- `modern` - Two-column with sidebar
- `minimal` - Simple, clean layout
- `photo` - Template with photo support
- `prof-developer` - Software developer focused
- `prof-teacher` - Education focused
- `prof-nurse` - Healthcare focused
- `prof-accountant` - Finance focused
- `prof-sales` - Sales focused
- `prof-customer-service` - Service industry
- `prof-engineer` - Engineering focused

#### resumeStore.js
**Purpose:** Centralized state management

**API:**
```javascript
// Get current state
getStore().getData()

// Update state
getStore().setData(newData)

// Subscribe to changes
getStore().subscribe(callback)

// Reset to initial state
getStore().reset()
```

#### aiClient.js
**Purpose:** Backend API communication

**Functions:**
```javascript
// Check AI availability
checkAiStatus(): Promise<boolean>

// Enhance bullet points
enhanceBullets(bullets, jobTitle, company): Promise<string[]>

// Generate summary
generateSummary(resumeData): Promise<string>

// Enhance description
enhanceDescription(description, context): Promise<string>

// Suggest skills
suggestSkills(resumeData): Promise<Object>

// Parse resume
parseResumeWithAi(rawContent): Promise<Object>

// Identify profession/template
identifyProfession(resumeData): Promise<Object>
```

---

### Backend Components

#### index.js
**Purpose:** Express server setup

**Configuration:**
- Port: `process.env.BACKEND_PORT || 3001`
- CORS: Enabled for all origins
- Body limit: 10MB

**Routes:**
- `GET /api/health` - Health check
- `GET /api/template-library` - List available templates
- `/api/*` - Mounted AI routes

#### aiRoutes.js
**Purpose:** AI API endpoints

**Endpoints:**

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/ai/status` | GET | Get AI provider status |
| `/api/ai/enhance-bullets` | POST | Improve bullet points |
| `/api/ai/generate-summary` | POST | Create professional summary |
| `/api/ai/enhance-description` | POST | Improve descriptions |
| `/api/ai/suggest-skills` | POST | Recommend skills |
| `/api/ai/parse-resume` | POST | Parse unstructured resume |
| `/api/ai/identify-profession` | POST | Auto-select template |

#### aiAdapter.js
**Purpose:** AI provider abstraction

**Functions:**
```javascript
// Get current AI status
getAIStatus(): Promise<Object>

// Call configured AI provider
callAI(systemPrompt, userPrompt, opts?): Promise<Object|string>

// Check if AI is available
isAIAvailable(provider?): Promise<boolean>
```

**Provider Selection Logic:**
```javascript
function usesGemini() {
  return checkGeminiAvailable().available;
}

export async function callAI(systemPrompt, userPrompt, opts = {}) {
  if (usesGemini()) {
    return callGeminiAPI(systemPrompt, userPrompt, opts);
  }
  return callOllama(systemPrompt, userPrompt, opts);
}
```

#### geminiService.js
**Purpose:** Google Gemini API integration

**Configuration:**
```javascript
GEMINI_API_KEY = process.env.GEMINI_API_KEY?.trim()
GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash"
GEMINI_API_VERSION = process.env.GEMINI_API_VERSION || "v1beta"
```

**Functions:**
```javascript
// Check if Gemini is configured
checkGeminiAvailable(): { available: boolean, model: string|null }

// Call Gemini API
callGeminiAPI(systemPrompt, userPrompt, opts): Promise<Object>
```

**API Endpoint:**
```
https://generativelanguage.googleapis.com/{version}/models/{model}:generateContent?key={apiKey}
```

**Request Format:**
```json
{
  "contents": [{
    "role": "user",
    "parts": [{ "text": "..." }]
  }],
  "generationConfig": {
    "responseMimeType": "application/json",
    "temperature": 0.3,
    "topP": 0.95,
    "topK": 40
  }
}
```

#### ollamaService.js
**Purpose:** Local Ollama integration

**Configuration:**
```javascript
OLLAMA_URL = process.env.OLLAMA_URL || "http://localhost:11434/api/generate"
OLLAMA_MODEL = process.env.OLLAMA_MODEL || "gemma4"
```

**Functions:**
```javascript
// Check if Ollama is running
checkOllamaAvailable(): Promise<boolean>

// Call Ollama API
callOllama(systemPrompt, userPrompt, opts): Promise<Object|string>
```

**Request Format:**
```json
{
  "model": "gemma4",
  "system": "...",
  "prompt": "...",
  "stream": false,
  "options": {
    "temperature": 0.3,
    "seed": 42,
    "top_k": 10,
    "top_p": 0.9,
    "num_ctx": 8192
  }
}
```

---

## Data Flow

### Resume Data Schema

```javascript
{
  personal_info: {
    full_name: string,
    email: string,
    phone: string,
    city: string,
    state: string,
    country: string,
    linkedin: string,
    github: string,
    portfolio: string,
    photoUrl: string|null
  },
  summary: string,
  objective: string,
  education: [{
    degree: string,
    field_of_study: string,
    institution: string,
    location: string,
    start_date: string,
    end_date: string,
    gpa: string,
    honors: string,
    relevant_coursework: string[]
  }],
  work_experience: [{
    job_title: string,
    company: string,
    location: string,
    start_date: string,
    end_date: string,
    is_current: boolean,
    responsibilities: string[],
    achievements: string[]
  }],
  technical_skills: {
    programming_languages: string[],
    frameworks_libraries: string[],
    databases: string[],
    cloud_platforms: string[],
    tools_software: string[],
    operating_systems: string[],
    methodologies: string[],
    other: string[]
  },
  soft_skills: string[],
  projects: [{
    name: string,
    description: string,
    technologies_used: string[],
    url: string,
    github_link: string
  }],
  certifications: [{
    name: string,
    issuing_organization: string,
    issue_date: string
  }],
  awards_honors: [{
    title: string,
    date: string,
    issuer: string,
    description: string
  }],
  languages: [{
    language: string,
    proficiency: string
  }]
}
```

### State Flow

```
User Input → FormEditor/JsonEditor
                    ↓
            resumeStore.setData()
                    ↓
            Subscribers notified
                    ↓
    ┌───────────────┴───────────────┐
    ↓                               ↓
PreviewPanel                JSON sync
(templateRenderer)          (JsonEditor)
```

### AI Enhancement Flow

```
User clicks ✨ button
        ↓
aiClient.enhanceBullets() called
        ↓
POST /api/ai/enhance-bullets
        ↓
aiRoutes → aiAdapter.callAI()
        ↓
    ┌───┴───┐
    ↓       ↓
Gemini   Ollama
    ↓       ↓
    └───┬───┘
        ↓
JSON response parsed
        ↓
Return enhanced bullets
        ↓
FormEditor updates state
```

---

## Configuration

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `GEMINI_API_KEY` | - | Google Gemini API key |
| `GEMINI_MODEL` | `gemini-2.5-flash` | Model to use |
| `GEMINI_API_VERSION` | `v1beta` | API version |
| `OLLAMA_URL` | `http://localhost:11434/api/generate` | Ollama endpoint |
| `OLLAMA_MODEL` | `gemma4` | Ollama model name |
| `BACKEND_PORT` | `3001` | Server port |

### Vite Configuration

```javascript
// vite.config.js
export default defineConfig({
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:3001',
      '/template-assets': 'http://localhost:3001'
    }
  }
});
```

---

## API Reference

### Status Endpoint

**GET /api/ai/status**

Response:
```json
{
  "available": true,
  "provider": "gemini",
  "model": "gemini-2.5-flash",
  "gemini": {
    "available": true,
    "model": "gemini-2.5-flash"
  },
  "ollama": {
    "available": false,
    "model": "gemma4"
  }
}
```

### Enhance Bullets

**POST /api/ai/enhance-bullets**

Request:
```json
{
  "bullets": ["string"],
  "jobTitle": "string",
  "company": "string"
}
```

Response:
```json
{
  "enhanced_bullets": ["string"]
}
```

### Generate Summary

**POST /api/ai/generate-summary**

Request:
```json
{
  "resumeData": { ... }
}
```

Response:
```json
{
  "summary": "string"
}
```

### Suggest Skills

**POST /api/ai/suggest-skills**

Request:
```json
{
  "resumeData": { ... }
}
```

Response:
```json
{
  "suggested_skills": {
    "programming_languages": ["string"],
    "frameworks_libraries": ["string"],
    ...
  }
}
```

### Identify Profession

**POST /api/ai/identify-profession**

Request:
```json
{
  "resumeData": { ... }
}
```

Response:
```json
{
  "template": "prof-developer",
  "confidence": "high",
  "reason": "string"
}
```

---

## Deployment

### Build for Production

```bash
npm run build
```

This creates a `dist/` folder with static files.

### Serve Production Build

```bash
npm run preview
```

### Environment Setup

1. Copy `.env.example` to `.env`
2. Configure your AI provider:
   - For Gemini: Set `GEMINI_API_KEY`
   - For Ollama: Ensure Ollama is running on the server

### Docker Deployment (Example)

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3001
CMD ["node", "server/index.js"]
```

---

## Error Handling

### Backend Error Responses

All endpoints return consistent error format:

```json
{
  "error": "Error message"
}
```

### HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 400 | Bad Request (missing/invalid input) |
| 500 | Server Error (AI failure, etc.) |

### Frontend Error Handling

```javascript
try {
  const result = await aiClient.enhanceBullets(bullets);
} catch (error) {
  console.error('Enhancement failed:', error.message);
  // Show user-friendly error
}
```

---

## Testing

### Manual Testing

1. Start both frontend and backend
2. Navigate through all sections
3. Test AI features with sample data
4. Verify PDF export
5. Test all templates

### AI Testing

```bash
# Test Gemini connection
curl http://localhost:3001/api/ai/status

# Test enhancement
curl -X POST http://localhost:3001/api/ai/enhance-bullets \
  -H "Content-Type: application/json" \
  -d '{"bullets": ["I wrote code"]}'
```

---

## Performance Considerations

### Frontend

- React components use memoization where appropriate
- Template rendering is optimized for minimal reflows
- PDF generation happens client-side (no server load)

### Backend

- Stateless design allows horizontal scaling
- AI requests are proxied without transformation
- No database required

### AI Provider Selection

- Gemini is preferred when configured (faster, higher quality)
- Ollama runs locally (no network latency, but uses local resources)
- Selection happens at startup based on environment configuration

---

## Security Considerations

### API Key Storage

- API keys stored in `.env` (not committed to git)
- Keys never exposed to frontend
- All AI calls happen server-side

### Input Validation

- Request body size limited to 10MB
- Input validated before AI processing
- Output sanitized before rendering

### CORS

- Currently allows all origins
- Configure appropriately for production:
  ```javascript
  app.use(cors({
    origin: 'https://your-domain.com'
  }));
  ```

---

## Troubleshooting Guide

### Common Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| "AI Engine: Offline" | No API key, Ollama not running | Configure Gemini key or start Ollama |
| PDF blank | html2pdf not loaded | Check CDN connection |
| Port in use | Another process using port | Change port in config |
| JSON parse error | Invalid JSON in editor | Validate JSON syntax |

### Debug Mode

Enable verbose logging:
```javascript
// In aiAdapter.js
console.log('Using provider:', status.provider);
console.log('Request:', { systemPrompt, userPrompt });
```

---

## Future Enhancements

Potential improvements:

1. **Database Integration** - Save/load resumes
2. **User Authentication** - Multi-user support
3. **More AI Providers** - Claude, GPT-4 support
4. **Template Editor** - Custom template creation
5. **Version History** - Track changes over time
6. **Cover Letter Generator** - Extend AI features
7. **Job Matching** - Compare resume to job descriptions

---

*Technical Manual for Resume Creator v1.0*