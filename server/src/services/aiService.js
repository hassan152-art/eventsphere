/**
 * EventSphere AI Service
 *
 * Supports Google Gemini.
 *
 * IMPORTANT:
 * The Gemini API key stays on the server.
 * Never put GEMINI_API_KEY inside the React frontend.
 */

const isConfigured = () => {
  return Boolean(process.env.GEMINI_API_KEY);
};

/**
 * Main AI function
 *
 * @param {Object} params
 * @param {string} params.systemPrompt
 * @param {Array} params.messages
 * @returns {Promise<string>}
 */
async function getAIResponse({ systemPrompt, messages }) {
  if (!isConfigured()) {
    const error = new Error('GEMINI_NOT_CONFIGURED');
    error.code = 'GEMINI_NOT_CONFIGURED';
    throw error;
  }

  const provider = (process.env.AI_PROVIDER || 'gemini').toLowerCase();

  if (provider === 'gemini') {
    return callGemini({
      systemPrompt,
      messages,
    });
  }

  throw new Error(`Unsupported AI_PROVIDER: ${provider}`);
}

/**
 * Google Gemini API
 */
async function callGemini({ systemPrompt, messages }) {
  const model = process.env.AI_MODEL || 'gemini-2.5-flash';
  const apiKey = process.env.GEMINI_API_KEY;

  const contents = messages.map((message) => ({
    role: message.role === 'assistant' ? 'model' : 'user',
    parts: [
      {
        text: String(message.content || ''),
      },
    ],
  }));

  const url =
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent` +
    `?key=${encodeURIComponent(apiKey)}`;

  const response = await fetch(url, {
    method: 'POST',

    headers: {
      'Content-Type': 'application/json',
    },

    body: JSON.stringify({
      systemInstruction: {
        parts: [
          {
            text: systemPrompt,
          },
        ],
      },

      contents,

      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 700,
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();

    console.error('Gemini API Error:', errorText);

    throw new Error(
      `Gemini API error (${response.status}): ${errorText}`
    );
  }

  const data = await response.json();

  const reply =
    data?.candidates?.[0]?.content?.parts
      ?.map((part) => part.text || '')
      .join('')
      .trim();

  if (!reply) {
    throw new Error('Gemini returned an empty response');
  }

  return reply;
}

module.exports = {
  getAIResponse,
  isConfigured,
};