import React from 'react';
import { NavTab } from '../../types';
import {
  LayoutDashboard,
  FileText,
  Video,
  MessageSquare,
  FileSignature,
  FileSpreadsheet,
  BrainCircuit,
  CreditCard,
  GraduationCap,
  FolderKanban,
  BarChart3,
  ShieldCheck,
  Zap,
} from 'lucide-react';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  documentCount: number;
  noteCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  documentCount,
  noteCount,
}) => {
  const navItems: { tab: NavTab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { tab: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { tab: 'documents', label: 'Documents', icon: <FileText className="w-4 h-4" />, badge: documentCount },
    { tab: 'youtube', label: 'YouTube AI', icon: <Video className="w-4 h-4" /> },
    { tab: 'chat', label: 'RAG Chat', icon: <MessageSquare className="w-4 h-4" /> },
    { tab: 'summaries', label: 'Summaries', icon: <FileSignature className="w-4 h-4" /> },
    { tab: 'notes', label: 'Notes', icon: <FileSpreadsheet className="w-4 h-4" />, badge: noteCount },
    { tab: 'quiz', label: 'Quiz Arena', icon: <BrainCircuit className="w-4 h-4" /> },
    { tab: 'flashcards', label: 'Flashcards', icon: <CreditCard className="w-4 h-4" /> },
    { tab: 'study', label: 'Study Assistant', icon: <GraduationCap className="w-4 h-4" /> },
    { tab: 'library', label: 'Knowledge Library', icon: <FolderKanban className="w-4 h-4" /> },
    { tab: 'analytics', label: 'Analytics', icon: <BarChart3 className="w-4 h-4" /> },
    { tab: 'free-tier', label: 'Free-Tier & Limits', icon: <ShieldCheck className="w-4 h-4" /> },
  ];

  return (
    <aside className="w-64 shrink-0 border-r bg-slate-50/60 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 flex flex-col justify-between p-4 h-[calc(100vh-4rem)] overflow-y-auto">
      <div className="space-y-1">
        <div className="px-3 pb-2 text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
          Workspace Navigation
        </div>
        {navItems.map((item) => {
          const isActive = currentTab === item.tab;
          return (
            <button
              key={item.tab}
              onClick={() => onSelectTab(item.tab)}
              className={`w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800/80'
              }`}
            >
              <div className="flex items-center gap-3">
                {item.icon}
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && item.badge > 0 && (
                <span
                  className={`text-xs tabular-nums font-mono ${
                    isActive ? 'text-indigo-100' : 'text-slate-400 dark:text-slate-500'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Free Tier Indicator Box */}
      <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800">
        <div className="p-3 bg-white dark:bg-slate-800/80 rounded-lg border border-slate-200 dark:border-slate-700/60 shadow-xs">
          <div className="flex items-center justify-between text-xs font-medium text-slate-700 dark:text-slate-200 mb-1.5">
            <span className="flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              Free Tier Status
            </span>
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">100% Free</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-1.5 overflow-hidden">
            <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: '12%' }} />
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5">
            Gemini Flash Free Tier Active
          </p>
        </div>
      </div>
    </aside>
  );
};
