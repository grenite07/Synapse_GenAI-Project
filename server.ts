import express, { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { documentsRouter } from './server/routes/documents.route.js';
import { youtubeRouter } from './server/routes/youtube.route.js';
import { ragRouter } from './server/routes/rag.route.js';
import { chatRouter } from './server/routes/chat.route.js';
import { summariesRouter } from './server/routes/summaries.route.js';
import { notesRouter } from './server/routes/notes.route.js';
import { quizRouter } from './server/routes/quiz.route.js';
import { flashcardsRouter } from './server/routes/flashcards.route.js';
import { studyRouter } from './server/routes/study.route.js';
import { searchRouter } from './server/routes/search.route.js';
import { quotaRouter } from './server/routes/quota.route.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  // JSON Body Parser with high limit for document buffers
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  // CORS & Security Headers
  app.use((req: Request, res: Response, next: NextFunction) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header(
      'Access-Control-Allow-Headers',
      'Origin, X-Requested-With, Content-Type, Accept, Authorization'
    );
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    if (req.method === 'OPTIONS') {
      res.sendStatus(200);
      return;
    }
    next();
  });

  // Health Check
  app.get('/api/health', (req: Request, res: Response) => {
    res.json({
      status: 'ok',
      service: 'Synapse AI Knowledge Platform',
      version: '1.0.0',
      timestamp: Date.now(),
    });
  });

  // API Routes
  app.use('/api/documents', documentsRouter);
  app.use('/api/youtube', youtubeRouter);
  app.use('/api/rag', ragRouter);
  app.use('/api/chat', chatRouter);
  app.use('/api/summaries', summariesRouter);
  app.use('/api/notes', notesRouter);
  app.use('/api/quizzes', quizRouter);
  app.use('/api/flashcards', flashcardsRouter);
  app.use('/api/study', studyRouter);
  app.use('/api/search', searchRouter);
  app.use('/api/quota', quotaRouter);

  // Serve static assets or mount Vite middleware in development
  const isProduction = process.env.NODE_ENV === 'production';
  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  // Global Error Handler
  app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    console.error('Unhandled server error:', err);
    res.status(500).json({
      success: false,
      error: err?.message || 'Internal Server Error',
    });
  });

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Synapse AI Platform backend running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
