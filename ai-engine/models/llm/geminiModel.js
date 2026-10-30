import { OpenAICompatibleModel } from './baseModel.js';

// Gemini exposes an OpenAI-compatible endpoint, so we reuse the same client.
export function createGeminiModel(cfg, shared = {}) {
  return new OpenAICompatibleModel({
    name: 'gemini',
    apiKey: cfg.apiKey,
    baseUrl: cfg.baseUrl,
    model: cfg.model,
    timeoutMs: shared.timeoutMs,
    defaults: shared.defaults,
  });
}
