import { Router, Request, Response } from 'express';
import { appState } from '../state.js';
import { defaultAIProvider } from '../providers/ai.provider.js';
import { Flashcard, FlashcardDeck } from '../types.js';

export const flashcardsRouter = Router();

// List decks
flashcardsRouter.get('/', (req: Request, res: Response) => {
  const decks = Array.from(appState.flashcardDecks.values()).sort(
    (a, b) => b.createdAt - a.createdAt
  );
  res.json({ success: true, data: decks });
});

// Generate flashcard deck with AI
flashcardsRouter.post('/generate', async (req: Request, res: Response) => {
  try {
    const { sourceId, count = 8, category } = req.body;

    let sourceTitle = 'Knowledge Core';
    let text = '';

    if (sourceId) {
      const doc = appState.knowledgeItems.get(sourceId);
      if (doc) {
        sourceTitle = doc.title;
        text = (doc.extractedText || doc.summary || '').slice(0, 6000);
      }
    } else {
      const docs = Array.from(appState.knowledgeItems.values());
      text = docs.map((d) => (d.extractedText || d.summary || '').slice(0, 1500)).join('\n');
    }

    if (!text) {
      return res.status(400).json({ success: false, error: 'No source material found' });
    }

    const prompt = `Create ${count} high-yield, memory-retention flashcards from this text.
Return a JSON array of objects with the exact schema:
[
  {
    "front": "Clear, challenging question or prompt",
    "back": "Concise, authoritative answer or explanation",
    "tags": ["Tag1", "Tag2"]
  }
]

Text:
${text}`;

    const rawCards = await defaultAIProvider.generateStructuredJSON<
      { front: string; back: string; tags?: string[] }[]
    >(prompt, 'You are a spaced-repetition memory retention expert. Output raw JSON.');

    const deckId = `deck_${Date.now()}`;
    const cards: Flashcard[] = rawCards.map((c, i) => ({
      id: `card_${deckId}_${i}`,
      deckId,
      front: c.front,
      back: c.back,
      tags: c.tags || ['Core'],
      masteryLevel: 'new',
    }));

    const newDeck: FlashcardDeck = {
      id: deckId,
      title: `${sourceTitle} Flashcards`,
      description: `Targeted retention deck generated from ${sourceTitle}.`,
      category: category || 'Study Decks',
      sourceId,
      sourceTitle,
      cards,
      createdAt: Date.now(),
    };

    appState.flashcardDecks.set(deckId, newDeck);
    appState.recordUsage(Math.ceil((text.length + 1000) / 4));

    res.json({ success: true, data: newDeck });
  } catch (err: any) {
    console.error('Flashcard error:', err);
    res.status(500).json({ success: false, error: err?.message || 'Failed to generate flashcards' });
  }
});

// Update card mastery
flashcardsRouter.patch('/cards/:id/mastery', (req: Request, res: Response) => {
  const { masteryLevel } = req.body;
  const cardId = req.params.id;

  for (const deck of appState.flashcardDecks.values()) {
    const card = deck.cards.find((c) => c.id === cardId);
    if (card) {
      card.masteryLevel = masteryLevel;
      card.lastReviewed = Date.now();
      return res.json({ success: true, data: card });
    }
  }

  res.status(404).json({ success: false, error: 'Card not found' });
});

// Delete deck
flashcardsRouter.delete('/:id', (req: Request, res: Response) => {
  const deleted = appState.flashcardDecks.delete(req.params.id);
  res.json({ success: deleted });
});
