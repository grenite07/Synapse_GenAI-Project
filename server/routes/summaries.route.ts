import { Router, Request, Response } from 'express';
import { appState } from '../state.js';
import { defaultAIProvider } from '../providers/ai.provider.js';

export const summariesRouter = Router();

summariesRouter.post('/generate', async (req: Request, res: Response) => {
  try {
    const { documentId, format = 'detailed' } = req.body;

    const doc = appState.knowledgeItems.get(documentId);
    if (!doc) {
      return res.status(404).json({ success: false, error: 'Document not found' });
    }

    const text = doc.extractedText || doc.summary || '';
    if (!text) {
      return res.status(400).json({ success: false, error: 'No extracted text found in document' });
    }

    let prompt = '';
    const slice = text.slice(0, 8000); // respect token boundaries

    switch (format) {
      case 'tldr':
        prompt = `Generate a rapid 3-bullet point TL;DR summary of this material:\n\n${slice}`;
        break;
      case 'chapters':
        prompt = `Break down this document into chronological or thematic chapters with timestamps or headings, summarizing each section:\n\n${slice}`;
        break;
      case 'formulas':
        prompt = `Extract all mathematical equations, scientific formulas, algorithmic definitions, and precise terms from this text:\n\n${slice}`;
        break;
      case 'detailed':
      default:
        prompt = `Create an executive academic summary of the following document.
Structure your output with:
1. Executive Overview
2. Core Architectural / Conceptual Pillars
3. Key Technical Insights
4. Practical Implications & Common Traps
\n\nContent:\n${slice}`;
        break;
    }

    const systemInstruction = 'You are an expert technical editor and academic synthesizer. Output crisp, high-density Markdown.';
    const result = await defaultAIProvider.generateText(prompt, systemInstruction);
    appState.recordUsage(Math.ceil((slice.length + result.length) / 4));

    res.json({
      success: true,
      data: {
        documentId,
        documentTitle: doc.title,
        format,
        content: result,
      },
    });
  } catch (err: any) {
    console.error('Summary error:', err);
    res.status(500).json({ success: false, error: err?.message || 'Summary generation failed' });
  }
});
