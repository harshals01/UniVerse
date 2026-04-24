/**
 * pages/Home.jsx — Premium Bento Grid Dashboard
 */
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import {
  PackageSearch, ShoppingBag, Sparkles,
  ArrowUpRight, Plus, TrendingUp, Clock, Zap,
} from 'lucide-react';

export default function Home() {
  const { user }  = useAuth();
  const navigate  = useNavigate();
  const hour      = new Date().getHours();
  const greeting  = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const first     = user?.name?.split(' ')[0] ?? 'there';

  return (
    <div className="page">

      {/* ── Welcome Banner ─────────────────────────────────────────────────── */}
      <div style={{ marginBottom: 28 }}>
        <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)', marginBottom: 6 }}>
          {greeting} 👋
        </p>
        <h1 style={{ fontSize: 'var(--text-3xl)', fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.2 }}>
          Welcome back,{' '}
          <span className="text-gradient">{first}</span>
        </h1>
        <p style={{ color: 'var(--text-muted)', marginTop: 8, fontSize: 'var(--text-sm)' }}>
          Your campus hub — everything in one place.
        </p>
      </div>

      {/* ── Bento Grid ─────────────────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gridTemplateRows: 'auto', gap: 16 }}>

        {/* ── Lost & Found — wide card ── */}
        <BentoCard
          style={{ gridColumn: 'span 2' }}
          gradient="linear-gradient(135deg, rgba(244,63,94,0.12) 0%, rgba(139,92,246,0.08) 100%)"
          glow="rgba(244,63,94,0.10)"
          onClick={() => navigate('/lostfound')}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <IconBadge color="#F43F5E" bg="rgba(244,63,94,0.15)">
                <PackageSearch size={20} strokeWidth={1.8} />
              </IconBadge>
              <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 700, marginTop: 16, marginBottom: 6 }}>Lost & Found</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)', lineHeight: 1.6, maxWidth: 340 }}>
                Report missing items or help others recover theirs. Post photos, set locations, and track status.
              </p>
            </div>
            <ArrowUpRight size={20} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
          </div>
          <div style={{ display: 'flex', gap: 12, marginTop: 24, flexWrap: 'wrap' }}>
            <StatChip icon={<Clock size={12} />} label="Open items" value="Active" color="#FB7185" />
            <StatChip icon={<TrendingUp size={12} />} label="Categories" value="Electronics, Keys…" color="#C4B5FD" />
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
            <button className="btn btn-secondary btn-sm" onClick={e => { e.stopPropagation(); navigate('/lostfound'); }}>Browse</button>
            <button className="btn btn-primary btn-sm" onClick={e => { e.stopPropagation(); navigate('/lostfound/create'); }}>
              <Plus size={14} /> Report item
            </button>
          </div>
        </BentoCard>

        {/* ── AI Notes — tall card ── */}
        <BentoCard
          style={{ gridRow: 'span 2' }}
          gradient="linear-gradient(135deg, rgba(139,92,246,0.15) 0%, rgba(6,182,212,0.08) 100%)"
          glow="rgba(139,92,246,0.15)"
          onClick={() => navigate('/notes')}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <IconBadge color="#A78BFA" bg="rgba(139,92,246,0.18)">
              <Sparkles size={20} strokeWidth={1.8} />
            </IconBadge>
            <ArrowUpRight size={20} style={{ color: 'var(--text-muted)' }} />
          </div>

          <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 700, marginTop: 16, marginBottom: 6 }}>AI Notes</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)', lineHeight: 1.6 }}>
            Write, generate, and summarize study notes powered by AI.
          </p>

          <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {['Generate study notes', 'Summarize content', 'Create quiz questions'].map((feat, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 14px',
                background: 'rgba(139,92,246,0.08)',
                border: '1px solid rgba(139,92,246,0.15)',
                borderRadius: 12,
                fontSize: 'var(--text-xs)', fontWeight: 600, color: '#C4B5FD',
              }}>
                <Zap size={12} style={{ color: '#A78BFA', flexShrink: 0 }} />
                {feat}
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 'auto', paddingTop: 24, flexWrap: 'wrap' }}>
            <button className="btn btn-secondary btn-sm" onClick={e => { e.stopPropagation(); navigate('/notes'); }}>My notes</button>
            <button className="btn btn-primary btn-sm" onClick={e => { e.stopPropagation(); navigate('/notes'); }}>
              <Plus size={14} /> New note
            </button>
          </div>
        </BentoCard>

        {/* ── Marketplace ── */}
        <BentoCard
          style={{ gridColumn: 'span 2' }}
          gradient="linear-gradient(135deg, rgba(59,130,246,0.12) 0%, rgba(6,182,212,0.08) 100%)"
          glow="rgba(59,130,246,0.10)"
          onClick={() => navigate('/marketplace')}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <IconBadge color="#60A5FA" bg="rgba(59,130,246,0.15)">
                <ShoppingBag size={20} strokeWidth={1.8} />
              </IconBadge>
              <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 700, marginTop: 16, marginBottom: 6 }}>Marketplace</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)', lineHeight: 1.6, maxWidth: 340 }}>
                Buy and sell items with fellow students — textbooks, gadgets, furniture, and more.
              </p>
            </div>
            <ArrowUpRight size={20} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
          </div>
          <div style={{ display: 'flex', gap: 12, marginTop: 20, flexWrap: 'wrap' }}>
            <StatChip icon={<TrendingUp size={12} />} label="Conditions" value="New · Like-new · Good" color="#67E8F9" />
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
            <button className="btn btn-secondary btn-sm" onClick={e => { e.stopPropagation(); navigate('/marketplace'); }}>Browse</button>
            <button className="btn btn-primary btn-sm" onClick={e => { e.stopPropagation(); navigate('/marketplace/create'); }}>
              <Plus size={14} /> Sell item
            </button>
          </div>
        </BentoCard>

      </div>

      {/* ── Quick tip ──────────────────────────────────────────────────────── */}
      <div style={{
        marginTop: 20,
        padding: '14px 20px',
        background: 'rgba(139,92,246,0.08)',
        border: '1px solid rgba(139,92,246,0.20)',
        borderRadius: 'var(--radius-lg)',
        display: 'flex', alignItems: 'center', gap: 14,
      }}>
        <Zap size={18} style={{ color: '#A78BFA', flexShrink: 0 }} />
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
          <strong style={{ color: '#C4B5FD' }}>AI Notes tip:</strong> Go to AI Notes, create a note, type any topic and hit{' '}
          <strong>Generate</strong> to get structured study content instantly.
        </p>
      </div>

      {/* Responsive bento */}
      <style>{`
        @media (max-width: 768px) {
          .bento-grid > * { grid-column: span 1 !important; grid-row: span 1 !important; }
        }
      `}</style>
    </div>
  );
}

/* ── Sub-components ───────────────────────────────────────────────────────── */
function BentoCard({ children, style = {}, gradient, glow, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        background:      `${gradient}, var(--bg-surface)`,
        border:          '1px solid var(--border-glass)',
        borderRadius:    'var(--radius-xl)',
        padding:         24,
        backdropFilter:  'var(--blur-md)',
        boxShadow:       'var(--shadow-card)',
        cursor:          'pointer',
        transition:      'all var(--transition-base)',
        display:         'flex',
        flexDirection:   'column',
        position:        'relative',
        overflow:        'hidden',
        ...style,
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform   = 'translateY(-3px)';
        e.currentTarget.style.boxShadow   = `0 16px 48px rgba(0,0,0,0.55), 0 0 0 1px ${glow}`;
        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform   = 'translateY(0)';
        e.currentTarget.style.boxShadow   = 'var(--shadow-card)';
        e.currentTarget.style.borderColor = 'var(--border-glass)';
      }}
    >
      {/* Inner shine */}
      <div style={{
        position: 'absolute', inset: 0, borderRadius: 'inherit',
        background: 'linear-gradient(135deg, rgba(255,255,255,0.04) 0%, transparent 50%)',
        pointerEvents: 'none',
      }} />
      {children}
    </div>
  );
}

function IconBadge({ children, color, bg }) {
  return (
    <div style={{
      width: 44, height: 44, borderRadius: 14,
      background: bg,
      border: `1px solid ${color}33`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color,
      boxShadow: `0 0 16px ${color}20`,
    }}>
      {children}
    </div>
  );
}

function StatChip({ icon, label, value, color }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 6,
      padding: '6px 12px',
      background: `${color}12`,
      border: `1px solid ${color}25`,
      borderRadius: 'var(--radius-pill)',
      fontSize: 'var(--text-xs)', fontWeight: 600, color,
    }}>
      {icon}
      <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>{label}:</span> {value}
    </div>
  );
}
