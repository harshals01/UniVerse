/**
 * components/notes/AISummaryPanel.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * The AI interaction panel:
 *  - Prompt input field
 *  - Mode selector (notes / summarize / quiz)
 *  - Generate button with loading state
 *  - Formatted AI output with copy button
 *  - History of previous AI interactions
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { useState } from 'react';
import toast from 'react-hot-toast';

// ── Renders markdown-like text as formatted HTML ───────────────────────────────
const renderMarkdown = (text) => {
  if (!text) return '';
  return text
    .replace(/^# (.+)$/gm,    '<h1>$1</h1>')
    .replace(/^## (.+)$/gm,   '<h2>$1</h2>')
    .replace(/^### (.+)$/gm,  '<h3>$1</h3>')
    .replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>')
    .replace(/^> (.+)$/gm,    '<blockquote>$1</blockquote>')
    .replace(/`(.+?)`/g,      '<code>$1</code>')
    .replace(/^- (.+)$/gm,    '<li>$1</li>')
    .replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>')
    .replace(/\[ \]/g,         '☐')
    .replace(/\[x\]/gi,        '☑')
    .replace(/\n\n/g,          '</p><p>')
    .replace(/^(?!<[h|u|b|l|p])/gm, '<p>')
    .replace(/(?<![>])$/gm,    '</p>');
};

const MODE_OPTIONS = [
  { value: 'notes',     label: '📝 Generate Notes', desc: 'Create structured study notes from your topic' },
  { value: 'summarize', label: '⚡ Summarize',       desc: 'Condense your notes into key bullet points'  },
  { value: 'quiz',      label: '🎯 Quiz Me',          desc: 'Generate practice Q&A from your notes'       },
];

export default function AISummaryPanel({ noteId, onGenerate, history = [] }) {
  const [prompt,    setPrompt]    = useState('');
  const [mode,      setMode]      = useState('notes');
  const [loading,   setLoading]   = useState(false);
  const [latestResult, setLatest] = useState(null);
  const [showHistory, setShowHistory] = useState(false);

  const handleGenerate = async () => {
    if (!prompt.trim()) { toast.error('Enter a prompt first'); return; }
    if (!noteId)        { toast.error('Save the note first before using AI'); return; }

    setLoading(true);
    setLatest(null);
    try {
      const result = await onGenerate(prompt.trim(), mode);
      setLatest(result);
      setPrompt('');
      toast.success('AI generation complete!');
    } catch (err) {
      toast.error(err.message || 'AI generation failed');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'var(--space-5)' }}>

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div style={{ display:'flex', alignItems:'center', gap:'var(--space-3)' }}>
        <span style={{ fontSize:'1.4rem' }}>🤖</span>
        <div>
          <h3 style={{ fontSize:'var(--text-lg)', fontWeight:700, margin:0 }}>AI Assistant</h3>
          <p style={{ color:'var(--text-muted)', fontSize:'var(--text-xs)', margin:0 }}>
            {MODE_OPTIONS.find(m => m.value === mode)?.desc}
          </p>
        </div>
        <span className="badge badge-ai" style={{ marginLeft:'auto' }}>
          {history.length} interactions
        </span>
      </div>

      {/* ── Mode selector ────────────────────────────────────────────────────── */}
      <div style={{ display:'flex', gap:'var(--space-2)', flexWrap:'wrap' }}>
        {MODE_OPTIONS.map((m) => (
          <button
            key={m.value}
            id={`mode-${m.value}`}
            onClick={() => setMode(m.value)}
            className={`btn btn-sm ${mode === m.value ? 'btn-primary' : 'btn-outline'}`}
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* ── Prompt input ────────────────────────────────────────────────────── */}
      <div style={{ display:'flex', flexDirection:'column', gap:'var(--space-2)' }}>
        <label htmlFor="ai-prompt" className="form-label">Your prompt</label>
        <textarea
          id="ai-prompt"
          placeholder={
            mode === 'notes'     ? 'e.g. "Explain Newton\'s Laws of Motion"' :
            mode === 'summarize' ? 'e.g. "Summarize my notes above"'          :
                                   'e.g. "Create 5 quiz questions from my notes"'
          }
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && e.ctrlKey) handleGenerate(); }}
          style={{ minHeight:'80px', fontSize:'var(--text-sm)' }}
        />
        <span style={{ color:'var(--text-muted)', fontSize:'var(--text-xs)' }}>
          Ctrl+Enter to generate
        </span>
      </div>

      {/* ── Generate button ──────────────────────────────────────────────────── */}
      <button
        id="ai-generate-btn"
        className="btn btn-primary btn-lg"
        onClick={handleGenerate}
        disabled={loading || !prompt.trim()}
        style={{ position:'relative', overflow:'hidden' }}
      >
        {loading ? (
          <span style={{ display:'flex', alignItems:'center', gap:'var(--space-2)' }}>
            <LoadingDots /> Generating…
          </span>
        ) : (
          '✨ Generate'
        )}
      </button>

      {/* ── AI Output ───────────────────────────────────────────────────────── */}
      {latestResult && (
        <div style={{
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border-primary)',
          borderRadius: 'var(--radius-lg)',
          padding: 'var(--space-6)',
          position: 'relative',
        }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'var(--space-4)' }}>
            <span style={{ fontSize:'var(--text-sm)', color:'var(--color-primary-light)', fontWeight:600 }}>
              ✨ AI Result — {MODE_OPTIONS.find(m => m.value === latestResult.mode)?.label}
            </span>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => copyToClipboard(latestResult.content)}
            >
              📋 Copy
            </button>
          </div>
          <div
            className="prose"
            dangerouslySetInnerHTML={{ __html: renderMarkdown(latestResult.content) }}
          />
          <div style={{ marginTop:'var(--space-4)', paddingTop:'var(--space-3)', borderTop:'1px solid var(--border-subtle)', color:'var(--text-muted)', fontSize:'var(--text-xs)', display:'flex', gap:'var(--space-4)' }}>
            <span>🔢 ~{latestResult.tokensUsed} tokens</span>
            <span>🤖 Provider: {latestResult.provider}</span>
          </div>
        </div>
      )}

      {/* ── History toggle ───────────────────────────────────────────────────── */}
      {history.length > 0 && (
        <div>
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => setShowHistory(h => !h)}
          >
            {showHistory ? '▲ Hide' : '▼ Show'} History ({history.length})
          </button>

          {showHistory && (
            <div style={{ marginTop:'var(--space-4)', display:'flex', flexDirection:'column', gap:'var(--space-3)' }}>
              {[...history].reverse().map((entry, i) => (
                <div key={entry._id || i} style={{
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: 'var(--space-4)',
                }}>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'var(--space-2)' }}>
                    <span className="badge badge-ai">{entry.mode}</span>
                    <span style={{ fontSize:'var(--text-xs)', color:'var(--text-muted)' }}>
                      {new Date(entry.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p style={{ fontSize:'var(--text-sm)', color:'var(--text-secondary)', marginBottom:'var(--space-2)' }}>
                    <strong>Prompt:</strong> {entry.prompt}
                  </p>
                  <p style={{ fontSize:'var(--text-xs)', color:'var(--text-muted)', whiteSpace:'pre-line' }}>
                    {entry.response.slice(0, 200)}…
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Animated loading dots ─────────────────────────────────────────────────────
const LoadingDots = () => (
  <span style={{ display:'inline-flex', gap:'3px' }}>
    {[0,1,2].map(i => (
      <span key={i} style={{
        width:6, height:6, borderRadius:'50%',
        background: 'currentColor',
        animation: `bounce 1s ease ${i * 0.15}s infinite`,
        display:'inline-block',
      }} />
    ))}
    <style>{`@keyframes bounce { 0%,80%,100%{transform:scale(0)} 40%{transform:scale(1)} }`}</style>
  </span>
);
