import { formatINR } from '../../utils/text.js';

const RELAX_FACTOR = 1.15; // show items up to 15% over budget when nothing fits

/**
 * Pure code (no LLM): filters by the customer's budget.
 * Returns { products, note } where note explains any relaxing we did.
 */
export function applyBudget(products, { minBudget = null, maxBudget = null } = {}) {
  if (minBudget === null && maxBudget === null) return { products, note: null };

  const within = products.filter(
    (p) => (minBudget === null || p.price >= minBudget) && (maxBudget === null || p.price <= maxBudget),
  );
  if (within.length > 0) return { products: within, note: null };

  if (maxBudget !== null) {
    const slightlyOver = products
      .filter((p) => p.price <= maxBudget * RELAX_FACTOR && (minBudget === null || p.price >= minBudget))
      .sort((a, b) => a.price - b.price);
    if (slightlyOver.length > 0) {
      return {
        products: slightlyOver,
        note: `Nothing is exactly within ${formatINR(maxBudget)}. These are slightly above the budget.`,
      };
    }
    const cheapest = [...products].sort((a, b) => a.price - b.price).slice(0, 3);
    if (cheapest.length > 0) {
      return {
        products: cheapest,
        note: `Nothing is available within ${formatINR(maxBudget)}. The cheapest options start at ${formatINR(cheapest[0].price)}.`,
      };
    }
  }
  return { products: [], note: null };
}
