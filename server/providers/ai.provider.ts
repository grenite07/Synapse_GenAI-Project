import { GoogleGenAI } from '@google/genai';

export interface IAIProvider {
  name: string;
  generateText(prompt: string, systemInstruction?: string): Promise<string>;
  generateStructuredJSON<T>(prompt: string, systemInstruction?: string): Promise<T>;
  streamText(
    prompt: string,
    systemInstruction: string | undefined,
    onChunk: (chunk: string) => void
  ): Promise<string>;
  generateEmbedding(text: string): Promise<number[]>;
}

export class GeminiAIProvider implements IAIProvider {
  public name = 'Google Gemini (gemini-3.8-flash)';
  private ai: GoogleGenAI | null = null;
  private apiKey: string = '';

  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY || '';
    if (this.apiKey) {
      this.ai = new GoogleGenAI({
        apiKey: this.apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });
    }
  }

  private ensureClient(): GoogleGenAI {
    if (!this.ai) {
      const key = process.env.GEMINI_API_KEY || '';
      if (!key) {
        throw new Error('GEMINI_API_KEY is not configured. Please set GEMINI_API_KEY in your environment or Secrets panel.');
      }
      this.apiKey = key;
      this.ai = new GoogleGenAI({
        apiKey: key,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });
    }
    return this.ai;
  }

  async generateText(prompt: string, systemInstruction?: string): Promise<string> {
    try {
      const client = this.ensureClient();
      const response = await client.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: systemInstruction ? { systemInstruction } : undefined,
      });
      return response.text || '';
    } catch (err: any) {
      console.error('Gemini generateText error:', err?.message || err);
      throw new Error(`AI generation failed: ${err?.message || 'Unknown error'}`);
    }
  }

  async generateStructuredJSON<T>(prompt: string, systemInstruction?: string): Promise<T> {
    try {
      const client = this.ensureClient();
      const response = await client.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          ...(systemInstruction ? { systemInstruction } : {}),
        },
      });
      const text = response.text || '{}';
      return JSON.parse(text) as T;
    } catch (err: any) {
      console.error('Gemini structured JSON error:', err?.message || err);
      // Attempt clean regex extraction if model returned markdown wrapped json
      try {
        const raw = await this.generateText(prompt + '\n\nOutput strict raw JSON only without markdown code blocks.', systemInstruction);
        const cleaned = raw.replace(/^```json/m, '').replace(/^```/m, '').trim();
        return JSON.parse(cleaned) as T;
      } catch (inner) {
        throw new Error(`Failed to parse AI response as JSON: ${err?.message || 'Invalid format'}`);
      }
    }
  }

  async streamText(
    prompt: string,
    systemInstruction: string | undefined,
    onChunk: (chunk: string) => void
  ): Promise<string> {
    try {
      const client = this.ensureClient();
      const stream = await client.models.generateContentStream({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: systemInstruction ? { systemInstruction } : undefined,
      });

      let fullText = '';
      for await (const chunk of stream) {
        const text = chunk.text || '';
        if (text) {
          fullText += text;
          onChunk(text);
        }
      }
      return fullText;
    } catch (err: any) {
      console.error('Gemini stream error:', err?.message || err);
      throw new Error(`Streaming failed: ${err?.message || 'Unknown error'}`);
    }
  }

  async generateEmbedding(text: string): Promise<number[]> {
    try {
      const client = this.ensureClient();
      const response = await client.models.embedContent({
        model: 'gemini-embedding-2-preview',
        contents: text.slice(0, 2048), // safeguard token limits
      });
      const values = (response as any).embedding?.values || (response as any).embeddings?.[0]?.values;
      if (values && Array.isArray(values)) {
        return values;
      }
      return this.fallbackDeterministicVector(text);
    } catch (err: any) {
      console.warn('Embedding API unavailable, utilizing deterministic vectorizer:', err?.message || err);
      return this.fallbackDeterministicVector(text);
    }
  }

  // High-dimensional deterministic vectorizer (768 dimensions) for offline/free fallback
  private fallbackDeterministicVector(text: string, dimensions = 768): number[] {
    const vector = new Array(dimensions).fill(0);
    const words = text.toLowerCase().match(/\b\w+\b/g) || [];
    if (words.length === 0) return vector;

    for (const word of words) {
      let hash = 5381;
      for (let i = 0; i < word.length; i++) {
        hash = ((hash << 5) + hash) + word.charCodeAt(i);
        hash = hash & hash;
      }
      const index = Math.abs(hash) % dimensions;
      vector[index] += 1;
    }

    // L2 Normalize
    const norm = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0)) || 1;
    return vector.map((v) => v / norm);
  }
}

// Global Singleton Instance
export const defaultAIProvider = new GeminiAIProvider();
