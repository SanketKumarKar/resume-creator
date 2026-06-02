# Resume Creator

A beautiful, ATS-friendly resume generator built with Vanilla JavaScript, Vite, and Express. It features a reactive live-preview editor, two-way sync with raw JSON data, and AI-powered text enhancement using Ollama.

## 🌟 Features

- **Live Preview:** See changes instantly as you type.
- **Three Professional Templates:** 
  - **Classic:** Traditional serif design, great for corporate roles.
  - **Modern:** Two-tone sidebar layout for a sleek, contemporary look.
  - **Minimal:** Clean, lightweight, and straightforward.
- **Dual Editing Modes:** 
  - **Form Editor:** An intuitive GUI with collapsible sections and dynamic list management.
  - **JSON Editor:** Advanced mode to paste raw structured JSON. It automatically unwraps nested payloads (like `{ "data": { ... } }`).
- **AI-Powered Enhancements:** Automatically enhance bullet points, generate summaries, and suggest relevant skills using a local Ollama instance (running the Gemma4 model).
- **High-Quality PDF Export:** Export your resume to a perfectly formatted A4 PDF in one click using `html2pdf.js`.
- **ATS-Friendly Output:** The generated HTML uses semantic tags and standard font pairings that parse accurately for Applicant Tracking Systems.

## 🚀 Tech Stack

- **Frontend:** Vanilla JavaScript, Vite, CSS3
- **Backend:** Node.js, Express.js
- **AI Integration:** Local Ollama API (`gemma` model)
- **PDF Generation:** `html2pdf.js` (loaded via CDN)

## 📦 Project Structure

```text
resume-creator/
├── src/
│   ├── main.js                 # App entry point & event wiring
│   ├── resumeStore.js          # Reactive centralized data store
│   ├── templateRenderer.js     # Engine to generate HTML from JSON data
│   ├── formEditor.js           # GUI editor logic (sections, dynamic arrays, AI calls)
│   ├── jsonEditor.js           # Raw JSON textarea handler
│   ├── aiClient.js             # API wrapper for backend endpoints
│   ├── pdfExport.js            # html2pdf integration
│   ├── style.css               # App UI styles (dark theme, layouts)
│   └── templates.css           # Resume template styles (Classic, Modern, Minimal)
├── server/
│   ├── index.js                # Express server setup
│   ├── aiRoutes.js             # Express endpoints for AI generation
│   └── ollamaService.js        # Logic to communicate with local Ollama daemon
├── index.html                  # Main application HTML shell
├── package.json
└── vite.config.js              # Vite configuration with backend proxy
```

## 💻 Getting Started

### Prerequisites

1. **Node.js** (v18 or higher recommended)
2. **Ollama:** You must have Ollama installed and running locally to use the AI enhancement features. Pull the required model:
   ```bash
   ollama run gemma:2b
   # Note: The codebase defaults to "gemma" or "gemma4". Ensure your local model name matches the config.
   ```

### Installation

1. Clone the repository and navigate into the folder:
   ```bash
   git clone <your-repo-url>
   cd resume-creator
   ```

2. Install the dependencies:
   ```bash
   npm install
   ```

3. Run the development environment:
   ```bash
   npm run dev
   ```
   This uses `concurrently` to launch both the Vite frontend dev server (default port `5173`) and the Express backend (default port `3001`) simultaneously.

4. Open your browser and navigate to `http://localhost:5173`.

## 🤖 Using the AI Features

If Ollama is running correctly, you will see an "AI Engine: Ready" badge in the UI. In the Form Editor, look for the sparkle ✨ buttons to:
- **Enhance Descriptions:** Rewrites basic text into professional, action-oriented bullet points.
- **Generate Summary:** Reads your current Work Experience and Education to write a compelling professional summary.
- **Suggest Skills:** Recommends technical and soft skills based on your job history.

## 📝 Editing with JSON

You can switch to the JSON Editor and paste a structured JSON file. The app handles the standard resume format:
```json
{
  "personal_info": {
    "full_name": "Jane Doe",
    "email": "jane@example.com",
    "phone": "+1 (555) 123 4567"
  },
  "summary": "Experienced software engineer...",
  "work_experience": [ ... ],
  "education": [ ... ],
  "skills": [ ... ]
}
```
*Note: The app will also automatically unwrap nested structures like `{ "filename": "x.doc", "data": { ... } }` for convenience.*
