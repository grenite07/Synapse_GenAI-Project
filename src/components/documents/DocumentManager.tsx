import React, { useState, useRef } from 'react';
import { KnowledgeItem, DocumentChunk } from '../../types';
import { api } from '../../services/api';
import {
  FileText,
  UploadCloud,
  Search,
  Trash2,
  Edit2,
  Star,
  Layers,
  Eye,
  CheckCircle2,
  Clock,
  AlertCircle,
  X,
  FileCheck,
  Folder,
} from 'lucide-react';

interface DocumentManagerProps {
  documents: KnowledgeItem[];
  onRefresh: () => void;
  onSelectDocumentForChat: (docId: string) => void;
}

export const DocumentManager: React.FC<DocumentManagerProps> = ({
  documents,
  onRefresh,
  onSelectDocumentForChat,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const [activeModalDoc, setActiveModalDoc] = useState<KnowledgeItem | null>(null);
  const [editingDocId, setEditingDocId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [viewingChunksDoc, setViewingChunksDoc] = useState<KnowledgeItem | null>(null);
  const [docChunks, setDocChunks] = useState<DocumentChunk[]>([]);
  const [loadingChunks, setLoadingChunks] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filter only document types (PDF, TXT, Markdown)
  const docList = documents.filter((d) => d.sourceType !== 'youtube');

  const categories = ['All', ...Array.from(new Set(docList.map((d) => d.category)))];

  const filteredDocs = docList.filter((doc) => {
    const matchesSearch =
      doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.tags.some((t) => t.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'All' || doc.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    setUploadError(null);
    setUploadSuccess(null);

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        // Read file as base64
        const reader = new FileReader();
        const fileDataPromise = new Promise<string>((resolve, reject) => {
          reader.onload = () => {
            const result = reader.result as string;
            // extract raw base64 after data:...;base64,
            const base64 = result.includes(',') ? result.split(',')[1] : result;
            resolve(base64);
          };
          reader.onerror = reject;
        });
        reader.readAsDataURL(file);
        const fileData = await fileDataPromise;

        await api.uploadDocument({
          fileName: file.name,
          fileData,
          mimeType: file.type || 'application/pdf',
          category: selectedCategory === 'All' ? 'Academic' : selectedCategory,
          tags: ['PDF Ingestion'],
        });
      }

      setUploadSuccess(`Successfully ingested and indexed ${files.length} document(s).`);
      onRefresh();
    } catch (err: any) {
      setUploadError(err?.message || 'Upload failed');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleToggleFavorite = async (doc: KnowledgeItem) => {
    try {
      await api.updateDocument(doc.id, { favorite: !doc.favorite });
      onRefresh();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this document and all indexed vectors?')) return;
    try {
      await api.deleteDocument(id);
      onRefresh();
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveRename = async (id: string) => {
    if (!editTitle.trim()) return;
    try {
      await api.updateDocument(id, { title: editTitle.trim() });
      setEditingDocId(null);
      onRefresh();
    } catch (e) {
      console.error(e);
    }
  };

  const handleInspectChunks = async (doc: KnowledgeItem) => {
    setViewingChunksDoc(doc);
    setLoadingChunks(true);
    try {
      const fullDoc = await api.getDocument(doc.id);
      setDocChunks(fullDoc.chunks || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingChunks(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header and Upload Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">
            Document Intelligence & Vector Repository
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Upload course material, textbooks, and research papers for RAG indexing.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => handleFileUpload(e.target.files)}
            multiple
            accept=".pdf,.txt,.md"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-lg shadow-xs transition-colors"
          >
            <UploadCloud className="w-4 h-4" />
            <span>{uploading ? 'Processing & Vectorizing...' : 'Upload Documents'}</span>
          </button>
        </div>
      </div>

      {/* Drag & Drop Visual Box */}
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          handleFileUpload(e.dataTransfer.files);
        }}
        className="p-8 border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-500 rounded-xl bg-slate-50/50 dark:bg-slate-900/30 text-center transition-colors cursor-pointer"
        onClick={() => fileInputRef.current?.click()}
      >
        <div className="w-12 h-12 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto mb-3">
          <UploadCloud className="w-6 h-6" />
        </div>
        <div className="text-sm font-semibold text-slate-900 dark:text-white">
          Click to upload or drag & drop files here
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Supports PDF, TXT, and Markdown files. Automatic sliding-window chunking & vector indexing.
        </p>
      </div>

      {/* Messages */}
      {uploadError && (
        <div className="p-3 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900/60 rounded-lg text-xs text-red-700 dark:text-red-300 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{uploadError}</span>
        </div>
      )}
      {uploadSuccess && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900/60 rounded-lg text-xs text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{uploadSuccess}</span>
        </div>
      )}

      {/* Filter and Search Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Filter documents..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-900 dark:text-white"
          />
        </div>

        {/* Category Filter Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto p-1 bg-slate-100 dark:bg-slate-800/80 rounded-lg">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Documents Table / Grid */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs overflow-hidden">
        {filteredDocs.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">
            No documents found matching your filter criteria.
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {filteredDocs.map((doc) => (
              <div
                key={doc.id}
                className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 mt-0.5">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    {editingDocId === doc.id ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          className="px-2 py-1 text-sm bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded text-slate-900 dark:text-white"
                          autoFocus
                        />
                        <button
                          onClick={() => handleSaveRename(doc.id)}
                          className="px-2 py-1 text-xs bg-indigo-600 text-white rounded"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingDocId(null)}
                          className="px-2 py-1 text-xs text-slate-500"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                          {doc.title}
                        </h3>
                        {doc.favorite && (
                          <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400 shrink-0" />
                        )}
                      </div>
                    )}

                    {/* Unboxed Metadata (Zero-pill discipline) */}
                    <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-1">
                      <span>{doc.category}</span>
                      <span aria-hidden="true">·</span>
                      <span className="tabular-nums font-mono">{doc.totalChunks} Chunks</span>
                      <span aria-hidden="true">·</span>
                      <span>
                        {doc.fileSize
                          ? `${Math.round(doc.fileSize / 1024)} KB`
                          : 'Indexed'}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                        {doc.status}
                      </span>
                    </div>

                    {doc.summary && (
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 line-clamp-1">
                        {doc.summary}
                      </p>
                    )}
                  </div>
                </div>

                {/* Document Actions */}
                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  <button
                    onClick={() => onSelectDocumentForChat(doc.id)}
                    className="px-3 py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors whitespace-nowrap shadow-2xs"
                  >
                    Query
                  </button>
                  <button
                    onClick={() => setActiveModalDoc(doc)}
                    className="p-1.5 text-slate-500 hover:text-slate-800 dark:hover:text-white rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    title="View Document Details"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleInspectChunks(doc)}
                    className="p-1.5 text-slate-500 hover:text-slate-800 dark:hover:text-white rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    title="Inspect Vector Chunks"
                  >
                    <Layers className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      setEditingDocId(doc.id);
                      setEditTitle(doc.title);
                    }}
                    className="p-1.5 text-slate-500 hover:text-slate-800 dark:hover:text-white rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    title="Rename Document"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleToggleFavorite(doc)}
                    className="p-1.5 text-slate-500 hover:text-amber-500 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    title="Favorite"
                  >
                    <Star
                      className={`w-4 h-4 ${doc.favorite ? 'text-amber-400 fill-amber-400' : ''}`}
                    />
                  </button>
                  <button
                    onClick={() => handleDelete(doc.id)}
                    className="p-1.5 text-slate-400 hover:text-red-500 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    title="Delete Document"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Document Preview Modal */}
      {activeModalDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-3xl bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[85vh] flex flex-col overflow-hidden">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {activeModalDoc.title}
                </h3>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  <span>{activeModalDoc.category}</span> ·{' '}
                  <span className="tabular-nums font-mono">
                    {activeModalDoc.totalChunks} Chunks
                  </span>
                </div>
              </div>
              <button
                onClick={() => setActiveModalDoc(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4">
              <div>
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Executive Summary
                </h4>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/60 p-3 rounded-lg border border-slate-200 dark:border-slate-800">
                  {activeModalDoc.summary || 'Summary unavailable.'}
                </p>
              </div>

              <div>
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Extracted Raw Text Excerpt
                </h4>
                <div className="text-xs font-mono text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-950 p-4 rounded-lg overflow-x-auto max-h-72 whitespace-pre-wrap">
                  {activeModalDoc.extractedText || 'No text extracted.'}
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex justify-end">
              <button
                onClick={() => setActiveModalDoc(null)}
                className="px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Vector Chunks Inspector Modal */}
      {viewingChunksDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-3xl bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[85vh] flex flex-col overflow-hidden">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Layers className="w-4 h-4 text-indigo-500" />
                  <span>Vector Chunks: {viewingChunksDoc.title}</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Inspect the granular embeddings and token subdivisions used by the semantic retrieval engine.
                </p>
              </div>
              <button
                onClick={() => setViewingChunksDoc(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-3">
              {loadingChunks ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  Loading indexed vectors...
                </div>
              ) : docChunks.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  No chunks found for this document.
                </div>
              ) : (
                docChunks.map((chunk, idx) => (
                  <div
                    key={chunk.id}
                    className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-xs"
                  >
                    <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1.5">
                      <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                        Chunk #{idx + 1} ({chunk.id})
                      </span>
                      <span className="font-mono tabular-nums">
                        ~{chunk.tokenCount} Tokens {chunk.pageNumber ? `· Page ${chunk.pageNumber}` : ''}
                      </span>
                    </div>
                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-mono text-[11px] whitespace-pre-wrap">
                      {chunk.content}
                    </p>
                  </div>
                ))
              )}
            </div>

            <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex justify-end">
              <button
                onClick={() => setViewingChunksDoc(null)}
                className="px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-lg"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
