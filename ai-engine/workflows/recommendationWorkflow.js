import { getPreferences, favoriteBrand } from '../memory/userPreferenceMemory.js';
import { searchProducts } from '../tools/productSearchTool.js';
import { applyBudget } from '../agents/budgetAgent/budgetAgent.js';
import { rankProducts } from '../agents/recommendationAgent/recommendationAgent.js';

/**
 * "Recommended for you" without the customer typing anything.
 * Uses what we learned about them: most-searched category, favourite brand, usual budget.
 * No LLM involved, so it is fast and free.
 */
export async function runRecommendationWorkflow({ userId, limit = 4 }) {
  const prefs = getPreferences(userId);
  const topCategory = Object.entries(prefs.categories).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
  if (!topCategory) return { products: [], reason: 'No history yet for this user.' };

  const requirements = {
    category: topCategory,
    brand: favoriteBrand(userId),
    minBudget: null,
    maxBudget: prefs.maxBudgetByCategory[topCategory] ?? null,
    useCase: null,
    features: [],
    keywords: [],
  };

  const found = await searchProducts(requirements);
  const { products } = applyBudget(found, requirements);
  const top = rankProducts(products, requirements).slice(0, limit);
  return { products: top, reason: `Based on your interest in ${topCategory}.`, requirements };
}
