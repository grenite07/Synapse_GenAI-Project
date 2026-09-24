import React, { useState } from 'react';
import { KnowledgeItem, NavTab } from '../../types';
import {
  FolderKanban,
  FileText,
  Video,
  Star,
  Tag,
  Folder,
  ArrowRight,
  Filter,
} from 'lucide-react';

interface KnowledgeLibraryProps {
  documents: KnowledgeItem[];
  onSelectDocument: (docId: string) => void;
  onSelectTab: (tab: NavTab) => void;
}

export const KnowledgeLibrary: React.FC<KnowledgeLibraryProps> = ({
  documents,
  onSelectDocument,
  onSelectTab,
}) => {
  const [selectedFolder, setSelectedFolder] = useState<string>('All');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const predefinedFolders = [
    'All',
    'Machine Learning',
    'DSA',
    'AIML',
    'Deep Learning',
    'Mathematics',
    'Projects',
    'Research',
    'College',
  ];

  // Collect all unique tags
  const allTags = Array.from(new Set(documents.flatMap((d) => d.tags)));

  const filteredDocs = documents.filter((doc) => {
    const matchesFolder =
      selectedFolder === 'All' ||
      doc.category.toLowerCase() === selectedFolder.toLowerCase();
    const matchesTag = !selectedTag || doc.tags.includes(selectedTag);
    return matchesFolder && matchesTag;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">
          Knowledge Library & Taxonomic Archives
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Curated folders and tag taxonomies across all textbooks, lecture recordings, and research documents.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left Folders & Tags Sidebar */}
        <div className="md:col-span-4 space-y-6">
          {/* Folders */}
          <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-2">
            <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Folder className="w-3.5 h-3.5" />
              <span>Curated Disciplines</span>
            </h2>
            <div className="space-y-1">
              {predefinedFolders.map((folder) => {
                const count =
                  folder === 'All'
                    ? documents.length
                    : documents.filter(
                        (d) => d.category.toLowerCase() === folder.toLowerCase()
                      ).length;

                return (
                  <button
                    key={folder}
                    onClick={() => {
                      setSelectedFolder(folder);
                      setSelectedTag(null);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded-lg transition-colors ${
                      selectedFolder === folder
                        ? 'bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 font-semibold'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <span>{folder}</span>
                    <span className="font-mono tabular-nums text-slate-400">
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tags */}
          {allTags.length > 0 && (
            <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-2">
              <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5" />
                <span>Knowledge Tags</span>
              </h2>
              <div className="flex flex-wrap gap-1.5">
                {allTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() =>
                      setSelectedTag(selectedTag === tag ? null : tag)
                    }
                    className={`px-2.5 py-1 text-xs rounded-md border transition-colors ${
                      selectedTag === tag
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-indigo-400'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Documents Grid */}
        <div className="md:col-span-8 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {selectedFolder} Collection ({filteredDocs.length})
            </span>
            {selectedTag && (
              <span className="text-xs text-indigo-600 dark:text-indigo-400">
                Filtered by tag: #{selectedTag}
              </span>
            )}
          </div>

          {filteredDocs.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-400 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
              No knowledge sources currently archived in this discipline. Upload documents to populate.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredDocs.map((doc) => (
                <div
                  key={doc.id}
                  className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs flex flex-col justify-between hover:border-indigo-400 transition-colors group"
                >
                  <div>
                    <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                      <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                        {doc.category}
                      </span>
                      {doc.sourceType === 'youtube' ? (
                        <Video className="w-4 h-4 text-red-500" />
                      ) : (
                        <FileText className="w-4 h-4 text-indigo-500" />
                      )}
                    </div>

                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white line-clamp-2 mb-2">
                      {doc.title}
                    </h3>

                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      {doc.summary || doc.extractedText?.slice(0, 140) + '...'}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <span className="text-[11px] font-mono tabular-nums text-slate-400">
                      {doc.totalChunks} Chunks
                    </span>
                    <button
                      onClick={() => {
                        onSelectDocument(doc.id);
                        onSelectTab('chat');
                      }}
                      className="text-xs font-medium text-indigo-600 dark:text-indigo-400 group-hover:translate-x-0.5 transition-transform flex items-center gap-1"
                    >
                      <span>Query</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
