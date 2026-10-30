# Agent Workflow

Example: "I want a gaming laptop under ₹70,000"

1. **classifyIntent** -> `shopping`
2. **shoppingAgent.understandRequest** -> `{ category: laptop, maxBudget: 70000, keywords: [gaming] }`
   (LLM returns JSON, validated with zod; if it fails, regex rules are used. Budgets are always double-checked by rules.)
3. **productSearchTool.searchProducts** -> laptops scored by keyword match
4. **budgetAgent.applyBudget** -> keeps products within budget; if none, relaxes by 15% or shows the cheapest and explains
5. **recommendationAgent.recommend** -> ranks (match 50%, rating 40%, budget fit 10%), LLM writes the reply from the top 3 only
6. Session memory saves the requirements and products.

## Follow-ups
- "make it under 66000" -> same category, new budget (`mergeRequirements`).
- "compare them" -> `comparisonAgent` on the last results; the table is built from data.
- A new category ("now show phones") starts a fresh search.

## Other flows
- **support**: extracts an order ID (`SM-1001`), reads the order, replies.
- **fashion**: suggests only items that exist in the catalog.
- **recommendationWorkflow**: personal picks from learned preferences (no LLM).
- **checkoutWorkflow**: prices the cart and applies offers (no payment).

## Debugging
In `npm run chat`, type `/debug` to see intent, requirements and which provider handled each step.
