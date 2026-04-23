/**
 * components/notes/NoteEditor.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Premium note editor — Dark Modular theme.
 * Title is a large borderless heading input.
 * Content is a full-height textarea with comfortable reading width.
 * Save button is pill-shaped with orange accent.
 *
 * All logic (handleSave, onSave prop contract) is unchanged.
 * ─────────────────────────────────────────────────────────────────────────────
 */
import { useState } from 'react';

export default function NoteEditor({ note, onSave, saving }) {
  const [title,   setTitle]   = useState(note?.title   || '');
  const [content, setContent] = useState(note?.content || '');

  const handleSave = () => {
    if (!title.trim()) return;
    onSave({ title: title.trim(), content });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)', height: '100%' }}>

      {/* Title input — large, borderless heading style */}
      <input
        id="note-title"
        type="text"
        placeholder="Untitled Note…"
        value={title}
        onChange={e => setTitle(e.target.value)}
        style={{
          fontSize:    'var(--text-2xl)',
          fontWeight:  800,
          background:  'transparent',
          border:      'none',
          borderRadius: 0,
          padding:     '0',
          color:       'var(--text-primary)',
          letterSpacing: '-0.02em',
          outline:     'none',
          width:       '100%',
        }}
      />

      {/* Subtle divider */}
      <div style={{ height: 1, background: 'var(--bg-elevated)', flexShrink: 0 }} />

      {/* Content textarea — main writing surface */}
      <textarea
        id="note-content"
        placeholder="Write your notes here, or enter a topic for the AI to generate study material…"
        value={content}
        onChange={e => setContent(e.target.value)}
        style={{
          flex:       1,
          minHeight:  280,
          lineHeight: 1.9,
          fontSize:   'var(--text-sm)',
          background: 'transparent',
          border:     'none',
          resize:     'none',
          color:      'var(--text-primary)',
          padding:    0,
          outline:    'none',
          fontFamily: 'inherit',
        }}
      />

      {/* Save row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 'var(--space-3)', borderTop: '1px solid var(--bg-elevated)' }}>
        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
          {content.split(/\s+/).filter(Boolean).length} words
        </span>
        <button
          id="save-note-btn"
          onClick={handleSave}
          disabled={saving || !title.trim()}
          style={{
            padding:      'var(--space-2) var(--space-5)',
            borderRadius: 'var(--radius-pill)',
            background:   saving ? 'var(--bg-elevated)' : 'var(--color-primary)',
            color:        saving ? 'var(--text-muted)' : '#fff',
            fontWeight:   700,
            fontSize:     'var(--text-sm)',
            border:       'none',
            cursor:       saving || !title.trim() ? 'not-allowed' : 'pointer',
            transition:   'background var(--transition-fast), box-shadow var(--transition-fast)',
            opacity:      saving || !title.trim() ? 0.6 : 1,
          }}
          onMouseEnter={e => { if (!saving && title.trim()) { e.currentTarget.style.background = 'var(--color-primary-dark)'; e.currentTarget.style.boxShadow = '0 0 16px var(--color-primary-glow)'; }}}
          onMouseLeave={e => { e.currentTarget.style.background = saving ? 'var(--bg-elevated)' : 'var(--color-primary)'; e.currentTarget.style.boxShadow = 'none'; }}
        >
          {saving ? 'Saving…' : '↑ Save'}
        </button>
      </div>
    </div>
  );
}
