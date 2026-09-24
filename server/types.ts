export type SourceType = 'pdf' | 'txt' | 'markdown' | 'youtube' | 'web';

export type ProcessingStatus = 'UPLOADING' | 'PROCESSING' | 'INDEXING' | 'READY' | 'FAILED';

export interface KnowledgeItem {
  id: string;
  title: string;
  sourceType: SourceType;
  fileName?: string;
  fileSize?: number;
  url?: string;
  category: string;
  tags: string[];
  favorite: boolean;
  status: ProcessingStatus;
  progress: number;
  errorMessage?: string;
  totalChunks: number;
  totalTokens?: number;
  channelTitle?: string;
  videoDuration?: string;
  thumbnailUrl?: string;
  summary?: string;
  extractedText?: string;
  createdAt: number;
  updatedAt: number;
}

export interface DocumentChunk {
  id: string;
  documentId: string;
  documentTitle: string;
  sourceType: SourceType;
  chunkIndex: number;
  content: string;
  embedding?: number[];
  pageNumber?: number;
  timestamp?: string; // For YouTube
  tokenCount: number;
}

export interface SearchResult {
  chunk: DocumentChunk;
  score: number; // 0.0 to 1.0 similarity
}

export interface Citation {
  chunkId: string;
  documentId: string;
  documentTitle: string;
  sourceType: SourceType;
  pageOrTime?: string;
  snippet: string;
  relevanceScore: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  citations?: Citation[];
  timestamp: number;
  mode?: 'document' | 'all-documents' | 'video' | 'knowledge-base';
  selectedSourceId?: string;
}

export interface ChatConversation {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: number;
  updatedAt: number;
}

export interface NoteItem {
  id: string;
  title: string;
  content: string;
  tags: string[];
  category: string;
  sourceDocumentId?: string;
  sourceDocumentTitle?: string;
  createdAt: number;
  updatedAt: number;
}

export interface QuizQuestion {
  id: string;
  type: 'mcq' | 'true_false' | 'short_answer';
  question: string;
  options?: string[]; // for mcq
  correctAnswer: string;
  explanation: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
}

export interface QuizSession {
  id: string;
  title: string;
  sourceId?: string;
  sourceTitle?: string;
  questions: QuizQuestion[];
  score?: number;
  totalQuestions: number;
  userAnswers?: Record<string, string>;
  completed: boolean;
  timeSpentSeconds?: number;
  createdAt: number;
}

export interface Flashcard {
  id: string;
  deckId: string;
  front: string;
  back: string;
  tags: string[];
  masteryLevel: 'new' | 'learning' | 'mastered';
  lastReviewed?: number;
  nextReviewDate?: number;
}

export interface FlashcardDeck {
  id: string;
  title: string;
  description: string;
  sourceId?: string;
  sourceTitle?: string;
  category: string;
  cards: Flashcard[];
  createdAt: number;
}

export interface StudyPlan {
  id: string;
  topic: string;
  targetDays: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  overview: string;
  dailyModules: {
    day: number;
    title: string;
    objectives: string[];
    recommendedReadings: string[];
    reviewQuestions: string[];
  }[];
  highYieldQuestions: {
    question: string;
    answerKey: string;
  }[];
  createdAt: number;
}

export interface FreeTierUsage {
  requestsToday: number;
  maxRequestsPerDay: number;
  tokensUsedToday: number;
  maxTokensPerDay: number;
  chunksStored: number;
  maxFreeChunks: number;
  activeProvider: string;
  costUSD: number;
}
