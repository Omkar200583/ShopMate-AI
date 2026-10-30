// No API keys at all: the engine must still work using its rule-based fallbacks.
import { test } from 'node:test';
import assert from 'node:assert/strict';

process.env.GROQ_API_KEY = '';
process.env.GEMINI_API_KEY = '';
process.env.OPENAI_API_KEY = '';
process.env.DEFAULT_PROVIDER = 'groq';
process.env.FALLBACK_ORDER = 'groq,gemini,openai';

const { extractBudget } = await import('../utils/text.js');
const { handleMessage } = await import('../index.js');
const { heuristicIntent } = await import('../agents/orchestrator/agentOrchestrator.js');

test('budget parsing', () => {
  assert.deepEqual(extractBudget('gaming laptop under ₹70,000'), { minBudget: null, maxBudget: 70000 });
  assert.equal(extractBudget('phone below 25k').maxBudget, 25000);
  assert.equal(extractBudget('laptop within 1.5 lakh').maxBudget, 150000);
  assert.deepEqual(extractBudget('between 20k and 30k'), { minBudget: 20000, maxBudget: 30000 });
  assert.equal(extractBudget('above 50000 laptop').minBudget, 50000);
  assert.equal(extractBudget('I need 5 laptops').maxBudget, null);
});

test('intent rules', () => {
  assert.equal(heuristicIntent('where is my order SM-1001'), 'support');
  assert.equal(heuristicIntent('compare these two'), 'compare');
  assert.equal(heuristicIntent('what to wear at a wedding'), 'fashion');
  assert.equal(heuristicIntent('hello'), 'chitchat');
  assert.equal(heuristicIntent('gaming laptop under 70000'), 'shopping');
});

test('shopping flow works without any LLM', async () => {
  const res = await handleMessage({ message: 'I want a gaming laptop under ₹70,000', sessionId: 'a' });
  assert.equal(res.intent, 'shopping');
  assert.equal(res.requirements.category, 'laptop');
  assert.equal(res.requirements.maxBudget, 70000);
  assert.ok(res.products.length > 0);
  assert.ok(res.products.every((p) => p.category === 'laptop' && p.price <= 70000));
  assert.equal(res.products[0].name, 'Zenvo Blaze 15');
  assert.match(res.reply, /Zenvo Blaze 15/);
});

test('follow-up keeps the category and changes the budget', async () => {
  await handleMessage({ message: 'gaming laptop under 70000', sessionId: 'b' });
  const res = await handleMessage({ message: 'make it under 66000', sessionId: 'b' });
  assert.equal(res.requirements.category, 'laptop');
  assert.equal(res.requirements.maxBudget, 66000);
  assert.ok(res.products.every((p) => p.price <= 66000));
});

test('compare reuses the previous results', async () => {
  await handleMessage({ message: 'laptops under 70000', sessionId: 'c' });
  const res = await handleMessage({ message: 'compare them', sessionId: 'c' });
  assert.equal(res.intent, 'compare');
  assert.ok(res.comparison);
  assert.ok(res.comparison.columns.length >= 2);
  assert.match(res.reply, /\| Feature \|/);
});

test('budget with nothing inside it is explained', async () => {
  const res = await handleMessage({ message: 'phone under 5000', sessionId: 'd' });
  assert.ok(res.products.length > 0);
  assert.match(res.reply, /Nothing is available within ₹5,000/);
});

test('support: order tracking', async () => {
  const res = await handleMessage({ message: 'track my order SM-1001', sessionId: 'e' });
  assert.equal(res.intent, 'support');
  assert.equal(res.order.status, 'Shipped');
  assert.match(res.reply, /Shipped/);
});

test('vague message asks what to buy', async () => {
  const res = await handleMessage({ message: 'I want to buy something', sessionId: 'f' });
  assert.match(res.reply, /What would you like to buy/);
});
