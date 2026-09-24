import React from 'react';
import { NavTab, KnowledgeItem, NoteItem, QuizSession, FlashcardDeck } from '../../types';
import {
  FileText,
  Video,
  MessageSquare,
  FileSpreadsheet,
  BrainCircuit,
  CreditCard,
  Plus,
  ArrowUpRight,
  TrendingUp,
  Clock,
  Sparkles,
} from 'lucide-react';

interface DashboardOverviewProps {
  documents: KnowledgeItem[];
  notes: NoteItem[];
  quizzes: QuizSession[];
  flashcardDecks: FlashcardDeck[];
  onSelectTab: (tab: NavTab) => void;
  onOpenUpload: () => void;
  onOpenYouTubeModal: () => void;
  onOpenSearch: () => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  documents,
  notes,
  quizzes,
  flashcardDecks,
  onSelectTab,
  onOpenUpload,
  onOpenYouTubeModal,
  onOpenSearch,
}) => {
  const pdfDocs = documents.filter((d) => d.sourceType !== 'youtube');
  const ytDocs = documents.filter((d) => d.sourceType === 'youtube');
  const completedQuizzes = quizzes.filter((q) => q.completed);
  const avgQuizScore =
    completedQuizzes.length > 0
      ? Math.round(
          (completedQuizzes.reduce((sum, q) => sum + (q.score || 0), 0) /
            completedQuizzes.reduce((sum, q) => sum + q.totalQuestions, 0)) *
            100
        )
      : 100;

  const totalCards = flashcardDecks.reduce((sum, d) => sum + d.cards.length, 0);
  const masteredCards = flashcardDecks.reduce(
    (sum, d) => sum + d.cards.filter((c) => c.masteryLevel === 'mastered').length,
    0
  );

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Top Banner / Welcome */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-slate-900 to-indigo-950 text-white shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-indigo-300 text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            Knowledge Overview
          </div>
          <h1 className="text-2xl font-bold tracking-tight">
            Academic & Technical Intelligence Hub
          </h1>
          <p className="text-xs text-slate-300 max-w-xl">
            Semantic vector embeddings active. Ask cross-document questions, extract concepts from video lectures, and drill with automated diagnostic quizzes.
          </p>
        </div>

        {/* Quick Actions Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={onOpenUpload}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-900 bg-white hover:bg-slate-100 rounded-lg shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Upload PDF</span>
          </button>
          <button
            onClick={onOpenYouTubeModal}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-xs transition-colors"
          >
            <Video className="w-4 h-4" />
            <span>Add YouTube</span>
          </button>
          <button
            onClick={() => onSelectTab('chat')}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-xs transition-colors"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Ask AI</span>
          </button>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div
          onClick={() => onSelectTab('documents')}
          className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs cursor-pointer hover:border-indigo-400 transition-colors"
        >
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-2">
            <span>Documents</span>
            <FileText className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white font-mono tabular-nums">
            {pdfDocs.length}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Indexed PDFs</div>
        </div>

        <div
          onClick={() => onSelectTab('youtube')}
          className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs cursor-pointer hover:border-red-400 transition-colors"
        >
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-2">
            <span>Videos</span>
            <Video className="w-4 h-4 text-red-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white font-mono tabular-nums">
            {ytDocs.length}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Lectures Ingested</div>
        </div>

        <div
          onClick={() => onSelectTab('notes')}
          className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs cursor-pointer hover:border-emerald-400 transition-colors"
        >
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-2">
            <span>Notes</span>
            <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white font-mono tabular-nums">
            {notes.length}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Revision Sheets</div>
        </div>

        <div
          onClick={() => onSelectTab('quiz')}
          className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs cursor-pointer hover:border-blue-400 transition-colors"
        >
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-2">
            <span>Quiz Mastery</span>
            <BrainCircuit className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white font-mono tabular-nums">
            {avgQuizScore}%
          </div>
          <div className="text-[11px] text-slate-400 mt-1">{completedQuizzes.length} Taken</div>
        </div>

        <div
          onClick={() => onSelectTab('flashcards')}
          className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs cursor-pointer hover:border-amber-400 transition-colors"
        >
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-2">
            <span>Flashcards</span>
            <CreditCard className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white font-mono tabular-nums">
            {masteredCards}/{totalCards}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Cards Mastered</div>
        </div>

        <div
          onClick={() => onSelectTab('free-tier')}
          className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs cursor-pointer hover:border-emerald-400 transition-colors"
        >
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-2">
            <span>Free Tier</span>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 font-mono tabular-nums">
            $0.00
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Compliant</div>
        </div>
      </div>

      {/* Main Grid: Recent Knowledge Sources + Quick Study Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Recent Knowledge Sources */}
        <div className="lg:col-span-8 p-6 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                Recent Knowledge Sources
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Vectorized documents ready for semantic Q&A and diagnostic analysis.
              </p>
            </div>
            <button
              onClick={() => onSelectTab('documents')}
              className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
            {documents.slice(0, 5).map((doc) => (
              <div
                key={doc.id}
                className="py-3 flex items-center justify-between gap-4 hover:bg-slate-50/70 dark:hover:bg-slate-800/40 px-2 rounded-lg transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                    {doc.sourceType === 'youtube' ? (
                      <Video className="w-4 h-4 text-red-500" />
                    ) : (
                      <FileText className="w-4 h-4 text-indigo-500" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-medium text-slate-900 dark:text-white truncate">
                      {doc.title}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      <span>{doc.category}</span>
                      <span aria-hidden="true">·</span>
                      <span className="tabular-nums font-mono">{doc.totalChunks} Chunks</span>
                      <span aria-hidden="true">·</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-medium">Ready</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => onSelectTab('chat')}
                    className="px-2.5 py-1 text-xs font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 rounded-md transition-colors"
                  >
                    Query Source
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Quick Learning Pipelines */}
        <div className="lg:col-span-4 space-y-4">
          <div className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-500" />
              Quick Knowledge Actions
            </h3>
            <div className="space-y-2">
              <button
                onClick={() => onSelectTab('quiz')}
                className="w-full text-left p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors flex items-center justify-between"
              >
                <div>
                  <div className="text-xs font-medium text-slate-900 dark:text-white">
                    Generate Diagnostic Quiz
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Test retention from selected documents
                  </div>
                </div>
                <BrainCircuit className="w-4 h-4 text-slate-400" />
              </button>

              <button
                onClick={() => onSelectTab('flashcards')}
                className="w-full text-left p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors flex items-center justify-between"
              >
                <div>
                  <div className="text-xs font-medium text-slate-900 dark:text-white">
                    Create Flashcard Deck
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Memory reinforcement with flip review
                  </div>
                </div>
                <CreditCard className="w-4 h-4 text-slate-400" />
              </button>

              <button
                onClick={() => onSelectTab('summaries')}
                className="w-full text-left p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors flex items-center justify-between"
              >
                <div>
                  <div className="text-xs font-medium text-slate-900 dark:text-white">
                    Synthesize Executive Summary
                  </div>
                  <div className="text-[11px] text-slate-400">
                    TL;DR, formulas, and chapter outlines
                  </div>
                </div>
                <FileText className="w-4 h-4 text-slate-400" />
              </button>

              <button
                onClick={onOpenSearch}
                className="w-full text-left p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors flex items-center justify-between"
              >
                <div>
                  <div className="text-xs font-medium text-slate-900 dark:text-white">
                    Search Knowledge Base
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Find terms, definitions, and vectors
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-400" />
              </button>
            </div>
          </div>

          {/* Study Progress Box */}
          <div className="p-5 bg-indigo-50/70 dark:bg-indigo-950/40 rounded-xl border border-indigo-200 dark:border-indigo-900/60">
            <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-300 text-xs font-semibold mb-1">
              <Clock className="w-3.5 h-3.5" />
              <span>Study Session Metric</span>
            </div>
            <p className="text-xs text-indigo-950 dark:text-indigo-200 leading-relaxed">
              You have indexed <span className="font-semibold">{documents.length} knowledge sources</span> containing <span className="font-semibold">{documents.reduce((s, d) => s + d.totalChunks, 0)} semantic vectors</span>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
