// Runs the real HTTP code path against a fake OpenAI-compatible server.
// Proves: JSON extraction, LLM replies, and fallback from a failing provider to a working one.
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';

let server;
let handleMessage;
const seen = [];

before(async () => {
  server = http.createServer((req, res) => {
    let body = '';
    req.on('data', (c) => (body += c));
    req.on('end', () => {
      // Anything sent to /groq/... simulates a provider that is down.
      if (req.url.startsWith('/groq/')) {
        res.statusCode = 500;
        res.end('{"error":"groq is down"}');
        return;
      }
      const payload = JSON.parse(body);
      const system = payload.messages[0].content;
      seen.push({ url: req.url, system: system.slice(0, 40), json: Boolean(payload.response_format) });

      let content;
      if (system.includes('extract shopping requirements')) {
        content =
          '```json\n' +
          JSON.stringify({
            category: 'Laptop',
            brand: null,
            minBudget: null,
            maxBudget: '₹70,000',
            useCase: 'gaming',
            features: ['16GB RAM'],
            keywords: [],
          }) +
          '\n```';
      } else if (system.includes('classify')) {
        content = '{"intent":"shopping"}';
      } else {
        content = 'FAKE-LLM: Zenvo Blaze 15 is my best pick.';
      }
      res.setHeader('content-type', 'application/json');
      res.end(JSON.stringify({ choices: [{ message: { content } }] }));
    });
  });
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  const origin = `http://127.0.0.1:${server.address().port}`;

  process.env.GROQ_API_KEY = 'test-key';
  process.env.GROQ_BASE_URL = `${origin}/groq`; // always fails with 500
  process.env.GEMINI_API_KEY = '';
  process.env.OPENAI_API_KEY = '';
  process.env.OLLAMA_BASE_URL = origin; // works
  process.env.DEFAULT_PROVIDER = 'groq';
  process.env.FALLBACK_ORDER = 'groq,ollama';

  ({ handleMessage } = await import('../index.js'));
});

after(() => server.close());

test('falls back from a failing provider to a working one', async () => {
  const res = await handleMessage({ message: 'I want a gaming laptop under ₹70,000', sessionId: 'x' });

  assert.equal(res.intent, 'shopping');
  assert.equal(res.requirements.category, 'laptop'); // "Laptop" normalized
  assert.equal(res.requirements.maxBudget, 70000); // "₹70,000" parsed
  assert.deepEqual(res.requirements.features, ['16gb ram']);
  assert.ok(res.products.every((p) => p.price <= 70000));
  assert.match(res.reply, /FAKE-LLM/);
  assert.ok(res.trace.some((t) => t.includes('LLM (ollama)')), res.trace.join(' | '));
});

test('JSON mode is requested for structured calls', () => {
  assert.ok(seen.some((s) => s.json), 'at least one call used response_format');
});
