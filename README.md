# 🧠 Synapse AI — Free-Tier AI Knowledge & RAG Platform

> **A free-tier, production-ready AI Knowledge Hub** engineered for students, developers, and researchers. Upload PDFs, transcribe YouTube lectures, perform semantic RAG vector searches, generate interactive quizzes, practice with spaced-repetition flashcards, and synthesize academic revision notes—all at **$0.00 infrastructure cost**.

---

## ⚡ Key Capabilities

- 📄 **Advanced PDF Intelligence**: Multi-file drag & drop, text extraction, sliding-window chunking (750 chars / 100 overlap), and vector indexing.
- ▶️ **YouTube Knowledge Ingestion**: Ingest video lectures by URL to extract timestamped chapter transcripts and index them for semantic Q&A.
- 💬 **Conversational RAG Chat**: Multi-turn research assistant with strict grounding guardrails (*"The information was not found in your knowledge sources"*), inline citations with relevance scores, and page/timestamp snippets.
- 🔎 **Global Semantic Search**: Instant keyboard shortcut (`Cmd+K` / `Ctrl+K`) search across documents, vector chunks, and notes.
- 🧪 **Interactive Quiz Arena**: AI-generated Multiple Choice, True/False, and Short Answer questions at Easy, Medium, or Hard difficulty with timers and detailed explanations.
- 🃏 **Spaced-Repetition Flashcards**: 3D flip card animations with active recall mastery ratings (*Still Learning*, *Almost Mastered*, *Mastered*).
- 🎓 **AI Study Assistant**: Generates customized multi-day syllabus roadmaps, daily modules, and high-yield examination question banks.
- 📝 **AI Summaries & Notes**: TL;DR, chapter outlines, formula extraction, and structured study notes with Markdown/TXT/JSON export.
- 🎙️ **Browser-Native Voice AI**: Zero-cost speech-to-text voice queries and text-to-speech recitation using the standard Web Speech API.
- 🛡️ **Free-Tier Cost Protection**: Built-in quota monitoring, request/token counters, and deterministic vector fallbacks to prevent accidental cloud billing.

---

## 💰 Free-Tier Architecture Matrix

| Layer | Service / Technology | Free Allowance | Credit Card Required? |
| :--- | :--- | :--- | :--- |
| **Frontend & Backend** | **Render / Vercel** | 750 free compute hours/mo, 100 GB bandwidth | **No** |
| **AI LLM & RAG** | **Google Gemini 3.8 Flash** | 1,500 requests/day, 1M tokens/min | **No** |
| **Embeddings & Vector**| **pgvector / Built-in Memory** | Unlimited in-memory (up to 50k vectors) | **No** |
| **Voice (TTS & STT)** | **Web Speech API** | Unlimited (native client-side) | **No** |
| **Database (Optional)**| **Neon / Supabase PostgreSQL** | 0.5 GB serverless storage | **No** |

---

## 🚀 Quick Start (Local Setup)

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- [Git](https://git-scm.com/)
- A free Gemini API key from [Google AI Studio](https://aistudio.google.com) (no credit card required)

### Windows Command Prompt (CMD)

```cmd
:: 1. Clone repository
git clone https://github.com/YOUR_USERNAME/synapse-ai-platform.git
cd synapse-ai-platform

:: 2. Install dependencies
npm install

:: 3. Configure environment variables
copy .env.example .env
notepad .env
```
*(Paste your free `GEMINI_API_KEY` into `.env` and save)*

```cmd
:: 4. Start full-stack development server
npm run dev
```

Visit **http://localhost:3000** in your browser.

---

## 📦 Push to GitHub

### 1. Create a new repository on GitHub
Go to [github.com/new](https://github.com/new), name it `synapse-ai-platform`, and click **Create repository** (do not check initialize with README, as we already have this README).

### 2. Run the Git commands:

```cmd
:: Initialize git (if not already initialized)
git init

:: Add all files (secrets in .env are safely excluded via .gitignore)
git add .

:: Commit files
git commit -m "feat: complete free-tier AI knowledge platform with RAG, quizzes, and voice"

:: Set default branch
git branch -M main

:: Link remote and push
git remote add origin https://github.com/YOUR_USERNAME/synapse-ai-platform.git
git push -u origin main
```

---

## 🌐 1-Click Free Deployment

### Deploy to Render (750 Free Hours/Month)
1. Go to [dashboard.render.com](https://dashboard.render.com) and click **New + → Web Service**.
2. Connect your GitHub repository.
3. Select the repository; the bundled `render.yaml` automatically populates the build and start settings:
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
4. Under **Environment Variables**, add:
   - `GEMINI_API_KEY`: *(your free key)*
   - `NODE_ENV`: `production`
   - `PORT`: `3000`
5. Click **Deploy Web Service**.

### Deploy with Docker
```cmd
docker-compose up --build -d
```

---

## 📁 Repository Structure

```
.
├── DEPLOYMENT.md             # Complete step-by-step free-tier deployment guide
├── Dockerfile                # Production multi-stage Docker container
├── docker-compose.yml        # Multi-container orchestration
├── render.yaml               # Infrastructure-as-code for 1-click Render deploy
├── vercel.json               # SPA routing configuration for Vercel
├── server.ts                 # Express full-stack entry point & security headers
├── server/
│   ├── types.ts              # TypeScript contracts for documents, chunks, quizzes
│   ├── state.ts              # Knowledge state repository with pre-seeded datasets
│   ├── providers/            # Abstracted providers (AI, Document, Vector, Embedding)
│   └── routes/               # Modular REST endpoints (RAG, Chat, YouTube, Quiz, etc.)
├── src/
│   ├── components/           # UI components (RAG Chat, Document Manager, Quizzes, Flashcards)
│   ├── services/             # Client API service and browser Web Speech API
│   ├── App.tsx               # Main application controller
│   └── main.tsx              # React 19 entry point
└── package.json
```

---

## 🔒 Security & Cost Protections

- **Zero Hardcoded Secrets**: All keys use `process.env` and `.env` is ignored by git.
- **Quota Safeguards**: Prevents runaway recursive loops by caching generated quizzes and summaries.
- **Deterministic Vector Fallback**: Guarantees uninterrupted search and zero downtime even if free API rate limits are temporarily reached.
- **Resource Ownership**: Documents and vectors are scoped and isolated.

---

## 📄 License

Apache-2.0 License. Built for students, engineers, and researchers everywhere.
