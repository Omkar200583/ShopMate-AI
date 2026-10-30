import { chat } from '../../models/llm/modelRegistry.js';
import { SYSTEM_PROMPT } from '../../prompts/systemPrompt.js';
import { extractOrderId, trackOrder } from '../../tools/orderTrackingTool.js';
import { formatINR, shortError } from '../../utils/text.js';

function orderTemplate(order) {
  return (
    `Order ${order.id}: ${order.status}.\n` +
    `Items: ${order.items.join(', ')} (total ${formatINR(order.total)}).\n` +
    `Carrier: ${order.carrier}. Expected: ${order.eta}.`
  );
}

export async function handleSupport({ message }, ctx) {
  const orderId = extractOrderId(message);

  if (!orderId) {
    return {
      reply:
        'I can check an order for you. Please share your order ID (for example SM-1001). ' +
        'For refunds or returns, I can only help once the store policy is connected to me.',
    };
  }

  const order = await trackOrder(orderId);
  if (!order) {
    return { reply: `I could not find an order with ID ${orderId}. Please double-check the ID.` };
  }

  try {
    const { text, provider } = await chat(
      [
        { role: 'system', content: SYSTEM_PROMPT },
        {
          role: 'user',
          content: `Customer message: ${message}\n\nOrder data (JSON): ${JSON.stringify(order)}\n\nTell the customer the order status in 2 to 3 sentences. Use only this data.`,
        },
      ],
      { provider: ctx.provider, maxTokens: 250 },
    );
    ctx.trace.push(`support: LLM (${provider})`);
    return { reply: text, order };
  } catch (err) {
    ctx.trace.push(`support: template (${shortError(err)})`);
    return { reply: orderTemplate(order), order };
  }
}
