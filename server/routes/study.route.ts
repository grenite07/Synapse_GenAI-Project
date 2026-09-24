import { Router, Request, Response } from 'express';
import { appState } from '../state.js';
import { defaultAIProvider } from '../providers/ai.provider.js';
import { StudyPlan } from '../types.js';

export const studyRouter = Router();

studyRouter.get('/', (req: Request, res: Response) => {
  const plans = Array.from(appState.studyPlans.values());
  res.json({ success: true, data: plans });
});

studyRouter.post('/generate-plan', async (req: Request, res: Response) => {
  try {
    const { topic, targetDays = 7, difficulty = 'Medium', focusAreas } = req.body;
    if (!topic) {
      return res.status(400).json({ success: false, error: 'Topic is required' });
    }

    const availableContext = Array.from(appState.knowledgeItems.values())
      .map((d) => d.title)
      .join(', ');

    const prompt = `Create a rigorous, highly actionable ${targetDays}-day academic study and revision roadmap for: "${topic}".
Difficulty: ${difficulty}.
Focus Areas: ${focusAreas || 'Comprehensive coverage'}.
Available Knowledge Base Sources: ${availableContext}.

Return a JSON object conforming strictly to this schema:
{
  "topic": "${topic}",
  "targetDays": ${targetDays},
  "difficulty": "${difficulty}",
  "overview": "Detailed rationale and strategic goal for this study block",
  "dailyModules": [
    {
      "day": 1,
      "title": "Module Title",
      "objectives": ["Goal 1", "Goal 2"],
      "recommendedReadings": ["Section / Topic 1", "Section / Topic 2"],
      "reviewQuestions": ["Practice problem 1", "Practice problem 2"]
    }
  ],
  "highYieldQuestions": [
    {
      "question": "Expected exam/interview question",
      "answerKey": "Concise authoritative solution"
    }
  ]
}`;

    const planData = await defaultAIProvider.generateStructuredJSON<any>(
      prompt,
      'You are a senior academic advisor and curriculum designer. Output raw JSON.'
    );

    const planId = `plan_${Date.now()}`;
    const studyPlan: StudyPlan = {
      id: planId,
      topic,
      targetDays: Number(targetDays),
      difficulty,
      overview: planData.overview || 'Structured study program designed for mastery.',
      dailyModules: planData.dailyModules || [],
      highYieldQuestions: planData.highYieldQuestions || [],
      createdAt: Date.now(),
    };

    appState.studyPlans.set(planId, studyPlan);
    appState.recordUsage(2200);

    res.json({ success: true, data: studyPlan });
  } catch (err: any) {
    console.error('Study plan error:', err);
    res.status(500).json({ success: false, error: err?.message || 'Study plan generation failed' });
  }
});
