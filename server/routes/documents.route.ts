import { Router, Request, Response } from 'express';
import { appState } from '../state.js';
import { defaultDocumentProcessor } from '../providers/document.processor.js';
import { defaultEmbeddingProvider } from '../providers/embedding.provider.js';
import { defaultVectorStore } from '../providers/vector.store.js';
import { defaultAIProvider } from '../providers/ai.provider.js';
import { KnowledgeItem } from '../types.js';

export const documentsRouter = Router();

// List all knowledge documents
documentsRouter.get('/', (req: Request, res: Response) => {
  const items = Array.from(appState.knowledgeItems.values()).sort(
    (a, b) => b.createdAt - a.createdAt
  );
  res.json({ success: true, data: items });
});

// Get single document with chunk details
documentsRouter.get('/:id', (req: Request, res: Response) => {
  const item = appState.knowledgeItems.get(req.params.id);
  if (!item) {
    return res.status(404).json({ success: false, error: 'Document not found' });
  }

  const chunks = defaultVectorStore
    .getAllChunks()
    .filter((c) => c.documentId === item.id)
    .sort((a, b) => a.chunkIndex - b.chunkIndex);

  res.json({
    success: true,
    data: {
      ...item,
      chunks,
    },
  });
});

// Upload and process document
documentsRouter.post('/upload', async (req: Request, res: Response) => {
  try {
    const { fileName, fileData, mimeType, category, tags } = req.body;

    if (!fileName || !fileData) {
      return res.status(400).json({ success: false, error: 'File name and file data are required.' });
    }

    // Safety checks: File size check (max 20MB for free-tier safeguard)
    const buffer = Buffer.from(fileData, 'base64');
    if (buffer.length > 20 * 1024 * 1024) {
      return res.status(413).json({
        success: false,
        error: 'File size exceeds free-tier 20MB limit. Please upload a smaller document.',
      });
    }

    const docId = `doc_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const detectedType = fileName.toLowerCase().endsWith('.pdf') ? 'pdf' : 'txt';

    // Create preliminary item
    const newItem: KnowledgeItem = {
      id: docId,
      title: fileName.replace(/\.[^/.]+$/, ''),
      sourceType: detectedType,
      fileName,
      fileSize: buffer.length,
      category: category || 'General',
      tags: Array.isArray(tags) ? tags : ['Uploaded'],
      favorite: false,
      status: 'PROCESSING',
      progress: 25,
      totalChunks: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    appState.knowledgeItems.set(docId, newItem);

    // 1. Extract Text
    const extraction = await defaultDocumentProcessor.extractText(buffer, mimeType || 'application/pdf', fileName);
    newItem.extractedText = extraction.text;
    newItem.progress = 50;

    // 2. Chunk text
    const chunks = defaultDocumentProcessor.chunkText(
      extraction.text,
      docId,
      newItem.title,
      detectedType,
      750,
      100
    );

    newItem.totalChunks = chunks.length;
    newItem.progress = 75;
    newItem.status = 'INDEXING';

    // 3. Generate Embeddings & Index in Vector Store
    for (const chunk of chunks) {
      chunk.embedding = await defaultEmbeddingProvider.embed(chunk.content);
    }
    await defaultVectorStore.addChunks(chunks);

    // 4. Generate quick executive summary using AI Provider
    try {
      const summaryPrompt = `Generate a concise 2-sentence summary of the following document:\n\n${extraction.text.slice(0, 3000)}`;
      const summary = await defaultAIProvider.generateText(summaryPrompt);
      newItem.summary = summary.trim();
    } catch {
      newItem.summary = 'Document successfully ingested and indexed for semantic search.';
    }

    newItem.status = 'READY';
    newItem.progress = 100;
    newItem.updatedAt = Date.now();
    appState.recordUsage(Math.min(extraction.text.length / 4, 3000));

    res.json({
      success: true,
      message: 'Document successfully processed and indexed into vector knowledge base.',
      data: newItem,
    });
  } catch (err: any) {
    console.error('Document upload error:', err);
    res.status(500).json({ success: false, error: err?.message || 'Processing failed' });
  }
});

// Update metadata (rename, category, favorite, tags)
documentsRouter.patch('/:id', (req: Request, res: Response) => {
  const item = appState.knowledgeItems.get(req.params.id);
  if (!item) {
    return res.status(404).json({ success: false, error: 'Document not found' });
  }

  const { title, category, favorite, tags } = req.body;
  if (title !== undefined) item.title = title;
  if (category !== undefined) item.category = category;
  if (favorite !== undefined) item.favorite = Boolean(favorite);
  if (tags !== undefined && Array.isArray(tags)) item.tags = tags;
  item.updatedAt = Date.now();

  res.json({ success: true, data: item });
});

// Delete document and remove associated chunks from vector store
documentsRouter.delete('/:id', async (req: Request, res: Response) => {
  const docId = req.params.id;
  if (!appState.knowledgeItems.has(docId)) {
    return res.status(404).json({ success: false, error: 'Document not found' });
  }

  appState.knowledgeItems.delete(docId);
  await defaultVectorStore.deleteByDocumentId(docId);
  appState.quota.chunksStored = defaultVectorStore.getAllChunks().length;

  res.json({ success: true, message: 'Document and vectors deleted successfully.' });
});
