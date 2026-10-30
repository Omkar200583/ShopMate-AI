import { chat } from '../../models/llm/modelRegistry.js';
import { SYSTEM_PROMPT } from '../../prompts/systemPrompt.js';
import { buildRecommendationPrompt } from '../../prompts/recommendationPrompt.js';
import { formatINR, shortError } from '../../utils/text.js';

/**
 * Ranks by keyword match (50%), rating (40%) and a small budget-fit bonus (10%).
 * The bonus is gentle on purpose: a cheaper product must not lose just because it is cheaper.
 */
export function rankProducts(products, requirements) {
  const maxMatch = Math.max(1, ...products.map((p) => p.matchScore ?? 0));
  const { maxBudget } = requirements;

  return products
    .map((p) => {
      const match = (p.matchScore ?? 0) / maxMatch;
      const rating = (p.rating ?? 0) / 5;
      // 1.0 at the budget, falling to 0.5 for free items; products over budget are not penalised here.
      const budgetFit = maxBudget ? 1 - 0.5 * Math.max(0, 1 - p.price / maxBudget) : 0.5;
      return { ...p, rank: 0.5 * match + 0.4 * rating + 0.1 * budgetFit };
    })
    .sort((a, b) => b.rank - a.rank);
}

function compactProduct(p) {
  return { name: p.name, brand: p.brand, price: p.price, rating: p.rating, specs: p.specs, tags: p.tags };
}

function templateReply(top, note) {
  const lines = top.map(
    (p, i) => `${i + 1}. ${p.name} - ${formatINR(p.price)} (rating ${p.rating}/5)`,
  );
  return [
    note,
    'Here are my top picks:',
    ...lines,
    `My best pick: ${top[0].name}.`,
  ]
    .filter(Boolean)
    .join('\n');
}

/** Picks the top products and writes the recommendation text. */
export async function recommend({ message, requirements, products, note }, ctx, { limit = 3 } = {}) {
  const top = rankProducts(products, requirements).slice(0, limit);
  if (top.length === 0) return { top, reply: '' };

  try {
    const { text, provider } = await chat(
      [
        { role: 'system', content: SYSTEM_PROMPT },
        {
          role: 'user',
          content: buildRecommendationPrompt({
            message,
            requirements,
            products: top.map(compactProduct),
            note,
          }),
        },
      ],
      { provider: ctx.provider },
    );
    ctx.trace.push(`recommend: LLM (${provider})`);
    return { top, reply: text };
  } catch (err) {
    ctx.trace.push(`recommend: template (${shortError(err)})`);
    return { top, reply: templateReply(top, note) };
  }
}
