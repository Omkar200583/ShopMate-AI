// Small text helpers shared by agents and tools.

export const CATEGORY_KEYWORDS = {
  laptop: ['laptop', 'laptops', 'notebook', 'macbook', 'ultrabook'],
  smartphone: ['phone', 'phones', 'smartphone', 'smartphones', 'mobile', 'mobiles', 'android', 'iphone'],
  headphones: ['headphone', 'headphones', 'earbuds', 'earphone', 'earphones', 'airpods', 'headset', 'neckband'],
  shoes: ['shoe', 'shoes', 'sneaker', 'sneakers', 'sandals', 'footwear', 'boots'],
  watch: ['watch', 'watches', 'smartwatch', 'smartwatches'],
  clothing: ['shirt', 'shirts', 'tshirt', 'tshirts', 'jeans', 'jacket', 'jackets', 'hoodie', 'kurta', 'dress', 'clothes', 'clothing', 'trousers', 'saree'],
};

export const STOPWORDS = new Set([
  'i', 'me', 'my', 'a', 'an', 'the', 'is', 'are', 'am', 'was', 'be', 'to', 'for', 'of', 'in', 'on', 'at',
  'and', 'or', 'with', 'want', 'need', 'looking', 'look', 'buy', 'get', 'show', 'give', 'find', 'suggest',
  'please', 'pls', 'good', 'best', 'some', 'any', 'under', 'below', 'above', 'over', 'within', 'around',
  'budget', 'price', 'rs', 'inr', 'rupees', 'it', 'that', 'this', 'one', 'can', 'you', 'do', 'have', 'u',
  'than', 'less', 'more', 'upto', 'up', 'max', 'min', 'between', 'about',
  'something', 'anything', 'everything', 'thing', 'things', 'stuff', 'new', 'nice', 'latest', 'them', 'these',
  'those', 'make', 'compare', 'comparison', 'versus', 'hello', 'hi', 'hey',
]);

export function tokenize(text = '') {
  return (String(text).toLowerCase().match(/[\p{L}\p{N}]+(?:-[\p{L}\p{N}]+)*/gu) || []);
}

export function detectCategory(text = '') {
  const tokens = tokenize(text);
  let best = null;
  let bestCount = 0;
  for (const [category, words] of Object.entries(CATEGORY_KEYWORDS)) {
    const count = tokens.filter((t) => words.includes(t)).length;
    if (count > bestCount) {
      best = category;
      bestCount = count;
    }
  }
  return best;
}

export function normalizeCategory(value) {
  if (!value) return null;
  const v = String(value).trim().toLowerCase();
  if (!v) return null;
  if (CATEGORY_KEYWORDS[v]) return v;
  for (const [category, words] of Object.entries(CATEGORY_KEYWORDS)) {
    if (words.includes(v)) return category;
  }
  return v;
}

function toNumber(numStr, suffix) {
  const n = parseFloat(String(numStr).replace(/,/g, ''));
  if (!Number.isFinite(n)) return null;
  const s = (suffix || '').toLowerCase();
  if (s === 'k' || s === 'thousand') return Math.round(n * 1000);
  if (s === 'l' || s === 'lakh' || s === 'lac') return Math.round(n * 100000);
  return Math.round(n);
}

// ₹ / rs / inr prefix is optional; suffix k, thousand, l, lakh, lac is optional.
const AMT = String.raw`(?:₹|rs\.?|inr)?\s*(\d[\d,]*(?:\.\d+)?)\s*(k|lakh|lac|thousand|l)?(?![\p{L}\p{N}])`;

/**
 * "under ₹70,000", "below 70k", "between 40k and 60k", "above 1.5 lakh"
 * -> { minBudget, maxBudget }
 */
export function extractBudget(text = '') {
  const t = String(text);
  const flags = 'iu';

  const between = new RegExp(String.raw`between\s*${AMT}\s*(?:and|to|-)\s*${AMT}`, flags).exec(t);
  if (between) {
    const a = toNumber(between[1], between[2]);
    const b = toNumber(between[3], between[4]);
    if (a !== null && b !== null) return { minBudget: Math.min(a, b), maxBudget: Math.max(a, b) };
  }

  const max = new RegExp(
    String.raw`(?:under|below|less than|lower than|within|upto|up to|max(?:imum)?|not more than|around|about|budget(?: of| is)?)\s*${AMT}`,
    flags,
  ).exec(t);
  if (max) return { minBudget: null, maxBudget: toNumber(max[1], max[2]) };

  const min = new RegExp(
    String.raw`(?:above|over|more than|at least|minimum|min|greater than)\s*${AMT}`,
    flags,
  ).exec(t);
  if (min) return { minBudget: toNumber(min[1], min[2]), maxBudget: null };

  // Bare amount: only trust it when there is a currency symbol or a k/lakh suffix.
  const bare = new RegExp(AMT, 'giu');
  let m;
  while ((m = bare.exec(t)) !== null) {
    const hasCurrency = /(?:₹|rs\.?|inr)/i.test(m[0]);
    if (hasCurrency || m[2]) return { minBudget: null, maxBudget: toNumber(m[1], m[2]) };
  }
  return { minBudget: null, maxBudget: null };
}

export function formatINR(n) {
  if (n === null || n === undefined || Number.isNaN(Number(n))) return 'N/A';
  return `₹${Number(n).toLocaleString('en-IN')}`;
}

export function shortError(err) {
  return String(err?.message || err).split('\n')[0].slice(0, 160);
}
