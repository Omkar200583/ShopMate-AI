# API Integration (Express)

```js
import { handleMessage } from '../ai-engine/index.js';

app.post('/api/ai/chat', async (req, res) => {
  try {
    const { message, sessionId } = req.body;
    const result = await handleMessage({ message, sessionId, userId: req.user?.id });
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});
```

## Response shape
```json
{
  "reply": "text to show",
  "intent": "shopping | compare | support | fashion | chitchat",
  "products": [{ "id": "...", "name": "...", "price": 64990, "rating": 4.4 }],
  "requirements": { "category": "laptop", "maxBudget": 70000 },
  "comparison": null,
  "order": null,
  "trace": ["intent: shopping (LLM groq)", "..."]
}
```
Render `products` as cards in React; do not parse `reply` for data. Hide `trace` in production.

## Notes
- `sessionId` keeps the conversation separate per user. Use the logged-in user's ID or a browser session ID.
- Memory is in RAM: it resets when the server restarts and does not work across multiple server instances. Move it to MongoDB or Redis before scaling.
- Add rate limiting on this route; every message can cost 2 to 3 LLM calls.
- Keep API keys only in the backend `.env`, never in React.
