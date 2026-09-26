# 🧠 Synapse AI — Free-Tier AI Knowledge & RAG Platform

> **A free-tier, production-ready AI Knowledge Hub** engineered for students, developers, and researchers. Upload PDFs, transcribe YouTube lectures, perform semantic RAG vector searches, generate interactive quizzes, practice with spaced-repetition flashcards, and synthesize academic revision notes—all at **$0.00 infrastructure cost**.

---

YOU CAN SEE THE WEB LINK FROM HERE.
https://synapse-genai-project.onrender.com/

## 📸 Visual Overview & Interface

| **Academic & Technical Dashboard** | **Conversational RAG Chat & Grounding** |
| :---: | :---: |
| *Centralized metrics, tracking vector chunks, and quick actions.* | *Strict grounding guardrails, inline citations, and LaTeX formula support.* |

| **Interactive Diagnostic Quiz Arena** | **Spaced-Repetition Flashcards** |
| :---: | :---: |
| *AI-generated MCQs, True/False, and instant explanations.* | *Active recall mastery tracking with 3D card flipping.* |

<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/54ad6fdd-3371-4f75-a425-ae4610ad4b53" />

<img width="1920" height="1080" alt="Screenshot (21)" src="https://github.com/user-attachments/assets/b40b2bc1-562b-4df3-8a0b-24b5de68fd0c" />
<img width="1920" height="1080" alt="Screenshot (22)" src="https://github.com/user-attachments/assets/83b3522c-25fb-4946-b38c-22c77f9897eb" />
<img width="1920" height="1080" alt="Screenshot (23)" src="https://github.com/user-attachments/assets/b1568a74-510f-4a3d-8b38-70398d7409cd" />
<img width="1920" height="1080" alt="Screenshot (24)" src="https://github.com/user-attachments/assets/dbba439c-6d87-4352-9474-de6c64a14dec" />
<img width="1920" height="1080" alt="Screenshot (26)" src="https://github.com/user-attachments/assets/c8adefce-a805-467e-852e-26046d340453" />
<img width="1920" height="1080" alt="Screenshot (25)" src="https://github.com/user-attachments/assets/9e675098-fe84-4fb1-bdfc-f3809b078006" />




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

## 🏗️ Technical Architecture & Tech Stack

Synapse AI is built using a modern, lightweight, and cost-optimized tech stack designed to operate completely within free-tier limits:

* **Frontend**: React, Vite, Tailwind CSS / Custom UI, Lucide Icons, Markdown/LaTeX rendering engines.
* **AI Engine**: Google Gemini Flash (leveraging high-tier free quotas for lightning-fast inference and embedding generation).
* **Vector Pipeline**: In-memory/local sliding-window chunking ($750$ character windows with $100$ character overlaps) coupled with semantic indexing.
* **State & Storage**: Client-side persistence, modular workspace architecture, and optimized document taxonomic libraries.

---

## 🚀 Getting Started Locally

Follow these instructions to set up and run Synapse AI on your local machine.

### Prerequisites

* Node.js (version 18.x or higher recommended)
* npm or yarn package manager
* A free Google Gemini API key ([Get one here](https://aistudio.google.com/))
