/** Checks that recommended products actually satisfy the customer's requirements. */
export function evaluateRecommendations({ products = [], requirements }) {
  const issues = [];
  if (products.length === 0) issues.push('No products recommended');

  for (const p of products) {
    if (requirements?.category && p.category !== requirements.category) {
      issues.push(`${p.name}: category ${p.category} is not ${requirements.category}`);
    }
    if (requirements?.maxBudget && p.price > requirements.maxBudget) {
      issues.push(`${p.name}: ₹${p.price.toLocaleString('en-IN')} is over budget`);
    }
    if (requirements?.minBudget && p.price < requirements.minBudget) {
      issues.push(`${p.name}: ₹${p.price.toLocaleString('en-IN')} is under the minimum`);
    }
  }
  return { ok: issues.length === 0, issues };
}
