import { Router, Request, Response } from 'express';
import { appState } from '../state.js';
import { defaultAIProvider } from '../providers/ai.provider.js';
import { defaultEmbeddingProvider } from '../providers/embedding.provider.js';
import { defaultVectorStore } from '../providers/vector.store.js';
import { Citation, SearchResult } from '../types.js';

export const ragRouter = Router();

// Core RAG query endpoint
ragRouter.post('/query', async (req: Request, res: Response) => {
  try {
    const { query, documentId, sourceType, topK = 4 } = req.body;
    if (!query) {
      return res.status(400).json({ success: false, error: 'Query string is required' });
    }

    // 1. Generate Query Vector Embedding
    const queryEmbedding = await defaultEmbeddingProvider.embed(query);

    // 2. Retrieve Top-K Semantically Similar Chunks
    const filter = documentId || sourceType ? { documentId, sourceType } : undefined;
    const searchResults: SearchResult[] = await defaultVectorStore.search(
      queryEmbedding,
      Number(topK),
      filter
    );

    // Filter by similarity threshold (e.g. 0.25 to prevent irrelevant context)
    const validResults = searchResults.filter((r) => r.score > 0.15);

    if (validResults.length === 0) {
      return res.json({
        success: true,
        answer: 'The information was not found in your knowledge sources.',
        citations: [],
        relevantChunks: 0,
      });
    }

    // 3. Assemble Context & Citations
    const citations: Citation[] = validResults.map((r) => ({
      chunkId: r.chunk.id,
      documentId: r.chunk.documentId,
      documentTitle: r.chunk.documentTitle,
      sourceType: r.chunk.sourceType,
      pageOrTime: r.chunk.pageNumber ? `Page ${r.chunk.pageNumber}` : r.chunk.timestamp,
      snippet: r.chunk.content.slice(0, 220) + '...',
      relevanceScore: Math.round(r.score * 100) / 100,
    }));

    const contextText = validResults
      .map(
        (r, idx) =>
          `[Source ${idx + 1}: "${r.chunk.documentTitle}" (${r.chunk.pageNumber ? `Page ${r.chunk.pageNumber}` : r.chunk.timestamp || 'Section'})]\n${r.chunk.content}`
      )
      .join('\n\n---\n\n');

    // 4. Synthesize Answer with Gemini AI Provider
    const systemPrompt = `You are Synapse AI, an elite academic and technical research assistant.
Answer the user's inquiry strictly and accurately based on the provided context sources.
Guidelines:
1. Cite sources inline using [Source 1], [Source 2], etc.
2. If the context does not contain sufficient facts to answer the question, state: "The information was not found in your knowledge sources."
3. Do not invent or hallucinate facts not supported by the context.
4. Format your answer with clean Markdown, clear headings, bullet points, and LaTeX formulas if applicable.`;

    const userPrompt = `Context:\n${contextText}\n\nUser Question: ${query}\n\nSynthesized Answer:`;

    let answer = '';
    try {
      answer = await defaultAIProvider.generateText(userPrompt, systemPrompt);
      appState.recordUsage(Math.ceil((contextText.length + answer.length) / 4));
    } catch (aiErr: any) {
      console.warn('AI provider generation error, providing fallback synthesis:', aiErr?.message);
      answer = `### Retrieved Knowledge Passages\n\n*(Note: The AI model is currently experiencing high demand on the free tier. Here is the relevant text directly retrieved from your knowledge base)*\n\n${validResults.map((r, i) => `**[Source ${i + 1}: ${r.chunk.documentTitle}]**\n> ${r.chunk.content}`).join('\n\n')}`;
    }

    res.json({
      success: true,
      answer,
      citations,
      relevantChunks: validResults.length,
    });
  } catch (err: any) {
    console.error('RAG query error:', err);
    res.status(500).json({ success: false, error: err?.message || 'RAG query failed' });
  }
});
