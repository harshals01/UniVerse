/**
 * services/aiService.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Generic AI service layer for UniVerse with Groq & Google Gemini fallback.
 * ─────────────────────────────────────────────────────────────────────────────
 */

const aiService = {
  /**
   * Generate AI content from a prompt OR a full conversation history.
   *
   * @param {string|null} prompt         — Single-shot prompt (legacy / Notes workspace)
   * @param {object}      options
   * @param {string}      options.mode          — 'chat' | 'notes' | 'summarize' | 'quiz'
   * @param {Array}       [options.messages]    — Full conversation history for multi-turn chat
   * @param {string}      [options.systemContext] — Extra system context to prepend
   * @returns {Promise<{ content: string, tokensUsed: number, provider: string }>}
   */
  generate: async (prompt, options = {}) => {
    const { mode = 'notes', messages, systemContext = '' } = options;

    if (!prompt && (!messages || messages.length === 0)) {
      throw new Error('Prompt or messages history is required');
    }
    if (prompt && prompt.trim().length < 3 && (!messages || messages.length === 0)) {
      throw new Error('Prompt must be at least 3 characters long');
    }

    // Try Groq first if key exists
    if (process.env.GROQ_API_KEY) {
      try {
        return await aiService._groqGenerate(prompt, { mode, messages, systemContext });
      } catch (err) {
        console.error('[aiService] Groq failed:', err.message);
        if (process.env.GEMINI_API_KEY) {
          console.log('[aiService] Falling back to Google Gemini...');
          return await aiService._geminiGenerate(prompt, { mode, messages, systemContext });
        }
        throw err;
      }
    }

    // Direct Gemini path
    if (process.env.GEMINI_API_KEY) {
      return await aiService._geminiGenerate(prompt, { mode, messages, systemContext });
    }

    throw new Error('No AI API keys configured (GROQ_API_KEY or GEMINI_API_KEY)');
  },

  // ── Helper to build system instructions ──────────────────────────────────
  _getSystemInstruction: (mode, systemContext = '') => {
    let systemMessage;
    if (mode === 'notes') {
      systemMessage = `You are an expert tutor. Create clear, comprehensive, and highly structured markdown study notes based on the prompt. 
Organize the content logically using your own natural headings, bullet points, and key takeaways to make the material easy to study and understand.`;
    } else if (mode === 'summarize') {
      systemMessage = 'Summarize the provided content clearly and concisely using bullet points.';
    } else if (mode === 'quiz') {
      systemMessage = 'Create a short practice quiz with answers based on the provided topic.';
    } else {
      systemMessage = `You are UniVerse AI, a smart and friendly campus assistant for college students. 
You help with study questions, campus life, notes, explanations, and general advice. 
Respond clearly and helpfully. Use markdown formatting when it improves readability.`;
    }

    return systemContext
      ? `${systemMessage}\n\nAdditional context: ${systemContext}`
      : systemMessage;
  },

  // ── Groq provider ────────────────────────────────────────────────────────
  _groqGenerate: async (prompt, { mode, messages, systemContext = '' }) => {
    const Groq = (await import('groq-sdk')).default;
    const apiKey = (process.env.GROQ_API_KEY || '').trim();
    const groq = new Groq({ apiKey });

    const fullSystem = aiService._getSystemInstruction(mode, systemContext);

    const groqMessages = messages && messages.length > 0
      ? [{ role: 'system', content: fullSystem }, ...messages]
      : [
          { role: 'system', content: fullSystem },
          { role: 'user',   content: prompt },
        ];

    const configuredModel = process.env.GROQ_MODEL?.trim();
    const modelsToTry = [
      configuredModel,
      'llama-3.1-8b-instant',
      'llama-3.3-70b-versatile',
      'llama-3.3-70b-specdec',
      'gemma2-9b-it',
      'mixtral-8x7b-32768',
    ].filter(Boolean);

    const uniqueModels = [...new Set(modelsToTry)];
    let lastError = null;

    for (const model of uniqueModels) {
      try {
        console.log(`[aiService] Trying Groq model: ${model}`);
        const response = await groq.chat.completions.create({
          messages: groqMessages,
          model,
          temperature: 0.7,
        });

        const content = response.choices?.[0]?.message?.content;
        if (content) {
          return {
            content,
            tokensUsed: response.usage?.total_tokens || 0,
            provider: `groq (${model})`,
            mode,
          };
        }
      } catch (err) {
        lastError = err;
        console.warn(`[aiService] Groq model ${model} failed: ${err.message}`);
        // Only cycle to next model if model not found / 404
        if (!err.message?.includes('404') && !err.message?.includes('model_not_found')) {
          throw err;
        }
      }
    }

    throw lastError || new Error('All Groq models failed');
  },

  // ── Google Gemini fallback provider ──────────────────────────────────────
  _geminiGenerate: async (prompt, { mode, messages, systemContext = '' }) => {
    const { GoogleGenerativeAI } = await import('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY?.trim());
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const fullSystem = aiService._getSystemInstruction(mode, systemContext);

    let content = '';
    if (messages && messages.length > 0) {
      const chat = model.startChat({
        history: [
          {
            role: 'user',
            parts: [{ text: `Instructions: ${fullSystem}` }],
          },
          {
            role: 'model',
            parts: [{ text: 'Understood. I will follow these instructions.' }],
          },
          ...messages.slice(0, -1).map(m => ({
            role: m.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: m.content }],
          })),
        ],
      });
      const lastMsg = messages[messages.length - 1].content;
      const result = await chat.sendMessage(lastMsg);
      content = result.response.text();
    } else {
      const combinedPrompt = `${fullSystem}\n\nUser Request: ${prompt}`;
      const result = await model.generateContent(combinedPrompt);
      content = result.response.text();
    }

    return {
      content,
      tokensUsed: 0,
      provider: 'gemini-1.5-flash',
      mode,
    };
  },
};

export default aiService;
