import { z } from 'zod';
import { chat, chatJson } from '../../models/llm/modelRegistry.js';
import { SYSTEM_PROMPT } from '../../prompts/systemPrompt.js';
import { INTENT_PROMPT } from '../../prompts/shoppingPrompt.js';
import { addMessage, getHistory } from '../../memory/conversationMemory.js';
import { learnFromRequirements } from '../../memory/userPreferenceMemory.js';
import { runShoppingWorkflow } from '../../workflows/shoppingWorkflow.js';
import { handleSupport } from '../supportAgent/supportAgent.js';
import { handleFashion } from '../fashionAgent/fashionAgent.js';
import { extractOrderId } from '../../tools/orderTrackingTool.js';
import { shortError } from '../../utils/text.js';

export const INTENTS = ['shopping', 'compare', 'support', 'fashion', 'chitchat'];
const IntentSchema = z.object({ intent: z.enum(INTENTS) });

export function heuristicIntent(message) {
  const m = message.toLowerCase();
  if (extractOrderId(message) || /\b(track|tracking|order status|where is my order|refund|return|cancel|complaint)\b/.test(m)) return 'support';
  if (/\b(compare|comparison|versus|vs\.?|difference between)\b/.test(m)) return 'compare';
  if (/\b(outfit|fashion|style me|what to wear|styling)\b/.test(m)) return 'fashion';
  if (/^(hi+|hello|hey|namaste|thanks|thank you|good (morning|afternoon|evening))\b/.test(m) && m.length < 40) return 'chitchat';
  return 'shopping';
}

export async function classifyIntent(message, ctx) {
  try {
    const { data, provider } = await chatJson(
      [
        { role: 'system', content: INTENT_PROMPT },
        { role: 'user', content: message },
      ],
      { provider: ctx.provider, temperature: 0, maxTokens: 40 },
    );
    const { intent } = IntentSchema.parse(data);
    ctx.trace.push(`intent: ${intent} (LLM ${provider})`);
    return intent;
  } catch (err) {
    const intent = heuristicIntent(message);
    ctx.trace.push(`intent: ${intent} (rules; ${shortError(err)})`);
    return intent;
  }
}

async function handleChitchat(message, ctx) {
  try {
    const { text, provider } = await chat(
      [
        { role: 'system', content: SYSTEM_PROMPT },
        ...getHistory(ctx.sessionId).slice(-6),
        { role: 'user', content: message },
      ],
      { provider: ctx.provider, maxTokens: 200 },
    );
    ctx.trace.push(`chitchat: LLM (${provider})`);
    return { reply: text };
  } catch (err) {
    ctx.trace.push(`chitchat: canned (${shortError(err)})`);
    return {
      reply: 'Hi! I am ShopMate AI. Tell me what you want to buy and your budget, for example "gaming laptop under ₹70,000".',
    };
  }
}

/**
 * Main entry point of the AI engine.
 * message -> intent -> the right agent/workflow -> { reply, intent, products, ... }
 */
export async function handleMessage({ message, sessionId = 'default', provider = null, userId = null } = {}) {
  const text = typeof message === 'string' ? message.trim() : '';
  if (!text) throw new Error('handleMessage: "message" must be a non-empty string');

  const ctx = { sessionId, provider, trace: [] };
  const intent = await classifyIntent(text, ctx);

  let result;
  switch (intent) {
    case 'support':
      result = await handleSupport({ message: text }, ctx);
      break;
    case 'fashion':
      result = await handleFashion({ message: text }, ctx);
      break;
    case 'chitchat':
      result = await handleChitchat(text, ctx);
      break;
    case 'compare':
      result = await runShoppingWorkflow({ message: text, mode: 'compare' }, ctx);
      break;
    default:
      result = await runShoppingWorkflow({ message: text, mode: 'shop' }, ctx);
  }

  if (userId && result.products?.length) learnFromRequirements(userId, result.requirements);

  addMessage(sessionId, 'user', text);
  addMessage(sessionId, 'assistant', result.reply);

  return {
    reply: result.reply,
    intent,
    products: result.products ?? [],
    requirements: result.requirements ?? null,
    comparison: result.comparison ?? null,
    order: result.order ?? null,
    trace: ctx.trace,
  };
}
