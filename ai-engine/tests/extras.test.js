import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

process.env.GROQ_API_KEY = '';
process.env.GEMINI_API_KEY = '';
process.env.OPENAI_API_KEY = '';
process.env.EMBEDDING_PROVIDER = 'local';

const api = await import('../index.js');
const { splitText } = await import('../rag/textSplitter.js');
const { sampleProducts } = await import('../data/sampleProducts.js');

test('cart: add, merge, remove, validate', async () => {
  await api.addToCart('s1', 'hp-002', 1);
  const cart = await api.addToCart('s1', 'hp-002', 2);
  assert.equal(cart.items.length, 1);
  assert.equal(cart.items[0].quantity, 3);
  assert.equal(cart.subtotal, 7999 * 3);
  await assert.rejects(() => api.addToCart('s1', 'nope', 1), /Unknown product/);
  await assert.rejects(() => api.addToCart('s1', 'hp-002', 0), /quantity/);
  assert.equal(api.removeFromCart('s1', 'hp-002').items.length, 0);
});

test('offers: category + store-wide, best first', () => {
  const offers = api.searchOffers('headphones');
  assert.equal(offers[0].code, 'SOUND10');
  assert.ok(offers.some((o) => o.category === 'all'));
  assert.ok(!offers.some((o) => o.category === 'laptop'));
});

test('checkout: coupon unlocks category offer, store-wide applies automatically', async () => {
  await api.addToCart('s2', 'hp-002', 1); // 7999 headphones
  const noCoupon = api.runCheckoutWorkflow({ sessionId: 's2' });
  assert.equal(noCoupon.discount, Math.round(7999 * 0.03)); // only ALL3
  const withCoupon = api.runCheckoutWorkflow({ sessionId: 's2', couponCode: 'sound10' });
  assert.equal(withCoupon.discount, Math.round(7999 * 0.1));
  assert.equal(withCoupon.total, 7999 - Math.round(7999 * 0.1));
  assert.equal(api.runCheckoutWorkflow({ sessionId: 'empty' }).ok, false);
});

test('preferences are learned and drive recommendations', async () => {
  await api.handleMessage({ message: 'laptops under 70000', sessionId: 'p1', userId: 'u1' });
  await api.handleMessage({ message: 'gaming laptop under 70000', sessionId: 'p1', userId: 'u1' });
  assert.equal(api.getPreferences('u1').categories.laptop, 2);

  const rec = await api.runRecommendationWorkflow({ userId: 'u1' });
  assert.ok(rec.products.length > 0);
  assert.ok(rec.products.every((p) => p.category === 'laptop' && p.price <= 70000));
  assert.equal((await api.runRecommendationWorkflow({ userId: 'new-user' })).products.length, 0);
});

test('embeddings: semantic search ranks the right category first', async () => {
  const top = await api.semanticSearch('gaming laptop', sampleProducts, 3);
  assert.equal(top[0].category, 'laptop');
  const similar = await api.findSimilarProducts(sampleProducts.find((p) => p.id === 'hp-002'), sampleProducts, 2);
  assert.equal(similar[0].category, 'headphones');
});

test('text splitter: chunk size, overlap, errors', () => {
  const text = 'Sentence number one. '.repeat(100);
  const chunks = splitText(text, { chunkSize: 200, overlap: 20 });
  assert.ok(chunks.length > 5);
  assert.ok(chunks.every((c) => c.length <= 200));
  assert.deepEqual(splitText('   '), []);
  assert.throws(() => splitText('abc', { chunkSize: 10, overlap: 10 }));
});

test('RAG: load, index and retrieve the right document', async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'rag-'));
  await writeFile(path.join(dir, 'returns.md'), 'Return policy: items can be returned within seven days if unused.');
  await writeFile(path.join(dir, 'shipping.txt'), 'Shipping: delivery takes three to five days across India.');
  await writeFile(path.join(dir, 'ignore.json'), '{"x":1}');

  const docs = await api.loadDocuments(dir);
  assert.equal(docs.length, 2);
  assert.ok((await api.indexDocuments(docs)) >= 2);
  const hits = await api.retrieve('how do I return an item', 1);
  assert.equal(hits[0].metadata.source, 'returns.md');
});

test('evaluators catch invented prices and bad recommendations', () => {
  const products = [{ name: 'A', category: 'laptop', price: 64990 }];
  const reqs = { category: 'laptop', maxBudget: 70000 };

  assert.equal(api.evaluateResponse({ reply: 'A costs ₹64,990, under your ₹70,000 budget', products, requirements: reqs }).ok, true);
  const bad = api.evaluateResponse({ reply: 'A costs only ₹49,990', products, requirements: reqs });
  assert.equal(bad.ok, false);
  assert.match(bad.issues[0], /49,990/);

  assert.equal(api.evaluateRecommendations({ products, requirements: reqs }).ok, true);
  const over = api.evaluateRecommendations({ products: [{ name: 'B', category: 'phone', price: 80000 }], requirements: reqs });
  assert.equal(over.issues.length, 2);
});

test('real engine output passes its own evaluators', async () => {
  const res = await api.handleMessage({ message: 'gaming laptop under 70000', sessionId: 'ev' });
  assert.equal(api.evaluateRecommendations({ products: res.products, requirements: res.requirements }).ok, true);
  assert.equal(api.evaluateResponse({ reply: res.reply, products: res.products, requirements: res.requirements }).ok, true);
});
