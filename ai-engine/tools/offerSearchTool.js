// DEMO offers. Replace with your real offers/coupons collection.
export const sampleOffers = [
  { id: 'OFF-SOUND10', code: 'SOUND10', category: 'headphones', percent: 10, title: '10% off headphones' },
  { id: 'OFF-LAP5', code: 'LAP5', category: 'laptop', percent: 5, title: '5% off laptops' },
  { id: 'OFF-RUN15', code: 'RUN15', category: 'shoes', percent: 15, title: '15% off shoes' },
  { id: 'OFF-ALL3', code: 'ALL3', category: 'all', percent: 3, title: '3% off everything' },
];

/** Offers that apply to a category (plus store-wide ones). Best discount first. */
export function searchOffers(category = null) {
  return sampleOffers
    .filter((o) => o.category === 'all' || !category || o.category === category)
    .sort((a, b) => b.percent - a.percent);
}
