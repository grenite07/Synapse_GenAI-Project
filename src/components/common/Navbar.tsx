import React from 'react';
import { NavTab } from '../../types';
import { Search, Sparkles, Moon, Sun, BookOpen, Layers } from 'lucide-react';

interface NavbarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  onOpenSearch: () => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  onOpenSearch,
  darkMode,
  onToggleDarkMode,
}) => {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-6 border-b bg-white/95 dark:bg-slate-900/95 backdrop-blur border-slate-200 dark:border-slate-800 transition-colors">
      {/* Zone 1: Single text element wordmark */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => onSelectTab('landing')}
          className="flex items-center gap-2.5 text-left focus:outline-none"
        >
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
            <Sparkles className="w-4 h-4" />
          </div>
          <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
            Synapse AI
          </span>
        </button>
      </div>

      {/* Zone 2: Navigation Links (single-line with subtle hover underline) */}
      <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-300">
        <button
          onClick={() => onSelectTab('dashboard')}
          className={`hover:text-slate-900 dark:hover:text-white transition-colors pb-1 ${
            currentTab === 'dashboard' ? 'text-indigo-600 dark:text-indigo-400 font-semibold border-b-2 border-indigo-600 dark:border-indigo-400' : ''
          }`}
        >
          Dashboard
        </button>
        <button
          onClick={() => onSelectTab('documents')}
          className={`hover:text-slate-900 dark:hover:text-white transition-colors pb-1 ${
            currentTab === 'documents' ? 'text-indigo-600 dark:text-indigo-400 font-semibold border-b-2 border-indigo-600 dark:border-indigo-400' : ''
          }`}
        >
          Documents
        </button>
        <button
          onClick={() => onSelectTab('youtube')}
          className={`hover:text-slate-900 dark:hover:text-white transition-colors pb-1 ${
            currentTab === 'youtube' ? 'text-indigo-600 dark:text-indigo-400 font-semibold border-b-2 border-indigo-600 dark:border-indigo-400' : ''
          }`}
        >
          YouTube AI
        </button>
        <button
          onClick={() => onSelectTab('chat')}
          className={`hover:text-slate-900 dark:hover:text-white transition-colors pb-1 ${
            currentTab === 'chat' ? 'text-indigo-600 dark:text-indigo-400 font-semibold border-b-2 border-indigo-600 dark:border-indigo-400' : ''
          }`}
        >
          RAG Chat
        </button>
        <button
          onClick={() => onSelectTab('quiz')}
          className={`hover:text-slate-900 dark:hover:text-white transition-colors pb-1 ${
            currentTab === 'quiz' ? 'text-indigo-600 dark:text-indigo-400 font-semibold border-b-2 border-indigo-600 dark:border-indigo-400' : ''
          }`}
        >
          Quizzes
        </button>
        <button
          onClick={() => onSelectTab('flashcards')}
          className={`hover:text-slate-900 dark:hover:text-white transition-colors pb-1 ${
            currentTab === 'flashcards' ? 'text-indigo-600 dark:text-indigo-400 font-semibold border-b-2 border-indigo-600 dark:border-indigo-400' : ''
          }`}
        >
          Flashcards
        </button>
        <button
          onClick={() => onSelectTab('study')}
          className={`hover:text-slate-900 dark:hover:text-white transition-colors pb-1 ${
            currentTab === 'study' ? 'text-indigo-600 dark:text-indigo-400 font-semibold border-b-2 border-indigo-600 dark:border-indigo-400' : ''
          }`}
        >
          Study Assistant
        </button>
      </nav>

      {/* Zone 3: Primary Actions (Search & Theme & Workspace Trigger) */}
      <div className="flex items-center gap-2.5">
        <button
          onClick={onOpenSearch}
          className="flex items-center gap-2 px-3 py-1.5 text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          title="Search knowledge (Cmd+K)"
        >
          <Search className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Search Knowledge</span>
          <kbd className="hidden sm:inline px-1.5 py-0.5 text-[10px] bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-700 font-mono">
            ⌘K
          </kbd>
        </button>

        <button
          onClick={onToggleDarkMode}
          className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          aria-label="Toggle dark mode"
        >
          {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
        </button>

        <button
          onClick={() => onSelectTab(currentTab === 'landing' ? 'dashboard' : 'landing')}
          className="px-3.5 py-1.5 text-xs font-medium text-white bg-slate-900 dark:bg-indigo-600 hover:bg-slate-800 dark:hover:bg-indigo-500 rounded-lg transition-colors whitespace-nowrap shadow-sm"
        >
          {currentTab === 'landing' ? 'Open Workspace' : 'Overview'}
        </button>
      </div>
    </header>
  );
};
