import {
  KnowledgeItem,
  ChatConversation,
  ChatMessage,
  NoteItem,
  QuizSession,
  FlashcardDeck,
  StudyPlan,
  FreeTierUsage,
} from '../types';

// Support decoupled deployment (Frontend on Vercel, Backend on Render)
const RAW_API_BASE = import.meta.env.VITE_API_URL || '';
export const API_BASE = RAW_API_BASE.replace(/\/+$/, '');

/**
 * Robust fetch helper with timeout, error handling, and auto-retry
 * specifically designed to handle Render free-tier cold-start wakeups (which take 30-50s on initial ping).
 */
async function safeFetch(url: string, options?: RequestInit, retries = 2): Promise<Response> {
  const fullUrl = url.startsWith('http') ? url : `${API_BASE}${url}`;
  
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController();
      // Render free-tier cold starts take up to 60s
      const timeoutId = setTimeout(() => controller.abort(), 65000);
      
      const res = await fetch(fullUrl, {
        ...options,
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
          ...(options?.headers || {}),
        },
      });
      
      clearTimeout(timeoutId);
      return res;
    } catch (err: any) {
      const isLastAttempt = attempt === retries;
      if (isLastAttempt) {
        console.warn(`[API] Failed to fetch ${fullUrl} after ${retries + 1} attempts:`, err);
        throw err;
      }
      // Wait 3 seconds before retrying to allow Render free tier spin-up
      await new Promise((r) => setTimeout(r, 3000));
    }
  }
  throw new Error(`Failed to reach ${fullUrl}`);
}

export const api = {
  // Check backend connectivity and status
  async checkHealth(): Promise<{ status: string; service: string }> {
    try {
      const res = await safeFetch('/api/health');
      return await res.json();
    } catch {
      return { status: 'offline', service: 'Unavailable' };
    }
  },

  // Documents
  async getDocuments(): Promise<KnowledgeItem[]> {
    try {
      const res = await safeFetch('/api/documents');
      const json = await res.json();
      return json.data || [];
    } catch {
      return [];
    }
  },

  async getDocument(id: string): Promise<KnowledgeItem> {
    const res = await safeFetch(`/api/documents/${id}`);
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to fetch document');
    return json.data;
  },

  async uploadDocument(formData: {
    fileName: string;
    fileData: string;
    mimeType: string;
    category?: string;
    tags?: string[];
  }): Promise<KnowledgeItem> {
    const res = await safeFetch('/api/documents/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Upload failed');
    return json.data;
  },

  async updateDocument(
    id: string,
    updates: { title?: string; category?: string; favorite?: boolean; tags?: string[] }
  ): Promise<KnowledgeItem> {
    const res = await safeFetch(`/api/documents/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Update failed');
    return json.data;
  },

  async deleteDocument(id: string): Promise<void> {
    const res = await safeFetch(`/api/documents/${id}`, { method: 'DELETE' });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Delete failed');
  },

  // YouTube
  async processYouTube(url: string, category?: string, customTitle?: string): Promise<KnowledgeItem> {
    const res = await safeFetch('/api/youtube/process', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url, category, customTitle }),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'YouTube processing failed');
    return json.data;
  },

  // Chat
  async getConversations(): Promise<ChatConversation[]> {
    try {
      const res = await safeFetch('/api/chat/conversations');
      const json = await res.json();
      return json.data || [];
    } catch {
      return [];
    }
  },

  async createConversation(title?: string): Promise<ChatConversation> {
    const res = await safeFetch('/api/chat/conversations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title }),
    });
    const json = await res.json();
    return json.data;
  },

  async sendMessage(
    conversationId: string,
    message: string,
    mode: string = 'knowledge-base',
    selectedSourceId?: string
  ): Promise<{ data: ChatMessage; conversation: ChatConversation }> {
    const res = await safeFetch(`/api/chat/conversations/${conversationId}/message`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, mode, selectedSourceId, stream: false }),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Message sending failed');
    return json;
  },

  // Summaries
  async generateSummary(documentId: string, format: string = 'detailed') {
    const res = await safeFetch('/api/summaries/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ documentId, format }),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Summary failed');
    return json.data;
  },

  // Notes
  async getNotes(): Promise<NoteItem[]> {
    try {
      const res = await safeFetch('/api/notes');
      const json = await res.json();
      return json.data || [];
    } catch {
      return [];
    }
  },

  async saveNote(note: Partial<NoteItem>): Promise<NoteItem> {
    const res = await safeFetch('/api/notes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(note),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Save failed');
    return json.data;
  },

  async generateNoteFromSource(documentId: string, focusTopic?: string): Promise<NoteItem> {
    const res = await safeFetch('/api/notes/generate-from-source', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ documentId, focusTopic }),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Note generation failed');
    return json.data;
  },

  async deleteNote(id: string): Promise<void> {
    await safeFetch(`/api/notes/${id}`, { method: 'DELETE' });
  },

  // Quizzes
  async getQuizzes(): Promise<QuizSession[]> {
    try {
      const res = await safeFetch('/api/quizzes');
      const json = await res.json();
      return json.data || [];
    } catch {
      return [];
    }
  },

  async generateQuiz(params: {
    sourceId?: string;
    questionCount?: number;
    difficulty?: string;
  }): Promise<QuizSession> {
    const res = await safeFetch('/api/quizzes/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Quiz generation failed');
    return json.data;
  },

  async submitQuiz(quizId: string, answers: Record<string, string>, timeSpentSeconds: number) {
    const res = await safeFetch(`/api/quizzes/${quizId}/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ answers, timeSpentSeconds }),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Submission failed');
    return json.data;
  },

  // Flashcards
  async getFlashcardDecks(): Promise<FlashcardDeck[]> {
    try {
      const res = await safeFetch('/api/flashcards');
      const json = await res.json();
      return json.data || [];
    } catch {
      return [];
    }
  },

  async generateFlashcards(params: { sourceId?: string; count?: number; category?: string }): Promise<FlashcardDeck> {
    const res = await safeFetch('/api/flashcards/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Flashcard generation failed');
    return json.data;
  },

  async updateCardMastery(cardId: string, masteryLevel: 'new' | 'learning' | 'mastered') {
    const res = await safeFetch(`/api/flashcards/cards/${cardId}/mastery`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ masteryLevel }),
    });
    return res.json();
  },

  // Study Plans
  async getStudyPlans(): Promise<StudyPlan[]> {
    try {
      const res = await safeFetch('/api/study');
      const json = await res.json();
      return json.data || [];
    } catch {
      return [];
    }
  },

  async generateStudyPlan(params: {
    topic: string;
    targetDays: number;
    difficulty: string;
    focusAreas?: string;
  }): Promise<StudyPlan> {
    const res = await safeFetch('/api/study/generate-plan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Study plan generation failed');
    return json.data;
  },

  // Global Search
  async search(query: string) {
    try {
      const res = await safeFetch(`/api/search?q=${encodeURIComponent(query)}`);
      const json = await res.json();
      return json.data || { documents: [], notes: [], chunks: [] };
    } catch {
      return { documents: [], notes: [], chunks: [] };
    }
  },

  // Quota & Free Tier Stats
  async getQuota() {
    try {
      const res = await safeFetch('/api/quota');
      const json = await res.json();
      return json.data;
    } catch {
      return null;
    }
  },
};
