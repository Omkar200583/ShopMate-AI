import { getModel } from '../llm/modelRegistry.js';

/**
 * Describes a product photo (for "find something like this" searches).
 * imageUrl: a public https URL or a data: URL (base64).
 * You must pass a provider and a vision-capable model name, e.g. describeImage(url, { provider: 'openai', model: 'gpt-4o-mini' }).
 * NOTE: not tested against a live provider yet.
 */
export async function describeImage(imageUrl, { provider = 'openai', model, prompt } = {}) {
  const llm = getModel(provider);
  if (!llm.isAvailable()) throw new Error(`Provider "${provider}" is not configured`);

  const original = llm.model;
  if (model) llm.model = model;
  try {
    return await llm.chat(
      [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text:
                prompt ??
                'Describe this product in one line: type, color, style, and 3 search keywords. Do not guess a brand.',
            },
            { type: 'image_url', image_url: { url: imageUrl } },
          ],
        },
      ],
      { temperature: 0, maxTokens: 150 },
    );
  } finally {
    llm.model = original;
  }
}
