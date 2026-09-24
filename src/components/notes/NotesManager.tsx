import React, { useState } from 'react';
import { NoteItem, KnowledgeItem } from '../../types';
import { api } from '../../services/api';
import {
  FileSpreadsheet,
  Plus,
  Trash2,
  Edit2,
  Sparkles,
  Download,
  Search,
  Check,
  Save,
  BookOpen,
} from 'lucide-react';

interface NotesManagerProps {
  notes: NoteItem[];
  documents: KnowledgeItem[];
  onRefresh: () => void;
}

export const NotesManager: React.FC<NotesManagerProps> = ({
  notes,
  documents,
  onRefresh,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNote, setSelectedNote] = useState<NoteItem | null>(
    notes.length > 0 ? notes[0] : null
  );
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [generatingFromDocId, setGeneratingFromDocId] = useState('');
  const [generating, setGenerating] = useState(false);

  const filteredNotes = notes.filter((n) =>
    n.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    n.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateNew = async () => {
    try {
      const created = await api.saveNote({
        title: 'Untitled Note',
        content: '# New Research Note\n\nRecord study insights here...',
        category: 'Study',
        tags: ['Draft'],
      });
      onRefresh();
      setSelectedNote(created);
      setIsEditing(true);
      setEditTitle(created.title);
      setEditContent(created.content);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSave = async () => {
    if (!selectedNote) return;
    try {
      const updated = await api.saveNote({
        ...selectedNote,
        title: editTitle,
        content: editContent,
      });
      setSelectedNote(updated);
      setIsEditing(false);
      onRefresh();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this note?')) return;
    try {
      await api.deleteNote(id);
      onRefresh();
      if (selectedNote?.id === id) {
        setSelectedNote(notes.length > 1 ? notes.find((n) => n.id !== id) || null : null);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleGenerateFromDoc = async () => {
    if (!generatingFromDocId) return;
    setGenerating(true);
    try {
      const note = await api.generateNoteFromSource(generatingFromDocId);
      onRefresh();
      setSelectedNote(note);
      setGeneratingFromDocId('');
    } catch (e) {
      console.error(e);
    } finally {
      setGenerating(false);
    }
  };

  const handleExport = (format: 'md' | 'txt' | 'json') => {
    if (!selectedNote) return;
    let text = selectedNote.content;
    let mime = 'text/plain;charset=utf-8';
    if (format === 'json') {
      text = JSON.stringify(selectedNote, null, 2);
      mime = 'application/json';
    }

    const blob = new Blob([text], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedNote.title.replace(/\s+/g, '_')}.${format}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header and Quick Generate */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">
            AI Study Notes & Revision Sheets
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Maintain structured technical notes synthesized from documents or written manually.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* AI Synthesis from Document */}
          <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 p-1 border border-slate-200 dark:border-slate-800 rounded-lg">
            <select
              value={generatingFromDocId}
              onChange={(e) => setGeneratingFromDocId(e.target.value)}
              className="text-xs bg-transparent border-none text-slate-700 dark:text-slate-300 focus:outline-none max-w-xs truncate"
            >
              <option value="">Synthesize from source...</option>
              {documents.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.title}
                </option>
              ))}
            </select>
            <button
              onClick={handleGenerateFromDoc}
              disabled={!generatingFromDocId || generating}
              className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{generating ? 'Generating...' : 'Auto-Generate'}</span>
            </button>
          </div>

          <button
            onClick={handleCreateNew}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 rounded-lg shadow-2xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Note</span>
          </button>
        </div>
      </div>

      {/* Main Split Layout: Notes List on Left, Editor/Viewer on Right */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 h-[calc(100vh-13rem)]">
        {/* Left List */}
        <div className="md:col-span-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs flex flex-col overflow-hidden">
          <div className="p-3 border-b border-slate-200 dark:border-slate-800">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search notes..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
            {filteredNotes.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                No notes found.
              </div>
            ) : (
              filteredNotes.map((n) => (
                <div
                  key={n.id}
                  onClick={() => {
                    setSelectedNote(n);
                    setIsEditing(false);
                  }}
                  className={`p-3.5 cursor-pointer transition-colors ${
                    selectedNote?.id === n.id
                      ? 'bg-indigo-50/70 dark:bg-indigo-950/50 border-l-2 border-indigo-600'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                  }`}
                >
                  <h4 className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                    {n.title}
                  </h4>
                  <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-1">
                    <span>{n.category}</span>
                    <span aria-hidden="true">·</span>
                    <span>{new Date(n.updatedAt).toLocaleDateString()}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-1">
                    {n.content.replace(/[#*`_]/g, '')}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Editor / Viewer */}
        <div className="md:col-span-8 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs flex flex-col overflow-hidden">
          {selectedNote ? (
            <>
              {/* Note Header / Controls */}
              <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div className="min-w-0 flex-1 mr-4">
                  {isEditing ? (
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="w-full text-base font-bold bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 px-2 py-1 rounded text-slate-900 dark:text-white"
                    />
                  ) : (
                    <h3 className="text-base font-bold text-slate-900 dark:text-white truncate">
                      {selectedNote.title}
                    </h3>
                  )}
                  <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                    <span>{selectedNote.category}</span>
                    {selectedNote.sourceDocumentTitle && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span>Source: {selectedNote.sourceDocumentTitle}</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {isEditing ? (
                    <button
                      onClick={handleSave}
                      className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-2xs transition-colors"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>Save</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setIsEditing(true);
                        setEditTitle(selectedNote.title);
                        setEditContent(selectedNote.content);
                      }}
                      className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-lg transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>
                  )}

                  {/* Export Menu */}
                  <button
                    onClick={() => handleExport('md')}
                    className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded hover:bg-slate-100 dark:hover:bg-slate-800"
                    title="Export Markdown"
                  >
                    <Download className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleDelete(selectedNote.id)}
                    className="p-1.5 text-slate-400 hover:text-red-500 rounded hover:bg-slate-100 dark:hover:bg-slate-800"
                    title="Delete Note"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Note Content */}
              <div className="flex-1 p-6 overflow-y-auto">
                {isEditing ? (
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="w-full h-full p-4 font-mono text-xs bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none resize-none leading-relaxed"
                  />
                ) : (
                  <div className="prose dark:prose-invert max-w-none text-xs leading-relaxed font-sans whitespace-pre-wrap text-slate-800 dark:text-slate-200">
                    {selectedNote.content}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-xs text-slate-400">
              Select or create a study note to view and edit.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
