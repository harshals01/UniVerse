/**
 * pages/Notes.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import toast from 'react-hot-toast';
import { notesApi } from '../api/notesApi.js';
import NoteEditor from '../components/notes/NoteEditor.jsx';
import AISummaryPanel from '../components/notes/AISummaryPanel.jsx';

export default function Notes() {
  const [notes, setNotes] = useState([]);
  const [selectedNote, setSelectedNote] = useState(null);
  const [loadingList, setLoadingList] = useState(true);
  const [saving, setSaving] = useState(false);
  const [creating, setCreating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileView, setMobileView] = useState('list');
  const [aiMode, setAiMode] = useState(false);

  /* ── API handlers ────────────────────────────────────────────────────────── */
  const fetchNotes = useCallback(async (search = '') => {
    setLoadingList(true);
    try {
      const res = await notesApi.getAll(search ? { search } : {});
      setNotes(res.data.notes);
    } catch (err) { toast.error(err.message); }
    finally { setLoadingList(false); }
  }, []);

  useEffect(() => { fetchNotes(); }, [fetchNotes]);

  const handleCreate = async () => {
    setCreating(true);
    try {
      const res = await notesApi.create({ title: 'Untitled Note', content: '' });
      const newNote = res.data.note;
      setNotes(prev => [newNote, ...prev]);
      setSelectedNote(newNote);
      setMobileView('editor');
      toast.success('New note created');
    } catch (err) { toast.error(err.message); }
    finally { setCreating(false); }
  };

  const handleSave = async ({ title, content }) => {
    if (!selectedNote) return;
    setSaving(true);
    try {
      await notesApi.update(selectedNote._id, { title, content });
      const res = await notesApi.getById(selectedNote._id);
      const updated = res.data.note;
      setSelectedNote(updated);
      setNotes(prev => prev.map(n => n._id === updated._id ? { ...n, title } : n));
      toast.success('Note saved');
    } catch (err) { toast.error(err.message); }
    finally { setSaving(false); }
  };

  const handleDelete = async (noteId) => {
    if (!confirm('Delete this note and all its AI history?')) return;
    try {
      await notesApi.delete(noteId);
      setNotes(prev => prev.filter(n => n._id !== noteId));
      if (selectedNote?._id === noteId) { setSelectedNote(null); setMobileView('list'); setAiMode(false); }
      toast.success('Note deleted');
    } catch (err) { toast.error(err.message); }
  };

  const handleSelect = async (note) => {
    try {
      const res = await notesApi.getById(note._id);
      setSelectedNote(res.data.note);
      setMobileView('editor');
    } catch (err) { toast.error(err.message); }
  };

  const handleAIGenerate = async (prompt, mode) => {
    const res = await notesApi.generateAI(selectedNote._id, prompt, mode);
    // Only update aiHistory — never write aiSummary so workspace output
    // stays isolated inside the AI Workspace panel and doesn't leak into
    // the "Latest AI Summary" block or any other chat preview area.
    setSelectedNote(prev => ({
      ...prev,
      aiHistory: [...(prev.aiHistory || []), res.data.historyEntry],
    }));
    return res.data.result;
  };

  const handleAutoSave = async (promptText, aiContent, mode) => {
    const title = `AI ${mode.charAt(0).toUpperCase() + mode.slice(1)}: ${promptText.slice(0, 60)}${promptText.length > 60 ? '…' : ''}`;
    const content = aiContent;
    try {
      const res = await notesApi.create({ title, content });
      const newNote = res.data.note;
      setNotes(prev => [newNote, ...prev]);
      toast.success('AI response saved as note ✓', { duration: 2000, icon: '📝' });
    } catch {
    }
  };

  const handleEnterAiMode = () => {
    if (selectedNote) setAiMode(true);
  };

  const handleCloseAiMode = () => setAiMode(false);

  const handleSearch = (e) => {
    const q = e.target.value;
    setSearchQuery(q);
    const timer = setTimeout(() => fetchNotes(q), 400);
    return () => clearTimeout(timer);
  };

  return (
    <div style={{ padding: 'var(--space-6) 0 var(--space-16)', minHeight: '100vh' }}>
      <div className="container">

        {/* ── Workspace header ─────────────────────────────────────────────── */}
        <div style={{
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 'var(--space-6)',
          flexWrap: 'wrap', gap: 'var(--space-3)',
        }}>
          <div>
            <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, letterSpacing: '-0.02em', margin: 0 }}>AI Notes</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', margin: 'var(--space-1) 0 0' }}>
              Write · Summarize · Quiz — powered by AI
            </p>
          </div>

          <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center' }}>
            {/* Mobile: back to list */}
            {mobileView === 'editor' && selectedNote && (
              <button
                className="notes-mobile-only"
                onClick={() => setMobileView('list')}
                style={ghostBtn}
              >← Notes</button>
            )}

            <button
              id="create-note-btn"
              onClick={handleCreate}
              disabled={creating}
              style={{
                padding: 'var(--space-2) var(--space-5)',
                borderRadius: 'var(--radius-pill)',
                background: 'var(--color-primary)',
                color: '#fff',
                fontWeight: 700,
                fontSize: 'var(--text-sm)',
                border: 'none',
                cursor: creating ? 'not-allowed' : 'pointer',
                opacity: creating ? 0.7 : 1,
                transition: 'background var(--transition-fast), box-shadow var(--transition-fast)',
                whiteSpace: 'nowrap',
              }}
              onMouseEnter={e => { if (!creating) { e.currentTarget.style.background = 'var(--color-primary-dark)'; e.currentTarget.style.boxShadow = '0 0 18px var(--color-primary-glow)'; } }}
              onMouseLeave={e => { e.currentTarget.style.background = 'var(--color-primary)'; e.currentTarget.style.boxShadow = 'none'; }}
            >
              {creating ? 'Creating…' : '+ New Note'}
            </button>
          </div>
        </div>

        <div className={`notes-workspace ${aiMode ? 'notes-ai-mode' : ''}`}>

          {/* ─── LEFT RAIL: Note list sidebar ──────────────────────────────── */}
          <div className={`notes-sidebar ${mobileView === 'editor' ? 'notes-mobile-hide' : ''}`}>
            <div style={{ padding: 'var(--space-3) var(--space-4)', borderBottom: '1px solid var(--bg-elevated)' }}>
              <div style={{ position: 'relative' }}>
                <span style={{
                  position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
                  color: 'var(--text-muted)', fontSize: '0.9rem', pointerEvents: 'none',
                }}>◎</span>
                <input
                  id="note-search"
                  type="text"
                  placeholder="Search notes…"
                  value={searchQuery}
                  onChange={handleSearch}
                  style={{
                    fontSize: 'var(--text-sm)',
                    paddingLeft: 36,
                    borderRadius: 'var(--radius-pill)',
                    background: 'var(--bg-elevated)',
                  }}
                />
              </div>
            </div>

            {!loadingList && notes.length > 0 && (
              <p style={{
                fontSize: 'var(--text-xs)', color: 'var(--text-muted)',
                fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em',
                padding: 'var(--space-3) var(--space-4) 0',
              }}>
                {notes.length} note{notes.length !== 1 ? 's' : ''}
              </p>
            )}

            <div style={{ overflowY: 'auto', flex: 1 }}>
              {loadingList ? (
                <div style={{ padding: 'var(--space-8)', textAlign: 'center', color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>Loading…</div>
              ) : notes.length === 0 ? (
                <div style={{ padding: 'var(--space-8)', textAlign: 'center' }}>
                  <p style={{ fontSize: '2rem', marginBottom: 'var(--space-2)' }}>✦</p>
                  <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>No notes yet.</p>
                  <button onClick={handleCreate} style={{ ...ghostBtn, color: 'var(--color-primary)', marginTop: 'var(--space-3)' }}>
                    Create your first
                  </button>
                </div>
              ) : (
                notes.map(note => (
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

          {/* ─── CENTER: Editor canvas (AI panel is rendered as full-screen overlay below) ──── */}
          {selectedNote ? (
            <>

              {/* EDITOR PANEL — always full width in normal mode */}
              <div className={`notes-editor-panel ${mobileView === 'list' ? 'notes-mobile-hide' : ''}`}>
                <div className="notes-editor-card">

                  {/* Editor card header */}
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 'var(--space-3)',
                    marginBottom: 'var(--space-5)', paddingBottom: 'var(--space-4)',
                    borderBottom: '1px solid var(--bg-elevated)',
                  }}>
                    <div style={{
                      width: 8, height: 8, borderRadius: '50%',
                      background: 'var(--color-primary)', flexShrink: 0,
                    }} />
                    <span style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                      Editor
                    </span>
                    <span style={{
                      marginLeft: 'auto',
                      padding: '2px 10px',
                      borderRadius: 'var(--radius-pill)',
                      background: 'rgba(139,92,246,0.12)',
                      color: 'var(--color-primary-light)',
                      fontSize: 'var(--text-xs)',
                      fontWeight: 700,
                    }}>
                      {selectedNote.aiHistory?.length || 0} AI runs
                    </span>
                  </div>

                  <NoteEditor
                    note={selectedNote}
                    onSave={handleSave}
                    saving={saving}
                  />

                  {/* Note meta */}
                  <div style={{ marginTop: 'var(--space-5)', paddingTop: 'var(--space-5)', borderTop: '1px solid var(--bg-elevated)', display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                    <InfoRow icon="📅" label="Created" value={new Date(selectedNote.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} />
                    {selectedNote.subject && <InfoRow icon="📚" label="Subject" value={selectedNote.subject} />}
                    <InfoRow icon="✦" label="AI Runs" value={`${selectedNote.aiHistory?.length || 0} interactions`} />
                  </div>

                  {/* Latest AI Summary block intentionally removed —
                      AI workspace responses are scoped to the AI Workspace
                      panel only and must not surface here. */}

                  {/* Open AI Workspace CTA */}
                  <button
                    id="enter-ai-mode-btn"
                    onClick={handleEnterAiMode}
                    style={{
                      marginTop: 'var(--space-4)',
                      width: '100%',
                      padding: 'var(--space-3)',
                      borderRadius: 'var(--radius-lg)',
                      background: 'linear-gradient(135deg, rgba(139,92,246,0.15), rgba(99,102,241,0.10))',
                      border: '1px solid var(--border-primary)',
                      color: 'var(--color-primary-light)',
                      fontWeight: 700,
                      fontSize: 'var(--text-sm)',
                      cursor: 'pointer',
                      transition: 'all var(--transition-base)',
                      letterSpacing: '0.02em',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(139,92,246,0.25)'; e.currentTarget.style.boxShadow = '0 0 24px var(--color-primary-glow)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'linear-gradient(135deg, rgba(139,92,246,0.15), rgba(99,102,241,0.10))'; e.currentTarget.style.boxShadow = 'none'; }}
                  >
                    ✨ Open AI Workspace
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div style={{
              gridColumn: '2 / -1',
              background: 'var(--bg-surface)',
              borderRadius: 'var(--radius-xl)',
              minHeight: 520,
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              gap: 'var(--space-4)', padding: 'var(--space-10)',
            }}>
              <div style={{
                width: 72, height: 72, borderRadius: '50%',
                background: 'var(--bg-elevated)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '2rem',
              }}>✦</div>
              <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 700, margin: 0, color: 'var(--text-secondary)' }}>
                Select or create a note
              </h2>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', textAlign: 'center', maxWidth: 340, margin: 0 }}>
                Pick a note from the sidebar or create a new one to start writing and using the AI assistant.
              </p>
              <button
                onClick={handleCreate}
                style={{
                  marginTop: 'var(--space-2)', padding: 'var(--space-3) var(--space-6)',
                  borderRadius: 'var(--radius-pill)', background: 'var(--color-primary)',
                  color: '#fff', fontWeight: 700, fontSize: 'var(--text-sm)',
                  border: 'none', cursor: 'pointer',
                }}
              >+ Create my first note</button>
            </div>
          )}
        </div>

        {/* ── AI Chat Modal — full-screen overlay, rendered outside grid ── */}
        {selectedNote && (
          <AISummaryPanel
            noteId={selectedNote._id}
            onGenerate={handleAIGenerate}
            history={selectedNote.aiHistory || []}
            aiMode={aiMode}
            onEnterAiMode={handleCloseAiMode}
            onAutoSave={handleAutoSave}
          />
        )}
      </div>

      {/* ── Layout Styles ─────────────────────────────────────────────────────── */}
      <style>{`
        /* ── Workspace grid: sidebar | editor ── */
        .notes-workspace {
          display: grid;
          grid-template-columns: 260px 1fr;
          gap: var(--space-5);
          align-items: start;
        }

        /* Sidebar */
        .notes-sidebar {
          background:     var(--bg-surface);
          border-radius:  var(--radius-lg);
          overflow:       hidden;
          position:       sticky;
          top:            24px;
          max-height:     85vh;
          display:        flex;
          flex-direction: column;
          border: 1px solid var(--border-subtle);
        }

        /* Editor panel */
        .notes-editor-panel { grid-column: 2 / -1; }
        .notes-editor-card {
          background:     var(--bg-surface);
          border-radius:  var(--radius-xl);
          padding:        var(--space-8);
          display:        flex;
          flex-direction: column;
          min-height:     480px;
          border: 1px solid var(--border-subtle);
          position: sticky;
          top: 24px;
          max-height: 85vh;
          overflow-y: auto;
        }

        /* Tablet */
        @media (max-width: 900px) {
          .notes-workspace { grid-template-columns: 220px 1fr; }
        }

        /* Mobile */
        @media (max-width: 720px) {
          .notes-workspace        { grid-template-columns: 1fr; }
          .notes-sidebar          { position: static; max-height: 60vh; }
          .notes-mobile-hide      { display: none !important; }
          .notes-mobile-only      { display: flex !important; }
          .notes-editor-panel     { grid-column: 1 / -1; }
        }
        @media (min-width: 721px) {
          .notes-mobile-only { display: none; }
        }
      `}</style>
    </div>
  );
}

function NoteListItem({ note, selected, onSelect, onDelete }) {
  return (
    <div
      onClick={onSelect}
      style={{
        padding: 'var(--space-4)',
        borderBottom: '1px solid var(--bg-base)',
        cursor: 'pointer',
        background: selected ? 'rgba(139,92,246,0.1)' : 'transparent',
        borderLeft: `3px solid ${selected ? 'var(--color-primary)' : 'transparent'}`,
        transition: 'background var(--transition-fast), border-color var(--transition-fast)',
        position: 'relative',
      }}
      onMouseEnter={e => { if (!selected) e.currentTarget.style.background = 'var(--bg-elevated)'; }}
      onMouseLeave={e => { if (!selected) e.currentTarget.style.background = 'transparent'; }}
    >
      <p style={{
        fontSize: 'var(--text-sm)',
        fontWeight: selected ? 700 : 600,
        color: selected ? 'var(--text-primary)' : 'var(--text-secondary)',
        marginBottom: 'var(--space-1)',
        paddingRight: 'var(--space-6)',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
      }}>{note.title}</p>
      <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', margin: 0 }}>
        {note.subject && `${note.subject} · `}{new Date(note.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
      </p>
      <button
        onClick={e => { e.stopPropagation(); onDelete(); }}
        style={{
          position: 'absolute', top: 'var(--space-3)', right: 'var(--space-3)',
          background: 'none', border: 'none',
          color: 'var(--text-muted)', fontSize: '0.85rem',
          cursor: 'pointer', opacity: 0,
          transition: 'opacity var(--transition-fast)',
          lineHeight: 1,
        }}
        onMouseEnter={e => { e.currentTarget.style.opacity = 1; e.currentTarget.style.color = 'var(--color-danger)'; }}
        onMouseLeave={e => { e.currentTarget.style.opacity = 0; e.currentTarget.style.color = 'var(--text-muted)'; }}
      >X</button>
      <style>{`.notes-sidebar > div > div:hover button { opacity: 0.5 !important; }`}</style>
    </div>
  );
}

const ghostBtn = {
  background: 'none', border: 'none',
  color: 'var(--text-secondary)',
  fontSize: 'var(--text-sm)',
  fontWeight: 600,
  cursor: 'pointer',
  padding: 'var(--space-2) var(--space-3)',
  display: 'flex', alignItems: 'center', gap: 4,
};

const InfoRow = ({ icon, label, value }) => (
  <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center' }}>
    <div style={{
      width: 30, height: 30, borderRadius: 'var(--radius-sm)',
      background: 'var(--bg-elevated)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: '0.85rem', flexShrink: 0,
    }}>{icon}</div>
    <div>
      <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>{label}</p>
      <p style={{ fontSize: 'var(--text-xs)', fontWeight: 600, margin: 0, color: 'var(--text-secondary)' }}>{value}</p>
    </div>
  </div>
);
