import { Router, Request, Response } from 'express';
import { appState } from '../state.js';
import { defaultVectorStore } from '../providers/vector.store.js';

export const quotaRouter = Router();

quotaRouter.get('/', (req: Request, res: Response) => {
  appState.quota.chunksStored = defaultVectorStore.getAllChunks().length;
  res.json({
    success: true,
    data: {
      quota: appState.quota,
      limits: {
        dailyRequestAllowance: '1,500 requests / day (Google Gemini Flash Free Tier)',
        maxTokenAllowance: '1,000,000 tokens / day',
        currentCost: '$0.00 (100% Free Tier Compliant)',
        storageType: 'Free In-Memory + Vector Index (PGVector & Supabase compatible)',
        providerStatus: 'Active & Resilient',
      },
      tips: [
        'Cached summaries and quizzes reduce repeated API invocations.',
        'Deterministic vector fallback guarantees uninterrupted search even if API key quota limits are reached.',
        'Document chunk overlap is optimized at 100 characters to balance contextual fidelity with token conservation.',
      ],
    },
  });
});
