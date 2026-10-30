// One small client for every provider that speaks the OpenAI-compatible
// /chat/completions protocol (Groq, Gemini, OpenAI and Ollama all do).
// Uses Node's built-in fetch, so no provider SDK is needed.

export class LLMError extends Error {
  constructor(message, { provider = null, status = null } = {}) {
    super(message);
    this.name = 'LLMError';
    this.provider = provider;
    this.status = status;
  }
}

export function extractJson(text) {
  let t = String(text).trim();
  t = t.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/i, '').trim();
  try {
    return JSON.parse(t);
  } catch {
    const start = t.indexOf('{');
    const end = t.lastIndexOf('}');
    if (start !== -1 && end > start) {
      return JSON.parse(t.slice(start, end + 1));
    }
    throw new LLMError('Model did not return valid JSON');
  }
}

export class OpenAICompatibleModel {
  constructor({
    name,
    apiKey = '',
    baseUrl,
    model,
    requiresKey = true,
    timeoutMs = 30000,
    defaults = {},
    maxTokensParam = 'max_tokens',
  }) {
    this.name = name;
    this.apiKey = apiKey;
    this.baseUrl = baseUrl.replace(/\/+$/, '');
    this.model = model;
    this.requiresKey = requiresKey;
    this.timeoutMs = timeoutMs;
    this.defaults = defaults;
    this.maxTokensParam = maxTokensParam;
  }

  isAvailable() {
    if (!this.requiresKey) return true;
    return Boolean(this.apiKey) && !/^your_/i.test(this.apiKey);
  }

  async _post(body) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);
    try {
      const headers = { 'Content-Type': 'application/json' };
      if (this.apiKey) headers.Authorization = `Bearer ${this.apiKey}`;

      const res = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
        signal: controller.signal,
      });
      const text = await res.text();
      if (!res.ok) {
        throw new LLMError(`${this.name} HTTP ${res.status}: ${text.slice(0, 300)}`, {
          provider: this.name,
          status: res.status,
        });
      }
      return JSON.parse(text);
    } catch (err) {
      if (err instanceof LLMError) throw err;
      if (err.name === 'AbortError') {
        throw new LLMError(`${this.name} timed out after ${this.timeoutMs} ms`, { provider: this.name });
      }
      throw new LLMError(`${this.name} request failed: ${err.message}`, { provider: this.name });
    } finally {
      clearTimeout(timer);
    }
  }

  async chat(messages, { temperature, maxTokens, json = false } = {}) {
    const body = {
      model: this.model,
      messages,
      temperature: temperature ?? this.defaults.temperature ?? 0.4,
      [this.maxTokensParam]: maxTokens ?? this.defaults.maxTokens ?? 700,
    };
    if (json) body.response_format = { type: 'json_object' };

    let data;
    try {
      data = await this._post(body);
    } catch (err) {
      // Some models reject response_format; retry once without it.
      if (json && err.status === 400) {
        delete body.response_format;
        data = await this._post(body);
      } else {
        throw err;
      }
    }

    const content = data?.choices?.[0]?.message?.content;
    if (typeof content !== 'string' || !content.trim()) {
      throw new LLMError(`${this.name} returned an empty response`, { provider: this.name });
    }
    return content.trim();
  }

  async chatJson(messages, opts = {}) {
    const raw = await this.chat(messages, { ...opts, json: true });
    return extractJson(raw);
  }
}
