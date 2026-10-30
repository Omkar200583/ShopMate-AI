import { sampleOrders } from '../data/sampleProducts.js';

const ORDER_ID = /\b(?:SM|ORD)[-_ ]?\d{3,}\b/i;

export function extractOrderId(text = '') {
  const m = ORDER_ID.exec(text);
  if (!m) return null;
  const digits = m[0].replace(/\D/g, '');
  return `SM-${digits}`;
}

/** DEMO: reads sample orders. Replace with a query on your real orders collection. */
export async function trackOrder(orderId) {
  if (!orderId) return null;
  return sampleOrders.find((o) => o.id === orderId.toUpperCase()) ?? null;
}
