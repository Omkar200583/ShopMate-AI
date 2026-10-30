// Long-term preferences per user, kept in RAM. Persist to MongoDB (users collection) later.

const store = new Map();

const empty = () => ({ categories: {}, brands: {}, maxBudgetByCategory: {} });

export function getPreferences(userId) {
  return store.get(userId) ?? empty();
}

/** Learns from a finished search (call with the requirements the shopping agent produced). */
export function learnFromRequirements(userId, requirements) {
  if (!userId || !requirements) return;
  const prefs = structuredClone(getPreferences(userId));
  const { category, brand, maxBudget } = requirements;
  if (category) prefs.categories[category] = (prefs.categories[category] ?? 0) + 1;
  if (brand) prefs.brands[brand] = (prefs.brands[brand] ?? 0) + 1;
  if (category && maxBudget) prefs.maxBudgetByCategory[category] = maxBudget;
  store.set(userId, prefs);
}

export function favoriteBrand(userId) {
  const entries = Object.entries(getPreferences(userId).brands);
  return entries.sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
}

export function clearPreferences(userId) {
  store.delete(userId);
}
