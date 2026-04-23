/**
 * pages/Home.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Dashboard / landing page for logged-in users.
 * Shows: Welcome greeting, 3 module cards, quick-action buttons.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const MODULES = [
  {
    id:          'module-lostfound',
    emoji:       '🔍',
    title:       'Lost & Found',
    description: 'Report lost items or help others find theirs. Post photos, set locations, and mark items as claimed.',
    path:        '/lostfound',
    gradient:    'linear-gradient(135deg, #ef4444 0%, #f97316 100%)',
    glow:        'rgba(239,68,68,0.2)',
    stats:       [
      { label:'Item types', value:'Electronics, Keys, Bags…' },
      { label:'Statuses',   value:'Open · Claimed · Resolved' },
    ],
    actions: [
      { label:'Browse items',  path:'/lostfound',        primary: false },
      { label:'+ Report item', path:'/lostfound/create', primary: true  },
    ],
  },
  {
    id:          'module-marketplace',
    emoji:       '🛒',
    title:       'Marketplace',
    description: 'Buy and sell items with fellow students. List textbooks, gadgets, furniture, and more.',
    path:        '/marketplace',
    gradient:    'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)',
    glow:        'rgba(59,130,246,0.2)',
    stats: [
      { label:'Conditions', value:'New · Like-new · Good · Fair' },
      { label:'Filters',    value:'Category · Price · Availability' },
    ],
    actions: [
      { label:'Browse listings', path:'/marketplace',        primary: false },
      { label:'+ Sell item',     path:'/marketplace/create', primary: true  },
    ],
  },
  {
    id:          'module-notes',
    emoji:       '🤖',
    title:       'AI Notes',
    description: 'Write notes and let AI generate structured content, summarize your material, or create quiz questions.',
    path:        '/notes',
    gradient:    'linear-gradient(135deg, #6c63ff 0%, #a855f7 100%)',
    glow:        'rgba(108,99,255,0.2)',
    stats: [
      { label:'AI modes',     value:'Generate · Summarize · Quiz' },
      { label:'History',      value:'Every interaction saved' },
    ],
    actions: [
      { label:'My notes',      path:'/notes',        primary: false },
      { label:'+ New note',    path:'/notes',        primary: true  },
    ],
  },
];

export default function Home() {
  const { user }   = useAuth();
  const navigate   = useNavigate();
  const hour       = new Date().getHours();
  const greeting   = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="page">
      <div className="container">

        {/* ── Hero greeting ──────────────────────────────────────────────────── */}
        <div style={{
          background: 'linear-gradient(135deg, var(--bg-surface) 0%, var(--bg-elevated) 100%)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-xl)',
          padding: 'var(--space-10) var(--space-8)',
          marginBottom: 'var(--space-10)',
          position: 'relative', overflow: 'hidden',
        }}>
          {/* Background glow */}
          <div style={{ position:'absolute', top:'-40%', right:'-5%', width:400, height:400, borderRadius:'50%', background:'var(--color-primary)', opacity:0.05, filter:'blur(60px)', pointerEvents:'none' }} />

          <div style={{ position:'relative', zIndex:1, display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:'var(--space-6)' }}>
            <div>
              <p style={{ color:'var(--text-muted)', fontSize:'var(--text-sm)', marginBottom:'var(--space-2)' }}>
                {greeting} 👋
              </p>
              <h1 style={{ fontSize:'var(--text-3xl)', fontWeight:800, marginBottom:'var(--space-3)' }}>
                Welcome back,{' '}
                <span style={{
                  background:'linear-gradient(135deg, var(--color-primary-light), var(--color-accent))',
                  WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent',
                }}>
                  {user?.name?.split(' ')[0]}
                </span>
              </h1>
              <p style={{ color:'var(--text-secondary)', maxWidth:480, lineHeight:1.7 }}>
                Your campus companion for Lost & Found, buying and selling, and AI-powered studying.
                What would you like to do today?
              </p>
            </div>

            {/* Avatar */}
            <div style={{
              width:80, height:80, borderRadius:'50%',
              background:'linear-gradient(135deg, var(--color-primary), var(--color-accent))',
              display:'flex', alignItems:'center', justifyContent:'center',
              fontSize:'2rem', fontWeight:800, color:'#fff',
              boxShadow:'var(--shadow-glow)', flexShrink:0,
            }}>
              {user?.name?.charAt(0).toUpperCase()}
            </div>
          </div>

          {/* Quick stats row */}
          {user?.college && (
            <div style={{ position:'relative', zIndex:1, marginTop:'var(--space-6)', paddingTop:'var(--space-6)', borderTop:'1px solid var(--border-subtle)', display:'flex', gap:'var(--space-8)', flexWrap:'wrap' }}>
              <Stat icon="🎓" label="College" value={user.college} />
              <Stat icon="📧" label="Email"   value={user.email}   />
              <Stat icon="🏷️" label="Role"    value={user.role}    />
            </div>
          )}
        </div>

        {/* ── Section title ──────────────────────────────────────────────────── */}
        <div style={{ marginBottom:'var(--space-6)' }}>
          <h2 style={{ fontSize:'var(--text-xl)', fontWeight:700 }}>Platform modules</h2>
          <p style={{ color:'var(--text-secondary)', fontSize:'var(--text-sm)', marginTop:'var(--space-1)' }}>
            Choose a module to get started
          </p>
        </div>

        {/* ── Module cards ───────────────────────────────────────────────────── */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(min(280px, 100%), 1fr))', gap:'var(--space-6)' }}>
          {MODULES.map(mod => <ModuleCard key={mod.id} mod={mod} navigate={navigate} />)}
        </div>

        {/* ── Quick start tip ────────────────────────────────────────────────── */}
        <div style={{
          marginTop:'var(--space-10)',
          padding:'var(--space-5) var(--space-6)',
          background:'var(--bg-elevated)',
          border:'1px solid var(--border-primary)',
          borderRadius:'var(--radius-lg)',
          display:'flex', alignItems:'center', gap:'var(--space-4)',
        }}>
          <span style={{ fontSize:'1.5rem' }}>💡</span>
          <div>
            <p style={{ fontWeight:600, marginBottom:2 }}>Quick tip — AI Notes</p>
            <p style={{ color:'var(--text-secondary)', fontSize:'var(--text-sm)' }}>
              Go to AI Notes, create a note, type any topic (e.g. "Photosynthesis"), and hit <strong>Generate</strong> to get structured study notes instantly.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}

// ── Module card component ──────────────────────────────────────────────────────
function ModuleCard({ mod, navigate }) {
  return (
    <div
      id={mod.id}
      style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-xl)',
        overflow: 'hidden',
        transition: 'all var(--transition-base)',
        cursor: 'pointer',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = 'var(--border-primary)';
        e.currentTarget.style.boxShadow   = `0 8px 32px ${mod.glow}`;
        e.currentTarget.style.transform   = 'translateY(-4px)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = 'var(--border-subtle)';
        e.currentTarget.style.boxShadow   = 'none';
        e.currentTarget.style.transform   = 'translateY(0)';
      }}
      onClick={() => navigate(mod.path)}
    >
      {/* Color band */}
      <div style={{ height:4, background:mod.gradient }} />

      <div style={{ padding:'var(--space-6)' }}>
        {/* Icon + title */}
        <div style={{ display:'flex', alignItems:'center', gap:'var(--space-3)', marginBottom:'var(--space-4)' }}>
          <div style={{
            width:48, height:48, borderRadius:'var(--radius-md)',
            background:mod.glow, display:'flex', alignItems:'center',
            justifyContent:'center', fontSize:'1.5rem',
          }}>
            {mod.emoji}
          </div>
          <h3 style={{ fontSize:'var(--text-xl)', fontWeight:700 }}>{mod.title}</h3>
        </div>

        {/* Description */}
        <p style={{ color:'var(--text-secondary)', fontSize:'var(--text-sm)', lineHeight:1.7, marginBottom:'var(--space-5)' }}>
          {mod.description}
        </p>

        {/* Stats */}
        <div style={{ display:'flex', flexDirection:'column', gap:'var(--space-2)', marginBottom:'var(--space-6)' }}>
          {mod.stats.map(s => (
            <div key={s.label} style={{ display:'flex', justifyContent:'space-between', fontSize:'var(--text-xs)' }}>
              <span style={{ color:'var(--text-muted)' }}>{s.label}</span>
              <span style={{ color:'var(--text-secondary)', fontWeight:500 }}>{s.value}</span>
            </div>
          ))}
        </div>

        {/* Action buttons */}
        <div style={{ display:'flex', gap:'var(--space-3)', flexWrap:'wrap' }}>
          {mod.actions.map(a => (
            <button
              key={a.label}
              onClick={(e) => { e.stopPropagation(); navigate(a.path); }}
              className={`btn btn-sm ${a.primary ? 'btn-primary' : 'btn-outline'}`}
              style={{ flex:1 }}
            >
              {a.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Stat pill ─────────────────────────────────────────────────────────────────
const Stat = ({ icon, label, value }) => (
  <div style={{ display:'flex', alignItems:'center', gap:'var(--space-2)' }}>
    <span>{icon}</span>
    <div>
      <p style={{ fontSize:'var(--text-xs)', color:'var(--text-muted)', margin:0 }}>{label}</p>
      <p style={{ fontSize:'var(--text-sm)', fontWeight:600, margin:0, textTransform:'capitalize' }}>{value}</p>
    </div>
  </div>
);
