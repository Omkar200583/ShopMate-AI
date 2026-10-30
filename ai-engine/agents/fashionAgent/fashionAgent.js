import { chat } from '../../models/llm/modelRegistry.js';
import { SYSTEM_PROMPT } from '../../prompts/systemPrompt.js';
import { loadProducts } from '../../tools/productSearchTool.js';
import { formatINR, shortError } from '../../utils/text.js';

const FASHION_CATEGORIES = new Set(['clothing', 'shoes', 'watch']);

/** Styling advice built from items that really exist in the catalog. */
export async function handleFashion({ message }, ctx) {
  const all = await loadProducts(null);
  const items = all
    .filter((p) => FASHION_CATEGORIES.has(p.category))
    .map((p) => ({ name: p.name, category: p.category, price: p.price, tags: p.tags }));

  try {
    const { text, provider } = await chat(
      [
        { role: 'system', content: SYSTEM_PROMPT },
        {
          role: 'user',
          content:
            `Customer message: ${message}\n\nCatalog items you may suggest (JSON): ${JSON.stringify(items)}\n\n` +
            `Give a short outfit suggestion (max 5 lines). Suggest only items from the list, with their price. ` +
            `If nothing fits, give general styling tips and say the store has no matching item.`,
        },
      ],
      { provider: ctx.provider, maxTokens: 400 },
    );
    ctx.trace.push(`fashion: LLM (${provider})`);
    return { reply: text };
  } catch (err) {
    ctx.trace.push(`fashion: template (${shortError(err)})`);
    const picks = items.slice(0, 3).map((p) => `- ${p.name} (${formatINR(p.price)})`);
    return { reply: `Here are some items from our store you could style:\n${picks.join('\n')}` };
  }
}
