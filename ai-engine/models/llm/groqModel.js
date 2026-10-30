import { OpenAICompatibleModel } from './baseModel.js';

export function createGroqModel(cfg, shared = {}) {
  return new OpenAICompatibleModel({
    name: 'groq',
    apiKey: cfg.apiKey,
    baseUrl: cfg.baseUrl,
    model: cfg.model,
    timeoutMs: shared.timeoutMs,
    defaults: shared.defaults,
  });
}
