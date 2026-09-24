import { DocumentChunk, SearchResult } from '../types.js';

export interface IVectorStore {
  addChunks(chunks: DocumentChunk[]): Promise<void>;
  deleteByDocumentId(documentId: string): Promise<void>;
  search(
    queryEmbedding: number[],
    topK?: number,
    filter?: { documentId?: string; sourceType?: string }
  ): Promise<SearchResult[]>;
  getAllChunks(): DocumentChunk[];
  clear(): Promise<void>;
}

export class InMemoryVectorStore implements IVectorStore {
  private chunks: Map<string, DocumentChunk> = new Map();

  async addChunks(newChunks: DocumentChunk[]): Promise<void> {
    for (const chunk of newChunks) {
      this.chunks.set(chunk.id, chunk);
    }
  }

  async deleteByDocumentId(documentId: string): Promise<void> {
    for (const [id, chunk] of this.chunks.entries()) {
      if (chunk.documentId === documentId) {
        this.chunks.delete(id);
      }
    }
  }

  async search(
    queryEmbedding: number[],
    topK: number = 4,
    filter?: { documentId?: string; sourceType?: string }
  ): Promise<SearchResult[]> {
    const results: SearchResult[] = [];

    for (const chunk of this.chunks.values()) {
      // Metadata filtering
      if (filter?.documentId && chunk.documentId !== filter.documentId) continue;
      if (filter?.sourceType && chunk.sourceType !== filter.sourceType) continue;

      if (!chunk.embedding || chunk.embedding.length === 0) continue;

      const score = this.cosineSimilarity(queryEmbedding, chunk.embedding);
      results.push({ chunk, score });
    }

    // Sort descending by similarity score
    results.sort((a, b) => b.score - a.score);
    return results.slice(0, topK);
  }

  getAllChunks(): DocumentChunk[] {
    return Array.from(this.chunks.values());
  }

  async clear(): Promise<void> {
    this.chunks.clear();
  }

  private cosineSimilarity(vecA: number[], vecB: number[]): number {
    if (vecA.length !== vecB.length || vecA.length === 0) return 0;
    let dot = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < vecA.length; i++) {
      const a = vecA[i];
      const b = vecB[i];
      dot += a * b;
      normA += a * a;
      normB += b * b;
    }

    if (normA === 0 || normB === 0) return 0;
    return dot / (Math.sqrt(normA) * Math.sqrt(normB));
  }
}

export const defaultVectorStore = new InMemoryVectorStore();
