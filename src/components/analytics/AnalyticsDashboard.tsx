import React from 'react';
import { KnowledgeItem, QuizSession, FlashcardDeck, NoteItem } from '../../types';
import {
  BarChart3,
  Award,
  CheckCircle2,
  FileText,
  Clock,
  TrendingUp,
  BrainCircuit,
  CreditCard,
  Layers,
} from 'lucide-react';

interface AnalyticsDashboardProps {
  documents: KnowledgeItem[];
  quizzes: QuizSession[];
  flashcardDecks: FlashcardDeck[];
  notes: NoteItem[];
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  documents,
  quizzes,
  flashcardDecks,
  notes,
}) => {
  const completedQuizzes = quizzes.filter((q) => q.completed);
  const totalQuestionsAnswered = completedQuizzes.reduce((s, q) => s + q.totalQuestions, 0);
  const totalCorrect = completedQuizzes.reduce((s, q) => s + (q.score || 0), 0);
  const quizAccuracy =
    totalQuestionsAnswered > 0
      ? Math.round((totalCorrect / totalQuestionsAnswered) * 100)
      : 100;

  const totalCards = flashcardDecks.reduce((s, d) => s + d.cards.length, 0);
  const masteredCards = flashcardDecks.reduce(
    (s, d) => s + d.cards.filter((c) => c.masteryLevel === 'mastered').length,
    0
  );

  const totalChunks = documents.reduce((s, d) => s + d.totalChunks, 0);

  // Group documents by category
  const categoryCounts: Record<string, number> = {};
  for (const doc of documents) {
    categoryCounts[doc.category] = (categoryCounts[doc.category] || 0) + 1;
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">
          Learning & Knowledge Analytics
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Empirical telemetry measuring retention, diagnostic mastery, and semantic repository growth.
        </p>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-2">
            <span>Diagnostic Accuracy</span>
            <BrainCircuit className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-3xl font-bold text-slate-900 dark:text-white font-mono tabular-nums">
            {quizAccuracy}%
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {totalCorrect} of {totalQuestionsAnswered} questions
          </div>
        </div>

        <div className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-2">
            <span>Active Recall Retention</span>
            <CreditCard className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-3xl font-bold text-slate-900 dark:text-white font-mono tabular-nums">
            {totalCards > 0 ? Math.round((masteredCards / totalCards) * 100) : 0}%
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {masteredCards} of {totalCards} flashcards mastered
          </div>
        </div>

        <div className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-2">
            <span>Semantic Vector Depth</span>
            <Layers className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-3xl font-bold text-slate-900 dark:text-white font-mono tabular-nums">
            {totalChunks}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Indexed vector chunks
          </div>
        </div>

        <div className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-2">
            <span>Synthesized Notes</span>
            <FileText className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-3xl font-bold text-slate-900 dark:text-white font-mono tabular-nums">
            {notes.length}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Structured study sheets
          </div>
        </div>
      </div>

      {/* Breakdown Grids */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Knowledge Disciplinary Distribution */}
        <div className="p-6 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
            Knowledge Distribution by Field
          </h2>
          <div className="space-y-3">
            {Object.entries(categoryCounts).map(([cat, count]) => {
              const pct = Math.round((count / documents.length) * 100);
              return (
                <div key={cat} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-700 dark:text-slate-300 font-medium">
                      {cat}
                    </span>
                    <span className="font-mono tabular-nums text-slate-400">
                      {count} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-indigo-600 dark:bg-indigo-500 h-2 rounded-full"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Diagnostic Exam History */}
        <div className="p-6 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
            Recent Examination Log
          </h2>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {completedQuizzes.slice(0, 5).map((q) => (
              <div
                key={q.id}
                className="py-3 flex items-center justify-between gap-4 text-xs"
              >
                <div>
                  <div className="font-semibold text-slate-900 dark:text-white truncate">
                    {q.title}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    <span>{new Date(q.createdAt).toLocaleDateString()}</span> ·{' '}
                    <span>{q.timeSpentSeconds || 60}s duration</span>
                  </div>
                </div>

                <div className="font-mono tabular-nums font-bold text-indigo-600 dark:text-indigo-400 shrink-0">
                  {q.score} / {q.totalQuestions} ({Math.round(((q.score || 0) / q.totalQuestions) * 100)}%)
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
