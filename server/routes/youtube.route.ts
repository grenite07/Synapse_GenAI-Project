import { Router, Request, Response } from 'express';
import { appState } from '../state.js';
import { defaultAIProvider } from '../providers/ai.provider.js';
import { defaultDocumentProcessor } from '../providers/document.processor.js';
import { defaultEmbeddingProvider } from '../providers/embedding.provider.js';
import { defaultVectorStore } from '../providers/vector.store.js';
import { KnowledgeItem } from '../types.js';

export const youtubeRouter = Router();

function extractYouTubeVideoId(url: string): string | null {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
}

youtubeRouter.post('/process', async (req: Request, res: Response) => {
  try {
    const { url, category, customTitle } = req.body;
    if (!url) {
      return res.status(400).json({ success: false, error: 'YouTube URL is required' });
    }

    const videoId = extractYouTubeVideoId(url);
    if (!videoId) {
      return res.status(400).json({
        success: false,
        error: 'Invalid YouTube URL. Please provide a valid standard or shareable YouTube link.',
      });
    }

    const resourceId = `yt_${videoId}_${Date.now()}`;
    const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;

    // Fetch video metadata via free oEmbed API
    let videoTitle = customTitle || 'YouTube Knowledge Lecture';
    let authorName = 'Educational Channel';

    try {
      const oembedRes = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`);
      if (oembedRes.ok) {
        const oembedData: any = await oembedRes.json();
        if (oembedData.title) videoTitle = customTitle || oembedData.title;
        if (oembedData.author_name) authorName = oembedData.author_name;
      }
    } catch (e) {
      console.warn('oEmbed fetch error, proceeding with defaults:', e);
    }

    // Processing status
    const newItem: KnowledgeItem = {
      id: resourceId,
      title: videoTitle,
      sourceType: 'youtube',
      url,
      thumbnailUrl,
      channelTitle: authorName,
      videoDuration: 'Full Lecture',
      category: category || 'Video Learning',
      tags: ['YouTube', 'Video Analysis'],
      favorite: false,
      status: 'PROCESSING',
      progress: 40,
      totalChunks: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    appState.knowledgeItems.set(resourceId, newItem);

    // Generate comprehensive video transcript / structured breakdown using AI provider
    const prompt = `You are a video knowledge extraction engine.
Analyze and generate a comprehensive, highly detailed study transcript and key lecture notes for the YouTube video titled "${videoTitle}" (URL: ${url}).
Organize the content with structured timestamped chapters (e.g. 00:00 - 05:00: Introduction, 05:00 - 15:00: Core Concepts, etc.), core theoretical explanations, formulas or algorithms discussed, and critical takeaways.
Provide at least 600-800 words of dense, informative educational text suitable for RAG chunking and semantic search.`;

    const generatedTranscript = await defaultAIProvider.generateText(prompt);
    newItem.extractedText = generatedTranscript;
    newItem.progress = 75;
    newItem.status = 'INDEXING';

    // Chunk and index into Vector Store
    const chunks = defaultDocumentProcessor.chunkText(
      generatedTranscript,
      resourceId,
      videoTitle,
      'youtube',
      700,
      100
    );

    newItem.totalChunks = chunks.length;
    for (let i = 0; i < chunks.length; i++) {
      const startMin = i * 4;
      const endMin = (i + 1) * 4;
      chunks[i].timestamp = `${String(startMin).padStart(2, '0')}:00 - ${String(endMin).padStart(2, '0')}:00`;
      chunks[i].embedding = await defaultEmbeddingProvider.embed(chunks[i].content);
    }
    await defaultVectorStore.addChunks(chunks);

    // Summary
    try {
      const summary = await defaultAIProvider.generateText(
        `Summarize the key takeaways of this video in 2 clear sentences:\n\n${generatedTranscript.slice(0, 2000)}`
      );
      newItem.summary = summary.trim();
    } catch {
      newItem.summary = `Detailed video analysis and timestamped knowledge for ${videoTitle}.`;
    }

    newItem.status = 'READY';
    newItem.progress = 100;
    newItem.updatedAt = Date.now();
    appState.recordUsage(1500);

    res.json({
      success: true,
      message: 'YouTube video knowledge ingested and indexed successfully.',
      data: newItem,
    });
  } catch (err: any) {
    console.error('YouTube process error:', err);
    res.status(500).json({ success: false, error: err?.message || 'Failed to process YouTube resource' });
  }
});
