# LLM Integration

Groq, Gemini, OpenAI and Ollama all expose an OpenAI-compatible `/chat/completions` endpoint, so one client (`models/llm/baseModel.js`) serves all four. Each provider file only supplies its settings.

## Configure (.env)
```
GROQ_API_KEY=...        GROQ_MODEL=llama-3.3-70b-versatile
GEMINI_API_KEY=...      GEMINI_MODEL=gemini-2.5-flash
OPENAI_API_KEY=...      OPENAI_MODEL=gpt-4o-mini
OLLAMA_BASE_URL=http://localhost:11434   OLLAMA_MODEL=llama3.2
DEFAULT_PROVIDER=groq
FALLBACK_ORDER=groq,gemini,openai
```
Model names change over time. If a call fails with "model not found", update the name in `.env`.

## Fallback
`modelRegistry.chat()` tries `provider` (if given), then `DEFAULT_PROVIDER`, then `FALLBACK_ORDER`, skipping providers without a key. If all fail, agents fall back to rules/templates.

## Use Ollama
Install Ollama, run `ollama pull llama3.2`, then `DEFAULT_PROVIDER=ollama`. Ollama is not in the default fallback list.

## Add another provider
If it is OpenAI-compatible: copy `groqModel.js`, add its settings in `config/aiConfig.js`, register it in `modelRegistry.js`.

## Check
`npm run check:llm` sends a tiny request to every configured provider.
