import { formatINR } from '../utils/text.js';

/**
 * Builds a side-by-side comparison from real product data (no LLM involved).
 * Returns { columns: [names], rows: [{ label, values: [..] }] }
 */
export function buildComparison(products) {
  const columns = products.map((p) => p.name);
  const rows = [
    { label: 'Price', values: products.map((p) => formatINR(p.price)) },
    { label: 'Rating', values: products.map((p) => (p.rating ? `${p.rating} / 5` : 'N/A')) },
    { label: 'Brand', values: products.map((p) => p.brand || 'N/A') },
  ];

  const specKeys = [...new Set(products.flatMap((p) => Object.keys(p.specs ?? {})))];
  for (const key of specKeys) {
    rows.push({ label: key, values: products.map((p) => p.specs?.[key] ?? '-') });
  }
  return { columns, rows };
}

export function comparisonToMarkdown({ columns, rows }) {
  const header = `| Feature | ${columns.join(' | ')} |`;
  const divider = `|${'---|'.repeat(columns.length + 1)}`;
  const body = rows.map((r) => `| ${r.label} | ${r.values.join(' | ')} |`);
  return [header, divider, ...body].join('\n');
}
