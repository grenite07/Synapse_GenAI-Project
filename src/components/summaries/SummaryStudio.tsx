import React, { useState } from 'react';
import { KnowledgeItem } from '../../types';
import { api } from '../../services/api';
import {
  FileSignature,
  Sparkles,
  Download,
  Copy,
  Check,
  BookOpen,
  FileText,
  ListOrdered,
  Calculator,
  Layers,
} from 'lucide-react';

interface SummaryStudioProps {
  documents: KnowledgeItem[];
}

export const SummaryStudio: React.FC<SummaryStudioProps> = ({ documents }) => {
  const [selectedDocId, setSelectedDocId] = useState<string>(
    documents.length > 0 ? documents[0].id : ''
  );
  const [format, setFormat] = useState<string>('detailed');
  const [loading, setLoading] = useState(false);
  const [summaryResult, setSummaryResult] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    if (!selectedDocId) return;
    setLoading(true);
    setSummaryResult(null);

    try {
      const data = await api.generateSummary(selectedDocId, format);
      setSummaryResult(data.content);
    } catch (e: any) {
      console.error(e);
      setSummaryResult(`Error generating summary: ${e?.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!summaryResult) return;
    navigator.clipboard.writeText(summaryResult);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = (ext: 'md' | 'txt') => {
    if (!summaryResult) return;
    const doc = documents.find((d) => d.id === selectedDocId);
    const filename = `${doc?.title || 'Summary'}_${format}.${ext}`;
    const blob = new Blob([summaryResult], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">
          AI Summarization Studio
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Synthesize high-density executive overviews, formulas, and chronological chapter outlines.
        </p>
      </div>

      {/* Configuration Card */}
      <div className="p-6 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 block">
              Source Material
            </label>
            <select
              value={selectedDocId}
              onChange={(e) => setSelectedDocId(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
            >
              {documents.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.title} ({d.sourceType.toUpperCase()})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 block">
              Summary Mode
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'detailed', label: 'Detailed', icon: <FileText className="w-3.5 h-3.5" /> },
                { id: 'tldr', label: 'TL;DR', icon: <Sparkles className="w-3.5 h-3.5" /> },
                { id: 'chapters', label: 'Chapters', icon: <ListOrdered className="w-3.5 h-3.5" /> },
                { id: 'formulas', label: 'Formulas', icon: <Calculator className="w-3.5 h-3.5" /> },
              ].map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setFormat(m.id)}
                  className={`flex items-center justify-center gap-1.5 px-3 py-2 text-xs rounded-lg border transition-colors ${
                    format === m.id
                      ? 'bg-indigo-50 dark:bg-indigo-950/70 border-indigo-500 text-indigo-600 dark:text-indigo-300 font-semibold'
                      : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {m.icon}
                  <span>{m.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <button
          onClick={handleGenerate}
          disabled={loading || !selectedDocId}
          className="flex items-center justify-center gap-2 w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
        >
          <Sparkles className="w-4 h-4" />
          <span>{loading ? 'Synthesizing Summary with Gemini...' : 'Generate Executive Summary'}</span>
        </button>
      </div>

      {/* Output Viewer */}
      {summaryResult && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-900 dark:text-white uppercase tracking-wider">
              Generated Synthesis ({format.toUpperCase()})
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 px-2.5 py-1 text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
              <button
                onClick={() => handleDownload('md')}
                className="flex items-center gap-1 px-2.5 py-1 text-xs text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 rounded transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Markdown</span>
              </button>
            </div>
          </div>

          <div className="p-6 text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-sans whitespace-pre-wrap">
            {summaryResult}
          </div>
        </div>
      )}
    </div>
  );
};
