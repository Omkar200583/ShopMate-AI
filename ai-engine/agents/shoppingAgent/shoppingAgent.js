import { z } from 'zod';
import { chatJson } from '../../models/llm/modelRegistry.js';
import { EXTRACT_PROMPT } from '../../prompts/shoppingPrompt.js';
import {
  detectCategory,
  extractBudget,
  normalizeCategory,
  shortError,
  tokenize,
  STOPWORDS,
  CATEGORY_KEYWORDS,
} from '../../utils/text.js';

// Accepts 70000, "70000", "₹70,000" or null. Anything else fails validation.
const money = z.preprocess((v) => {
  if (v === null || v === undefined || v === '') return null;
  return Number(String(v).replace(/[₹,\s]/g, ''));
}, z.number().finite().nonnegative().nullable());

const textOrNull = z.preprocess(
  (v) => (typeof v === 'string' && v.trim() ? v.trim() : null),
  z.string().nullable(),
);

const stringList = z.preprocess(
  (v) => (Array.isArray(v) ? v.map((x) => String(x).toLowerCase().trim()).filter(Boolean) : []),
  z.array(z.string()),
);

const RequirementsSchema = z.object({
  category: textOrNull,
  brand: textOrNull,
  minBudget: money,
  maxBudget: money,
  useCase: textOrNull,
  features: stringList,
  keywords: stringList,
});

function finalize(raw) {
  const parsed = RequirementsSchema.parse(raw);
  return {
    ...parsed,
    category: normalizeCategory(parsed.category),
    features: [...new Set(parsed.features)],
    keywords: [...new Set(parsed.keywords)],
  };
}

// ---- Rule-based fallback: works with no LLM at all ----
const ALL_CATEGORY_WORDS = new Set(Object.values(CATEGORY_KEYWORDS).flat());

export function heuristicRequirements(message) {
  const { minBudget, maxBudget } = extractBudget(message);
  const category = detectCategory(message);
  const words = tokenize(message).filter(
    (w) => !STOPWORDS.has(w) && !ALL_CATEGORY_WORDS.has(w) && !/^\d/.test(w) && w.length > 2,
  );
  return {
    category,
    brand: null,
    minBudget,
    maxBudget,
    useCase: null,
    features: [],
    keywords: [...new Set(words)],
  };
}

/**
 * Follow-ups like "make it under 50k" keep the earlier category and features.
 * A new category starts a fresh search.
 */
export function mergeRequirements(previous, next) {
  if (!previous) return next;
  if (next.category && previous.category && next.category !== previous.category) return next;

  return {
    category: next.category ?? previous.category,
    brand: next.brand ?? previous.brand,
    minBudget: next.minBudget ?? previous.minBudget,
    maxBudget: next.maxBudget ?? previous.maxBudget,
    useCase: next.useCase ?? previous.useCase,
    features: [...new Set([...previous.features, ...next.features])],
    keywords: [...new Set([...previous.keywords, ...next.keywords])],
  };
}

/** Turns a customer message into structured requirements. Returns { raw, requirements }. */
export async function understandRequest(message, previous, ctx) {
  let raw;
  try {
    const { data, provider } = await chatJson(
      [
        { role: 'system', content: EXTRACT_PROMPT },
        { role: 'user', content: message },
      ],
      { provider: ctx.provider, temperature: 0, maxTokens: 300 },
    );
    raw = finalize(data);
    ctx.trace.push(`understand: LLM (${provider})`);
  } catch (err) {
    raw = heuristicRequirements(message);
    ctx.trace.push(`understand: rules (${shortError(err)})`);
  }

  // Safety net: the rules are very reliable for money, so fill gaps the LLM left.
  if (raw.maxBudget === null && raw.minBudget === null) {
    const b = extractBudget(message);
    raw = { ...raw, minBudget: b.minBudget, maxBudget: b.maxBudget };
  }
  if (!raw.category) raw = { ...raw, category: detectCategory(message) };

  return { raw, requirements: mergeRequirements(previous, raw) };
}
