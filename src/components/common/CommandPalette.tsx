import React, { useState, useEffect } from 'react';
import { Search, X, FileText, Video, FileSpreadsheet, ArrowRight } from 'lucide-react';
import { api } from '../../services/api';
import { NavTab } from '../../types';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTab: (tab: NavTab) => void;
  onSelectDocument?: (id: string) => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onSelectTab,
  onSelectDocument,
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<{ documents: any[]; notes: any[]; chunks: any[] }>({
    documents: [],
    notes: [],
    chunks: [],
  });
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else {
          // Open
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!query.trim()) {
      setResults({ documents: [], notes: [], chunks: [] });
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const data = await api.search(query);
        setResults(data);
      } catch (e) {
        console.error('Search error:', e);
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-slate-950/60 backdrop-blur-xs p-4">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3 border-b border-slate-200 dark:border-slate-800">
          <Search className="w-5 h-5 text-slate-400 mr-3 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search documents, YouTube transcripts, notes, concepts..."
            className="w-full bg-transparent text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none"
            autoFocus
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="ml-2 text-xs text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded"
          >
            ESC
          </button>
        </div>

        {/* Results Container */}
        <div className="max-h-96 overflow-y-auto p-4 space-y-4">
          {isSearching && (
            <div className="py-8 text-center text-xs text-slate-400">
              Running semantic vector and keyword search across knowledge base...
            </div>
          )}

          {!isSearching && !query && (
            <div className="py-6 text-center text-xs text-slate-400">
              Type keywords or conceptual questions to search vector chunks and documents.
            </div>
          )}

          {!isSearching && query && results.documents.length === 0 && results.chunks.length === 0 && results.notes.length === 0 && (
            <div className="py-6 text-center text-xs text-slate-500 dark:text-slate-400">
              No matching knowledge records found for "{query}".
            </div>
          )}

          {/* Documents */}
          {results.documents.length > 0 && (
            <div>
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Documents & Videos ({results.documents.length})
              </div>
              <div className="space-y-1.5">
                {results.documents.map((doc: any) => (
                  <button
                    key={doc.id}
                    onClick={() => {
                      if (onSelectDocument) onSelectDocument(doc.id);
                      onSelectTab(doc.sourceType === 'youtube' ? 'youtube' : 'documents');
                      onClose();
                    }}
                    className="w-full text-left p-2.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/80 flex items-center justify-between group transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {doc.sourceType === 'youtube' ? (
                        <Video className="w-4 h-4 text-red-500 shrink-0" />
                      ) : (
                        <FileText className="w-4 h-4 text-indigo-500 shrink-0" />
                      )}
                      <span className="text-sm font-medium text-slate-900 dark:text-white truncate">
                        {doc.title}
                      </span>
                      <span className="text-xs text-slate-400 shrink-0">· {doc.category}</span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Semantic Chunks */}
          {results.chunks.length > 0 && (
            <div>
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Semantic Text Passages ({results.chunks.length})
              </div>
              <div className="space-y-2">
                {results.chunks.map((chunk: any) => (
                  <div
                    key={chunk.id}
                    onClick={() => {
                      onSelectTab('chat');
                      onClose();
                    }}
                    className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:border-indigo-400 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
                      <span className="font-medium text-slate-800 dark:text-slate-200">
                        {chunk.documentTitle}
                      </span>
                      <span className="tabular-nums font-mono text-indigo-600 dark:text-indigo-400">
                        {chunk.score}% Match
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2">
                      {chunk.snippet}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          {results.notes.length > 0 && (
            <div>
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Notes ({results.notes.length})
              </div>
              <div className="space-y-1.5">
                {results.notes.map((note: any) => (
                  <button
                    key={note.id}
                    onClick={() => {
                      onSelectTab('notes');
                      onClose();
                    }}
                    className="w-full text-left p-2.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <FileSpreadsheet className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span className="text-sm font-medium text-slate-900 dark:text-white truncate">
                        {note.title}
                      </span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
