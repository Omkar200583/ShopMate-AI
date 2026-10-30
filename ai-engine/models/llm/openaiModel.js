import { OpenAICompatibleModel } from './baseModel.js';

export function createOpenAIModel(cfg, shared = {}) {
  return new OpenAICompatibleModel({
    name: 'openai',
    apiKey: cfg.apiKey,
    baseUrl: cfg.baseUrl,
    model: cfg.model,
    timeoutMs: shared.timeoutMs,
    defaults: shared.defaults,
    maxTokensParam: 'max_completion_tokens',
  });
}
