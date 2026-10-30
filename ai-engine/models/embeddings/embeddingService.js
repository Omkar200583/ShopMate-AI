import { aiConfig } from '../../config/aiConfig.js';
import { tokenize } from '../../utils/text.js';

const DEFAULT_MODELS = {
  openai: 'text-embedding-3-small',
  ollama: 'nomic-embed-text',
  gemini: 'gemini-embedding-001',
};

const DIMS = 256;

function fnv1a(str, seed = 2166136261) {
  let h = seed >>> 0;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h >>> 0;
}

/** Offline "hashed bag of words" embedding. No API, no key. Matches shared words, not meaning. */
export function localEmbed(text) {
  const v = new Array(DIMS).fill(0);
  for (const token of tokenize(text)) {
    const idx = fnv1a(token) % DIMS;
    const sign = fnv1a(token, 99991) % 2 === 0 ? 1 : -1;
    v[idx] += sign;
  }
  const norm = Math.sqrt(v.reduce((s, x) => s + x * x, 0)) || 1;
  return v.map((x) => x / norm);
}

async function remoteEmbed(texts) {
  const name = aiConfig.embeddingProvider;
  const cfg = aiConfig.providers[name];
  if (!cfg) throw new Error(`Unknown EMBEDDING_PROVIDER "${name}"`);
  if (name !== 'ollama' && !cfg.apiKey) throw new Error(`EMBEDDING_PROVIDER=${name} but its API key is empty`);

  const res = await fetch(`${cfg.baseUrl.replace(/\/+$/, '')}/embeddings`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(cfg.apiKey ? { Authorization: `Bearer ${cfg.apiKey}` } : {}),
    },
    body: JSON.stringify({ model: aiConfig.embeddingModel || DEFAULT_MODELS[name], input: texts }),
  });
  const body = await res.text();
  if (!res.ok) throw new Error(`${name} embeddings HTTP ${res.status}: ${body.slice(0, 200)}`);
  const data = JSON.parse(body).data;
  return data.sort((a, b) => a.index - b.index).map((d) => d.embedding);
}

/** texts: string[] -> number[][] (same order) */
export async function embed(texts) {
  const list = Array.isArray(texts) ? texts : [texts];
  if (aiConfig.embeddingProvider === 'local') return list.map(localEmbed);
  return remoteEmbed(list);
}

export function cosineSimilarity(a, b) {
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  return na && nb ? dot / (Math.sqrt(na) * Math.sqrt(nb)) : 0;
}
