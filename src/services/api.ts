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

export const api = {
  // Documents
  async getDocuments(): Promise<KnowledgeItem[]> {
    const res = await fetch(`${API_BASE}/api/documents`);
    const json = await res.json();
    return json.data || [];
  },

  async getDocument(id: string): Promise<KnowledgeItem> {
    const res = await fetch(`${API_BASE}/api/documents/${id}`);
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
    const res = await fetch(`${API_BASE}/api/documents/upload`, {
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
    const res = await fetch(`${API_BASE}/api/documents/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Update failed');
    return json.data;
  },

  async deleteDocument(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/api/documents/${id}`, { method: 'DELETE' });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Delete failed');
  },

  // YouTube
  async processYouTube(url: string, category?: string, customTitle?: string): Promise<KnowledgeItem> {
    const res = await fetch(`${API_BASE}/api/youtube/process`, {
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
    const res = await fetch(`${API_BASE}/api/chat/conversations`);
    const json = await res.json();
    return json.data || [];
  },

  async createConversation(title?: string): Promise<ChatConversation> {
    const res = await fetch(`${API_BASE}/api/chat/conversations`, {
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
    const res = await fetch(`${API_BASE}/api/chat/conversations/${conversationId}/message`, {
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
    const res = await fetch(`${API_BASE}/api/summaries/generate`, {
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
    const res = await fetch(`${API_BASE}/api/notes`);
    const json = await res.json();
    return json.data || [];
  },

  async saveNote(note: Partial<NoteItem>): Promise<NoteItem> {
    const res = await fetch(`${API_BASE}/api/notes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(note),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Save failed');
    return json.data;
  },

  async generateNoteFromSource(documentId: string, focusTopic?: string): Promise<NoteItem> {
    const res = await fetch(`${API_BASE}/api/notes/generate-from-source`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ documentId, focusTopic }),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Note generation failed');
    return json.data;
  },

  async deleteNote(id: string): Promise<void> {
    await fetch(`${API_BASE}/api/notes/${id}`, { method: 'DELETE' });
  },

  // Quizzes
  async getQuizzes(): Promise<QuizSession[]> {
    const res = await fetch(`${API_BASE}/api/quizzes`);
    const json = await res.json();
    return json.data || [];
  },

  async generateQuiz(params: {
    sourceId?: string;
    questionCount?: number;
    difficulty?: string;
  }): Promise<QuizSession> {
    const res = await fetch(`${API_BASE}/api/quizzes/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Quiz generation failed');
    return json.data;
  },

  async submitQuiz(quizId: string, answers: Record<string, string>, timeSpentSeconds: number) {
    const res = await fetch(`${API_BASE}/api/quizzes/${quizId}/submit`, {
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
    const res = await fetch(`${API_BASE}/api/flashcards`);
    const json = await res.json();
    return json.data || [];
  },

  async generateFlashcards(params: { sourceId?: string; count?: number; category?: string }): Promise<FlashcardDeck> {
    const res = await fetch(`${API_BASE}/api/flashcards/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Flashcard generation failed');
    return json.data;
  },

  async updateCardMastery(cardId: string, masteryLevel: 'new' | 'learning' | 'mastered') {
    const res = await fetch(`${API_BASE}/api/flashcards/cards/${cardId}/mastery`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ masteryLevel }),
    });
    return res.json();
  },

  // Study Plans
  async getStudyPlans(): Promise<StudyPlan[]> {
    const res = await fetch(`${API_BASE}/api/study`);
    const json = await res.json();
    return json.data || [];
  },

  async generateStudyPlan(params: {
    topic: string;
    targetDays: number;
    difficulty: string;
    focusAreas?: string;
  }): Promise<StudyPlan> {
    const res = await fetch(`${API_BASE}/api/study/generate-plan`, {
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
    const res = await fetch(`${API_BASE}/api/search?q=${encodeURIComponent(query)}`);
    const json = await res.json();
    return json.data || { documents: [], notes: [], chunks: [] };
  },

  // Quota & Free Tier Stats
  async getQuota() {
    const res = await fetch(`${API_BASE}/api/quota`);
    const json = await res.json();
    return json.data;
  },
};
