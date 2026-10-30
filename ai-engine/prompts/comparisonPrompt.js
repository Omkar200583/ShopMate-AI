export function buildComparisonPrompt({ message, comparison }) {
  return `Customer message: ${message}

Comparison data (JSON):
${JSON.stringify(comparison)}

Write a verdict of 3 to 4 sentences: who each product suits, and which one you would pick for this customer and why.
Use ONLY the data above. Do not repeat the whole table, it is shown separately.`;
}
