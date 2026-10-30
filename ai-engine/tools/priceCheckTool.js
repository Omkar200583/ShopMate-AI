import { loadProducts } from './productSearchTool.js';

/** Looks up the current price of a product by (part of) its name or its id. */
export async function checkPrice(query) {
  const q = String(query ?? '').trim().toLowerCase();
  if (!q) return null;
  const all = await loadProducts(null);
  const hit = all.find((p) => p.id.toLowerCase() === q || p.name.toLowerCase().includes(q));
  return hit ? { id: hit.id, name: hit.name, price: hit.price } : null;
}
