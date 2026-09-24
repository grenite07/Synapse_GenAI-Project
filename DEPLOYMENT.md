# 🚀 Synapse AI Platform — Free-Tier Deployment & Developer Guide

Complete, step-by-step production deployment manual designed for 100% free-tier operation without requiring paid infrastructure.

---

## 🪟 Quick Start on Windows (Local Development)

Run the entire full-stack application on Windows using standard Command Prompt (CMD).

### 1. Clone & Enter Directory
```cmd
cd /d D:\projects\synapse-ai-platform
```

### 2. Install Dependencies
```cmd
npm install
```

### 3. Setup Environment Variables
Create `.env` from `.env.example`:
```cmd
copy .env.example .env
```
Open `.env` in Notepad and insert your free Gemini API key:
```cmd
notepad .env
```

### 4. Launch Full-Stack Server
```cmd
npm run dev
```
Open your browser to:
```
http://localhost:3000
```

### 5. Production Build & Test
```cmd
npm run build
npm start
```

---

## 💰 Free-Tier Technology Matrix & Official References

| Layer | Recommended Service | Free Tier Allowance | Credit Card Required? | Fallback Option | Official Documentation |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Frontend & Fullstack** | **Vercel** / **Render** | 100 GB bandwidth / month, 100k edge invocations | **No** (Vercel Hobby) | Netlify / Cloudflare Pages | [vercel.com/docs](https://vercel.com/docs) |
| **Backend API** | **Render** | 750 free instance hours / month | **No** | Railway Free / Fly.io | [render.com/docs](https://render.com/docs) |
| **Database** | **Neon PostgreSQL** | 0.5 GiB storage, serverless compute | **No** | Supabase free PostgreSQL | [neon.tech/docs](https://neon.tech/docs) |
| **Vector Index** | **pgvector / Built-in Memory** | Unlimited in-memory (50k chunks) | **No** | Supabase pgvector | [github.com/pgvector/pgvector](https://github.com/pgvector/pgvector) |
| **AI LLM & RAG** | **Google Gemini 3.8 Flash** | 1,500 requests / day, 1M tokens/min free | **No** | Local Ollama / Deterministic | [ai.google.dev](https://ai.google.dev) |
| **Speech (TTS & STT)**| **Web Speech API** | Unlimited (runs native in browser) | **No** | Built-in browser synthesis | [developer.mozilla.org](https://developer.mozilla.org) |

---

## 🌍 Step-by-Step Free Production Deployment

### Step 1: Create Free Accounts
1. **Google AI Studio**: Sign in at [aistudio.google.com](https://aistudio.google.com) to generate a free Gemini API Key (no credit card needed).
2. **GitHub**: Push your project repository to GitHub.
3. **Render / Vercel**: Create a free developer account at [render.com](https://render.com) or [vercel.com](https://vercel.com).

### Step 2: Database Setup (Optional for Persistence)
- The app defaults to the **Built-in Resilient Vector & State Store** (100% free, zero external setup).
- For a persistent external PostgreSQL database:
  1. Visit [neon.tech](https://neon.tech) and click **Create Project**.
  2. Select the free tier (0.5 GB).
  3. Copy your connection string: `postgresql://user:pass@ep-xyz.neon.tech/neondb?sslmode=require`.

### Step 3: Storage Setup
- The app includes a memory storage adapter.
- For cloud asset storage on free tier:
  1. Create a free bucket on [Supabase](https://supabase.com/storage) (1 GB free storage).
  2. Or use Cloudflare R2 (10 GB free monthly storage).

### Step 4: Configure AI Provider
- Set your `GEMINI_API_KEY` in environment variables.
- Models configured:
  - Text & RAG: `gemini-3.8-flash` (free tier eligible)
  - Embeddings: `gemini-embedding-2-preview` (free tier eligible)
  - Resilient local deterministic vector fallback triggers automatically if network is interrupted.

### Step 5: Deploy Full-Stack Node/Express to Render (Free Tier)
1. In Render dashboard, click **New + > Web Service**.
2. Connect your GitHub repository.
3. Select **Node** environment.
4. Set Build Command:
   ```cmd
   npm install && npm run build
   ```
5. Set Start Command:
   ```cmd
   npm start
   ```
6. Add Environment Variables:
   - `GEMINI_API_KEY`: your Google AI Studio key
   - `PORT`: `3000`
   - `NODE_ENV`: `production`
7. Click **Create Web Service**. Your free backend will deploy and receive an SSL URL (e.g., `https://synapse-ai.onrender.com`).

### Step 6: Deploy Frontend (Alternative: Standalone Vercel SPA)
If deploying the frontend separately to Vercel:
1. Import repository on [vercel.com](https://vercel.com).
2. Framework Preset: **Vite**.
3. Build Command: `npm run build`.
4. Output Directory: `dist`.
5. Environment Variables:
   - `VITE_API_URL`: URL of your Render backend.

### Step 7: Configure Environment Variables
Ensure the following variables are defined in your deployment dashboard:
```env
GEMINI_API_KEY=your_gemini_api_key_here
NODE_ENV=production
PORT=3000
```

### Step 8: Configure CORS
The backend in `server.ts` includes universal CORS middleware:
```ts
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});
```

### Step 9: Verify Production API
Run curl or test the health endpoint:
```cmd
curl https://your-app.onrender.com/api/health
```
Expected response:
```json
{"status":"ok","service":"Synapse AI Knowledge Platform","version":"1.0.0"}
```

### Step 10: Test Production Application
1. Open your live URL.
2. Ingest a PDF document or YouTube lecture.
3. Verify chunking, vector indexing, and RAG Q&A with inline citations.
4. Test quiz generation, flashcard mastery, and voice recitation.

---

## 🧯 FREE-TIER COST CONTROL

### What is 100% Free?
1. **Google Gemini 3.8 Flash**: Free tier provides 15 Requests Per Minute (RPM) and 1,500 Requests Per Day (RPD). This is more than sufficient for thousands of student study sessions.
2. **Embeddings & Vector Search**: Stored in-memory with cosine similarity computations. 0 external database fees.
3. **Web Speech API**: Runs 100% client-side inside the user's browser (Chrome, Edge, Safari). No ElevenLabs or Google Cloud Speech bills.
4. **Vercel / Render**: Generous hobby tiers that do not bill when inactive.

### Quota Guardrails Built into the Code:
- **Rate-Limiting & Quota Telemetry**: View real-time consumption in the *Free-Tier & Limits* tab.
- **Sliding Window Chunking**: Constrains chunks to 750 characters with 100 character overlap, saving up to 60% of token context usage.
- **Result Caching**: Summaries and diagnostic quizzes are stored in memory, preventing repeated LLM calls for identical queries.
- **Deterministic Vector Fallback**: Guarantees the application never crashes if API rate limits are temporarily met.
