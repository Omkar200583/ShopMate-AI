// Public API of the ShopMate AI engine.
// From your Express backend:  import { handleMessage } from '../ai-engine/index.js';

export { handleMessage, classifyIntent } from './agents/orchestrator/agentOrchestrator.js';
export { listProviders, getModel, chat, chatJson } from './models/llm/modelRegistry.js';
export { embed, cosineSimilarity } from './models/embeddings/embeddingService.js';
export { semanticSearch, findSimilarProducts } from './models/embeddings/vectorSearch.js';
export { describeImage } from './models/vision/imageUnderstanding.js';

export { searchProducts } from './tools/productSearchTool.js';
export { addToCart, removeFromCart, clearCart, getCart } from './tools/cartTool.js';
export { searchOffers } from './tools/offerSearchTool.js';

export { loadDocuments } from './rag/documentLoader.js';
export { indexDocuments, retrieve } from './rag/retrievalService.js';

export { runRecommendationWorkflow } from './workflows/recommendationWorkflow.js';
export { runCheckoutWorkflow } from './workflows/checkoutWorkflow.js';

export { evaluateResponse } from './evaluation/responseEvaluator.js';
export { evaluateRecommendations } from './evaluation/recommendationEvaluator.js';

export { clearHistory } from './memory/conversationMemory.js';
export { clearSession } from './memory/sessionMemory.js';
export { getPreferences, clearPreferences } from './memory/userPreferenceMemory.js';
