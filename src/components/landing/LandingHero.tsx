import React from 'react';
import { NavTab } from '../../types';
import {
  FileText,
  Video,
  MessageSquare,
  Search,
  BrainCircuit,
  CreditCard,
  GraduationCap,
  Mic,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Zap,
} from 'lucide-react';

interface LandingHeroProps {
  onSelectTab: (tab: NavTab) => void;
}

export const LandingHero: React.FC<LandingHeroProps> = ({ onSelectTab }) => {
  const features = [
    {
      title: 'PDF AI & Multi-File RAG',
      desc: 'Deep semantic parsing, chunking with sliding-window overlap, and vectorized document retrieval.',
      icon: <FileText className="w-5 h-5 text-indigo-500" />,
      tab: 'documents' as NavTab,
    },
    {
      title: 'YouTube Knowledge Engine',
      desc: 'Ingest lectures and tutorials by URL, extracting timestamped chapters and multi-hour video transcripts.',
      icon: <Video className="w-5 h-5 text-red-500" />,
      tab: 'youtube' as NavTab,
    },
    {
      title: 'Conversational RAG Chat',
      desc: 'ChatGPT-style interface with strict context boundaries, anti-hallucination guardrails, and source citations.',
      icon: <MessageSquare className="w-5 h-5 text-blue-500" />,
      tab: 'chat' as NavTab,
    },
    {
      title: 'Global Semantic Search',
      desc: 'Cosine similarity vector matching combined with full-text keyword indexing across your entire library.',
      icon: <Search className="w-5 h-5 text-purple-500" />,
      tab: 'dashboard' as NavTab,
    },
    {
      title: 'Interactive Quiz Arena',
      desc: 'AI-generated Multiple Choice, True/False, and Short Answer exams with instant feedback and grading.',
      icon: <BrainCircuit className="w-5 h-5 text-emerald-500" />,
      tab: 'quiz' as NavTab,
    },
    {
      title: 'Spaced-Repetition Flashcards',
      desc: 'Digital decks with 3D flip animations, mastery level tracking, and automated question generation.',
      icon: <CreditCard className="w-5 h-5 text-amber-500" />,
      tab: 'flashcards' as NavTab,
    },
    {
      title: 'AI Curriculum Study Assistant',
      desc: 'Tailored revision schedules, milestone breakdowns, and high-yield interview and exam questions.',
      icon: <GraduationCap className="w-5 h-5 text-teal-500" />,
      tab: 'study' as NavTab,
    },
    {
      title: 'Browser-Native Voice AI',
      desc: 'Zero-cost browser speech recognition for voice queries and natural text-to-speech recitation.',
      icon: <Mic className="w-5 h-5 text-pink-500" />,
      tab: 'chat' as NavTab,
    },
  ];

  const steps = [
    { num: '01', title: 'Upload', desc: 'Drag in PDFs or paste educational YouTube links.' },
    { num: '02', title: 'Process', desc: 'Documents are cleaned, chunked, and vectorized.' },
    { num: '03', title: 'Ask', desc: 'Ask specific questions with automatic semantic retrieval.' },
    { num: '04', title: 'Understand', desc: 'Review source-backed citations, summaries, and notes.' },
    { num: '05', title: 'Learn', desc: 'Solidify retention through quizzes, flashcards, and study plans.' },
  ];

  const useCases = [
    { role: 'Students', benefit: 'Transform dense textbook chapters and video lectures into revision notes and mock exams.' },
    { role: 'Developers', benefit: 'Index software API docs and technical whitepapers for instantaneous precise querying.' },
    { role: 'Researchers', benefit: 'Synthesize across multiple papers with verified page-level source citations.' },
    { role: 'Professionals', benefit: 'Analyze business proposals, compliance filings, and market analysis dossiers.' },
    { role: 'Teachers', benefit: 'Rapidly generate curriculum diagnostics, lecture takeaways, and student test quizzes.' },
    { role: 'Content Creators', benefit: 'Deconstruct long video scripts, brainstorm outlines, and extract core highlights.' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      {/* Hero Section */}
      <section className="relative px-6 pt-16 pb-20 max-w-7xl mx-auto overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 text-xs font-medium text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 rounded-full border border-indigo-200 dark:border-indigo-800">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Free-Tier Architecture · Zero Paid Lock-in</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-slate-900 dark:text-white leading-tight">
              Your Personal AI <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-500">
                Knowledge Hub
              </span>
            </h1>

            <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl">
              Upload documents, understand videos, ask questions and turn information into structured, permanent knowledge with semantic RAG intelligence.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={() => onSelectTab('dashboard')}
                className="flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md transition-all hover:shadow-indigo-500/20"
              >
                <span>Get Started Free</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => onSelectTab('documents')}
                className="flex items-center gap-2 px-6 py-3 text-sm font-semibold text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors shadow-xs"
              >
                <FileText className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>Upload Document</span>
              </button>
            </div>

            {/* Quick Proof Metrics */}
            <div className="pt-6 border-t border-slate-200 dark:border-slate-800 grid grid-cols-3 gap-6">
              <div>
                <div className="text-2xl font-bold text-slate-900 dark:text-white font-mono tabular-nums">100%</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">Free Tier Ready</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-900 dark:text-white font-mono tabular-nums">&lt; 0.2s</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">Vector Search</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-900 dark:text-white font-mono tabular-nums">0</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">Paid API Dependencies</div>
              </div>
            </div>
          </div>

          {/* Hero Visual Banner */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-xl bg-slate-900">
              <img
                src="/src/assets/images/hero_knowledge_graph_1790277212714.jpg"
                alt="Knowledge graph network"
                className="w-full h-80 object-cover opacity-90 hover:scale-105 transition-transform duration-700"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  // Fallback container
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent flex flex-col justify-end p-6">
                <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-1">
                  <Zap className="w-3.5 h-3.5" />
                  Semantic Engine Live
                </div>
                <h3 className="text-white font-semibold text-lg">
                  Multi-modal Vector Memory
                </h3>
                <p className="text-xs text-slate-300 mt-1">
                  Ingesting textbooks, research journals, and YouTube lectures with zero external subscription costs.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="px-6 py-16 bg-white dark:bg-slate-900/50 border-y border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-2">
              Comprehensive Suite
            </h2>
            <h3 className="text-3xl font-bold text-slate-900 dark:text-white">
              Engineered for Complete Mastery
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
              Every tool required to convert raw unstructured media into lasting understanding.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => (
              <div
                key={i}
                onClick={() => onSelectTab(f.tab)}
                className="p-6 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/60 hover:border-indigo-500 dark:hover:border-indigo-400 cursor-pointer transition-all hover:-translate-y-1 shadow-xs group"
              >
                <div className="w-10 h-10 rounded-lg bg-white dark:bg-slate-700 flex items-center justify-center mb-4 shadow-2xs group-hover:scale-110 transition-transform">
                  {f.icon}
                </div>
                <h4 className="text-base font-semibold text-slate-900 dark:text-white mb-1.5 flex items-center justify-between">
                  <span>{f.title}</span>
                  <ArrowRight className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="px-6 py-16 max-w-7xl mx-auto">
        <div className="text-center max-w-xl mx-auto mb-12">
          <h2 className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-2">
            Workflow Architecture
          </h2>
          <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
            How Synapse AI Operates
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {steps.map((s, idx) => (
            <div
              key={idx}
              className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col justify-between"
            >
              <div>
                <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400">
                  {s.num}
                </span>
                <h4 className="text-base font-semibold text-slate-900 dark:text-white mt-1 mb-2">
                  {s.title}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {s.desc}
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>Automated pipeline</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Target Audiences */}
      <section className="px-6 py-16 bg-slate-100/70 dark:bg-slate-900/80 border-t border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-xl mx-auto mb-12">
            <h2 className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-2">
              Versatile Utility
            </h2>
            <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
              Who Uses This Platform
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {useCases.map((u, i) => (
              <div
                key={i}
                className="p-6 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700/60 shadow-xs"
              >
                <div className="text-sm font-bold text-indigo-600 dark:text-indigo-400 mb-1.5">
                  {u.role}
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {u.benefit}
                </p>
              </div>
            ))}
          </div>

          {/* Bottom CTA */}
          <div className="mt-16 text-center">
            <button
              onClick={() => onSelectTab('dashboard')}
              className="inline-flex items-center gap-2 px-8 py-3.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md transition-all hover:scale-105"
            >
              <span>Launch Your Knowledge Platform</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
