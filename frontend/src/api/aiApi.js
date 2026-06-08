/**
 * api/aiApi.js
 */
import axios from './axiosConfig.js';

/**
 * Send a multi-turn conversation to the AI.
 *
 * @param {Array<{role:'user'|'assistant', content:string}>} messages - Full conversation history
 * @param {string} mode - 'chat' | 'notes' | 'summarize' | 'quiz'
 * @param {string} [systemContext] - Optional extra system context (e.g. current page/section)
 * @returns {Promise<{content:string, tokensUsed:number, provider:string}>}
 */
export const sendChatMessage = async (messages, mode = 'chat', systemContext = '') => {
  const res = await axios.post('/api/ai/generate', {
    messages,
    mode,
    systemContext,
  });
  return res.data.data.result;
};

/**
 * Single-shot prompt generation (used by Notes workspace).
 *
 * @param {string} prompt
 * @param {string} mode - 'notes' | 'summarize' | 'quiz'
 * @param {string} [context]
 * @returns {Promise<{content:string, tokensUsed:number, provider:string}>}
 */
export const generateSingle = async (prompt, mode = 'notes', context = '') => {
  const res = await axios.post('/api/ai/generate', {
    prompt,
    mode,
    context,
  });
  return res.data.data.result;
};
