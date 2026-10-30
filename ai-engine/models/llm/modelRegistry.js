import { aiConfig } from '../../config/aiConfig.js';
import { LLMError } from './baseModel.js';
import { createGroqModel } from './groqModel.js';
import { createGeminiModel } from './geminiModel.js';
import { createOpenAIModel } from './openaiModel.js';
import { createOllamaModel } from './ollamaModel.js';

const shared = {
  timeoutMs: aiConfig.timeoutMs,
  defaults: { temperature: aiConfig.temperature, maxTokens: aiConfig.maxTokens },
};

const instances = {
  groq: createGroqModel(aiConfig.providers.groq, shared),
  gemini: createGeminiModel(aiConfig.providers.gemini, shared),
  openai: createOpenAIModel(aiConfig.providers.openai, shared),
  ollama: createOllamaModel(aiConfig.providers.ollama, shared),
};

export class NoProviderError extends LLMError {
  constructor() {
    super('No LLM provider is configured (add an API key to .env or run Ollama).');
    this.name = 'NoProviderError';
  }
}

export function listProviders() {
  return Object.entries(instances).map(([name, m]) => ({
    name,
    model: m.model,
    available: m.isAvailable(),
  }));
}

export function getModel(name) {
  const m = instances[String(name).toLowerCase()];
  if (!m) throw new Error(`Unknown provider "${name}". Known: ${Object.keys(instances).join(', ')}`);
  return m;
}

// preferred -> default -> fallback list, de-duplicated, only providers that are available.
export function providerOrder(preferred) {
  const wanted = [preferred, aiConfig.defaultProvider, ...aiConfig.fallbackOrder]
    .filter(Boolean)
    .map((n) => String(n).toLowerCase());
  return [...new Set(wanted)].filter((n) => instances[n] && instances[n].isAvailable());
}

async function withFallback(method, messages, opts = {}) {
  const order = providerOrder(opts.provider);
  if (order.length === 0) throw new NoProviderError();

  const errors = [];
  for (const name of order) {
    try {
      const value = await instances[name][method](messages, opts);
      return { value, provider: name, failed: errors };
    } catch (err) {
      errors.push(`${name}: ${String(err.message).split('\n')[0]}`);
    }
  }
  throw new LLMError(`All providers failed -> ${errors.join(' | ')}`);
}

/** Returns { text, provider }. Tries providers in order until one works. */
export async function chat(messages, opts = {}) {
  const { value, provider, failed } = await withFallback('chat', messages, opts);
  return { text: value, provider, failed };
}

/** Returns { data, provider }. Same as chat() but parses a JSON object. */
export async function chatJson(messages, opts = {}) {
  const { value, provider, failed } = await withFallback('chatJson', messages, opts);
  return { data: value, provider, failed };
}
