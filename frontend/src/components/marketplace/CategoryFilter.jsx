/**
 * components/marketplace/CategoryFilter.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Filter bar — Dark Modular theme.
 * Pill category chips, themed search input, sort select, price range.
 * All filter state logic and onChange calls are unchanged.
 * ─────────────────────────────────────────────────────────────────────────────
 */

const CATEGORIES   = ['all', 'electronics', 'clothing', 'accessories', 'books', 'documents', 'keys', 'bags', 'sports', 'other'];
const CONDITIONS   = [{ value: '', label: 'All' }, { value: 'new', label: '✨ New' }, { value: 'like-new', label: '👌 Like-new' }, { value: 'good', label: '👍 Good' }, { value: 'fair', label: '🔄 Fair' }];
const SORT_OPTIONS = [
  { value: 'newest',     label: 'Newest first'  },
  { value: 'price_asc',  label: 'Price: Low → High' },
  { value: 'price_desc', label: 'Price: High → Low' },
  { value: 'oldest',     label: 'Oldest first'  },
];

export default function CategoryFilter({ filters, onChange }) {
  const set = (key, val) => onChange({ ...filters, [key]: val });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', marginBottom: 'var(--space-8)' }}>

      {/* ── Row 1: Search + Sort + Sold toggle ──────────────────────────────── */}
      <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center', flexWrap: 'wrap' }}>

        {/* Search */}
        <div style={{ flex: 1, minWidth: 220, position: 'relative' }}>
          <span style={{
            position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
            color: 'var(--text-muted)', fontSize: '1rem', pointerEvents: 'none',
          }}>
            ◎
          </span>
          <input
            type="text"
            placeholder="Search listings…"
            value={filters.search || ''}
            onChange={e => set('search', e.target.value)}
            style={{
              width:       '100%',
              paddingLeft: 40,
              fontSize:    'var(--text-sm)',
              borderRadius: 'var(--radius-pill)',
            }}
          />
        </div>

        {/* Sort */}
        <select
          value={filters.sortBy || 'newest'}
          onChange={e => set('sortBy', e.target.value)}
          style={{
            width:        'auto',
            padding:      '10px 36px 10px 16px',
            fontSize:     'var(--text-sm)',
            borderRadius: 'var(--radius-pill)',
            flexShrink:    0,
          }}
        >
          {SORT_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>

        {/* Show sold toggle */}
        <label style={{
          display:    'flex', alignItems: 'center', gap: 8,
          cursor:     'pointer',
          fontSize:   'var(--text-sm)',
          color:      'var(--text-secondary)',
          whiteSpace: 'nowrap',
          background: 'var(--bg-surface)',
          padding:    '10px 16px',
          borderRadius: 'var(--radius-pill)',
          userSelect: 'none',
        }}>
          <input
            type="checkbox"
            checked={filters.isSold === 'true'}
            onChange={e => set('isSold', e.target.checked ? 'true' : 'false')}
            style={{ width: 'auto', accentColor: 'var(--color-primary)', cursor: 'pointer' }}
          />
          Show sold
        </label>
      </div>

      {/* ── Row 2: Price range ───────────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
        <span style={{
          fontSize:      'var(--text-xs)',
          color:         'var(--text-muted)',
          fontWeight:    700,
          textTransform: 'uppercase',
          letterSpacing: '0.07em',
          flexShrink:    0,
        }}>
          Price range
        </span>
        <input
          type="number" placeholder="Min ₹"
          value={filters.minPrice || ''} onChange={e => set('minPrice', e.target.value)}
          style={{ width: 100, fontSize: 'var(--text-sm)', borderRadius: 'var(--radius-pill)', textAlign: 'center' }}
          min={0}
        />
        <span style={{ color: 'var(--text-muted)', fontWeight: 700 }}>—</span>
        <input
          type="number" placeholder="Max ₹"
          value={filters.maxPrice || ''} onChange={e => set('maxPrice', e.target.value)}
          style={{ width: 100, fontSize: 'var(--text-sm)', borderRadius: 'var(--radius-pill)', textAlign: 'center' }}
          min={0}
        />
      </div>

      {/* ── Row 3: Category pills ────────────────────────────────────────────── */}
      <div>
        <p style={sectionLabel}>Category</p>
        <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
          {CATEGORIES.map(c => (
            <Pill
              key={c}
              active={(filters.category || 'all') === c}
              onClick={() => set('category', c === 'all' ? '' : c)}
            >
              {c}
            </Pill>
          ))}
        </div>
      </div>

      {/* ── Row 4: Condition pills ───────────────────────────────────────────── */}
      <div>
        <p style={sectionLabel}>Condition</p>
        <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
          {CONDITIONS.map(c => (
            <Pill
              key={c.value}
              active={(filters.condition || '') === c.value}
              onClick={() => set('condition', c.value)}
            >
              {c.label}
            </Pill>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Shared styles ─────────────────────────────────────────────────────────────
const sectionLabel = {
  fontSize:      'var(--text-xs)',
  fontWeight:    700,
  color:         'var(--text-muted)',
  marginBottom:  'var(--space-2)',
  textTransform: 'uppercase',
  letterSpacing: '0.07em',
};

// ── Category / Condition Pill ─────────────────────────────────────────────────
const Pill = ({ active, onClick, children }) => (
  <button
    onClick={onClick}
    style={{
      padding:        '6px 16px',
      borderRadius:   'var(--radius-pill)',
      fontSize:       'var(--text-xs)',
      fontWeight:     active ? 700 : 500,
      border:         'none',
      background:     active ? 'var(--color-primary)' : 'var(--bg-elevated)',
      color:          active ? '#fff' : 'var(--text-secondary)',
      cursor:         'pointer',
      transition:     'all var(--transition-fast)',
      textTransform:  'capitalize',
      letterSpacing:  '0.02em',
      whiteSpace:     'nowrap',
    }}
    onMouseEnter={e => {
      if (!active) {
        e.currentTarget.style.background = 'var(--bg-hover)';
        e.currentTarget.style.color = 'var(--text-primary)';
      }
    }}
    onMouseLeave={e => {
      if (!active) {
        e.currentTarget.style.background = 'var(--bg-elevated)';
        e.currentTarget.style.color = 'var(--text-secondary)';
      }
    }}
  >
    {children}
  </button>
);
