import React, { useState } from 'react';
import { KnowledgeItem } from '../../types';
import { api } from '../../services/api';
import {
  Video,
  Play,
  Plus,
  Clock,
  Sparkles,
  ExternalLink,
  MessageSquare,
  FileSpreadsheet,
  BrainCircuit,
  Trash2,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

interface YouTubeManagerProps {
  documents: KnowledgeItem[];
  onRefresh: () => void;
  onSelectForChat: (docId: string) => void;
  onGenerateQuizForDoc: (docId: string) => void;
  onGenerateNotesForDoc: (docId: string) => void;
}

export const YouTubeManager: React.FC<YouTubeManagerProps> = ({
  documents,
  onRefresh,
  onSelectForChat,
  onGenerateQuizForDoc,
  onGenerateNotesForDoc,
}) => {
  const [url, setUrl] = useState('');
  const [customTitle, setCustomTitle] = useState('');
  const [category, setCategory] = useState('Computer Science');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const ytVideos = documents.filter((d) => d.sourceType === 'youtube');

  const handleProcess = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    setProcessing(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await api.processYouTube(url.trim(), category, customTitle.trim() || undefined);
      setSuccess(`Lecture "${res.title}" successfully processed, transcribed, and indexed into the vector store.`);
      setUrl('');
      setCustomTitle('');
      onRefresh();
    } catch (err: any) {
      setError(err?.message || 'Failed to process YouTube video');
    } finally {
      setProcessing(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to remove this video from your knowledge base?')) return;
    try {
      await api.deleteDocument(id);
      onRefresh();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">
          YouTube Video Knowledge Ingestion
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Extract timestamped transcripts, conceptual lectures, and study notes from any educational YouTube link.
        </p>
      </div>

      {/* Input Box Card */}
      <div className="p-6 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
        <form onSubmit={handleProcess} className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Video className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Paste YouTube Video URL (e.g., https://www.youtube.com/watch?v=kPRA0W1kECg)"
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-500 text-slate-900 dark:text-white"
                required
              />
            </div>
            <button
              type="submit"
              disabled={processing}
              className="flex items-center justify-center gap-2 px-5 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 rounded-lg shadow-xs transition-colors whitespace-nowrap"
            >
              <Sparkles className="w-4 h-4" />
              <span>{processing ? 'Transcribing & Indexing...' : 'Ingest Video'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1 block">
                Custom Title (Optional)
              </label>
              <input
                type="text"
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                placeholder="e.g. CS50 Algorithms Lecture 3"
                className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1 block">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
              >
                <option value="Computer Science">Computer Science</option>
                <option value="Machine Learning">Machine Learning</option>
                <option value="Mathematics">Mathematics</option>
                <option value="Software Engineering">Software Engineering</option>
                <option value="General Science">General Science</option>
              </select>
            </div>
          </div>
        </form>

        {error && (
          <div className="mt-4 p-3 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900/60 rounded-lg text-xs text-red-700 dark:text-red-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div className="mt-4 p-3 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900/60 rounded-lg text-xs text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{success}</span>
          </div>
        )}
      </div>

      {/* Videos List Grid */}
      <div className="space-y-4">
        <h2 className="text-base font-semibold text-slate-900 dark:text-white">
          Indexed YouTube Lectures ({ytVideos.length})
        </h2>

        {ytVideos.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
            No YouTube video lectures indexed yet. Enter a URL above to begin.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {ytVideos.map((video) => (
              <div
                key={video.id}
                className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-2xs flex flex-col justify-between"
              >
                <div>
                  {/* Thumbnail / Header */}
                  <div className="relative h-44 bg-slate-900 overflow-hidden">
                    <img
                      src={
                        video.thumbnailUrl ||
                        '/src/assets/images/card_video_intel_1790277244429.jpg'
                      }
                      alt={video.title}
                      className="w-full h-full object-cover opacity-85 hover:scale-105 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent flex items-end p-4">
                      <div>
                        <div className="text-[11px] text-red-400 font-semibold uppercase tracking-wider flex items-center gap-1.5 mb-1">
                          <Play className="w-3 h-3 fill-red-400" />
                          <span>{video.channelTitle || 'Video Lecture'}</span>
                        </div>
                        <h3 className="text-sm font-bold text-white line-clamp-1">
                          {video.title}
                        </h3>
                      </div>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-4 space-y-2">
                    <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                      <span>{video.category}</span>
                      <span aria-hidden="true">·</span>
                      <span className="tabular-nums font-mono">{video.totalChunks} Chunks</span>
                      <span aria-hidden="true">·</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-medium">Indexed</span>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                      {video.summary || video.extractedText?.slice(0, 160) + '...'}
                    </p>
                  </div>
                </div>

                {/* Video Actions */}
                <div className="p-4 pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => onSelectForChat(video.id)}
                      className="px-2.5 py-1 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md transition-colors flex items-center gap-1"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Ask Video</span>
                    </button>
                    <button
                      onClick={() => onGenerateQuizForDoc(video.id)}
                      className="px-2.5 py-1 text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md transition-colors flex items-center gap-1"
                    >
                      <BrainCircuit className="w-3.5 h-3.5" />
                      <span>Quiz</span>
                    </button>
                    <button
                      onClick={() => onGenerateNotesForDoc(video.id)}
                      className="px-2.5 py-1 text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md transition-colors flex items-center gap-1"
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5" />
                      <span>Notes</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-1">
                    {video.url && (
                      <a
                        href={video.url}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-md"
                        title="Open on YouTube"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                    <button
                      onClick={() => handleDelete(video.id)}
                      className="p-1.5 text-slate-400 hover:text-red-500 rounded-md"
                      title="Delete Video"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
