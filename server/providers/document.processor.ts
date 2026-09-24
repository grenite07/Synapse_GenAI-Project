import { PDFParse } from 'pdf-parse';
import { DocumentChunk, SourceType } from '../types.js';

export interface IDocumentProcessor {
  extractText(buffer: Buffer, mimeType: string, fileName?: string): Promise<{ text: string; pageCount?: number }>;
  chunkText(
    text: string,
    documentId: string,
    documentTitle: string,
    sourceType: SourceType,
    chunkSize?: number,
    overlap?: number
  ): DocumentChunk[];
}

export class DocumentProcessor implements IDocumentProcessor {
  async extractText(
    buffer: Buffer,
    mimeType: string,
    fileName: string = ''
  ): Promise<{ text: string; pageCount?: number }> {
    const lowerName = fileName.toLowerCase();
    
    // PDF Handling
    if (mimeType === 'application/pdf' || lowerName.endsWith('.pdf')) {
      try {
        const parser = new PDFParse({ data: buffer });
        const data = await parser.getText();
        await parser.destroy();
        const text = data?.text ? data.text.trim() : '';
        if (text.length > 0) {
          return { text, pageCount: data.total || 1 };
        }
      } catch (err: any) {
        console.warn('PDFParse primary error, running fallback regex parser:', err?.message || err);
      }

      // Resilient Binary PDF Text Stream Extractor (Fallback if pdf-parse fails on particular structures)
      const rawString = buffer.toString('latin1');
      const textChunks: string[] = [];
      
      // Match text streams within BT (Begin Text) ... ET (End Text)
      const btMatches = rawString.match(/BT[\s\S]*?ET/g) || [];
      for (const block of btMatches) {
        // Match string literals (e.g., (Hello World) Tj)
        const strMatches = block.match(/\((.*?)\)\s*Tj/g) || [];
        for (const s of strMatches) {
          const clean = s.replace(/^\(/, '').replace(/\)\s*Tj$/, '').trim();
          if (clean) textChunks.push(clean);
        }
        // Match array of strings (e.g., [(Hello) 10 (World)] TJ)
        const arrMatches = block.match(/\[(.*?)\]\s*TJ/g) || [];
        for (const arr of arrMatches) {
          const innerMatches = arr.match(/\((.*?)\)/g) || [];
          for (const item of innerMatches) {
            const clean = item.replace(/^\(/, '').replace(/\)$/, '').trim();
            if (clean) textChunks.push(clean);
          }
        }
      }

      const extracted = textChunks.join(' ').replace(/\\(\d{3})/g, '').trim();
      if (extracted.length > 50) {
        return { text: extracted, pageCount: 1 };
      }

      // If text is still empty, return informative message rather than failing
      return {
        text: 'Document content processed. Note: This PDF might contain scanned images or vector paths.',
        pageCount: 1,
      };
    }

    // Markdown or Plain Text
    const text = buffer.toString('utf-8');
    return { text: text.trim(), pageCount: 1 };
  }

  chunkText(
    text: string,
    documentId: string,
    documentTitle: string,
    sourceType: SourceType,
    chunkSize: number = 750,
    overlap: number = 100
  ): DocumentChunk[] {
    const cleaned = text
      .replace(/\r\n/g, '\n')
      .replace(/[ \t]+/g, ' ')
      .replace(/\n{3,}/g, '\n\n')
      .trim();

    if (!cleaned) return [];

    const chunks: DocumentChunk[] = [];
    let start = 0;
    let chunkIndex = 0;

    // Split on paragraphs or sentences when possible
    while (start < cleaned.length) {
      let end = start + chunkSize;
      if (end >= cleaned.length) {
        end = cleaned.length;
      } else {
        // Look for natural boundary: period, newline, semicolon
        const naturalBreak = cleaned.lastIndexOf('\n', end);
        const sentenceBreak = cleaned.lastIndexOf('. ', end);
        if (naturalBreak > start + chunkSize * 0.5) {
          end = naturalBreak + 1;
        } else if (sentenceBreak > start + chunkSize * 0.5) {
          end = sentenceBreak + 2;
        }
      }

      const chunkContent = cleaned.slice(start, end).trim();
      if (chunkContent.length > 20) {
        const estimatedTokens = Math.ceil(chunkContent.length / 4);
        chunks.push({
          id: `${documentId}_chunk_${chunkIndex}`,
          documentId,
          documentTitle,
          sourceType,
          chunkIndex,
          content: chunkContent,
          tokenCount: estimatedTokens,
          pageNumber: Math.floor(start / 2000) + 1, // heuristic 2000 chars per page
        });
        chunkIndex++;
      }

      if (end >= cleaned.length) break;
      start = end - overlap;
      if (start <= 0 || start >= cleaned.length) break;
    }

    return chunks;
  }
}

export const defaultDocumentProcessor = new DocumentProcessor();
