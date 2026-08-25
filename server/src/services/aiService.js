/**
 * aiService.js
 * -----------------------------------------------------------------------
 * Abstraction layer for the EventSphere AI Copilot (SRS section 23).
 *
 * The frontend NEVER talks to an LLM directly and NEVER sees an API key.
 * It calls POST /api/ai/chat on this server; this service builds a
 * role-aware system prompt (grounded in real DB context gathered by
 * aiController), calls the configured provider, and returns plain text.
 *
 * Swap providers by changing AI_PROVIDER / AI_API_KEY / AI_MODEL in .env.
 * If no key is configured, getAIResponse() throws AI_NOT_CONFIGURED so the
 * controller can fall back to the rule-based responder in aiController.js.
 * -----------------------------------------------------------------------
 */

const isConfigured = () => Boolean(process.env.AI_API_KEY);

/**
 * @param {Object} params
 * @param {string} params.systemPrompt - grounding context + instructions
 * @param {Array<{role: 'user'|'assistant', content: string}>} params.messages
 * @returns {Promise<string>} assistant reply text
 */
async function getAIResponse({ systemPrompt, messages }) {
  if (!isConfigured()) {
    const err = new Error('AI_NOT_CONFIGURED');
    err.code = 'AI_NOT_CONFIGURED';
    throw err;
  }

  const provider = (process.env.AI_PROVIDER || 'anthropic').toLowerCase();

  if (provider === 'anthropic') {
    return callAnthropic({ systemPrompt, messages });
  }
  if (provider === 'openai') {
    return callOpenAI({ systemPrompt, messages });
  }

  throw new Error(`Unsupported AI_PROVIDER: ${provider}`);
}

async function callAnthropic({ systemPrompt, messages }) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.AI_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: process.env.AI_MODEL || 'claude-sonnet-4-6',
      max_tokens: 700,
      system: systemPrompt,
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Anthropic API error (${res.status}): ${text}`);
  }

  const data = await res.json();
  const textBlock = (data.content || []).find((b) => b.type === 'text');
  return textBlock ? textBlock.text : '';
}

async function callOpenAI({ systemPrompt, messages }) {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.AI_API_KEY}`,
    },
    body: JSON.stringify({
      model: process.env.AI_MODEL || 'gpt-4o-mini',
      messages: [{ role: 'system', content: systemPrompt }, ...messages],
      max_tokens: 700,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`OpenAI API error (${res.status}): ${text}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content || '';
}

module.exports = { getAIResponse, isConfigured };
