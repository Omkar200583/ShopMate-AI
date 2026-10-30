import { chat } from '../../models/llm/modelRegistry.js';
import { SYSTEM_PROMPT } from '../../prompts/systemPrompt.js';
import { buildComparisonPrompt } from '../../prompts/comparisonPrompt.js';
import { buildComparison, comparisonToMarkdown } from '../../tools/productCompareTool.js';
import { shortError } from '../../utils/text.js';

/** Compares 2-3 products: the table is built from real data, the verdict is written by the LLM. */
export async function compareProducts({ message, products }, ctx) {
  const items = products.slice(0, 3);
  const comparison = buildComparison(items);
  const table = comparisonToMarkdown(comparison);

  let verdict;
  try {
    const { text, provider } = await chat(
      [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: buildComparisonPrompt({ message, comparison }) },
      ],
      { provider: ctx.provider },
    );
    ctx.trace.push(`compare: LLM (${provider})`);
    verdict = text;
  } catch (err) {
    ctx.trace.push(`compare: table only (${shortError(err)})`);
    verdict = `Comparing ${items.map((p) => p.name).join(', ')}:`;
  }

  return { comparison, reply: `${verdict}\n\n${table}` };
}
