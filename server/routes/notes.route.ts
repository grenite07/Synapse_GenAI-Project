import { Router, Request, Response } from 'express';
import { appState } from '../state.js';
import { defaultAIProvider } from '../providers/ai.provider.js';
import { NoteItem } from '../types.js';

export const notesRouter = Router();

// List all notes
notesRouter.get('/', (req: Request, res: Response) => {
  const notes = Array.from(appState.notes.values()).sort(
    (a, b) => b.updatedAt - a.updatedAt
  );
  res.json({ success: true, data: notes });
});

// Create note
notesRouter.post('/', (req: Request, res: Response) => {
  const { title, content, category, tags, sourceDocumentId, sourceDocumentTitle } = req.body;
  if (!title || !content) {
    return res.status(400).json({ success: false, error: 'Title and content are required' });
  }

  const id = `note_${Date.now()}`;
  const newNote: NoteItem = {
    id,
    title,
    content,
    category: category || 'General',
    tags: Array.isArray(tags) ? tags : [],
    sourceDocumentId,
    sourceDocumentTitle,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  appState.notes.set(id, newNote);
  res.json({ success: true, data: newNote });
});

// Auto-generate note from document
notesRouter.post('/generate-from-source', async (req: Request, res: Response) => {
  try {
    const { documentId, focusTopic } = req.body;
    const doc = appState.knowledgeItems.get(documentId);
    if (!doc) {
      return res.status(404).json({ success: false, error: 'Document not found' });
    }

    const text = (doc.extractedText || doc.summary || '').slice(0, 6000);
    const prompt = `Synthesize a structured revision note based on this material.
Title: "${doc.title}"
${focusTopic ? `Special Focus: ${focusTopic}` : ''}

Include:
- High-level Concept Overview
- Critical Definitions & Notation
- Step-by-Step Mechanisms
- Exam/Interview High-Yield Tips

Material:
${text}`;

    const content = await defaultAIProvider.generateText(prompt, 'You are an elite academic study author.');
    const noteId = `note_${Date.now()}`;
    const generatedNote: NoteItem = {
      id: noteId,
      title: `${doc.title} - Structured Notes`,
      content,
      category: doc.category,
      tags: [...doc.tags, 'Auto-Synthesized'],
      sourceDocumentId: doc.id,
      sourceDocumentTitle: doc.title,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    appState.notes.set(noteId, generatedNote);
    appState.recordUsage(Math.ceil((text.length + content.length) / 4));

    res.json({ success: true, data: generatedNote });
  } catch (err: any) {
    console.error('Note generation error:', err);
    res.status(500).json({ success: false, error: err?.message || 'Note generation failed' });
  }
});

// Update note
notesRouter.put('/:id', (req: Request, res: Response) => {
  const note = appState.notes.get(req.params.id);
  if (!note) {
    return res.status(404).json({ success: false, error: 'Note not found' });
  }

  const { title, content, category, tags } = req.body;
  if (title !== undefined) note.title = title;
  if (content !== undefined) note.content = content;
  if (category !== undefined) note.category = category;
  if (tags !== undefined && Array.isArray(tags)) note.tags = tags;
  note.updatedAt = Date.now();

  res.json({ success: true, data: note });
});

// Delete note
notesRouter.delete('/:id', (req: Request, res: Response) => {
  const deleted = appState.notes.delete(req.params.id);
  res.json({ success: deleted });
});
