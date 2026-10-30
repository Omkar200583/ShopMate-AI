# AI Architecture

```
frontend -> Express route -> handleMessage() -> orchestrator
                                   |
          +------------+-----------+-----------+-----------+
          |            |           |           |           |
      shopping      compare     support     fashion    chitchat
          |
 shoppingAgent -> productSearchTool -> budgetAgent -> recommendationAgent
```

- **Orchestrator** (`agents/orchestrator`): classifies intent (LLM, with rule fallback) and calls the right agent.
- **Agents** are modules with their own prompt and tools, not separate models.
- **Tools** (`tools/`) read data: products, prices, orders, cart, offers. The LLM never invents data; it only phrases what tools return.
- **Memory**: `conversationMemory` (chat history), `sessionMemory` (last search), `userPreferenceMemory` (long-term taste).
- **Workflows** (`workflows/`): fixed step sequences for shopping, recommendations and checkout.
- **Evaluation** (`evaluation/`): code checks that replies and recommendations match the real data.

Design rule: anything that must be correct (money, budget filtering, ranking, tables) is plain code. The LLM is used for language: understanding the message and writing the reply.
