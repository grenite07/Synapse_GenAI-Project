import { defaultAIProvider, IAIProvider } from './ai.provider.js';

export interface IEmbeddingProvider {
  embed(text: string): Promise<number[]>;
  embedBatch(texts: string[]): Promise<number[][]>;
}

export class EmbeddingProvider implements IEmbeddingProvider {
  constructor(private ai: IAIProvider = defaultAIProvider) {}

  async embed(text: string): Promise<number[]> {
    return this.ai.generateEmbedding(text);
  }

  async embedBatch(texts: string[]): Promise<number[][]> {
    const results: number[][] = [];
    for (const text of texts) {
      const vec = await this.embed(text);
      results.push(vec);
    }
    return results;
  }
}

export const defaultEmbeddingProvider = new EmbeddingProvider();
