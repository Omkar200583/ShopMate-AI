import { getCart } from '../tools/cartTool.js';
import { searchOffers } from '../tools/offerSearchTool.js';

/**
 * Prices the cart and applies the best offer per line.
 * It does NOT take payment. PayPal comes later, in your backend, using `total` from here.
 */
export function runCheckoutWorkflow({ sessionId, couponCode = null }) {
  const cart = getCart(sessionId);
  if (cart.items.length === 0) return { ok: false, error: 'Your cart is empty.' };

  const lines = cart.items.map((line) => {
    const offers = searchOffers(line.category);
    // A coupon code only unlocks the offer with that code; store-wide ("all") offers apply automatically.
    const eligible = offers.filter((o) => o.category === 'all' || (couponCode && o.code === couponCode.toUpperCase()));
    const best = eligible[0] ?? null;
    const gross = line.price * line.quantity;
    const discount = best ? Math.round((gross * best.percent) / 100) : 0;
    return { ...line, gross, discount, offer: best ? best.title : null, net: gross - discount };
  });

  const subtotal = lines.reduce((s, l) => s + l.gross, 0);
  const discount = lines.reduce((s, l) => s + l.discount, 0);
  return { ok: true, lines, subtotal, discount, total: subtotal - discount };
}
