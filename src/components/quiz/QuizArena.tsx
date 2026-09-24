import React, { useState, useEffect } from 'react';
import { QuizSession, KnowledgeItem } from '../../types';
import { api } from '../../services/api';
import {
  BrainCircuit,
  Clock,
  Sparkles,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Award,
  ArrowRight,
} from 'lucide-react';

interface QuizArenaProps {
  quizzes: QuizSession[];
  documents: KnowledgeItem[];
  preselectedDocId?: string;
  onRefresh: () => void;
}

export const QuizArena: React.FC<QuizArenaProps> = ({
  quizzes,
  documents,
  preselectedDocId,
  onRefresh,
}) => {
  const [selectedSourceId, setSelectedSourceId] = useState<string>(preselectedDocId || '');
  const [difficulty, setDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Medium');
  const [questionCount, setQuestionCount] = useState<number>(3);
  const [generating, setGenerating] = useState(false);

  // Active playing quiz session
  const [activeQuiz, setActiveQuiz] = useState<QuizSession | null>(null);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [submittedResult, setSubmittedResult] = useState<any | null>(null);
  const [timeElapsed, setTimeElapsed] = useState<number>(0);
  const [timerActive, setTimerActive] = useState(false);

  useEffect(() => {
    let interval: any;
    if (timerActive && !submittedResult) {
      interval = setInterval(() => setTimeElapsed((t) => t + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timerActive, submittedResult]);

  const handleStartGenerate = async () => {
    setGenerating(true);
    try {
      const session = await api.generateQuiz({
        sourceId: selectedSourceId || undefined,
        difficulty,
        questionCount,
      });
      setActiveQuiz(session);
      setUserAnswers({});
      setSubmittedResult(null);
      setTimeElapsed(0);
      setTimerActive(true);
      onRefresh();
    } catch (e: any) {
      console.error(e);
      alert(e?.message || 'Failed to generate quiz');
    } finally {
      setGenerating(false);
    }
  };

  const handleSubmit = async () => {
    if (!activeQuiz) return;
    setTimerActive(false);
    try {
      const result = await api.submitQuiz(activeQuiz.id, userAnswers, timeElapsed);
      setSubmittedResult(result);
      onRefresh();
    } catch (e) {
      console.error(e);
    }
  };

  const handlePlayExisting = (quiz: QuizSession) => {
    setActiveQuiz(quiz);
    setUserAnswers(quiz.userAnswers || {});
    setSubmittedResult(
      quiz.completed
        ? {
            quizId: quiz.id,
            score: quiz.score || 0,
            totalQuestions: quiz.totalQuestions,
            percentage: Math.round(((quiz.score || 0) / quiz.totalQuestions) * 100),
            session: quiz,
          }
        : null
    );
    setTimeElapsed(quiz.timeSpentSeconds || 0);
    setTimerActive(!quiz.completed);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">
          Interactive Diagnostic Quiz Arena
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Reinforce comprehension through AI-generated MCQs, True/False, and conceptual diagnostic exams.
        </p>
      </div>

      {/* Quiz Generator Configuration */}
      {!activeQuiz && (
        <div className="p-6 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-500" />
            <span>Configure New Diagnostic Exam</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 block">
                Target Knowledge Source
              </label>
              <select
                value={selectedSourceId}
                onChange={(e) => setSelectedSourceId(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
              >
                <option value="">Entire Knowledge Base (Broad Diagnostic)</option>
                {documents.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 block">
                Difficulty Level
              </label>
              <div className="flex gap-2">
                {(['Easy', 'Medium', 'Hard'] as const).map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setDifficulty(lvl)}
                    className={`flex-1 py-1.5 text-xs rounded-lg border font-medium transition-colors ${
                      difficulty === lvl
                        ? 'bg-indigo-50 dark:bg-indigo-950/70 border-indigo-500 text-indigo-600 dark:text-indigo-400 font-semibold'
                        : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 block">
                Question Count
              </label>
              <div className="flex gap-2">
                {[3, 5, 10].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setQuestionCount(num)}
                    className={`flex-1 py-1.5 text-xs rounded-lg border font-mono tabular-nums transition-colors ${
                      questionCount === num
                        ? 'bg-indigo-50 dark:bg-indigo-950/70 border-indigo-500 text-indigo-600 dark:text-indigo-400 font-semibold'
                        : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {num} Qs
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button
            onClick={handleStartGenerate}
            disabled={generating}
            className="flex items-center justify-center gap-2 w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
          >
            <BrainCircuit className="w-4 h-4" />
            <span>{generating ? 'Formulating Exam with Gemini AI...' : 'Generate and Start Quiz'}</span>
          </button>
        </div>
      )}

      {/* Active Quiz Session Arena */}
      {activeQuiz && (
        <div className="space-y-6">
          {/* Top Bar with Timer and Progress */}
          <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                {activeQuiz.title}
              </h2>
              <div className="text-xs text-slate-400 mt-0.5">
                <span>{activeQuiz.questions.length} Questions</span> ·{' '}
                <span>{activeQuiz.sourceTitle || 'Knowledge Core'}</span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5 font-mono tabular-nums text-xs font-semibold px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-700 dark:text-slate-300">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>
                  {Math.floor(timeElapsed / 60)}:{String(timeElapsed % 60).padStart(2, '0')}
                </span>
              </div>

              <button
                onClick={() => {
                  setActiveQuiz(null);
                  setSubmittedResult(null);
                }}
                className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                Exit Quiz
              </button>
            </div>
          </div>

          {/* Results Banner if completed */}
          {submittedResult && (
            <div className="p-6 rounded-xl bg-gradient-to-r from-indigo-900 to-slate-900 text-white shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center font-mono font-bold text-2xl tabular-nums">
                  {submittedResult.percentage}%
                </div>
                <div>
                  <h3 className="text-lg font-bold">Diagnostic Evaluation Complete</h3>
                  <p className="text-xs text-indigo-200 mt-0.5">
                    Score: {submittedResult.score} / {submittedResult.totalQuestions} correct in {timeElapsed} seconds.
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  setUserAnswers({});
                  setSubmittedResult(null);
                  setTimeElapsed(0);
                  setTimerActive(true);
                }}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-900 bg-white hover:bg-slate-100 rounded-lg shadow-xs transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Retry Quiz</span>
              </button>
            </div>
          )}

          {/* Questions List */}
          <div className="space-y-4">
            {activeQuiz.questions.map((q, idx) => {
              const selectedAns = userAnswers[q.id];
              const isSubmitted = Boolean(submittedResult);
              const isCorrect = isSubmitted && selectedAns?.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase();

              return (
                <div
                  key={q.id}
                  className={`p-6 bg-white dark:bg-slate-900 rounded-xl border transition-colors ${
                    isSubmitted
                      ? isCorrect
                        ? 'border-emerald-500/60 dark:border-emerald-500/60'
                        : 'border-red-500/60 dark:border-red-500/60'
                      : 'border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                    <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                      Question {idx + 1} of {activeQuiz.questions.length}
                    </span>
                    <span className="capitalize">{q.difficulty}</span>
                  </div>

                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">
                    {q.question}
                  </h3>

                  {/* Options */}
                  {q.options && q.options.length > 0 ? (
                    <div className="space-y-2">
                      {q.options.map((opt) => {
                        const isChosen = selectedAns === opt;
                        const isCorrectOption = opt.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase();

                        return (
                          <button
                            key={opt}
                            disabled={isSubmitted}
                            onClick={() => setUserAnswers((prev) => ({ ...prev, [q.id]: opt }))}
                            className={`w-full text-left p-3 rounded-lg text-xs font-medium border transition-colors flex items-center justify-between ${
                              isSubmitted
                                ? isCorrectOption
                                  ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-emerald-800 dark:text-emerald-200'
                                  : isChosen
                                  ? 'bg-red-50 dark:bg-red-950/60 border-red-500 text-red-800 dark:text-red-200'
                                  : 'border-slate-200 dark:border-slate-800 opacity-60'
                                : isChosen
                                ? 'bg-indigo-50 dark:bg-indigo-950/70 border-indigo-600 text-indigo-900 dark:text-indigo-200'
                                : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                            }`}
                          >
                            <span>{opt}</span>
                            {isSubmitted && isCorrectOption && (
                              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                            )}
                            {isSubmitted && isChosen && !isCorrectOption && (
                              <XCircle className="w-4 h-4 text-red-500 shrink-0" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div>
                      <input
                        type="text"
                        disabled={isSubmitted}
                        value={selectedAns || ''}
                        onChange={(e) =>
                          setUserAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))
                        }
                        placeholder="Type short answer..."
                        className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                      />
                    </div>
                  )}

                  {/* Explanation after submit */}
                  {isSubmitted && (
                    <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg text-xs border border-slate-200 dark:border-slate-800">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">
                        Explanation:
                      </span>{' '}
                      <span className="text-slate-600 dark:text-slate-400">{q.explanation}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Submit Button */}
          {!submittedResult && (
            <button
              onClick={handleSubmit}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors"
            >
              Submit Diagnostic Answers
            </button>
          )}
        </div>
      )}

      {/* Quiz History List */}
      {!activeQuiz && quizzes.length > 0 && (
        <div className="space-y-3 pt-6 border-t border-slate-200 dark:border-slate-800">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
            Past Quiz Diagnostics ({quizzes.length})
          </h3>

          <div className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
            {quizzes.map((quiz) => (
              <div
                key={quiz.id}
                className="p-4 flex items-center justify-between gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
              >
                <div>
                  <h4 className="text-xs font-semibold text-slate-900 dark:text-white">
                    {quiz.title}
                  </h4>
                  <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                    <span>{quiz.totalQuestions} Questions</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono tabular-nums">
                      {quiz.completed ? `Score: ${quiz.score}/${quiz.totalQuestions}` : 'Incomplete'}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>{new Date(quiz.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <button
                  onClick={() => handlePlayExisting(quiz)}
                  className="px-3 py-1.5 text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 rounded-lg transition-colors flex items-center gap-1"
                >
                  <span>Review / Play</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
