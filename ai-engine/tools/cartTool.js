import { loadProducts } from './productSearchTool.js';

// In-memory carts per session. Replace with your real cart API/collection when integrating.
const carts = new Map();

const cartOf = (sessionId) => carts.get(sessionId) ?? [];

export async function addToCart(sessionId, productId, quantity = 1) {
  const qty = Math.floor(Number(quantity));
  if (!Number.isFinite(qty) || qty < 1 || qty > 10) throw new Error('quantity must be between 1 and 10');

  const product = (await loadProducts(null)).find((p) => p.id === productId);
  if (!product) throw new Error(`Unknown product "${productId}"`);

  const cart = [...cartOf(sessionId)];
  const line = cart.find((l) => l.productId === productId);
  if (line) line.quantity = Math.min(10, line.quantity + qty);
  else cart.push({ productId, name: product.name, category: product.category, price: product.price, quantity: qty });
  carts.set(sessionId, cart);
  return getCart(sessionId);
}

export function removeFromCart(sessionId, productId) {
  carts.set(sessionId, cartOf(sessionId).filter((l) => l.productId !== productId));
  return getCart(sessionId);
}

export function clearCart(sessionId) {
  carts.delete(sessionId);
}

export function getCart(sessionId) {
  const items = cartOf(sessionId).map((l) => ({ ...l }));
  const subtotal = items.reduce((s, l) => s + l.price * l.quantity, 0);
  return { items, subtotal };
}
