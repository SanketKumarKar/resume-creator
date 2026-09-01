# Resume Creator - Pitch Deck

## Slide 1: Cover Slide

# Resume Creator
### Build Professional Resumes with AI

---

## Slide 2: The Problem

### Traditional Resume Creation is Painful

- **Time-consuming** - Writing and formatting takes hours
- **Writer's block** - Difficulty articulating achievements
- **ATS unfriendly** - Many resumes fail automated screening
- **Limited templates** - Generic designs don't stand out
- **One-size-fits-all** - No profession-specific formatting

### The Consequences

-Qualified candidates get rejected by ATS systems
-Hours wasted on formatting instead of content
-Resumes look unprofessional or inconsistent

---

## Slide 3: Our Solution

### AI-Powered Resume Builder

Resume Creator helps you create professional, ATS-friendly resumes in minutes:

- **Smart AI assistant** - Enhance content automatically
- **Live preview** - See exactly how your resume looks
- **Multiple templates** - Profession-specific designs
- **Form or JSON mode** - Edit however you prefer
- **One-click PDF export** - Production-ready output

---

## Slide 4: Key Features

### 1. Live Editor
```
┌──────────────────────────────────────────────┐
│  [Template Selector]  [JSON/Form]  [PDF]   │
└──────────────────────────────────────────────┘
┌─────────────────┬──────────────────────────────┐
│  FORM EDITOR    │   LIVE PREVIEW               │
│  - Personal Info│   [Resume Preview Here]      │
│  - Experience   │                              │
│  - Skills       │   (Updates in real-time)     │
│  - Education    │                              │
│  - Projects     │                              │
└─────────────────┴──────────────────────────────┘
```

### 2. AI Enhancement
- **✨ Enhance bullets** - Transform plain text to impactful statements
- **✨ Generate summary** - Create compelling professional blurbs
- **✨ Suggest skills** - Discover relevant skills you may have missed

### 3. Template Library
- Classic, Modern, Minimal
- Developer, Teacher, Nurse, Accountant, Sales, Engineer, Customer Service

---

## Slide 5: How It Works

### Three-Step Process

```
1. EDIT YOUR RESUME
   ↓
   Choose a template
   Fill in your details
   Use AI to enhance content

2. PREVIEW IN REAL-TIME
   ↓
   See exactly how it looks
   Make adjustments as needed
   Switch templates instantly

3. EXPORT TO PDF
   ↓
   Download ATS-friendly PDF
   Ready to submit to employers
```

---

## Slide 6: Technology Stack

### Frontend
- **React 19** - Modern UI framework
- **Vite** - Fast development and build
- **HTML2PDF.js** - High-quality PDF generation

### Backend
- **Node.js + Express** - Reliable API server
- **CORS support** - Secure cross-origin requests

### AI Integration
- **Google Gemini API** - Cloud-based AI (when configured)
- **Local Ollama** - Private, offline AI (default)

```
┌─────────────────────────────────────────────────┐
│  Choose your AI provider:                       │
│                                                 │
│  ☐ Google Gemini API (cloud)                    │
│     - Free API key from Google AI Studio        │
│     - Fast, high-quality results                │
│                                                 │
│  ☑ Local Ollama (offline)                       │
│     - Runs on your machine                      │
│     - No API costs                              │
│     - No data leaves your computer              │
└─────────────────────────────────────────────────┘
```

---

## Slide 7: Getting Started

### Installation (3 commands)

```bash
# 1. Clone and install
git clone <repo>
cd resume-creator
npm install

# 2. Configure
cp server/.env.example server/.env
# Edit .env with your Gemini key (optional)

# 3. Run
npm run dev
# Open http://localhost:5173
```

### System Requirements
- Node.js 18+
- Browser with JavaScript enabled
- Either: Gemini API key OR Ollama installed

---

## Slide 8: Use Cases

### Who Should Use Resume Creator?

**Job Seekers**
- Quickly create professional resumes
- Stand out with ATS-friendly formatting
- Customize for different roles

**Career Changers**
- Highlight transferable skills
- Present experience in new context
- Overcome industry gaps

**Students & Grads**
- Create first professional resume
- Showcase academic achievements
- Emphasize relevant projects

**Professionals**
- Update existing resume
- Tailor for specific applications
- Maintain consistent format

---

## Slide 9: Pricing & Business Model

### Free Tier (Current)
- Unlimited resume creation
- All templates available
- Form and JSON editing
- PDF export
- Local AI (Ollama)

### Future Pro Tier (Planned)
- **$5/month or $50/year**
- Cloud AI enhancements (no local setup)
- Template customization
- Resume library storage
- ATS score analysis
- Priority support

### Revenue Streams
- Pro subscription
- Enterprise licensing
- Resume review services

---

## Slide 10: Market Opportunity

### Resume Tools Market

| Statistic | Value |
|-----------|-------|
| Global market size | $1.5B+ |
| Annual growth | 8.5% CAGR |
| Target users | 100M+ job seekers |
| Competition | Large, fragmented |

### Our Edge
- **Free and open-source** - Build user base quickly
- **Privacy-focused** - Local AI by default
- **Professional templates** - Industry-specific designs
- **AI-assisted** - Modern approach to content

---

## Slide 11: Traction & Roadmap

### Current Status
- ✅ Resume creator complete
- ✅ AI enhancement working
- ✅ Multiple templates
- ✅ PDF export functional
- 🔄 Documentation in progress
- 🔄 Testing suite running

### Short-Term (Q1-Q2)
- Add cover letter generator
- Integrate more AI providers
- Add version history
- Implement database storage

### Long-Term (Q3-Q4)
- Mobile app version
- Enterprise features
- Resume scanning (OCR)
- LinkedIn profile parser

---

## Slide 12: Team

### The Creator
**Sanket Kumar Kar**
- Full-stack developer
- Experience with React, Node.js
- Passion for productivity tools

### Advisors
- [J. Lakshmi] - Project Lead/Manager

---

## Slide 13: Contact & Demo

### Let's Connect!

**GitHub:** github.com/SanketKumarKar/resume-parser

**Email:** sanketkumarkar@.com

**Demo:** http://localhost:5173 (after npm run dev)

### Thank You!

Questions?