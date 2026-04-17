/**
 * pages/Notes.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * AI Notes page — the core feature page.
 *
 * Layout (two-column on desktop):
 *  LEFT  → Note list sidebar + create button
 *  RIGHT → Note editor (top) + AI panel (bottom)
 *
 * State flow:
 *  selectedNote → passed to NoteEditor + AISummaryPanel
 *  When AI generates → calls notesApi.generateAI() → updates note.aiHistory
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { notesApi }       from '../api/notesApi.js';
import NoteEditor         from '../components/notes/NoteEditor.jsx';
import AISummaryPanel     from '../components/notes/AISummaryPanel.jsx';

export default function Notes() {
  const [notes,        setNotes]        = useState([]);
  const [selectedNote, setSelectedNote] = useState(null);
  const [loadingList,  setLoadingList]  = useState(true);
  const [saving,       setSaving]       = useState(false);
  const [creating,     setCreating]     = useState(false);
  const [searchQuery,  setSearchQuery]  = useState('');

  // ── Fetch user's notes ────────────────────────────────────────────────────
  const fetchNotes = useCallback(async (search = '') => {
    setLoadingList(true);
    try {
      const res = await notesApi.getAll(search ? { search } : {});
      setNotes(res.data.notes);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoadingList(false);
    }
  }, []);

  useEffect(() => { fetchNotes(); }, [fetchNotes]);

  // ── Create new note ───────────────────────────────────────────────────────
  const handleCreate = async () => {
    setCreating(true);
    try {
      const res = await notesApi.create({ title: 'Untitled Note', content: '' });
      const newNote = res.data.note;
      setNotes(prev => [newNote, ...prev]);
      setSelectedNote(newNote);
      toast.success('New note created');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setCreating(false);
    }
  };

  // ── Save note (editor calls this) ─────────────────────────────────────────
  const handleSave = async ({ title, content }) => {
    if (!selectedNote) return;
    setSaving(true);
    try {
      await notesApi.update(selectedNote._id, { title, content });
      // Refresh selected note to get updated fields
      const res = await notesApi.getById(selectedNote._id);
      const updated = res.data.note;
      setSelectedNote(updated);
      setNotes(prev => prev.map(n => n._id === updated._id ? { ...n, title } : n));
      toast.success('Note saved');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  // ── Delete note ───────────────────────────────────────────────────────────
  const handleDelete = async (noteId) => {
    if (!confirm('Delete this note and all its AI history?')) return;
    try {
      await notesApi.delete(noteId);
      setNotes(prev => prev.filter(n => n._id !== noteId));
      if (selectedNote?._id === noteId) setSelectedNote(null);
      toast.success('Note deleted');
    } catch (err) {
      toast.error(err.message);
    }
  };

  // ── Select a note (loads full content + history) ──────────────────────────
  const handleSelect = async (note) => {
    try {
      const res = await notesApi.getById(note._id);
      setSelectedNote(res.data.note);
    } catch (err) {
      toast.error(err.message);
    }
  };

  // ── AI generation ─────────────────────────────────────────────────────────
  const handleAIGenerate = async (prompt, mode) => {
    const res = await notesApi.generateAI(selectedNote._id, prompt, mode);
    // Update local note's aiHistory so the panel shows latest
    setSelectedNote(prev => ({
      ...prev,
      aiSummary: res.data.result.content,
      aiHistory: [...(prev.aiHistory || []), res.data.historyEntry],
    }));
    return res.data.result;
  };

  // ── Search handler ────────────────────────────────────────────────────────
  const handleSearch = (e) => {
    const q = e.target.value;
    setSearchQuery(q);
    const timer = setTimeout(() => fetchNotes(q), 400); // debounce
    return () => clearTimeout(timer);
  };

  return (
    <div className="page">
      <div className="container">

        {/* ── Page Header ─────────────────────────────────────────────────── */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'var(--space-8)' }}>
          <div>
            <h1 style={{ fontSize:'var(--text-3xl)', fontWeight:800 }}>
              🤖 AI Notes
            </h1>
            <p style={{ color:'var(--text-secondary)', marginTop:'var(--space-2)' }}>
              Write notes. Let AI generate, summarize, and quiz you.
            </p>
          </div>
          <button
            id="create-note-btn"
            className="btn btn-primary btn-lg"
            onClick={handleCreate}
            disabled={creating}
          >
            {creating ? 'Creating…' : '+ New Note'}
          </button>
        </div>

        {/* ── Two-column layout ────────────────────────────────────────────── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '280px 1fr',
          gap: 'var(--space-6)',
          alignItems: 'start',
        }}>

          {/* ── LEFT: Note list ──────────────────────────────────────────── */}
          <div style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-lg)',
            overflow: 'hidden',
            position: 'sticky',
            top: '24px',
          }}>
            {/* Search */}
            <div style={{ padding:'var(--space-4)', borderBottom:'1px solid var(--border-subtle)' }}>
              <input
                id="note-search"
                type="text"
                placeholder="🔍 Search notes…"
                value={searchQuery}
                onChange={handleSearch}
                style={{ fontSize:'var(--text-sm)' }}
              />
            </div>

            {/* List */}
            <div style={{ maxHeight:'70vh', overflowY:'auto' }}>
              {loadingList ? (
                <div style={{ padding:'var(--space-8)', textAlign:'center', color:'var(--text-muted)' }}>
                  Loading notes…
                </div>
              ) : notes.length === 0 ? (
                <div style={{ padding:'var(--space-8)', textAlign:'center' }}>
                  <p style={{ fontSize:'2rem' }}>📝</p>
                  <p style={{ color:'var(--text-muted)', fontSize:'var(--text-sm)' }}>
                    No notes yet. Create one!
                  </p>
                </div>
              ) : (
                notes.map((note) => (
                  <NoteListItem
                    key={note._id}
                    note={note}
                    selected={selectedNote?._id === note._id}
                    onSelect={() => handleSelect(note)}
                    onDelete={() => handleDelete(note._id)}
                  />
                ))
              )}
            </div>
          </div>

          {/* ── RIGHT: Editor + AI panel ──────────────────────────────────── */}
          {selectedNote ? (
            <div style={{ display:'flex', flexDirection:'column', gap:'var(--space-6)' }}>

              {/* Note Editor */}
              <div className="card" style={{ padding:'var(--space-6)' }}>
                <div style={{ display:'flex', alignItems:'center', gap:'var(--space-2)', marginBottom:'var(--space-5)' }}>
                  <span>📄</span>
                  <span style={{ fontSize:'var(--text-sm)', fontWeight:600, color:'var(--text-secondary)' }}>
                    NOTE EDITOR
                  </span>
                  <span className="badge badge-ai" style={{ marginLeft:'auto' }}>
                    {selectedNote.aiHistory?.length || 0} AI interactions
                  </span>
                </div>
                <NoteEditor
                  note={selectedNote}
                  onSave={handleSave}
                  saving={saving}
                />
              </div>

              {/* AI Panel */}
              <div className="card" style={{ padding:'var(--space-6)' }}>
                <AISummaryPanel
                  noteId={selectedNote._id}
                  onGenerate={handleAIGenerate}
                  history={selectedNote.aiHistory || []}
                />
              </div>
            </div>
          ) : (
            /* Empty state */
            <div style={{
              display:'flex', flexDirection:'column',
              alignItems:'center', justifyContent:'center',
              minHeight:'60vh', gap:'var(--space-4)',
              color:'var(--text-muted)',
            }}>
              <span style={{ fontSize:'4rem' }}>🤖</span>
              <h2 style={{ fontSize:'var(--text-xl)', color:'var(--text-secondary)' }}>
                Select or create a note
              </h2>
              <p style={{ fontSize:'var(--text-sm)', textAlign:'center', maxWidth:360 }}>
                Choose a note from the list, or create a new one to start using the AI assistant.
              </p>
              <button className="btn btn-primary" onClick={handleCreate}>
                + Create my first note
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

// ── Note list item ────────────────────────────────────────────────────────────
function NoteListItem({ note, selected, onSelect, onDelete }) {
  return (
    <div
      onClick={onSelect}
      style={{
        padding: 'var(--space-4)',
        borderBottom: '1px solid var(--border-subtle)',
        cursor: 'pointer',
        background: selected ? 'var(--bg-elevated)' : 'transparent',
        borderLeft: `3px solid ${selected ? 'var(--color-primary)' : 'transparent'}`,
        transition: 'all var(--transition-fast)',
        position: 'relative',
      }}
    >
      <p style={{ fontSize:'var(--text-sm)', fontWeight:600, color:'var(--text-primary)', marginBottom:'var(--space-1)' }}>
        {note.title}
      </p>
      <p style={{ fontSize:'var(--text-xs)', color:'var(--text-muted)' }}>
        {note.subject} · {new Date(note.createdAt).toLocaleDateString()}
      </p>
      <button
        onClick={(e) => { e.stopPropagation(); onDelete(); }}
        style={{
          position:'absolute', top:'var(--space-3)', right:'var(--space-3)',
          background:'transparent', border:'none', color:'var(--text-muted)',
          fontSize:'var(--text-sm)', cursor:'pointer', opacity: 0.5,
          transition: 'opacity var(--transition-fast)',
        }}
        onMouseEnter={e => e.target.style.opacity = 1}
        onMouseLeave={e => e.target.style.opacity = 0.5}
      >
        🗑
      </button>
    </div>
  );
}
