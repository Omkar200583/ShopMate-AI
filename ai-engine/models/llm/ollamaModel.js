import { OpenAICompatibleModel } from './baseModel.js';

// Local models via Ollama (http://localhost:11434). No API key needed.
// Install Ollama, then run: ollama pull llama3.2
export function createOllamaModel(cfg, shared = {}) {
  return new OpenAICompatibleModel({
    name: 'ollama',
    apiKey: '',
    baseUrl: cfg.baseUrl,
    model: cfg.model,
    requiresKey: false,
    // Local models are slower, give them more time.
    timeoutMs: Math.max(shared.timeoutMs ?? 30000, 120000),
    defaults: shared.defaults,
  });
}
