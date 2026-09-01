# Resume Creator

A smart resume builder that helps you create professional, ATS-friendly resumes with AI assistance.

## What It Does

Resume Creator is a web application that lets you:
- **Edit your resume** using a simple form or by pasting JSON data
- **See live preview** as you type
- **Use AI to improve your content** - enhance bullet points, generate summaries, and get skill suggestions
- **Choose from professional templates** - Classic, Modern, Minimal, and profession-specific designs
- **Export to PDF** with one click

## How It Works

The app has two parts:
1. **Frontend** - A React web interface where you edit your resume
2. **Backend** - A Node.js server that provides AI features

### AI Provider Selection

The AI features automatically choose between two options:

**Option 1: Google Gemini API** (Cloud-based, requires free API key)
- Used when you configure `GEMINI_API_KEY` in your `.env` file
- Fast and powerful
- Get your free key at: https://aistudio.google.com/app/apikey

**Option 2: Local Ollama** (Free, runs on your computer)
- Used automatically when no Gemini key is configured
- Requires Ollama installed on your machine
- Download from: https://ollama.com

## Quick Start

### Prerequisites

- **Node.js** (version 18 or higher)
- **Either**:
  - A Gemini API key (free from Google AI Studio), **OR**
  - Ollama installed locally with the `gemma4` model

### Installation

1. **Install dependencies:**
   ```bash
   cd resume-creator
   npm install
   ```

2. **Configure environment:**
   ```bash
   # Copy the example file
   cp server/.env.example server/.env
   
   # Then edit server/.env and add your Gemini API key
   # OR leave it empty to use local Ollama
   ```

3. **Run the application:**
   ```bash
   npm run dev
   ```
   
   This starts both the frontend (http://localhost:5173) and backend (http://localhost:3001).

4. **Open your browser** and go to http://localhost:5173

## Using the AI Features

When the AI engine is ready, you'll see a green "AI Engine: Ready" badge.

Click the sparkle ✨ buttons to:
- **Enhance bullet points** - Turn basic descriptions into professional achievements
- **Generate summary** - Create a compelling professional summary from your experience
- **Suggest skills** - Get recommendations based on your work history
- **Smart template selection** - Auto-pick the best template for your profession

## Templates

- **Classic** - Traditional design for corporate roles
- **Modern** - Two-column layout with accent colors
- **Minimal** - Clean and simple
- **Profession-specific** - Tailored templates for developers, teachers, nurses, accountants, sales, customer service, and engineers

## Configuration

Edit `server/.env` to customize:

```env
# Use Gemini (cloud AI)
GEMINI_API_KEY=your_key_here
GEMINI_MODEL=gemini-2.5-flash
GEMINI_API_VERSION=v1beta

# Use Ollama (local AI) - used when GEMINI_API_KEY is empty
OLLAMA_URL=http://localhost:11434/api/generate
OLLAMA_MODEL=gemma4

# Server port
BACKEND_PORT=3001
```

## Tech Stack

- **Frontend:** React 19, Vite
- **Backend:** Node.js, Express
- **AI:** Google Gemini or Ollama
- **PDF Export:** html2pdf.js

## Project Structure

```
resume-creator/
├── src/                    # React frontend
│   ├── components/         # UI components
│   ├── aiClient.js         # API communication
│   ├── resumeStore.js      # Data management
│   └── templateRenderer.js # Template engine
├── server/                 # Express backend
│   ├── index.js            # Server setup
│   ├── aiRoutes.js         # AI endpoints
│   ├── aiAdapter.js        # Provider selection
│   ├── geminiService.js    # Gemini API client
│   └── ollamaService.js    # Ollama API client
└── Resume_Formats/         # Template images
```

## Tips

- The app works offline if you use local Ollama
- Your data stays on your computer - nothing is sent to external servers except AI requests
- Use the JSON editor for bulk editing or importing existing resumes
- Export to PDF produces ATS-friendly output optimized for job applications

## Troubleshooting

**AI Engine shows "Offline":**
- If using Gemini: Check your API key in `server/.env`
- If using Ollama: Make sure Ollama is running (`ollama serve`) and the `gemma4` model is installed

**Port 3001 or 5173 already in use:**
- Change `BACKEND_PORT` in `server/.env`
- Change frontend port in `vite.config.js`

**PDF export not working:**
- Check browser console for errors
- Try a different browser (Chrome/Edge recommended)
