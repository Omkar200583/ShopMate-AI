import { aiConfig } from '../config/aiConfig.js';
import { sampleProducts } from '../data/sampleProducts.js';
import { normalizeCategory, tokenize, STOPWORDS } from '../utils/text.js';

// ---------- MongoDB source (optional) ----------
let mongoClientPromise = null;

function mapDoc(d) {
  return {
    id: String(d._id ?? d.id),
    name: d.name ?? d.title ?? 'Unnamed product',
    brand: d.brand ?? '',
    category: normalizeCategory(d.category) ?? '',
    price: Number(d.price),
    rating: Number(d.rating ?? d.ratings ?? 0),
    tags: Array.isArray(d.tags) ? d.tags.map((t) => String(t).toLowerCase()) : [],
    description: d.description ?? '',
    specs: d.specs && typeof d.specs === 'object' ? d.specs : {},
  };
}

async function loadFromMongo(category) {
  const { MongoClient } = await import('mongodb');
  mongoClientPromise ??= new MongoClient(aiConfig.mongodbUri).connect();
  const client = await mongoClientPromise;
  const col = client.db(aiConfig.mongodbDb || undefined).collection(aiConfig.mongodbCollection);
  const query = category ? { category: new RegExp(`^${category}s?$`, 'i') } : {};
  const docs = await col.find(query).limit(200).toArray();
  return docs.map(mapDoc).filter((p) => Number.isFinite(p.price));
}

export async function loadProducts(category = null) {
  if (aiConfig.useMongo && aiConfig.mongodbUri) {
    try {
      return await loadFromMongo(category);
    } catch (err) {
      console.warn(`[productSearchTool] MongoDB failed (${err.message}). Using sample catalog.`);
    }
  }
  return sampleProducts;
}

// ---------- Search ----------
function scoreProduct(product, req) {
  let score = 0;
  const haystackName = `${product.name} ${product.brand}`.toLowerCase();
  const haystackTags = product.tags.join(' ').toLowerCase();
  const haystackDesc = `${product.description} ${Object.values(product.specs).join(' ')}`.toLowerCase();

  if (req.brand && product.brand.toLowerCase() === String(req.brand).toLowerCase()) score += 3;

  const terms = new Set(
    [req.useCase, ...(req.features ?? []), ...(req.keywords ?? [])]
      .filter(Boolean)
      .flatMap((t) => tokenize(t))
      .filter((t) => !STOPWORDS.has(t) && t.length > 1),
  );
  for (const term of terms) {
    if (haystackTags.includes(term)) score += 2;
    if (haystackName.includes(term)) score += 2;
    if (haystackDesc.includes(term)) score += 1;
  }
  return score;
}

/**
 * Finds products matching the requirements (category, brand, keywords).
 * Budget is applied separately by the budget agent.
 * Returns products with a `matchScore`, best first.
 */
export async function searchProducts(req, { limit = 30 } = {}) {
  const category = normalizeCategory(req.category);
  const all = await loadProducts(category);

  const pool = category ? all.filter((p) => normalizeCategory(p.category) === category) : all;

  const scored = pool.map((p) => ({ ...p, matchScore: scoreProduct(p, req) }));

  // Without a category, only keep products that matched something.
  const filtered = category ? scored : scored.filter((p) => p.matchScore > 0);

  return filtered
    .sort((a, b) => b.matchScore - a.matchScore || b.rating - a.rating)
    .slice(0, limit);
}

export async function listCategories() {
  const all = await loadProducts(null);
  return [...new Set(all.map((p) => normalizeCategory(p.category)).filter(Boolean))];
}
