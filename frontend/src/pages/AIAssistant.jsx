/**
 * pages/AIAssistant.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Dedicated conversational AI chat page for UniVerse.
 *
 * Features:
 *  - Full chat-style conversation thread (never clears on navigation)
 *  - Multi-turn context sent to Groq on every message
 *  - Markdown rendering for AI responses
 *  - Mode selector: Chat / Notes / Summarize / Quiz
 *  - Clear chat button to explicitly reset the session
 *  - Keyboard shortcut: Ctrl+Enter to send
 *  - Responsive — works on mobile
 * ─────────────────────────────────────────────────────────────────────────────
 */
import { useState, useRef, useEffect, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import toast from 'react-hot-toast';
import {
  Bot, Sparkles, Copy, AlertTriangle, Send,
  Trash2, ChevronDown, Zap, BookOpen, HelpCircle, MessageSquare,
} from 'lucide-react';
import { sendChatMessage } from '../api/aiApi.js';

// ── Mode definitions ──────────────────────────────────────────────────────────
const MODES = [
  {
    value: 'chat',
    label: 'Chat',
    Icon: MessageSquare,
    desc: 'General campus & study assistant',
    placeholder: 'Ask me anything…',
    color: '#8B5CF6',
  },
  {
    value: 'notes',
    label: 'Generate Notes',
    Icon: BookOpen,
    desc: 'Create structured study notes from a topic',
    placeholder: 'e.g. "Explain Newton\'s Laws of Motion"',
    color: '#6366F1',
  },
  {
    value: 'summarize',
    label: 'Summarize',
    Icon: Zap,
    desc: 'Condense content into key bullet points',
    placeholder: 'Paste or describe the content to summarize…',
    color: '#10B981',
  },
  {
    value: 'quiz',
    label: 'Quiz Me',
    Icon: HelpCircle,
    desc: 'Generate practice Q&A from a topic',
    placeholder: 'e.g. "Create 5 questions about photosynthesis"',
    color: '#F59E0B',
  },
];

// ── Markdown renderer ─────────────────────────────────────────────────────────
const MarkdownContent = ({ content, style = {} }) => (
  <div className="prose ai-prose" style={{ whiteSpace: 'pre-wrap', ...style }}>
    <ReactMarkdown remarkPlugins={[remarkGfm]}>{content || ''}</ReactMarkdown>
  </div>
);

// ── Loading dots ──────────────────────────────────────────────────────────────
const LoadingDots = () => (
  <span style={{ display: 'inline-flex', gap: 4 }}>
    {[0, 1, 2].map(i => (
      <span key={i} style={{
        width: 7, height: 7, borderRadius: '50%',
        background: 'var(--color-primary-light)',
        animation: `aiDotBounce 1.1s ease ${i * 0.18}s infinite`,
        display: 'inline-block',
      }} />
    ))}
  </span>
);

// ── Timestamp formatter ───────────────────────────────────────────────────────
const fmtTime = (ts) => new Date(ts).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

// ─────────────────────────────────────────────────────────────────────────────
export default function AIAssistant() {
  const [messages, setMessages]   = useState([]);   // [{role, content, mode, ts, provider?, tokens?}]
  const [input, setInput]         = useState('');
  const [mode, setMode]           = useState('chat');
  const [loading, setLoading]     = useState(false);
  const [showModes, setShowModes] = useState(false);
  const chatEndRef  = useRef(null);
  const textareaRef = useRef(null);

  const currentMode = MODES.find(m => m.value === mode);

  // Auto-scroll to latest message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Auto-grow textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`;
    }
  }, [input]);

  const copyText = useCallback((text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  }, []);

  // ── Send message ────────────────────────────────────────────────────────────
  const handleSend = useCallback(async () => {
    const trimmed = input.trim();
    if (!trimmed) { toast.error('Type a message first'); return; }
    if (loading) return;

    // Append user message immediately
    const userMsg = { role: 'user', content: trimmed, mode, ts: Date.now() };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput('');
    setLoading(true);

    try {
      // Build Groq-compatible history (role + content only)
      const history = updatedMessages.map(({ role, content }) => ({
        role: role === 'ai' ? 'assistant' : role,
        content,
      }));

      const result = await sendChatMessage(history, mode);
      setMessages(prev => [...prev, {
        role: 'ai',
        content: result.content,
        mode,
        ts: Date.now(),
        provider: result.provider,
        tokens: result.tokensUsed,
      }]);
    } catch (err) {
      const errText = err?.response?.data?.message || err.message || 'AI generation failed';
      setMessages(prev => [...prev, {
        role: 'error',
        content: errText,
        ts: Date.now(),
      }]);
      toast.error(errText);
    } finally {
      setLoading(false);
      // Re-focus textarea
      setTimeout(() => textareaRef.current?.focus(), 50);
    }
  }, [input, loading, messages, mode]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClear = () => {
    if (messages.length === 0) return;
    if (!window.confirm('Clear the entire conversation? This cannot be undone.')) return;
    setMessages([]);
    toast.success('Conversation cleared');
  };

  const handleSuggestion = (text) => {
    setInput(text);
    textareaRef.current?.focus();
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div style={{ height: 'calc(100vh - 88px)', display: 'flex', flexDirection: 'column', padding: '0 0 var(--space-4)' }}>

      {/* ── Page header ── */}
      <div style={{
        padding: 'var(--space-5) var(--space-6) var(--space-4)',
        display: 'flex', alignItems: 'center', gap: 'var(--space-4)',
        flexShrink: 0,
      }}>
        {/* Avatar */}
        <div style={{
          width: 44, height: 44, borderRadius: 'var(--radius-md)',
          background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 0 24px var(--color-primary-glow)',
          flexShrink: 0,
        }}>
          <Bot size={22} color="#fff" />
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <h1 style={{ fontSize: 'var(--text-xl)', fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>
            AI Assistant
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-xs)', margin: 0 }}>
            {messages.length > 0
              ? `${messages.filter(m => m.role === 'user').length} message${messages.filter(m => m.role === 'user').length !== 1 ? 's' : ''} · ${currentMode.label} mode`
              : 'Powered by Groq Llama 3'}
          </p>
        </div>

        {/* Status pill */}
        <span style={{
          padding: '4px 12px', borderRadius: 'var(--radius-pill)',
          background: 'rgba(16,185,129,0.15)', color: 'var(--color-success)',
          fontSize: 'var(--text-xs)', fontWeight: 700, flexShrink: 0,
        }}>● Live</span>

        {/* Clear button */}
        {messages.length > 0 && (
          <button
            id="ai-clear-btn"
            onClick={handleClear}
            title="Clear conversation"
            aria-label="Clear conversation"
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '6px 12px', borderRadius: 'var(--radius-md)',
              background: 'rgba(244,63,94,0.08)',
              border: '1px solid rgba(244,63,94,0.20)',
              color: 'rgba(244,63,94,0.75)',
              fontSize: 'var(--text-xs)', fontWeight: 600,
              cursor: 'pointer', flexShrink: 0,
              transition: 'all var(--transition-fast)',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(244,63,94,0.15)'; e.currentTarget.style.color = '#F43F5E'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(244,63,94,0.08)'; e.currentTarget.style.color = 'rgba(244,63,94,0.75)'; }}
          >
            <Trash2 size={13} /> Clear
          </button>
        )}
      </div>

      {/* ── Mode selector bar ── */}
      <div style={{
        padding: '0 var(--space-6) var(--space-3)',
        display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap',
        flexShrink: 0,
      }}>
        {MODES.map(m => (
          <button
            key={m.value}
            id={`ai-mode-${m.value}`}
            onClick={() => setMode(m.value)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: 'var(--space-2) var(--space-4)',
              borderRadius: 'var(--radius-pill)',
              border: mode === m.value
                ? `1px solid ${m.color}55`
                : '1px solid var(--border-subtle)',
              background: mode === m.value
                ? `${m.color}22`
                : 'transparent',
              color: mode === m.value ? m.color : 'var(--text-muted)',
              fontWeight: 600, fontSize: 'var(--text-xs)',
              cursor: 'pointer',
              transition: 'all var(--transition-fast)',
            }}
          >
            <m.Icon size={12} />
            {m.label}
          </button>
        ))}
      </div>

      {/* ── Divider ── */}
      <div style={{ height: 1, background: 'var(--border-subtle)', marginBottom: 'var(--space-2)', flexShrink: 0 }} />

      {/* ── Chat messages area ── */}
      <div style={{
        flex: 1,
        minHeight: 0,
        overflowY: 'auto',
        overflowX: 'hidden',
        padding: 'var(--space-4) var(--space-6)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-5)',
        scrollBehavior: 'smooth',
      }}>

        {/* Empty state */}
        {messages.length === 0 && (
          <div style={{
            flex: 1, display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            gap: 'var(--space-6)', padding: 'var(--space-8)',
            textAlign: 'center',
          }}>
            <div style={{
              width: 88, height: 88, borderRadius: '50%',
              background: 'linear-gradient(135deg, rgba(139,92,246,0.18), rgba(99,102,241,0.08))',
              border: '1px solid var(--border-primary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 40px rgba(139,92,246,0.15)',
            }}>
              <Sparkles size={36} color="#A78BFA" />
            </div>

            <div>
              <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 800, margin: '0 0 var(--space-2)', color: 'var(--text-secondary)' }}>
                How can I help you?
              </h2>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', margin: 0, maxWidth: 380 }}>
                {currentMode.desc}. Type below to start a conversation — your history stays visible throughout the session.
              </p>
            </div>

            {/* Suggestion chips */}
            <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap', justifyContent: 'center', maxWidth: 480 }}>
              {[
                'Explain photosynthesis in simple terms',
                'Summarize the French Revolution',
                'Create a quiz on basic economics',
                'What are Newton\'s laws?',
                'Tips for effective studying',
                'Explain recursion in programming',
              ].map(s => (
                <button
                  key={s}
                  onClick={() => handleSuggestion(s)}
                  style={{
                    padding: 'var(--space-2) var(--space-3)',
                    borderRadius: 'var(--radius-pill)',
                    border: '1px solid var(--border-default)',
                    background: 'var(--bg-elevated)',
                    color: 'var(--text-secondary)',
                    fontSize: 'var(--text-xs)', fontWeight: 600,
                    cursor: 'pointer', transition: 'all var(--transition-fast)',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--color-primary)'; e.currentTarget.style.color = 'var(--color-primary-light)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-default)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Chat messages */}
        {messages.map((msg, i) => {
          if (msg.role === 'user') return (
            <div key={i} style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)' }}>
              <div style={{ maxWidth: '75%' }}>
                {/* Mode badge above bubble */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 4 }}>
                  <span style={{
                    fontSize: '10px', color: 'var(--text-muted)', fontWeight: 600,
                    textTransform: 'uppercase', letterSpacing: '0.06em',
                  }}>
                    {MODES.find(m => m.value === msg.mode)?.label} · {fmtTime(msg.ts)}
                  </span>
                </div>
                <div style={{
                  padding: 'var(--space-3) var(--space-5)',
                  background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))',
                  borderRadius: 'var(--radius-lg) var(--radius-lg) 4px var(--radius-lg)',
                  boxShadow: '0 4px 20px rgba(139,92,246,0.25)',
                }}>
                  <p style={{ fontSize: 'var(--text-sm)', color: '#fff', margin: 0, fontWeight: 500, lineHeight: 1.6 }}>
                    {msg.content}
                  </p>
                </div>
              </div>
            </div>
          );

          if (msg.role === 'error') return (
            <div key={i} style={{
              padding: 'var(--space-4) var(--space-5)',
              background: 'rgba(244,63,94,0.08)',
              border: '1px solid rgba(244,63,94,0.25)',
              borderRadius: 'var(--radius-lg)',
              color: 'var(--color-danger)',
              fontSize: 'var(--text-sm)',
              display: 'flex', alignItems: 'flex-start', gap: 'var(--space-3)',
            }}>
              <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: 2 }} />
              <span>{msg.content}</span>
            </div>
          );

          // AI message
          return (
            <div key={i} style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'flex-start' }}>
              {/* Bot avatar */}
              <div style={{
                width: 32, height: 32, borderRadius: 'var(--radius-sm)',
                background: 'linear-gradient(135deg, rgba(139,92,246,0.3), rgba(99,102,241,0.2))',
                border: '1px solid var(--border-primary)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0, marginTop: 4,
              }}>
                <Bot size={16} color="#A78BFA" />
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                {/* Meta line */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-2)' }}>
                  <span style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--color-primary-light)' }}>
                    UniVerse AI
                  </span>
                  {msg.provider && <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>· {msg.provider}</span>}
                  {msg.tokens  && <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>· ~{msg.tokens} tokens</span>}
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)', marginLeft: 'auto' }}>{fmtTime(msg.ts)}</span>
                  <button
                    onClick={() => copyText(msg.content)}
                    title="Copy response"
                    aria-label="Copy AI response"
                    style={{
                      background: 'none', border: 'none',
                      color: 'var(--text-muted)', cursor: 'pointer',
                      display: 'flex', alignItems: 'center',
                      padding: 2, borderRadius: 4,
                      transition: 'color var(--transition-fast)',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-secondary)'; }}
                    onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; }}
                  >
                    <Copy size={12} />
                  </button>
                </div>

                {/* Message bubble */}
                <div style={{
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '4px var(--radius-lg) var(--radius-lg) var(--radius-lg)',
                  padding: 'var(--space-4) var(--space-5)',
                  boxShadow: '0 2px 16px rgba(0,0,0,0.2)',
                }}>
                  <MarkdownContent content={msg.content} />
                </div>
              </div>
            </div>
          );
        })}

        {/* Loading bubble */}
        {loading && (
          <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'flex-start' }}>
            <div style={{
              width: 32, height: 32, borderRadius: 'var(--radius-sm)',
              background: 'linear-gradient(135deg, rgba(139,92,246,0.3), rgba(99,102,241,0.2))',
              border: '1px solid var(--border-primary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0, marginTop: 4,
            }}>
              <Bot size={16} color="#A78BFA" />
            </div>
            <div style={{
              padding: 'var(--space-3) var(--space-5)',
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '4px var(--radius-lg) var(--radius-lg) var(--radius-lg)',
              display: 'flex', alignItems: 'center', gap: 'var(--space-3)',
            }}>
              <LoadingDots />
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Thinking…</span>
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* ── Input area ── */}
      <div style={{
        padding: 'var(--space-3) var(--space-6) var(--space-4)',
        borderTop: '1px solid var(--border-subtle)',
        background: 'var(--bg-surface)',
        flexShrink: 0,
      }}>
        <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: '0 0 var(--space-2)', fontWeight: 500 }}>
          <span style={{
            display: 'inline-block', padding: '1px 6px',
            background: 'rgba(139,92,246,0.12)',
            borderRadius: 4, marginRight: 6,
            color: 'var(--color-primary-light)', fontWeight: 700,
          }}>{currentMode.label}</span>
          {currentMode.desc}
        </p>

        <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'flex-end' }}>
          <textarea
            id="ai-chat-input"
            ref={textareaRef}
            placeholder={currentMode.placeholder}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            style={{
              flex: 1,
              minHeight: '48px',
              maxHeight: '160px',
              fontSize: 'var(--text-sm)',
              resize: 'none',
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-lg)',
              lineHeight: 1.6,
              transition: 'border-color var(--transition-fast)',
              overflowY: 'auto',
            }}
            onFocus={e => { e.currentTarget.style.borderColor = 'var(--color-primary)'; }}
            onBlur={e => { e.currentTarget.style.borderColor = 'var(--border-default)'; }}
          />

          <button
            id="ai-send-btn"
            onClick={handleSend}
            disabled={loading || !input.trim()}
            aria-label="Send message"
            style={{
              width: 48, height: 48,
              borderRadius: 'var(--radius-lg)',
              background: loading || !input.trim()
                ? 'var(--bg-elevated)'
                : `linear-gradient(135deg, ${currentMode.color}, #6366F1)`,
              color: loading || !input.trim() ? 'var(--text-muted)' : '#fff',
              border: 'none',
              cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
              boxShadow: loading || !input.trim() ? 'none' : `0 4px 20px ${currentMode.color}55`,
              transition: 'all var(--transition-fast)',
            }}
          >
            {loading ? <LoadingDots /> : <Send size={16} />}
          </button>
        </div>

        <p style={{ fontSize: '10px', color: 'var(--text-muted)', margin: 'var(--space-2) 0 0', textAlign: 'right' }}>
          Ctrl + Enter to send · Context preserved across follow-ups
        </p>
      </div>

      {/* ── Scoped styles ── */}
      <style>{`
        @keyframes aiDotBounce {
          0%, 80%, 100% { transform: scale(0); opacity: 0.4; }
          40% { transform: scale(1); opacity: 1; }
        }
        /* Prose styles — same system as AISummaryPanel */
        .ai-prose h1,.ai-prose h2,.ai-prose h3,.ai-prose h4 { color:var(--text-primary); margin:var(--space-4) 0 var(--space-2); font-weight:800; line-height:1.3; }
        .ai-prose h1 { font-size:var(--text-xl); }
        .ai-prose h2 { font-size:var(--text-lg); }
        .ai-prose h3 { font-size:var(--text-base); }
        .ai-prose p  { color:var(--text-secondary); line-height:1.8; margin:0 0 var(--space-3); white-space:pre-wrap; word-break:break-word; }
        .ai-prose ul,.ai-prose ol { padding-left:var(--space-6); color:var(--text-secondary); margin:0 0 var(--space-3); }
        .ai-prose li { margin-bottom:var(--space-1); line-height:1.75; }
        .ai-prose ol { list-style-type:decimal; }
        .ai-prose ul { list-style-type:disc; }
        .ai-prose code:not(pre code) { background:rgba(139,92,246,0.15); color:var(--color-primary-light); padding:2px 7px; border-radius:5px; font-size:0.87em; font-family:'Fira Code',monospace; }
        .ai-prose pre { background:rgba(0,0,0,0.35); border:1px solid rgba(139,92,246,0.2); border-radius:var(--radius-lg); padding:var(--space-4); margin:var(--space-3) 0; overflow-x:auto; }
        .ai-prose pre code { background:transparent; color:#e2e8f0; padding:0; font-size:0.84em; font-family:'Fira Code',monospace; white-space:pre; }
        .ai-prose blockquote { border-left:3px solid var(--color-primary); padding:var(--space-2) var(--space-4); color:var(--text-muted); margin:var(--space-3) 0; background:rgba(139,92,246,0.05); border-radius:0 var(--radius-sm) var(--radius-sm) 0; font-style:italic; }
        .ai-prose blockquote p { margin:0; }
        .ai-prose a { color:var(--color-primary-light); text-decoration:underline; text-underline-offset:3px; }
        .ai-prose strong { color:var(--text-primary); font-weight:700; }
        .ai-prose em { color:var(--text-secondary); font-style:italic; }
        .ai-prose table { border-collapse:collapse; width:100%; margin:var(--space-3) 0; font-size:var(--text-sm); }
        .ai-prose th,.ai-prose td { border:1px solid var(--border-subtle); padding:var(--space-2) var(--space-3); text-align:left; }
        .ai-prose th { background:rgba(139,92,246,0.1); color:var(--text-primary); font-weight:700; }
        .ai-prose hr { border:none; border-top:1px solid var(--border-subtle); margin:var(--space-4) 0; }
        .ai-prose > *:first-child { margin-top:0 !important; }
        .ai-prose > *:last-child  { margin-bottom:0 !important; }

        /* Responsive */
        @media (max-width: 600px) {
          #ai-chat-input { font-size: 16px; } /* prevent iOS zoom */
        }
      `}</style>
    </div>
  );
}
