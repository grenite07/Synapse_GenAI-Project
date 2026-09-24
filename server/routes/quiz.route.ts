import { Router, Request, Response } from 'express';
import { appState } from '../state.js';
import { defaultAIProvider } from '../providers/ai.provider.js';
import { QuizQuestion, QuizSession } from '../types.js';

export const quizRouter = Router();

// List past quiz sessions
quizRouter.get('/', (req: Request, res: Response) => {
  const quizzes = Array.from(appState.quizzes.values()).sort(
    (a, b) => b.createdAt - a.createdAt
  );
  res.json({ success: true, data: quizzes });
});

// Generate new quiz session
quizRouter.post('/generate', async (req: Request, res: Response) => {
  try {
    const {
      sourceId,
      questionCount = 5,
      difficulty = 'Medium',
      questionTypes = ['mcq', 'true_false'],
    } = req.body;

    let sourceTitle = 'Entire Knowledge Base';
    let sourceContent = '';

    if (sourceId) {
      const doc = appState.knowledgeItems.get(sourceId);
      if (doc) {
        sourceTitle = doc.title;
        sourceContent = (doc.extractedText || doc.summary || '').slice(0, 6000);
      }
    } else {
      // Assemble sample from multiple documents
      const docs = Array.from(appState.knowledgeItems.values());
      sourceContent = docs
        .map((d) => `Title: ${d.title}\n${(d.extractedText || d.summary || '').slice(0, 1500)}`)
        .join('\n\n');
    }

    if (!sourceContent) {
      return res.status(400).json({ success: false, error: 'No source material available to generate quiz questions.' });
    }

    const prompt = `Generate exactly ${questionCount} academic quiz questions at ${difficulty} difficulty level based on this text.
Question types to include: ${questionTypes.join(', ')}.

Return a JSON array of question objects matching this schema:
[
  {
    "id": "q1",
    "type": "mcq" | "true_false" | "short_answer",
    "question": "Clear question text",
    "options": ["Option A", "Option B", "Option C", "Option D"], // required for mcq and true_false
    "correctAnswer": "Exact string matching one of the options or short answer",
    "explanation": "Clear explanation of why this answer is correct",
    "difficulty": "${difficulty}"
  }
]

Source Material:
${sourceContent}`;

    const systemInstruction = 'You are a rigorous university examination board member. Output pure JSON without markdown ticks.';
    const questions = await defaultAIProvider.generateStructuredJSON<QuizQuestion[]>(prompt, systemInstruction);

    const quizId = `quiz_${Date.now()}`;
    const newSession: QuizSession = {
      id: quizId,
      title: `${sourceTitle} - ${difficulty} Challenge`,
      sourceId,
      sourceTitle,
      questions,
      totalQuestions: questions.length,
      completed: false,
      createdAt: Date.now(),
    };

    appState.quizzes.set(quizId, newSession);
    appState.recordUsage(Math.ceil((sourceContent.length + 1500) / 4));

    res.json({ success: true, data: newSession });
  } catch (err: any) {
    console.error('Quiz generation error:', err);
    res.status(500).json({ success: false, error: err?.message || 'Quiz generation failed' });
  }
});

// Submit quiz answers and grade
quizRouter.post('/:id/submit', (req: Request, res: Response) => {
  const { answers, timeSpentSeconds } = req.body;
  const session = appState.quizzes.get(req.params.id);

  if (!session) {
    return res.status(404).json({ success: false, error: 'Quiz session not found' });
  }

  let correctCount = 0;
  session.userAnswers = answers || {};

  for (const q of session.questions) {
    const userAns = (answers[q.id] || '').trim().toLowerCase();
    const correctAns = (q.correctAnswer || '').trim().toLowerCase();
    if (userAns === correctAns) {
      correctCount++;
    }
  }

  session.score = correctCount;
  session.completed = true;
  session.timeSpentSeconds = timeSpentSeconds || 60;

  res.json({
    success: true,
    data: {
      quizId: session.id,
      score: correctCount,
      totalQuestions: session.totalQuestions,
      percentage: Math.round((correctCount / session.totalQuestions) * 100),
      session,
    },
  });
});
