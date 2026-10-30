// Every file from the planned ShopMate structure must exist and contain code/text.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

const FILES = [
  'models/llm/groqModel.js', 'models/llm/ollamaModel.js', 'models/llm/openaiModel.js',
  'models/llm/geminiModel.js', 'models/llm/modelRegistry.js',
  'models/embeddings/embeddingService.js', 'models/embeddings/vectorSearch.js',
  'models/vision/imageUnderstanding.js',
  'agents/orchestrator/agentOrchestrator.js', 'agents/shoppingAgent/shoppingAgent.js',
  'agents/recommendationAgent/recommendationAgent.js', 'agents/comparisonAgent/comparisonAgent.js',
  'agents/budgetAgent/budgetAgent.js', 'agents/fashionAgent/fashionAgent.js', 'agents/supportAgent/supportAgent.js',
  'tools/productSearchTool.js', 'tools/productCompareTool.js', 'tools/priceCheckTool.js',
  'tools/cartTool.js', 'tools/orderTrackingTool.js', 'tools/offerSearchTool.js',
  'rag/documentLoader.js', 'rag/textSplitter.js', 'rag/vectorStore.js', 'rag/retrievalService.js',
  'memory/conversationMemory.js', 'memory/userPreferenceMemory.js', 'memory/sessionMemory.js',
  'prompts/systemPrompt.js', 'prompts/shoppingPrompt.js', 'prompts/recommendationPrompt.js', 'prompts/comparisonPrompt.js',
  'workflows/shoppingWorkflow.js', 'workflows/recommendationWorkflow.js', 'workflows/checkoutWorkflow.js',
  'evaluation/responseEvaluator.js', 'evaluation/recommendationEvaluator.js',
  'config/aiConfig.js', 'index.js',
  'docs/AI-ARCHITECTURE.md', 'docs/LLM-INTEGRATION.md', 'docs/AGENT-WORKFLOW.md',
  'docs/RAG-ARCHITECTURE.md', 'docs/API-INTEGRATION.md', 'docs/AI-TESTING.md',
];

test(`all ${FILES.length} planned files exist and are not empty`, async () => {
  const problems = [];
  for (const f of FILES) {
    try {
      const s = await stat(path.join(root, f));
      if (s.size === 0) problems.push(`${f}: empty`);
    } catch {
      problems.push(`${f}: missing`);
    }
  }
  assert.deepEqual(problems, []);
});

test('every .js module imports without errors', async () => {
  process.env.GROQ_API_KEY = '';
  for (const f of FILES.filter((x) => x.endsWith('.js'))) {
    await import(pathToFileURL(path.join(root, f)).href);
  }
});
