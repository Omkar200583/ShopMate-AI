// Remembers what the customer was searching for, so follow-ups like
// "make it under 50k" or "compare them" work.

const store = new Map();

export function getSession(sessionId = 'default') {
  return store.get(sessionId) ?? { requirements: null, products: [] };
}

export function saveSession(sessionId = 'default', patch = {}) {
  store.set(sessionId, { ...getSession(sessionId), ...patch });
}

export function clearSession(sessionId = 'default') {
  store.delete(sessionId);
}
