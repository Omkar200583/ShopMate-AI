import { cosineSimilarity } from '../models/embeddings/embeddingService.js';

/** In-memory vector store. Swap for MongoDB Atlas Vector Search when you have lots of data. */
export class VectorStore {
  constructor() {
    this.items = [];
  }

  add({ id, text, embedding, metadata = {} }) {
    this.items.push({ id, text, embedding, metadata });
  }

  get size() {
    return this.items.length;
  }

  clear() {
    this.items = [];
  }

  search(queryEmbedding, k = 3) {
    return this.items
      .map((item) => ({ ...item, score: cosineSimilarity(queryEmbedding, item.embedding) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, k)
      .map(({ embedding, ...rest }) => rest);
  }
}
