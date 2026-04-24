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

// ── Mock response templates ───────────────────────────────────────────────────
// Realistic, formatted markdown-style output. Gives the frontend something
// meaningful to render even without a real API key.

const MOCK_RESPONSES = {
  notes: (prompt) => `# Study Notes: ${prompt}

## Overview
${prompt} is a fundamental concept in academic study. These notes provide a structured breakdown to aid understanding and revision.

## Key Concepts

### 1. Core Definition
- ${prompt} refers to the systematic study and application of related principles
- It forms the foundation for advanced topics in its domain
- Understanding ${prompt} enables better problem-solving in real-world scenarios

### 2. Important Principles
- **Principle A** — The primary law governing ${prompt} states that related elements interact in predictable ways
- **Principle B** — Secondary effects can compound the primary behavior
- **Principle C** — Edge cases require special consideration

### 3. Common Applications
- Academic research and theory development
- Practical implementation in industry settings
- Cross-domain application with adjacent fields

## Summary
${prompt} is best understood through progressive exposure — start with core definitions, build mental models, then apply concepts through practice.

## Exam Tips
> Focus on definitions, real-world examples, and be ready to compare with related concepts.

## References
- Standard textbooks on the subject
- Peer-reviewed journals in the field
- Online courses and documentation`,

  summarize: (prompt) => `## AI Summary

**Key Points:**
- ${prompt.slice(0, 60)}... introduces the core idea
- Multiple interconnected concepts form the foundation
- Practical implications extend across several domains

**In one sentence:**
${prompt.slice(0, 100)}... represents a structured approach to understanding the subject matter through analysis and synthesis.

**Action items:**
- [ ] Review the main definitions
- [ ] Practice with sample problems
- [ ] Connect to prior knowledge`,

  quiz: (prompt) => `## Practice Quiz: ${prompt}

**Q1.** What is the primary definition of ${prompt}?
> Answer: ${prompt} is defined by its core characteristics and practical applications.

**Q2.** Name three key principles associated with ${prompt}.
> Answer: (1) Core principle, (2) Secondary principle, (3) Applied principle.

**Q3.** How does ${prompt} relate to adjacent concepts in the field?
> Answer: It shares foundational elements while having distinct operational differences.`,
};

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

    if (!prompt || prompt.trim().length < 3) {
      throw new Error('Prompt must be at least 3 characters long');
    }

    // ── Check for real API key ────────────────────────────────────────────────
    if (process.env.GROQ_API_KEY) {
      return await aiService._groqGenerate(prompt, { mode });
    }

    // ── Fall through to mock ──────────────────────────────────────────────────
    return await aiService._mockGenerate(prompt, { mode, delay });
  },

  // ── Mock provider (active when no OPENAI_API_KEY) ─────────────────────────
  _mockGenerate: async (prompt, { mode, delay }) => {
    // Simulate network latency
    await new Promise((r) => setTimeout(r, delay));

    const template = MOCK_RESPONSES[mode] ?? MOCK_RESPONSES.notes;
    const content = template(prompt.trim());

    return {
      content,
      tokensUsed: Math.floor(content.length / 4), // Approximate token count
      provider: 'mock',
      mode,
    };
  },

  // ── Groq provider (active when GROQ_API_KEY is set) ─────────────────────────
  _groqGenerate: async (prompt, { mode }) => {
    const Groq = (await import('groq-sdk')).default;
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    // Customize the system prompt based on the mode
    let systemMessage = 'You are a helpful AI assistant.';
    if (mode === 'notes') {
      systemMessage = 'You are an expert tutor. Create clear, highly structured markdown study notes based on the prompt.';
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

    const content = response.choices[0]?.message?.content || '';

    return {
      content,
      tokensUsed: response.usage?.total_tokens || 0,
      provider: 'groq',
      mode,
    };
  },
};

export default aiService;
