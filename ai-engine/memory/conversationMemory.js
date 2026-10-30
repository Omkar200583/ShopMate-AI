// Short-term chat history, kept in RAM per session. Later you can swap the Map for MongoDB/Redis.

const MAX_MESSAGES = 12;
const store = new Map();

export function getHistory(sessionId = 'default') {
  return store.get(sessionId) ?? [];
}

export function addMessage(sessionId = 'default', role, content) {
  const list = store.get(sessionId) ?? [];
  list.push({ role, content });
  store.set(sessionId, list.slice(-MAX_MESSAGES));
}

export function clearHistory(sessionId = 'default') {
  store.delete(sessionId);
}
