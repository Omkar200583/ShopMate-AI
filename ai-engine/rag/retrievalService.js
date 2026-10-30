import { embed } from '../models/embeddings/embeddingService.js';
import { splitText } from './textSplitter.js';
import { VectorStore } from './vectorStore.js';

const store = new VectorStore();

/** docs: [{ source, text }] -> splits, embeds and stores them. Returns number of chunks. */
export async function indexDocuments(docs, { chunkSize = 500, overlap = 50 } = {}) {
  store.clear();
  const pieces = docs.flatMap((d) =>
    splitText(d.text, { chunkSize, overlap }).map((text, i) => ({ source: d.source, text, i })),
  );
  if (pieces.length === 0) return 0;
  const vectors = await embed(pieces.map((p) => p.text));
  pieces.forEach((p, n) =>
    store.add({ id: `${p.source}#${p.i}`, text: p.text, embedding: vectors[n], metadata: { source: p.source } }),
  );
  return pieces.length;
}

/** Returns the k most relevant chunks for a question: [{ id, text, metadata, score }] */
export async function retrieve(query, k = 3) {
  if (store.size === 0) return [];
  const [q] = await embed([query]);
  return store.search(q, k);
}
