import React, { useState } from 'react';
import { StudyPlan } from '../../types';
import { api } from '../../services/api';
import {
  GraduationCap,
  Sparkles,
  Calendar,
  CheckCircle2,
  BookOpen,
  HelpCircle,
  Clock,
  ArrowRight,
} from 'lucide-react';

interface StudyAssistantProps {
  studyPlans: StudyPlan[];
  onRefresh: () => void;
}

export const StudyAssistant: React.FC<StudyAssistantProps> = ({
  studyPlans,
  onRefresh,
}) => {
  const [topic, setTopic] = useState('');
  const [targetDays, setTargetDays] = useState(7);
  const [difficulty, setDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Medium');
  const [focusAreas, setFocusAreas] = useState('');
  const [generating, setGenerating] = useState(false);
  const [activePlan, setActivePlan] = useState<StudyPlan | null>(
    studyPlans.length > 0 ? studyPlans[0] : null
  );

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;

    setGenerating(true);
    try {
      const plan = await api.generateStudyPlan({
        topic: topic.trim(),
        targetDays,
        difficulty,
        focusAreas: focusAreas.trim() || undefined,
      });
      onRefresh();
      setActivePlan(plan);
      setTopic('');
      setFocusAreas('');
    } catch (e: any) {
      console.error(e);
      alert(e?.message || 'Failed to generate study plan');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">
          AI Academic Study Assistant
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Synthesize structured milestone revision roadmaps and high-yield examination question banks.
        </p>
      </div>

      {/* Generation Form */}
      <div className="p-6 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-indigo-500" />
          <span>Curate New Structured Revision Roadmap</span>
        </h2>

        <form onSubmit={handleGenerate} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1 block">
                Target Topic or Exam Title
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. Distributed Systems & Consensus Algorithms"
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                required
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1 block">
                Target Timeline (Days)
              </label>
              <select
                value={targetDays}
                onChange={(e) => setTargetDays(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
              >
                <option value={3}>3 Days (Crash Revision)</option>
                <option value={7}>7 Days (Standard Sprint)</option>
                <option value={14}>14 Days (Comprehensive Mastery)</option>
                <option value={30}>30 Days (Full Semester Course)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1 block">
                Target Difficulty
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
              <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1 block">
                Focus Areas (Optional)
              </label>
              <input
                type="text"
                value={focusAreas}
                onChange={(e) => setFocusAreas(e.target.value)}
                placeholder="e.g. Raft algorithm, Paxos, leader election"
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={generating}
            className="flex items-center justify-center gap-2 w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
          >
            <GraduationCap className="w-4 h-4" />
            <span>{generating ? 'Architecting Study Plan with Gemini...' : 'Synthesize Study Roadmap'}</span>
          </button>
        </form>
      </div>

      {/* Render Active Study Plan */}
      {activePlan && (
        <div className="space-y-6">
          <div className="p-6 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  {activePlan.topic}
                </h2>
                <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                  <span className="font-mono tabular-nums">{activePlan.targetDays} Days Duration</span>
                  <span aria-hidden="true">·</span>
                  <span>{activePlan.difficulty} Level</span>
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/60 p-3 rounded-lg border border-slate-200 dark:border-slate-800">
              {activePlan.overview}
            </p>

            {/* Daily Modules Accordion/List */}
            <div className="space-y-3 pt-2">
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Daily Study Modules
              </h3>
              <div className="space-y-3">
                {activePlan.dailyModules.map((mod) => (
                  <div
                    key={mod.day}
                    className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-indigo-600 dark:text-indigo-400 font-mono">
                        Day {mod.day}: {mod.title}
                      </span>
                    </div>

                    <div className="text-xs space-y-1">
                      <div className="font-semibold text-slate-700 dark:text-slate-300 text-[11px]">
                        Core Objectives:
                      </div>
                      <ul className="list-disc list-inside space-y-0.5 text-slate-600 dark:text-slate-400 text-[11px]">
                        {mod.objectives.map((obj, i) => (
                          <li key={i}>{obj}</li>
                        ))}
                      </ul>
                    </div>

                    {mod.reviewQuestions && mod.reviewQuestions.length > 0 && (
                      <div className="text-xs pt-1 border-t border-slate-200 dark:border-slate-700/60">
                        <span className="font-semibold text-slate-700 dark:text-slate-300 text-[11px]">
                          Self-Test Checkpoint:
                        </span>{' '}
                        <span className="text-slate-600 dark:text-slate-400 text-[11px]">
                          {mod.reviewQuestions.join('; ')}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* High Yield Questions */}
            {activePlan.highYieldQuestions && activePlan.highYieldQuestions.length > 0 && (
              <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  High-Yield Examination Questions
                </h3>
                <div className="space-y-2">
                  {activePlan.highYieldQuestions.map((q, i) => (
                    <div
                      key={i}
                      className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs"
                    >
                      <div className="font-semibold text-slate-900 dark:text-white mb-1">
                        Q{i + 1}: {q.question}
                      </div>
                      <div className="text-slate-600 dark:text-slate-400 text-[11px] bg-slate-50 dark:bg-slate-800/60 p-2 rounded">
                        <span className="font-medium text-slate-700 dark:text-slate-300">Model Solution:</span>{' '}
                        {q.answerKey}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
