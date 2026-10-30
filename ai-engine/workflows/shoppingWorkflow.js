import { getSession, saveSession } from '../memory/sessionMemory.js';
import { understandRequest } from '../agents/shoppingAgent/shoppingAgent.js';
import { applyBudget } from '../agents/budgetAgent/budgetAgent.js';
import { recommend, rankProducts } from '../agents/recommendationAgent/recommendationAgent.js';
import { compareProducts } from '../agents/comparisonAgent/comparisonAgent.js';
import { searchProducts, listCategories } from '../tools/productSearchTool.js';
import { formatINR } from '../utils/text.js';

const hasSearchTerms = (r) =>
  Boolean(r.category || r.brand || r.useCase || r.features.length || r.keywords.length);

/**
 * understand -> search -> budget filter -> rank -> recommend (or compare)
 * mode: 'shop' | 'compare'
 */
export async function runShoppingWorkflow({ message, mode = 'shop' }, ctx) {
  const session = getSession(ctx.sessionId);

  // 1. Shopping agent: message -> structured requirements
  const { raw, requirements } = await understandRequest(message, session.requirements, ctx);

  // 2. Find candidates (or reuse the previous results for "compare them")
  let candidates;
  let note = null;

  if (mode === 'compare' && !raw.category && session.products.length >= 2) {
    candidates = session.products;
    ctx.trace.push('search: reused previous results');
  } else {
    if (!hasSearchTerms(requirements)) {
      const categories = await listCategories();
      return {
        reply: `What would you like to buy? I can help with: ${categories.join(', ')}.`,
        products: [],
        requirements,
      };
    }
    const found = await searchProducts(requirements);
    ctx.trace.push(`search: ${found.length} matches`);

    // 3. Budget agent
    const budgeted = applyBudget(found, requirements);
    candidates = budgeted.products;
    note = budgeted.note;
    ctx.trace.push(`budget: ${candidates.length} left${note ? ' (relaxed)' : ''}`);
  }

  if (candidates.length === 0) {
    const where = requirements.category ? ` for "${requirements.category}"` : '';
    const budget = requirements.maxBudget ? ` under ${formatINR(requirements.maxBudget)}` : '';
    saveSession(ctx.sessionId, { requirements, products: [] });
    return {
      reply: `Sorry, I could not find matching products${where}${budget}. Try a different budget or fewer filters.`,
      products: [],
      requirements,
    };
  }

  // 4. Compare or recommend
  if (mode === 'compare' && candidates.length >= 2) {
    const top = rankProducts(candidates, requirements).slice(0, 3);
    const { comparison, reply } = await compareProducts({ message, products: top }, ctx);
    saveSession(ctx.sessionId, { requirements, products: top });
    return { reply: note ? `${note}\n\n${reply}` : reply, products: top, requirements, comparison };
  }

  const { top, reply } = await recommend({ message, requirements, products: candidates, note }, ctx);
  saveSession(ctx.sessionId, { requirements, products: top });
  return { reply, products: top, requirements };
}
