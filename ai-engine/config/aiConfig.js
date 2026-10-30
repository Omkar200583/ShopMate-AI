import 'dotenv/config';

const env = process.env;

const clean = (value) => (value ?? '').trim();
const list = (value, fallback) =>
  clean(value || fallback)
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);

const ollamaBase = clean(env.OLLAMA_BASE_URL) || 'http://localhost:11434';

export const aiConfig = {
  defaultProvider: clean(env.DEFAULT_PROVIDER).toLowerCase() || 'groq',
  fallbackOrder: list(env.FALLBACK_ORDER, 'groq,gemini,openai'),

  temperature: Number(env.AI_TEMPERATURE ?? 0.4),
  maxTokens: Number(env.AI_MAX_TOKENS ?? 700),
  timeoutMs: Number(env.AI_TIMEOUT_MS ?? 30000),

  // Every provider below speaks the OpenAI-compatible /chat/completions protocol,
  // so one small client (models/llm/baseModel.js) serves all of them.
  providers: {
    groq: {
      apiKey: clean(env.GROQ_API_KEY),
      baseUrl: clean(env.GROQ_BASE_URL) || 'https://api.groq.com/openai/v1',
      model: clean(env.GROQ_MODEL) || 'llama-3.3-70b-versatile',
    },
    gemini: {
      apiKey: clean(env.GEMINI_API_KEY),
      baseUrl:
        clean(env.GEMINI_BASE_URL) ||
        'https://generativelanguage.googleapis.com/v1beta/openai',
      model: clean(env.GEMINI_MODEL) || 'gemini-2.5-flash',
    },
    openai: {
      apiKey: clean(env.OPENAI_API_KEY),
      baseUrl: clean(env.OPENAI_BASE_URL) || 'https://api.openai.com/v1',
      model: clean(env.OPENAI_MODEL) || 'gpt-4o-mini',
    },
    ollama: {
      apiKey: '',
      baseUrl: `${ollamaBase.replace(/\/+$/, '')}/v1`,
      model: clean(env.OLLAMA_MODEL) || 'llama3.2',
    },
  },

  // Embeddings: "local" (offline, no key) | "openai" | "gemini" | "ollama"
  // Never mix providers on the same index: vectors from different models are not comparable.
  embeddingProvider: (clean(env.EMBEDDING_PROVIDER) || 'local').toLowerCase(),
  embeddingModel: clean(env.EMBEDDING_MODEL),

  // Product catalog source
  useMongo: clean(env.USE_MONGO).toLowerCase() === 'true',
  mongodbUri: clean(env.MONGODB_URI),
  mongodbDb: clean(env.MONGODB_DB),
  mongodbCollection: clean(env.MONGODB_PRODUCTS_COLLECTION) || 'products',
};
