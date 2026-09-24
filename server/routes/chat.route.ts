import { Router, Request, Response } from 'express';
import { appState } from '../state.js';
import { defaultAIProvider } from '../providers/ai.provider.js';
import { defaultEmbeddingProvider } from '../providers/embedding.provider.js';
import { defaultVectorStore } from '../providers/vector.store.js';
import { ChatConversation, ChatMessage, Citation } from '../types.js';

export const chatRouter = Router();

// List conversations
chatRouter.get('/conversations', (req: Request, res: Response) => {
  const convs = Array.from(appState.conversations.values()).sort(
    (a, b) => b.updatedAt - a.updatedAt
  );
  res.json({ success: true, data: convs });
});

// Create new conversation
chatRouter.post('/conversations', (req: Request, res: Response) => {
  const { title } = req.body;
  const id = `conv_${Date.now()}`;
  const newConv: ChatConversation = {
    id,
    title: title || 'New Research Session',
    messages: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  appState.conversations.set(id, newConv);
  res.json({ success: true, data: newConv });
});

// Delete conversation
chatRouter.delete('/conversations/:id', (req: Request, res: Response) => {
  const deleted = appState.conversations.delete(req.params.id);
  res.json({ success: deleted });
});

// Send message (Non-streaming or SSE streaming)
chatRouter.post('/conversations/:id/message', async (req: Request, res: Response) => {
  try {
    const { message, mode = 'knowledge-base', selectedSourceId, stream = false } = req.body;
    const convId = req.params.id;

    let conv = appState.conversations.get(convId);
    if (!conv) {
      conv = {
        id: convId,
        title: message.slice(0, 36) + '...',
        messages: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      appState.conversations.set(convId, conv);
    }

    // 1. Build Vector Retrieval Query
    const queryEmbedding = await defaultEmbeddingProvider.embed(message);
    const filter =
      mode === 'document' || mode === 'video'
        ? { documentId: selectedSourceId }
        : mode === 'all-documents'
        ? { sourceType: 'pdf' }
        : undefined;

    const results = await defaultVectorStore.search(queryEmbedding, 4, filter);
    const validResults = results.filter((r) => r.score > 0.12);

    const citations: Citation[] = validResults.map((r) => ({
      chunkId: r.chunk.id,
      documentId: r.chunk.documentId,
      documentTitle: r.chunk.documentTitle,
      sourceType: r.chunk.sourceType,
      pageOrTime: r.chunk.pageNumber ? `Page ${r.chunk.pageNumber}` : r.chunk.timestamp,
      snippet: r.chunk.content.slice(0, 240) + '...',
      relevanceScore: Math.round(r.score * 100) / 100,
    }));

    const contextText =
      validResults.length > 0
        ? validResults
            .map(
              (r, idx) =>
                `[Source ${idx + 1}: ${r.chunk.documentTitle}]\n${r.chunk.content}`
            )
            .join('\n\n---\n\n')
        : 'No specific document excerpts matched.';

    // 2. Assemble system prompt with conversation history
    const systemPrompt = `You are Synapse AI, a professional academic and research assistant.
You possess access to the user's uploaded documents and indexed lecture videos.
Rules:
- Cite context sources accurately where relevant using [Source X].
- If the required answer is outside the provided knowledge sources and the user asked about their files, clarify: "The information was not found in your knowledge sources."
- Maintain clarity, professional tone, and rich Markdown formatting.`;

    const userMessage: ChatMessage = {
      id: `msg_u_${Date.now()}`,
      role: 'user',
      content: message,
      timestamp: Date.now(),
      mode,
      selectedSourceId,
    };
    conv.messages.push(userMessage);

    const promptText = `Context:\n${contextText}\n\nRecent user question: ${message}`;

    if (stream) {
      // SSE Streaming Response
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      let accumulated = '';
      try {
        await defaultAIProvider.streamText(promptText, systemPrompt, (chunk) => {
          accumulated += chunk;
          res.write(`data: ${JSON.stringify({ chunk })}\n\n`);
        });
      } catch (streamErr: any) {
        const fallbackText = `\n\n*(Note: High demand on free tier. Displaying retrieved knowledge)*\n\n${contextText}`;
        accumulated += fallbackText;
        res.write(`data: ${JSON.stringify({ chunk: fallbackText })}\n\n`);
      }

      const assistantMessage: ChatMessage = {
        id: `msg_a_${Date.now()}`,
        role: 'assistant',
        content: accumulated,
        citations,
        timestamp: Date.now(),
      };
      conv.messages.push(assistantMessage);
      conv.updatedAt = Date.now();
      appState.recordUsage(Math.ceil((contextText.length + accumulated.length) / 4));

      res.write(`data: ${JSON.stringify({ done: true, citations })}\n\n`);
      return res.end();
    } else {
      let answer = '';
      try {
        answer = await defaultAIProvider.generateText(promptText, systemPrompt);
      } catch (err: any) {
        answer = `I reviewed your knowledge sources. Here are the directly matching context excerpts:\n\n${contextText}`;
      }
      const assistantMessage: ChatMessage = {
        id: `msg_a_${Date.now()}`,
        role: 'assistant',
        content: answer,
        citations,
        timestamp: Date.now(),
      };
      conv.messages.push(assistantMessage);
      conv.updatedAt = Date.now();
      appState.recordUsage(Math.ceil((contextText.length + answer.length) / 4));

      return res.json({
        success: true,
        data: assistantMessage,
        conversation: conv,
      });
    }
  } catch (err: any) {
    console.error('Chat error:', err);
    res.status(500).json({ success: false, error: err?.message || 'Chat error' });
  }
});
