import OpenAI from 'openai';

/**
 * Embedding Service
 * Generates vector embeddings for text content using OpenAI's embedding models
 */
export class EmbeddingService {
  private openai: OpenAI;
  private model: string;

  constructor(apiKey?: string, model: string = 'text-embedding-3-small') {
    this.openai = new OpenAI({
      apiKey: apiKey || process.env.OPENAI_API_KEY,
    });
    this.model = model;
  }

  /**
   * Generate embedding for a single text string
   * @param text - The text to embed
   * @returns Vector embedding as number array
   */
  async generateEmbedding(text: string): Promise<number[]> {
    try {
      const response = await this.openai.embeddings.create({
        model: this.model,
        input: text,
        encoding_format: 'float',
      });

      return response.data[0].embedding;
    } catch (error) {
      console.error('Error generating embedding:', error);
      throw new Error(`Failed to generate embedding: ${error}`);
    }
  }

  /**
   * Generate embeddings for multiple texts in batch
   * @param texts - Array of texts to embed
   * @returns Array of vector embeddings
   */
  async generateEmbeddings(texts: string[]): Promise<number[][]> {
    try {
      // OpenAI API has limits on batch size, so we chunk if necessary
      const BATCH_SIZE = 100;
      const embeddings: number[][] = [];

      for (let i = 0; i < texts.length; i += BATCH_SIZE) {
        const batch = texts.slice(i, i + BATCH_SIZE);
        const response = await this.openai.embeddings.create({
          model: this.model,
          input: batch,
          encoding_format: 'float',
        });

        embeddings.push(...response.data.map((item) => item.embedding));
      }

      return embeddings;
    } catch (error) {
      console.error('Error generating embeddings:', error);
      throw new Error(`Failed to generate embeddings: ${error}`);
    }
  }

  /**
   * Generate embedding for content objects
   * Combines title and text for better semantic representation
   * @param content - Content object with title and/or text
   * @returns Vector embedding
   */
  async generateContentEmbedding(content: {
    title?: string;
    text?: string;
  }): Promise<number[]> {
    const textToEmbed = [content.title, content.text]
      .filter(Boolean)
      .join('. ');

    if (!textToEmbed.trim()) {
      throw new Error('Content must have title or text to generate embedding');
    }

    return this.generateEmbedding(textToEmbed);
  }

  /**
   * Calculate cosine similarity between two vectors
   * @param vecA - First vector
   * @param vecB - Second vector
   * @returns Similarity score between -1 and 1
   */
  cosineSimilarity(vecA: number[], vecB: number[]): number {
    if (vecA.length !== vecB.length) {
      throw new Error('Vectors must have the same length');
    }

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }

    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }
}

// Export singleton instance
export const embeddingService = new EmbeddingService();
