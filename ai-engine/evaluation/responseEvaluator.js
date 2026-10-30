/**
 * Checks an LLM reply against the real data it was given.
 * Flags any ₹ amount that is not a product price or the customer's budget (a classic hallucination).
 */
export function evaluateResponse({ reply, products = [], requirements = null }) {
  const issues = [];
  const allowed = new Set(products.map((p) => p.price));
  if (requirements?.maxBudget) allowed.add(requirements.maxBudget);
  if (requirements?.minBudget) allowed.add(requirements.minBudget);

  const amounts = [...String(reply).matchAll(/₹\s?(\d[\d,]*)/g)].map((m) => Number(m[1].replace(/,/g, '')));
  for (const a of amounts) {
    if (!allowed.has(a)) issues.push(`Unknown price in reply: ₹${a.toLocaleString('en-IN')}`);
  }
  if (!String(reply).trim()) issues.push('Empty reply');

  return { ok: issues.length === 0, issues };
}
