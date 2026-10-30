export function buildRecommendationPrompt({ message, requirements, products, note }) {
  return `Customer message: ${message}

Customer requirements (JSON): ${JSON.stringify(requirements)}
${note ? `Note about the search: ${note}\n` : ''}
Top matching products (JSON, already ranked, best first):
${JSON.stringify(products)}

Write a short recommendation:
1. One sentence acknowledging what they want.
2. Recommend these products in order, each as: name, price in ₹, and one reason based ONLY on the data above.
3. End with the single best pick and one short follow-up question.
Do not mention any product or spec that is not in the data.`;
}
