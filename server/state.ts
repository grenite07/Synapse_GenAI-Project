import {
  KnowledgeItem,
  DocumentChunk,
  ChatConversation,
  NoteItem,
  QuizSession,
  FlashcardDeck,
  StudyPlan,
  FreeTierUsage,
} from './types.js';
import { defaultVectorStore } from './providers/vector.store.js';
import { defaultEmbeddingProvider } from './providers/embedding.provider.js';

class AppState {
  public knowledgeItems: Map<string, KnowledgeItem> = new Map();
  public conversations: Map<string, ChatConversation> = new Map();
  public notes: Map<string, NoteItem> = new Map();
  public quizzes: Map<string, QuizSession> = new Map();
  public flashcardDecks: Map<string, FlashcardDeck> = new Map();
  public studyPlans: Map<string, StudyPlan> = new Map();

  public quota: FreeTierUsage = {
    requestsToday: 18,
    maxRequestsPerDay: 1500, // Gemini free tier generous limit
    tokensUsedToday: 42350,
    maxTokensPerDay: 1000000,
    chunksStored: 0,
    maxFreeChunks: 50000,
    activeProvider: 'Google Gemini 3.8 Flash (Free Tier)',
    costUSD: 0.0,
  };

  constructor() {
    this.seedInitialData();
  }

  recordUsage(tokens: number = 500) {
    this.quota.requestsToday += 1;
    this.quota.tokensUsedToday += tokens;
    this.quota.chunksStored = defaultVectorStore.getAllChunks().length;
  }

  private async seedInitialData() {
    // 1. Initial Document: Machine Learning & Deep Learning Foundations
    const doc1Id = 'doc_ml_foundations';
    const doc1Text = `Machine Learning Foundations: Supervised, Unsupervised, and Deep Learning.
Supervised Learning algorithms learn a mapping from input features X to output labels Y given a labeled dataset. Examples include Linear Regression, Logistic Regression, Support Vector Machines (SVM), Random Forests, and Gradient Boosted Decision Trees (XGBoost).
Loss Functions: Mean Squared Error (MSE) is commonly used for regression tasks: MSE = (1/N) * sum((y_i - y_hat_i)^2). Cross-Entropy Loss is used for classification tasks: L = -sum(y_i * log(p_i)).
Gradient Descent optimizes model parameters theta by updating: theta = theta - alpha * grad(J(theta)), where alpha is the learning rate.
Deep Learning models, particularly Convolutional Neural Networks (CNNs) for spatial computer vision and Transformers for sequence modeling and natural language, utilize backpropagation to compute analytical gradients through the chain rule.
Transformers rely on the Scaled Dot-Product Attention mechanism: Attention(Q, K, V) = softmax((Q * K^T) / sqrt(d_k)) * V, where Q is Query, K is Key, and V is Value.`;

    const doc1Item: KnowledgeItem = {
      id: doc1Id,
      title: 'Machine Learning & Deep Learning Foundations',
      sourceType: 'pdf',
      fileName: 'ML_Foundations_Guide.pdf',
      fileSize: 412000,
      category: 'Machine Learning',
      tags: ['AIML', 'Supervised Learning', 'Deep Learning', 'Transformers'],
      favorite: true,
      status: 'READY',
      progress: 100,
      totalChunks: 2,
      totalTokens: 280,
      extractedText: doc1Text,
      summary: 'Comprehensive primer covering supervised vs unsupervised learning, loss functions, gradient descent optimization, and transformer scaled dot-product attention mechanics.',
      createdAt: Date.now() - 3600000 * 24,
      updatedAt: Date.now() - 3600000 * 24,
    };
    this.knowledgeItems.set(doc1Id, doc1Item);

    // 2. Initial YouTube Resource: DSA & Computational Complexity
    const yt1Id = 'yt_dsa_complexity';
    const yt1Text = `Data Structures & Computational Complexity Crash Course.
Asymptotic Analysis evaluates algorithm efficiency as input size n approaches infinity.
Big-O Notation represents the worst-case upper bound of an algorithm's time or space complexity.
Common Complexities:
- O(1) Constant Time: Hash table lookup (average case), array index access.
- O(log n) Logarithmic Time: Binary Search on sorted arrays, balanced binary search tree lookups.
- O(n) Linear Time: Linear search, single pass through an array or linked list.
- O(n log n) Linearithmic Time: Merge Sort, Heap Sort, Quick Sort (average case).
- O(n^2) Quadratic Time: Bubble Sort, Selection Sort, nested double loops over array size n.
- O(2^n) Exponential Time: Naive recursive Fibonacci computation, travelling salesperson brute force.
Space Complexity measures the auxiliary memory required by an algorithm, including recursive call stack depth.`;

    const yt1Item: KnowledgeItem = {
      id: yt1Id,
      title: 'Data Structures & Algorithmic Complexity (Big-O)',
      sourceType: 'youtube',
      url: 'https://www.youtube.com/watch?v=kPRA0W1kECg',
      category: 'DSA',
      tags: ['Algorithms', 'Complexity', 'Big-O', 'Data Structures'],
      favorite: true,
      status: 'READY',
      progress: 100,
      totalChunks: 2,
      totalTokens: 250,
      channelTitle: 'Computer Science Core',
      videoDuration: '18:45',
      thumbnailUrl: 'https://images.unsplash.com/photo-1516116211227-bbc141e6c469?w=600&auto=format&fit=crop&q=80',
      extractedText: yt1Text,
      summary: 'Essential masterclass detailing asymptotic runtime bounds, Big-O classes from O(1) to O(2^n), auxiliary memory analysis, and sort algorithm performance.',
      createdAt: Date.now() - 3600000 * 12,
      updatedAt: Date.now() - 3600000 * 12,
    };
    this.knowledgeItems.set(yt1Id, yt1Item);

    // Index chunks into Vector Store
    const chunks: DocumentChunk[] = [
      {
        id: `${doc1Id}_c0`,
        documentId: doc1Id,
        documentTitle: doc1Item.title,
        sourceType: 'pdf',
        chunkIndex: 0,
        content: doc1Text.slice(0, 480),
        tokenCount: 120,
        pageNumber: 1,
      },
      {
        id: `${doc1Id}_c1`,
        documentId: doc1Id,
        documentTitle: doc1Item.title,
        sourceType: 'pdf',
        chunkIndex: 1,
        content: doc1Text.slice(450),
        tokenCount: 160,
        pageNumber: 2,
      },
      {
        id: `${yt1Id}_c0`,
        documentId: yt1Id,
        documentTitle: yt1Item.title,
        sourceType: 'youtube',
        chunkIndex: 0,
        content: yt1Text.slice(0, 420),
        tokenCount: 110,
        timestamp: '00:00 - 08:30',
      },
      {
        id: `${yt1Id}_c1`,
        documentId: yt1Id,
        documentTitle: yt1Item.title,
        sourceType: 'youtube',
        chunkIndex: 1,
        content: yt1Text.slice(380),
        tokenCount: 140,
        timestamp: '08:30 - 18:45',
      },
    ];

    // Generate embeddings for initial seed
    for (const chunk of chunks) {
      chunk.embedding = await defaultEmbeddingProvider.embed(chunk.content);
    }
    await defaultVectorStore.addChunks(chunks);
    this.quota.chunksStored = defaultVectorStore.getAllChunks().length;

    // Seed Notes
    const note1: NoteItem = {
      id: 'note_1',
      title: 'Transformer Attention Formulation Key Takeaways',
      category: 'AIML',
      tags: ['Transformers', 'Attention', 'Formulas'],
      sourceDocumentId: doc1Id,
      sourceDocumentTitle: doc1Item.title,
      content: `# Scaled Dot-Product Attention Notes\n\n- **Formula**: \`Attention(Q, K, V) = softmax((Q * K^T) / sqrt(d_k)) * V\`\n- **Why scale by sqrt(d_k)**: When dimension d_k is large, dot products grow large in magnitude, pushing softmax into regions with extremely small gradients. Dividing by sqrt(d_k) stabilizes backpropagation.\n- **Complexity**: Quadratic O(N^2) in sequence length N for standard self-attention.`,
      createdAt: Date.now() - 3600000 * 8,
      updatedAt: Date.now() - 3600000 * 8,
    };
    this.notes.set(note1.id, note1);

    // Seed Flashcards Deck
    const deck1: FlashcardDeck = {
      id: 'deck_dsa',
      title: 'Essential DSA & Complexity Deck',
      description: 'Master time and space complexity classes, data structure operations, and sort runtimes.',
      category: 'DSA',
      sourceId: yt1Id,
      sourceTitle: yt1Item.title,
      cards: [
        {
          id: 'card_1',
          deckId: 'deck_dsa',
          front: 'What is the average and worst-case time complexity of Binary Search?',
          back: 'Average: O(log n), Worst-case: O(log n). Requires the underlying collection to be sorted and indexed.',
          tags: ['Search', 'Complexity'],
          masteryLevel: 'mastered',
          lastReviewed: Date.now(),
        },
        {
          id: 'card_2',
          deckId: 'deck_dsa',
          front: 'What is the worst-case time complexity of Quick Sort, and when does it occur?',
          back: 'O(n^2). It occurs when the pivot chosen is consistently the extreme (smallest or largest element), such as on an already sorted array without randomized pivots.',
          tags: ['Sorting', 'QuickSort'],
          masteryLevel: 'learning',
          lastReviewed: Date.now(),
        },
        {
          id: 'card_3',
          deckId: 'deck_dsa',
          front: 'What is the scaling factor in Scaled Dot-Product Attention and why?',
          back: 'sqrt(d_k). It counteracts variance growth of the dot product for large vector dimensions d_k, preventing vanishing softmax gradients.',
          tags: ['Attention', 'DeepLearning'],
          masteryLevel: 'new',
        },
      ],
      createdAt: Date.now() - 3600000 * 10,
    };
    this.flashcardDecks.set(deck1.id, deck1);

    // Seed Quiz
    const quiz1: QuizSession = {
      id: 'quiz_1',
      title: 'Machine Learning & Complexity Diagnostic Quiz',
      sourceId: doc1Id,
      sourceTitle: doc1Item.title,
      totalQuestions: 3,
      score: 3,
      completed: true,
      timeSpentSeconds: 95,
      questions: [
        {
          id: 'q1',
          type: 'mcq',
          question: 'Which loss function is traditionally utilized for binary classification tasks?',
          options: ['Mean Squared Error (MSE)', 'Binary Cross-Entropy Loss', 'Huber Loss', 'Cosine Proximity Loss'],
          correctAnswer: 'Binary Cross-Entropy Loss',
          explanation: 'Binary Cross-Entropy quantifies the divergence between true label y in {0, 1} and predicted probability p.',
          difficulty: 'Easy',
        },
        {
          id: 'q2',
          type: 'true_false',
          question: 'True or False: Hash table lookup operates in O(1) worst-case time complexity.',
          options: ['True', 'False'],
          correctAnswer: 'False',
          explanation: 'Hash tables operate in O(1) average time, but can degrade to O(n) in the worst case due to hash collisions chaining into linked lists.',
          difficulty: 'Medium',
        },
        {
          id: 'q3',
          type: 'short_answer',
          question: 'What is the learning rate parameter denoted by in the standard gradient descent update equation?',
          correctAnswer: 'alpha',
          explanation: 'The parameter update is theta = theta - alpha * grad(J(theta)), where alpha controls the optimization step size.',
          difficulty: 'Easy',
        },
      ],
      userAnswers: {
        q1: 'Binary Cross-Entropy Loss',
        q2: 'False',
        q3: 'alpha',
      },
      createdAt: Date.now() - 3600000 * 4,
    };
    this.quizzes.set(quiz1.id, quiz1);

    // Seed Conversation
    const conv1: ChatConversation = {
      id: 'conv_initial',
      title: 'Exploring Transformer Attention Mechanics',
      createdAt: Date.now() - 3600000 * 2,
      updatedAt: Date.now() - 3600000 * 2,
      messages: [
        {
          id: 'msg_1',
          role: 'user',
          content: 'Can you explain why Transformers use scaled dot-product attention instead of regular dot-product attention?',
          timestamp: Date.now() - 3600000 * 2,
          mode: 'document',
          selectedSourceId: doc1Id,
        },
        {
          id: 'msg_2',
          role: 'assistant',
          content: `In the Transformer architecture, **Scaled Dot-Product Attention** computes:

$$\\text{Attention}(Q, K, V) = \\text{softmax}\\left(\\frac{QK^T}{\\sqrt{d_k}}\\right)V$$

### Primary Reason: Vanishing Gradients in Softmax
1. **Variance Scaling**: If components of query $Q$ and key $K$ are independent random variables with zero mean and unit variance, their dot product has a mean of $0$ and variance of $d_k$.
2. **Softmax Saturation**: For large projection dimensions $d_k$, the dot products grow substantially in magnitude. Large positive logits cause the $\\text{softmax}$ function to push probability mass almost entirely onto the single largest value.
3. **Gradient Extinction**: In saturated softmax regions, the local derivative $\\frac{\\partial \\text{softmax}}{\\partial z}$ approaches zero, causing the vanishing gradient problem during backpropagation.
4. **Dividing by $\\sqrt{d_k}$**: Scales the variance back down to $1$, keeping logits in a gentle slope where gradients flow reliably.`,
          citations: [
            {
              chunkId: `${doc1Id}_c1`,
              documentId: doc1Id,
              documentTitle: doc1Item.title,
              sourceType: 'pdf',
              pageOrTime: 'Page 2',
              snippet: 'Transformers rely on the Scaled Dot-Product Attention mechanism: Attention(Q, K, V) = softmax((Q * K^T) / sqrt(d_k)) * V',
              relevanceScore: 0.94,
            },
          ],
          timestamp: Date.now() - 3600000 * 2 + 1500,
        },
      ],
    };
    this.conversations.set(conv1.id, conv1);
  }
}

export const appState = new AppState();
