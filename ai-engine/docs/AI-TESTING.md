# AI Testing

```
npm test            # all automated tests, no API key needed
npm run check:llm   # real call to each configured provider
npm run chat        # manual testing, use /debug
```

## What the tests cover
- `rules.test.js`: budget parsing, intents, full flows with no LLM, follow-ups, compare, support.
- `llm.test.js`: the real HTTP path against a fake server, JSON parsing, provider fallback.
- `extras.test.js`: cart, offers, checkout, preferences, embeddings, RAG, evaluators.
- `structure.test.js`: every file in the planned folder structure exists and is not empty.

## Quality checks in code
- `evaluateResponse({ reply, products, requirements })`: flags any ₹ amount not in the data.
- `evaluateRecommendations({ products, requirements })`: flags wrong category or over budget.

## Not covered by automation
Real Groq/Gemini/OpenAI answers, MongoDB, remote embeddings and vision. Check these by hand with a key. Before launch, collect 30 to 50 real customer messages and review the replies.
