# RAG Architecture

RAG lets the assistant answer from your own documents (return policy, FAQs, size guides) instead of guessing.

```
documents -> documentLoader -> textSplitter -> embeddingService -> vectorStore
question  -> embeddingService -> vectorStore.search -> top chunks -> (put in the LLM prompt)
```

```js
import { loadDocuments } from './rag/documentLoader.js';
import { indexDocuments, retrieve } from './rag/retrievalService.js';

await indexDocuments(await loadDocuments('./knowledge'));
const chunks = await retrieve('How do I return an item?', 3);
```

## Embeddings
- Default `EMBEDDING_PROVIDER=local`: offline hashed bag-of-words. Needs no key, matches shared words only (not meaning). Good for development and tests.
- For real semantic search set `EMBEDDING_PROVIDER=openai|gemini|ollama` (and optionally `EMBEDDING_MODEL`).
- Re-index whenever you change provider or model. Vectors from different models cannot be compared.

## Not connected yet
`retrieve()` is not yet called by the support agent. To use it, call `retrieve(message)` in `supportAgent.js` and add the chunks to the prompt. The store is in memory; move to MongoDB Atlas Vector Search when your data grows.
