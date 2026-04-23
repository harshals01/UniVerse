/**
 * pages/NoteDetail.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Standalone full-screen note detail view — Dark Modular theme.
 * Used when navigating directly to /notes/:id.
 *
 * Layout  :  [large content canvas 70%] | [right rail 30%]
 * Shows the note content, AI history blocks, and meta info.
 * ─────────────────────────────────────────────────────────────────────────────
 */
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { notesApi } from '../api/notesApi.js';

/* ── Renders markdown-like text as formatted HTML ───────────────────────────── */
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
    .replace(/(<li>.*<\/li>)/gs,'<ul>$1</ul>')
    .replace(/\[ \]/g,         '☐')
    .replace(/\[x\]/gi,        '☑')
    .replace(/\n\n/g,          '</p><p>')
    .replace(/^(?!<[h|u|b|l|p])/gm, '<p>')
    .replace(/(?<![\>])$/gm,    '</p>');
};

const MODE_COLORS = {
  notes:     { bg: 'rgba(229,69,3,0.10)',   color: '#ff6b35' },
  summarize: { bg: 'rgba(59,130,246,0.10)', color: '#60a5fa' },
  quiz:      { bg: 'rgba(34,197,94,0.10)',  color: '#4ade80' },
};

export default function NoteDetail() {
  const { id }              = useParams();
  const navigate            = useNavigate();
  const [note,    setNote]  = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await notesApi.getById(id);
        setNote(res.data.note);
      } catch (err) {
        toast.error(err.message || 'Failed to load note');
        navigate('/notes');
      } finally {
        setLoading(false);
      }
    })();
  }, [id, navigate]);

  if (loading) return (
    <div style={{ padding: 'var(--space-8)', display: 'flex', justifyContent: 'center', color: 'var(--text-muted)' }}>
      Loading note…
    </div>
  );

  if (!note) return null;

  const wordCount = note.content?.split(/\s+/).filter(Boolean).length || 0;

  return (
    <div style={{ padding: 'var(--space-8) 0 var(--space-16)', minHeight: '100vh' }}>
      <div className="container">

        {/* Back button */}
        <button
          onClick={() => navigate('/notes')}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--text-muted)', fontSize: 'var(--text-sm)', fontWeight: 600,
            padding: '6px 0', marginBottom: 'var(--space-5)',
            display: 'flex', alignItems: 'center', gap: 6,
          }}
        >
          ← Back to Notes
        </button>

        <div className="nd-layout">

          {/* ── Main canvas ──────────────────────────────────────────────────── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>

            {/* Note content card */}
            <div style={{
              background:   'var(--bg-surface)',
              borderRadius: 'var(--radius-xl)',
              padding:      'var(--space-8) var(--space-10)',
            }}>
              {/* Header */}
              <div style={{ marginBottom: 'var(--space-6)', paddingBottom: 'var(--space-5)', borderBottom: '1px solid var(--bg-elevated)' }}>
                <h1 style={{
                  fontSize:      'var(--text-3xl)',
                  fontWeight:    800,
                  letterSpacing: '-0.02em',
                  marginBottom:  'var(--space-3)',
                }}>
                  {note.title}
                </h1>
                <div style={{ display: 'flex', gap: 'var(--space-4)', flexWrap: 'wrap' }}>
                  <span style={metaChip}>
                    📅 {new Date(note.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </span>
                  {note.subject && <span style={metaChip}>📚 {note.subject}</span>}
                  <span style={metaChip}>✦ {wordCount} words</span>
                  {note.aiHistory?.length > 0 && (
                    <span style={{ ...metaChip, background: 'rgba(229,69,3,0.12)', color: 'var(--color-primary)' }}>
                      🤖 {note.aiHistory.length} AI runs
                    </span>
                  )}
                </div>
              </div>

              {/* Note content */}
              {note.content ? (
                <div
                  className="prose nd-prose"
                  dangerouslySetInnerHTML={{ __html: renderMarkdown(note.content) }}
                />
              ) : (
                <p style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>This note has no content yet.</p>
              )}
            </div>

            {/* AI History blocks */}
            {note.aiHistory?.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                <p style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                  AI History ({note.aiHistory.length})
                </p>
                {[...note.aiHistory].reverse().map((entry, i) => {
                  const modeStyle = MODE_COLORS[entry.mode] || MODE_COLORS.notes;
                  return (
                    <div key={entry._id || i} style={{
                      background:   'var(--bg-surface)',
                      borderRadius: 'var(--radius-lg)',
                      padding:      'var(--space-6)',
                      borderLeft:   `3px solid ${modeStyle.color}`,
                    }}>
                      {/* Entry header */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
                        <span style={{
                          padding:       '3px 12px',
                          borderRadius:  'var(--radius-pill)',
                          background:    modeStyle.bg,
                          color:         modeStyle.color,
                          fontSize:      'var(--text-xs)',
                          fontWeight:    800,
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                        }}>
                          {entry.mode}
                        </span>
                        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginLeft: 'auto' }}>
                          {new Date(entry.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                      </div>

                      {/* Prompt */}
                      <div style={{
                        background:   'var(--bg-elevated)',
                        borderRadius: 'var(--radius-md)',
                        padding:      'var(--space-3) var(--space-4)',
                        marginBottom: 'var(--space-4)',
                      }}>
                        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
                          Prompt
                        </p>
                        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', margin: 0, fontStyle: 'italic' }}>
                          "{entry.prompt}"
                        </p>
                      </div>

                      {/* Response */}
                      <div
                        className="prose nd-prose"
                        style={{ fontSize: 'var(--text-sm)' }}
                        dangerouslySetInnerHTML={{ __html: renderMarkdown(entry.response) }}
                      />
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ── Right rail ───────────────────────────────────────────────────── */}
          <div className="nd-rail">

            {/* Quick actions */}
            <div style={railCard}>
              <p style={railLabel}>Actions</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                <button
                  onClick={() => navigate('/notes')}
                  style={actionBtn('#fff', 'var(--color-primary)')}
                  onMouseEnter={e => { e.currentTarget.style.background = 'var(--color-primary-dark)'; e.currentTarget.style.boxShadow = '0 0 16px var(--color-primary-glow)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'var(--color-primary)'; e.currentTarget.style.boxShadow = 'none'; }}
                >
                  ✎ Edit in Workspace
                </button>
                <button
                  onClick={() => { navigator.clipboard.writeText(note.content || ''); toast.success('Copied!'); }}
                  style={actionBtn('var(--text-secondary)', 'var(--bg-elevated)')}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'var(--bg-elevated)'}
                >
                  ◈ Copy Content
                </button>
              </div>
            </div>

            {/* Note metadata */}
            <div style={railCard}>
              <p style={railLabel}>Details</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                <InfoRow icon="📅" label="Created"  value={new Date(note.createdAt).toLocaleDateString()} />
                <InfoRow icon="✏️" label="Updated"  value={new Date(note.updatedAt).toLocaleDateString()} />
                <InfoRow icon="✦"  label="Words"    value={`${wordCount} words`} />
                {note.subject && <InfoRow icon="📚" label="Subject" value={note.subject} />}
                <InfoRow icon="🤖" label="AI Runs"  value={`${note.aiHistory?.length || 0} interactions`} />
              </div>
            </div>

            {/* Latest AI summary preview */}
            {note.aiSummary && (
              <div style={railCard}>
                <p style={railLabel}>Latest AI Summary</p>
                <p style={{
                  fontSize:  'var(--text-xs)',
                  color:     'var(--text-secondary)',
                  lineHeight: 1.7,
                  margin:    0,
                  display:   '-webkit-box',
                  WebkitLineClamp: 8,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}>
                  {note.aiSummary}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .nd-layout {
          display: grid;
          grid-template-columns: 1fr 280px;
          gap: var(--space-6);
          align-items: start;
        }
        .nd-rail {
          display:        flex;
          flex-direction: column;
          gap:            var(--space-4);
          position:       sticky;
          top:            24px;
        }
        .nd-prose p   { color: var(--text-secondary); line-height: 1.9; margin-bottom: var(--space-3); }
        .nd-prose h1,
        .nd-prose h2,
        .nd-prose h3  { color: var(--text-primary); font-weight: 700; margin: var(--space-5) 0 var(--space-2); }
        .nd-prose h1  { font-size: var(--text-2xl); }
        .nd-prose h2  { font-size: var(--text-xl); }
        .nd-prose h3  { font-size: var(--text-lg); }
        .nd-prose ul  { padding-left: var(--space-5); margin-bottom: var(--space-3); }
        .nd-prose li  { color: var(--text-secondary); line-height: 1.8; }
        .nd-prose code { background: var(--bg-elevated); padding: 2px 6px; border-radius: 4px; font-size: 0.85em; }
        .nd-prose blockquote { border-left: 3px solid var(--color-primary); padding-left: var(--space-4); color: var(--text-muted); margin: var(--space-4) 0; }
        .nd-prose strong { color: var(--text-primary); }
        @media (max-width: 860px) {
          .nd-layout { grid-template-columns: 1fr; }
          .nd-rail   { position: static; }
        }
      `}</style>
    </div>
  );
}

/* ── Shared helpers ─────────────────────────────────────────────────────────── */
const metaChip = {
  padding:      '3px 12px',
  borderRadius: 'var(--radius-pill)',
  background:   'var(--bg-elevated)',
  fontSize:     'var(--text-xs)',
  color:        'var(--text-muted)',
  fontWeight:   600,
};

const railCard = {
  background:   'var(--bg-surface)',
  borderRadius: 'var(--radius-lg)',
  padding:      'var(--space-5)',
};

const railLabel = {
  fontSize:      'var(--text-xs)',
  fontWeight:    700,
  color:         'var(--text-muted)',
  textTransform: 'uppercase',
  letterSpacing: '0.07em',
  margin:        '0 0 var(--space-3)',
};

const actionBtn = (color, bg) => ({
  width:        '100%',
  padding:      'var(--space-2) var(--space-4)',
  borderRadius: 'var(--radius-pill)',
  background:   bg,
  color,
  fontWeight:   700,
  fontSize:     'var(--text-sm)',
  border:       'none',
  cursor:       'pointer',
  textAlign:    'center',
  transition:   'background var(--transition-fast), box-shadow var(--transition-fast)',
});

const InfoRow = ({ icon, label, value }) => (
  <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center' }}>
    <div style={{
      width: 30, height: 30, borderRadius: 'var(--radius-sm)',
      background: 'var(--bg-elevated)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: '0.85rem', flexShrink: 0,
    }}>
      {icon}
    </div>
    <div>
      <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>{label}</p>
      <p style={{ fontSize: 'var(--text-xs)', fontWeight: 600, margin: 0, color: 'var(--text-secondary)' }}>{value}</p>
    </div>
  </div>
);
