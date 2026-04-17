/**
 * components/notes/NoteEditor.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Renders a note's title + content text area.
 * Calls onSave({ title, content }) when the user clicks Save.
 * Controlled component — parent owns state.
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
    <div style={{ display:'flex', flexDirection:'column', gap:'var(--space-4)' }}>
      <input
        id="note-title"
        type="text"
        placeholder="Note title…"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        style={{ fontSize:'var(--text-xl)', fontWeight:700, background:'transparent',
                 border:'none', borderBottom:'1px solid var(--border-default)',
                 borderRadius:0, padding:'var(--space-2) 0', color:'var(--text-primary)' }}
      />

      <textarea
        id="note-content"
        placeholder="Paste your notes here, or write a topic for the AI to generate notes on…"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        style={{ minHeight:'260px', lineHeight:1.8, fontSize:'var(--text-sm)' }}
      />

      <button
        id="save-note-btn"
        className="btn btn-primary"
        onClick={handleSave}
        disabled={saving || !title.trim()}
        style={{ alignSelf:'flex-start' }}
      >
        {saving ? 'Saving…' : '💾 Save Note'}
      </button>
    </div>
  );
}
