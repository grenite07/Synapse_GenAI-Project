import { Router, Request, Response } from 'express';
import { appState } from '../state.js';
import { defaultEmbeddingProvider } from '../providers/embedding.provider.js';
import { defaultVectorStore } from '../providers/vector.store.js';

export const searchRouter = Router();

searchRouter.get('/', async (req: Request, res: Response) => {
  try {
    const q = (req.query.q as string || '').trim();
    if (!q) {
      return res.json({ success: true, data: { documents: [], chunks: [], notes: [] } });
    }

    // 1. Keyword search in documents and notes
    const lower = q.toLowerCase();
    const matchedDocs = Array.from(appState.knowledgeItems.values()).filter(
      (d) =>
        d.title.toLowerCase().includes(lower) ||
        d.category.toLowerCase().includes(lower) ||
        d.tags.some((t) => t.toLowerCase().includes(lower))
    );

    const matchedNotes = Array.from(appState.notes.values()).filter(
      (n) =>
        n.title.toLowerCase().includes(lower) ||
        n.content.toLowerCase().includes(lower) ||
        n.tags.some((t) => t.toLowerCase().includes(lower))
    );

    // 2. Semantic search in vector chunks
    const qEmbedding = await defaultEmbeddingProvider.embed(q);
    const vectorResults = await defaultVectorStore.search(qEmbedding, 6);
    const matchedChunks = vectorResults
      .filter((r) => r.score > 0.15)
      .map((r) => ({
        id: r.chunk.id,
        documentId: r.chunk.documentId,
        documentTitle: r.chunk.documentTitle,
        sourceType: r.chunk.sourceType,
        pageNumber: r.chunk.pageNumber,
        timestamp: r.chunk.timestamp,
        snippet: r.chunk.content.slice(0, 200) + '...',
        score: Math.round(r.score * 100),
      }));

    res.json({
      success: true,
      data: {
        documents: matchedDocs,
        notes: matchedNotes,
        chunks: matchedChunks,
      },
    });
  } catch (err: any) {
    console.error('Search error:', err);
    res.status(500).json({ success: false, error: err?.message || 'Search failed' });
  }
});
