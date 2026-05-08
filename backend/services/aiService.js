/**
 * services/aiService.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Generic AI service layer for UniVerse.
 *
 * Architecture decisions:
 *  - ONE public function: aiService.generate(prompt, options)
 *  - All modules (notes, summarize, quiz) call the same function
 *  - Swap provider in ONE place — controller never changes
 *  - Mock mode is production-quality: structured, formatted, realistic
 *
 * To switch to real OpenAI later:
 *  1. npm install openai
 *  2. Add OPENAI_API_KEY to .env
 *  3. Replace _mockGenerate() body with real API call
 *  4. Nothing else changes — controllers are untouched
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
   * Generate AI content from a prompt.
   *
   * @param {string} prompt         — User's topic, question, or raw notes text
   * @param {object} options
   * @param {string} options.mode   — 'notes' | 'summarize' | 'quiz' (default: 'notes')
   * @param {number} options.delay  — Simulated latency in ms (default: 1200)
   * @returns {Promise<{ content: string, tokensUsed: number, provider: string }>}
   */
  generate: async (prompt, options = {}) => {
    const { mode = 'notes', delay = 1200 } = options;

    // ── Step 1: Visibility of env state at call time ──────────────────────────
    console.log('[aiService] DEBUG_ENV:', {
      hasKey: !!process.env.GROQ_API_KEY,
      keyPreview: process.env.GROQ_API_KEY?.slice(0, 5) ?? '(none)',
    });

    if (!prompt || prompt.trim().length < 3) {
      throw new Error('Prompt must be at least 3 characters long');
    }

    // ── Check for real API key ────────────────────────────────────────────────
    if (!process.env.GROQ_API_KEY) {
      throw new Error("GROQ API KEY NOT FOUND");
    }

    console.log('[aiService] USING GROQ');
    return await aiService._groqGenerate(prompt, { mode });
  },

  // ── Mock provider removed ───────────────────────────────────────────────────

  // ── Groq provider (active when GROQ_API_KEY is set) ─────────────────────────
  _groqGenerate: async (prompt, { mode }) => {
    const Groq = (await import('groq-sdk')).default;
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    // Customize the system prompt based on the mode
    let systemMessage = 'You are a helpful AI assistant.';
    if (mode === 'notes') {
      systemMessage = `You are an expert tutor. Create clear, comprehensive, and highly structured markdown study notes based on the prompt. 
Organize the content logically using your own natural headings, bullet points, and key takeaways to make the material easy to study and understand.`;
    } else if (mode === 'summarize') {
      systemMessage = 'Summarize the provided content clearly and concisely using bullet points.';
    } else if (mode === 'quiz') {
      systemMessage = 'Create a short practice quiz with answers based on the provided topic.';
    }

    const response = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: systemMessage },
        { role: 'user', content: prompt }
      ],
      model: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
      temperature: 0.7,
    });

    // ── Step 4 strict guard: hard-throw on empty content ─────────────────────
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
