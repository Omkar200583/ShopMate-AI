import { embed, cosineSimilarity } from './embeddingService.js';

const productText = (p) =>
  [p.name, p.brand, p.category, ...(p.tags ?? []), p.description].filter(Boolean).join(' ');

/** Ranks products by similarity to a free-text query. */
export async function semanticSearch(query, products, k = 5) {
  if (products.length === 0) return [];
  const [q, ...vectors] = await embed([query, ...products.map(productText)]);
  return products
    .map((p, i) => ({ ...p, similarity: cosineSimilarity(q, vectors[i]) }))
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, k);
}

/** "More like this": other products closest to the given one. */
export async function findSimilarProducts(product, products, k = 3) {
  const others = products.filter((p) => p.id !== product.id);
  return semanticSearch(productText(product), others, k);
}
