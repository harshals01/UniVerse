/**
 * services/aiService.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Generic AI service layer for UniVerse.
 *
 * Architecture decisions:
 *  - ONE public function: aiService.generate(prompt, options)
 *  - All modules (notes, summarize, quiz) call the same function
 *  - Uses Groq API (LLaMA 3) for extremely fast, real-time generation
 *  - Fails fast: throws an error if GROQ_API_KEY is missing
 *
 * Supported modes (via options.mode):
 *  'notes'     → generate structured study notes from a topic/text
 *  'summarize' → condense existing content into bullet summary
 *  'quiz'      → generate Q&A pairs (future use)
 * ─────────────────────────────────────────────────────────────────────────────
 */


// ── Main public interface ─────────────────────────────────────────────────────
const aiService = {
  /**
   * Generate AI content from a prompt OR a full conversation history.
   *
   * @param {string|null} prompt         — Single-shot prompt (legacy / Notes workspace)
   * @param {object}      options
   * @param {string}      options.mode          — 'chat' | 'notes' | 'summarize' | 'quiz'
   * @param {Array}       [options.messages]    — Full conversation history for multi-turn chat
   *                                              [{role:'user'|'assistant', content:string}, …]
   * @param {string}      [options.systemContext] — Extra system context to prepend
   * @returns {Promise<{ content: string, tokensUsed: number, provider: string }>}
   */
  generate: async (prompt, options = {}) => {
    const { mode = 'notes', messages, systemContext = '' } = options;

    // ── Env check ────────────────────────────────────────────────────────────
    console.log('[aiService] DEBUG_ENV:', {
      hasKey: !!process.env.GROQ_API_KEY,
      keyPreview: process.env.GROQ_API_KEY?.slice(0, 5) ?? '(none)',
      multiTurn: !!messages?.length,
    });

    if (!process.env.GROQ_API_KEY) {
      throw new Error('GROQ API KEY NOT FOUND');
    }

    // Multi-turn path: messages array takes priority over single prompt
    if (messages && messages.length > 0) {
      console.log('[aiService] USING GROQ — multi-turn, turns:', messages.length);
      return await aiService._groqGenerate(null, { mode, messages, systemContext });
    }

    // Single-prompt path (backward compat)
    if (!prompt || prompt.trim().length < 3) {
      throw new Error('Prompt must be at least 3 characters long');
    }
    console.log('[aiService] USING GROQ — single prompt');
    return await aiService._groqGenerate(prompt, { mode, systemContext });
  },

  // ── Mock provider removed ───────────────────────────────────────────────────

  // ── Groq provider (active when GROQ_API_KEY is set) ─────────────────────────
  /**
   * @param {string|null} prompt         — null when using multi-turn messages
   * @param {object}      opts
   * @param {string}      opts.mode
   * @param {Array}       [opts.messages] — Full [{role, content}] history
   * @param {string}      [opts.systemContext]
   */
  _groqGenerate: async (prompt, { mode, messages, systemContext = '' }) => {
    const Groq = (await import('groq-sdk')).default;
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    // ── Build system message based on mode ────────────────────────────────────
    let systemMessage;
    if (mode === 'notes') {
      systemMessage = `You are an expert tutor. Create clear, comprehensive, and highly structured markdown study notes based on the prompt. 
Organize the content logically using your own natural headings, bullet points, and key takeaways to make the material easy to study and understand.`;
    } else if (mode === 'summarize') {
      systemMessage = 'Summarize the provided content clearly and concisely using bullet points.';
    } else if (mode === 'quiz') {
      systemMessage = 'Create a short practice quiz with answers based on the provided topic.';
    } else {
      // 'chat' — general conversational assistant
      systemMessage = `You are UniVerse AI, a smart and friendly campus assistant for college students. 
You help with study questions, campus life, notes, explanations, and general advice. 
Respond clearly and helpfully. Use markdown formatting when it improves readability.`;
    }

    // Inject optional section context into system message
    const fullSystem = systemContext
      ? `${systemMessage}\n\nAdditional context: ${systemContext}`
      : systemMessage;

    // ── Build the messages payload ────────────────────────────────────────────
    // Multi-turn: prepend system message and use the full history
    // Single-turn: classic [system, user] pair
    const groqMessages = messages && messages.length > 0
      ? [{ role: 'system', content: fullSystem }, ...messages]
      : [
          { role: 'system', content: fullSystem },
          { role: 'user',   content: prompt },
        ];

    const response = await groq.chat.completions.create({
      messages: groqMessages,
      model: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
      temperature: 0.7,
    });

    // ── Guard: hard-throw on empty content ───────────────────────────────────
    const content = response.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error('[aiService] Empty response from Groq — check model name or API quota');
    }

    return {
      content,
      tokensUsed: response.usage?.total_tokens || 0,
      provider: 'groq',
      mode,
    };
  },
};

export default aiService;
