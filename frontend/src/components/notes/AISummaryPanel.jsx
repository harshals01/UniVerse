/**
 * components/notes/AISummaryPanel.jsx
 */
import { useState, useRef, useEffect } from 'react';
import toast from 'react-hot-toast';

const MODE_OPTIONS = [
  { value: 'notes', label: 'Generate Notes', desc: 'Create structured study notes from your topic', placeholder: 'e.g. "Explain Newton\'s Laws of Motion"' },
  { value: 'summarize', label: 'Summarize', desc: 'Condense your notes into key bullet points', placeholder: 'e.g. "Summarize my notes above"' },
  { value: 'quiz', label: 'Quiz Me', desc: 'Generate practice Q&A from your notes', placeholder: 'e.g. "Create 5 quiz questions from my notes"' },
];

const renderMarkdown = (text) => {
  if (!text) return '';
  return text
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>')
    .replace(/`(.+?)`/g, '<code>$1</code>')
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>')
    .replace(/\[ \]/g, '☐').replace(/\[x\]/gi, '☑')
    .replace(/\n\n/g, '</p><p>');
};

export default function AISummaryPanel({
  noteId, onGenerate, history = [],
  aiMode = false, onEnterAiMode, onApplyToNote,
}) {
  const [prompt, setPrompt] = useState('');
  const [mode, setMode] = useState('notes');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([]); // chat-style log
  const chatEndRef = useRef(null);

  const currentMode = MODE_OPTIONS.find(m => m.value === mode);

  useEffect(() => {
    if (aiMode) chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, aiMode]);

  const handleGenerate = async () => {
    if (!prompt.trim()) { toast.error('Enter a prompt first'); return; }
    if (!noteId) { toast.error('Save the note first'); return; }

    const userMsg = { role: 'user', text: prompt.trim(), mode, ts: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setPrompt('');
    setLoading(true);

    try {
      const result = await onGenerate(userMsg.text, mode);
      setMessages(prev => [...prev, { role: 'ai', text: result.content, mode, provider: result.provider, tokens: result.tokensUsed, ts: Date.now(), raw: result.content }]);
      toast.success('AI generation complete!');
    } catch (err) {
      setMessages(prev => [...prev, { role: 'error', text: err.message || 'Generation failed', ts: Date.now() }]);
      toast.error(err.message || 'AI generation failed');
    } finally {
      setLoading(false);
    }
  };

  const copyText = (text) => { navigator.clipboard.writeText(text); toast.success('Copied!'); };

  /* ── Compact sidebar widget (normal mode) ── */
  if (!aiMode) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <span style={{ fontSize: '1.3rem' }}>🤖</span>
          <div>
            <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 700, margin: 0 }}>AI Assistant</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-xs)', margin: 0 }}>{currentMode.desc}</p>
          </div>
          <span style={{ marginLeft: 'auto', padding: '2px 8px', borderRadius: 'var(--radius-pill)', background: 'rgba(139,92,246,0.15)', color: 'var(--color-primary-light)', fontSize: 'var(--text-xs)', fontWeight: 700 }}>
            {history.length} runs
          </span>
        </div>

        <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
          {MODE_OPTIONS.map(m => (
            <button key={m.value} id={`mode-${m.value}`} onClick={() => setMode(m.value)}
              className={`btn btn-sm ${mode === m.value ? 'btn-primary' : 'btn-outline'}`}>
              {m.label}
            </button>
          ))}
        </div>

        <textarea id="ai-prompt" placeholder={currentMode.placeholder}
          value={prompt} onChange={e => setPrompt(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && e.ctrlKey) handleGenerate(); }}
          style={{ minHeight: '70px', fontSize: 'var(--text-sm)' }}
        />

        <button id="ai-generate-btn" className="btn btn-primary btn-lg"
          onClick={handleGenerate} disabled={loading || !prompt.trim()}
          style={{ position: 'relative', overflow: 'hidden' }}>
          {loading ? <><LoadingDots /> Generating…</> : '✨ Generate'}
        </button>

        {messages.length > 0 && messages[messages.length - 1].role === 'ai' && (
          <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-primary)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-4)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-3)' }}>
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-primary-light)', fontWeight: 600 }}>
                ✨ Latest Result
              </span>
              <button className="btn btn-ghost btn-sm" onClick={() => copyText(messages[messages.length - 1].text)}>📋</button>
            </div>
            <div className="prose" style={{ fontSize: 'var(--text-xs)' }}
              dangerouslySetInnerHTML={{ __html: renderMarkdown(messages[messages.length - 1].text) }} />
          </div>
        )}
      </div>
    );
  }

  /* ── Full AI Workspace (aiMode = true) ── */
  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      background: 'var(--bg-surface)',
      border: '1px solid var(--border-primary)',
      borderRadius: 'var(--radius-xl)',
      overflow: 'hidden',
      height: '85vh',
      boxShadow: '0 0 40px rgba(139,92,246,0.12)',
    }}>

      {/* ── Workspace header ── */}
      <div style={{
        padding: 'var(--space-5) var(--space-6)',
        borderBottom: '1px solid var(--border-subtle)',
        background: 'linear-gradient(135deg, rgba(139,92,246,0.1), rgba(99,102,241,0.06))',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
          <div style={{
            width: 40, height: 40, borderRadius: 'var(--radius-md)',
            background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.2rem', boxShadow: '0 0 20px var(--color-primary-glow)',
          }}>🤖</div>
          <div>
            <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 800, margin: 0, letterSpacing: '-0.01em' }}>AI Study Workspace</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-xs)', margin: 0 }}>
              {history.length} total interactions · Groq Llama 3
            </p>
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 'var(--space-2)', alignItems: 'center' }}>
            <span style={{
              padding: '4px 12px', borderRadius: 'var(--radius-pill)',
              background: 'rgba(16,185,129,0.15)', color: 'var(--color-success)',
              fontSize: 'var(--text-xs)', fontWeight: 700,
            }}>● Live</span>
          </div>
        </div>

        {/* Mode tabs */}
        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
          {MODE_OPTIONS.map(m => (
            <button key={m.value} id={`aiws-mode-${m.value}`}
              onClick={() => setMode(m.value)}
              style={{
                padding: 'var(--space-2) var(--space-4)',
                borderRadius: 'var(--radius-pill)',
                border: mode === m.value ? '1px solid var(--color-primary)' : '1px solid var(--border-subtle)',
                background: mode === m.value ? 'rgba(139,92,246,0.2)' : 'transparent',
                color: mode === m.value ? 'var(--color-primary-light)' : 'var(--text-muted)',
                fontWeight: 600, fontSize: 'var(--text-sm)',
                cursor: 'pointer',
                transition: 'all var(--transition-fast)',
              }}>
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Chat messages area ── */}
      <div style={{ flex: 1, overflowY: 'auto', padding: 'var(--space-6)', display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>

        {/* Empty state */}
        {messages.length === 0 && history.length === 0 && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 'var(--space-5)', opacity: 0.7 }}>
            <div style={{
              width: 80, height: 80, borderRadius: '50%',
              background: 'linear-gradient(135deg, rgba(139,92,246,0.2), rgba(99,102,241,0.1))',
              border: '1px solid var(--border-primary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '2.2rem',
              boxShadow: '0 0 30px rgba(139,92,246,0.15)',
            }}></div>
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: 'var(--text-base)', fontWeight: 700, color: 'var(--text-secondary)', margin: '0 0 var(--space-2)' }}>
                {currentMode.desc}
              </p>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', margin: 0 }}>
                Type a prompt below and press Generate to begin
              </p>
            </div>
            <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap', justifyContent: 'center' }}>
              {['Explain key concepts', 'Summarize my notes', 'Create a quiz'].map(hint => (
                <button key={hint} onClick={() => setPrompt(hint)}
                  style={{
                    padding: 'var(--space-2) var(--space-4)', borderRadius: 'var(--radius-pill)',
                    border: '1px solid var(--border-default)', background: 'var(--bg-elevated)',
                    color: 'var(--text-secondary)', fontSize: 'var(--text-xs)', fontWeight: 600,
                    cursor: 'pointer', transition: 'all var(--transition-fast)',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--color-primary)'; e.currentTarget.style.color = 'var(--color-primary-light)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-default)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
                >{hint}</button>
              ))}
            </div>
          </div>
        )}

        {/* Previous history (on first open) */}
        {messages.length === 0 && history.length > 0 && [...history].slice(-3).map((entry, i) => (
          <AIHistoryCard key={entry._id || i} entry={entry} onCopy={copyText} onApply={onApplyToNote} />
        ))}

        {/* Current session messages */}
        {messages.map((msg, i) => {
          if (msg.role === 'user') return (
            <div key={i} style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <div style={{
                maxWidth: '75%', padding: 'var(--space-4) var(--space-5)',
                background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))',
                borderRadius: 'var(--radius-lg) var(--radius-lg) 4px var(--radius-lg)',
                boxShadow: '0 4px 20px rgba(139,92,246,0.25)',
              }}>
                <p style={{ fontSize: 'var(--text-xs)', color: 'rgba(255,255,255,0.7)', margin: '0 0 4px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  {MODE_OPTIONS.find(m => m.value === msg.mode)?.label}
                </p>
                <p style={{ fontSize: 'var(--text-sm)', color: '#fff', margin: 0, fontWeight: 500 }}>{msg.text}</p>
              </div>
            </div>
          );

          if (msg.role === 'error') return (
            <div key={i} style={{ padding: 'var(--space-4)', background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.3)', borderRadius: 'var(--radius-lg)', color: 'var(--color-danger)', fontSize: 'var(--text-sm)' }}>
              ⚠ {msg.text}
            </div>
          );

          return (
            <div key={i} style={{
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-primary)',
              borderRadius: 'var(--radius-lg)',
              overflow: 'hidden',
              boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
            }}>
              {/* AI card header */}
              <div style={{
                padding: 'var(--space-3) var(--space-5)',
                borderBottom: '1px solid var(--border-subtle)',
                display: 'flex', alignItems: 'center', gap: 'var(--space-3)',
                background: 'linear-gradient(90deg, rgba(139,92,246,0.08), transparent)',
              }}>
                <span style={{ fontSize: '1rem' }}>🤖</span>
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-primary-light)', fontWeight: 700 }}>
                  ✨ {MODE_OPTIONS.find(m => m.value === msg.mode)?.label}
                </span>
                {msg.provider && <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>· {msg.provider}</span>}
                {msg.tokens && <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>· ~{msg.tokens} tokens</span>}
                <div style={{ marginLeft: 'auto', display: 'flex', gap: 'var(--space-2)' }}>
                  <button className="btn btn-ghost btn-sm" onClick={() => copyText(msg.text)} title="Copy">📋</button>
                  {onApplyToNote && (
                    <button
                      className="btn btn-sm"
                      onClick={() => onApplyToNote(msg.text)}
                      style={{
                        background: 'rgba(139,92,246,0.2)', border: '1px solid var(--border-primary)',
                        color: 'var(--color-primary-light)', fontWeight: 600,
                      }}
                    >↗ Apply to Note</button>
                  )}
                </div>
              </div>
              {/* AI card body */}
              <div className="prose ai-prose" style={{ padding: 'var(--space-5)', fontSize: 'var(--text-sm)' }}
                dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.text) }} />
            </div>
          );
        })}

        {/* Loading bubble */}
        {loading && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 'var(--space-3)',
            padding: 'var(--space-4) var(--space-5)',
            background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-lg)', width: 'fit-content',
            boxShadow: '0 0 20px rgba(139,92,246,0.1)',
          }}>
            <span style={{ fontSize: '1rem' }}>🤖</span>
            <LoadingDots />
            <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>Generating…</span>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* ── Prompt input bar ── */}
      <div style={{
        padding: 'var(--space-4) var(--space-6)',
        borderTop: '1px solid var(--border-subtle)',
        background: 'var(--bg-elevated)',
        flexShrink: 0,
      }}>
        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', margin: '0 0 var(--space-2)', fontWeight: 600 }}>
          {currentMode.desc}
        </p>
        <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'flex-end' }}>
          <textarea
            id="aiws-prompt"
            placeholder={currentMode.placeholder}
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && e.ctrlKey) handleGenerate(); }}
            style={{
              flex: 1, minHeight: '52px', maxHeight: '120px',
              fontSize: 'var(--text-sm)', resize: 'none',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-lg)',
              transition: 'border-color var(--transition-fast)',
            }}
            onFocus={e => { e.currentTarget.style.borderColor = 'var(--color-primary)'; }}
            onBlur={e => { e.currentTarget.style.borderColor = 'var(--border-default)'; }}
          />
          <button
            id="aiws-generate-btn"
            onClick={handleGenerate}
            disabled={loading || !prompt.trim()}
            style={{
              padding: 'var(--space-3) var(--space-6)',
              borderRadius: 'var(--radius-lg)',
              background: loading || !prompt.trim()
                ? 'var(--bg-surface)'
                : 'linear-gradient(135deg, var(--color-primary), var(--color-accent))',
              color: loading || !prompt.trim() ? 'var(--text-muted)' : '#fff',
              fontWeight: 700, fontSize: 'var(--text-sm)',
              border: 'none', cursor: loading || !prompt.trim() ? 'not-allowed' : 'pointer',
              whiteSpace: 'nowrap',
              boxShadow: loading || !prompt.trim() ? 'none' : '0 4px 20px rgba(139,92,246,0.35)',
              transition: 'all var(--transition-fast)',
              flexShrink: 0,
            }}>
            {loading ? '⏳ Thinking…' : 'Generate'}
          </button>
        </div>
        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', margin: 'var(--space-2) 0 0' }}>
          Ctrl + Enter to send
        </p>
      </div>

      {/* Prose styles */}
      <style>{`
        .ai-prose h1,.ai-prose h2,.ai-prose h3 { color:var(--text-primary); margin:var(--space-4) 0 var(--space-2); }
        .ai-prose h1 { font-size:var(--text-xl); }
        .ai-prose h2 { font-size:var(--text-lg); }
        .ai-prose h3 { font-size:var(--text-base); }
        .ai-prose p  { color:var(--text-secondary); line-height:1.8; margin:0 0 var(--space-3); }
        .ai-prose ul { padding-left:var(--space-5); color:var(--text-secondary); }
        .ai-prose li { margin-bottom:var(--space-2); line-height:1.7; }
        .ai-prose code { background:rgba(139,92,246,0.12); color:var(--color-primary-light); padding:1px 6px; border-radius:4px; }
        .ai-prose blockquote { border-left:3px solid var(--color-primary); padding-left:var(--space-4); color:var(--text-muted); margin:var(--space-3) 0; }
        .ai-prose strong { color:var(--text-primary); }
        @keyframes bounce { 0%,80%,100%{transform:scale(0)} 40%{transform:scale(1)} }
      `}</style>
    </div>
  );
}

/* ── History card (shown on first open in aiMode) ── */
function AIHistoryCard({ entry, onCopy, onApply }) {
  return (
    <div style={{
      background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)',
      borderRadius: 'var(--radius-lg)', overflow: 'hidden', opacity: 0.75,
    }}>
      <div style={{
        padding: 'var(--space-3) var(--space-4)',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex', gap: 'var(--space-3)', alignItems: 'center',
      }}>
        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>{entry.mode}</span>
        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginLeft: 'auto' }}>
          {new Date(entry.createdAt).toLocaleDateString()}
        </span>
        <button className="btn btn-ghost btn-sm" onClick={() => onCopy(entry.response)}>📋</button>
        {onApply && <button className="btn btn-ghost btn-sm" onClick={() => onApply(entry.response)}>↗</button>}
      </div>
      <div className="prose ai-prose" style={{ padding: 'var(--space-4)', fontSize: 'var(--text-xs)' }}
        dangerouslySetInnerHTML={{ __html: renderMarkdown(entry.response?.slice(0, 400) + '…') }} />
    </div>
  );
}

/* ── Loading dots ── */
const LoadingDots = () => (
  <span style={{ display: 'inline-flex', gap: 3 }}>
    {[0, 1, 2].map(i => (
      <span key={i} style={{
        width: 6, height: 6, borderRadius: '50%',
        background: 'var(--color-primary-light)',
        animation: `bounce 1s ease ${i * 0.15}s infinite`,
        display: 'inline-block',
      }} />
    ))}
  </span>
);
