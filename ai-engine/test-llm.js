// Checks which LLM providers actually work with your keys:  npm run check:llm
import { listProviders, getModel } from './index.js';

console.log('Provider status\n');
for (const p of listProviders()) {
  if (!p.available) {
    console.log(`- ${p.name.padEnd(7)} skipped (no API key in .env)`);
    continue;
  }
  const started = Date.now();
  try {
    const reply = await getModel(p.name).chat(
      [{ role: 'user', content: 'Reply with exactly one word: OK' }],
      { temperature: 0, maxTokens: 10 },
    );
    console.log(`- ${p.name.padEnd(7)} OK   model=${p.model}  ${Date.now() - started} ms  reply="${reply}"`);
  } catch (err) {
    console.log(`- ${p.name.padEnd(7)} FAIL model=${p.model}  ${err.message.split('\n')[0]}`);
  }
}
