import React, { useState } from 'react';
import { FlashcardDeck as FlashcardDeckType, Flashcard, KnowledgeItem } from '../../types';
import { api } from '../../services/api';
import {
  CreditCard,
  Sparkles,
  RotateCw,
  CheckCircle2,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
} from 'lucide-react';

interface FlashcardDeckProps {
  decks: FlashcardDeckType[];
  documents: KnowledgeItem[];
  onRefresh: () => void;
}

export const FlashcardDeck: React.FC<FlashcardDeckProps> = ({
  decks,
  documents,
  onRefresh,
}) => {
  const [activeDeckId, setActiveDeckId] = useState<string>(
    decks.length > 0 ? decks[0].id : ''
  );
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [selectedSourceId, setSelectedSourceId] = useState('');
  const [cardCount, setCardCount] = useState(6);

  const activeDeck = decks.find((d) => d.id === activeDeckId) || decks[0];
  const currentCard = activeDeck?.cards[currentCardIndex];

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleNext = () => {
    if (!activeDeck) return;
    setIsFlipped(false);
    setCurrentCardIndex((prev) => (prev + 1) % activeDeck.cards.length);
  };

  const handlePrev = () => {
    if (!activeDeck) return;
    setIsFlipped(false);
    setCurrentCardIndex((prev) =>
      prev === 0 ? activeDeck.cards.length - 1 : prev - 1
    );
  };

  const handleSetMastery = async (level: 'new' | 'learning' | 'mastered') => {
    if (!currentCard) return;
    try {
      await api.updateCardMastery(currentCard.id, level);
      currentCard.masteryLevel = level;
      handleNext();
    } catch (e) {
      console.error(e);
    }
  };

  const handleGenerateDeck = async () => {
    setGenerating(true);
    try {
      const newDeck = await api.generateFlashcards({
        sourceId: selectedSourceId || undefined,
        count: cardCount,
        category: 'Study Deck',
      });
      onRefresh();
      setActiveDeckId(newDeck.id);
      setCurrentCardIndex(0);
      setIsFlipped(false);
    } catch (e: any) {
      console.error(e);
      alert(e?.message || 'Failed to generate flashcards');
    } finally {
      setGenerating(false);
    }
  };

  const masteredCount =
    activeDeck?.cards.filter((c) => c.masteryLevel === 'mastered').length || 0;
  const learningCount =
    activeDeck?.cards.filter((c) => c.masteryLevel === 'learning').length || 0;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header and Deck Select */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">
            Spaced-Repetition Flashcards
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Reinforce key algorithmic definitions and memory triggers with active recall.
          </p>
        </div>

        {/* Deck Picker */}
        {decks.length > 0 && (
          <select
            value={activeDeckId}
            onChange={(e) => {
              setActiveDeckId(e.target.value);
              setCurrentCardIndex(0);
              setIsFlipped(false);
            }}
            className="px-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white"
          >
            {decks.map((deck) => (
              <option key={deck.id} value={deck.id}>
                {deck.title} ({deck.cards.length} cards)
              </option>
            ))}
          </select>
        )}
      </div>

      {/* AI Deck Generator Box */}
      <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-indigo-500" />
          <span className="text-xs font-semibold text-slate-900 dark:text-white">
            Generate Deck from Source:
          </span>
          <select
            value={selectedSourceId}
            onChange={(e) => setSelectedSourceId(e.target.value)}
            className="text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md px-2 py-1 text-slate-800 dark:text-slate-200 max-w-xs truncate"
          >
            <option value="">All Knowledge Material</option>
            {documents.map((d) => (
              <option key={d.id} value={d.id}>
                {d.title}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={handleGenerateDeck}
          disabled={generating}
          className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-lg shadow-2xs transition-colors"
        >
          <CreditCard className="w-3.5 h-3.5" />
          <span>{generating ? 'Formulating Deck...' : 'Generate Flashcards'}</span>
        </button>
      </div>

      {/* Interactive Card Presentation Area */}
      {activeDeck && currentCard ? (
        <div className="space-y-4">
          {/* Deck Progress Bar */}
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span className="font-mono tabular-nums">
              Card {currentCardIndex + 1} of {activeDeck.cards.length}
            </span>
            <div className="flex items-center gap-3">
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold font-mono tabular-nums">
                {masteredCount} Mastered
              </span>
              <span className="text-amber-500 font-semibold font-mono tabular-nums">
                {learningCount} Learning
              </span>
            </div>
          </div>

          {/* 3D Flip Card Container */}
          <div
            onClick={handleFlip}
            className="w-full h-80 cursor-pointer perspective-1000 group"
          >
            <div
              className={`relative w-full h-full duration-500 transform-style-3d rounded-2xl shadow-md border border-slate-200 dark:border-slate-800 transition-transform ${
                isFlipped ? 'rotate-y-180' : ''
              }`}
            >
              {/* Front of Card */}
              <div className="absolute inset-0 backface-hidden flex flex-col justify-between p-8 bg-white dark:bg-slate-900 rounded-2xl">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                    Question / Prompt
                  </span>
                  <span className="text-[11px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                    Click card to flip
                  </span>
                </div>

                <div className="text-lg sm:text-xl font-bold text-center text-slate-900 dark:text-white px-4 leading-relaxed">
                  {currentCard.front}
                </div>

                <div className="flex justify-center text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    <RotateCw className="w-3.5 h-3.5" />
                    <span>Flip to reveal answer</span>
                  </span>
                </div>
              </div>

              {/* Back of Card */}
              <div className="absolute inset-0 backface-hidden rotate-y-180 flex flex-col justify-between p-8 bg-indigo-50/60 dark:bg-indigo-950/70 border-indigo-200 dark:border-indigo-900 rounded-2xl">
                <div className="flex items-center justify-between text-xs text-indigo-700 dark:text-indigo-300">
                  <span className="font-semibold uppercase tracking-wider">
                    Answer Key
                  </span>
                  <span className="text-[11px] bg-indigo-100 dark:bg-indigo-900 px-2 py-0.5 rounded">
                    Click card to flip back
                  </span>
                </div>

                <div className="text-base sm:text-lg font-medium text-center text-indigo-950 dark:text-indigo-100 px-4 leading-relaxed">
                  {currentCard.back}
                </div>

                <div className="flex justify-center text-xs text-indigo-600 dark:text-indigo-400">
                  <span>How well did you know this?</span>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation and Mastery Rating Controls */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrev}
                className="p-2 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Previous Card"
              >
                <ChevronLeft className="w-4 h-4 text-slate-600 dark:text-slate-300" />
              </button>
              <button
                onClick={handleNext}
                className="p-2 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Next Card"
              >
                <ChevronRight className="w-4 h-4 text-slate-600 dark:text-slate-300" />
              </button>
            </div>

            {/* Mastery Level Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleSetMastery('new')}
                className="px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-lg transition-colors"
              >
                Still Learning
              </button>
              <button
                onClick={() => handleSetMastery('learning')}
                className="px-3 py-1.5 text-xs font-semibold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 hover:bg-amber-100 rounded-lg transition-colors"
              >
                Almost Mastered
              </button>
              <button
                onClick={() => handleSetMastery('mastered')}
                className="flex items-center gap-1 px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-2xs transition-colors"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Mastered</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-12 text-center text-xs text-slate-400 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
          No flashcard decks found. Generate your first deck above.
        </div>
      )}
    </div>
  );
};
