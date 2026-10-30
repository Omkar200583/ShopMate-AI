// Terminal chat to test the engine:  npm run chat
import readline from 'node:readline';
import { stdin as input, stdout as output } from 'node:process';
import { handleMessage, listProviders, clearHistory, clearSession } from './index.js';

const sessionId = 'cli';
let debug = false;
let provider = null;

console.log('ShopMate AI - terminal chat');
const usable = listProviders().filter((p) => p.available && p.name !== 'ollama');
if (usable.length === 0) {
  console.log('No API key found in .env, so I will answer using built-in rules (no LLM).');
} else {
  console.log(`LLM providers ready: ${usable.map((p) => `${p.name} (${p.model})`).join(', ')}`);
}
console.log('Commands: /debug  /reset  /provider <groq|gemini|openai|ollama>  /exit\n');

const rl = readline.createInterface({ input, output, prompt: 'You: ' });
rl.prompt();

// One line at a time, in order (works for typing and for piped input).
for await (const rawLine of rl) {
  const line = rawLine.trim();

  if (line === '/exit') break;

  if (!line) {
    // ignore empty input
  } else if (line === '/debug') {
    debug = !debug;
    console.log(`debug ${debug ? 'on' : 'off'}`);
  } else if (line === '/reset') {
    clearHistory(sessionId);
    clearSession(sessionId);
    console.log('conversation cleared');
  } else if (line.startsWith('/provider')) {
    provider = line.split(/\s+/)[1] || null;
    console.log(`preferred provider: ${provider ?? 'default'}`);
  } else {
    try {
      const res = await handleMessage({ message: line, sessionId, provider });
      console.log(`\nShopMate: ${res.reply}\n`);
      if (debug) {
        console.log('--- debug ---');
        console.log('intent      :', res.intent);
        console.log('requirements:', JSON.stringify(res.requirements));
        console.log('trace       :', res.trace.join(' | '));
        console.log('-------------\n');
      }
    } catch (err) {
      console.error(`Error: ${err.message}\n`);
    }
  }
  rl.prompt();
}
rl.close();
