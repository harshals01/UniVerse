/**
 * components/lostfound/ItemFilter.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Filter bar — Dark Modular theme.
 * Pill chips for Type/Status, pill search input, category row.
 * All filter state logic and onChange calls are unchanged.
 * ─────────────────────────────────────────────────────────────────────────────
 */

const TYPES      = [{ value: '', label: 'All' }, { value: 'lost', label: 'Lost' }, { value: 'found', label: 'Found' }];
const STATUSES   = [{ value: '', label: 'All' }, { value: 'open', label: 'Open' }, { value: 'claimed', label: 'Claimed' }];
const CATEGORIES = ['all', 'electronics', 'clothing', 'accessories', 'books', 'documents', 'keys', 'bags', 'sports', 'other'];

/* ── Colour definitions for type pills ──────────────────────────────────────── */
const TYPE_COLORS = {
  '':      { active: { bg: 'var(--color-primary)',           color: '#fff'     }, inactive: null },
  'lost':  { active: { bg: 'rgba(229,69,3,0.85)',            color: '#fff'     }, inactive: null },
  'found': { active: { bg: 'rgba(34,197,94,0.85)',           color: '#fff'     }, inactive: null },
};

export default function ItemFilter({ filters, onChange }) {
  const set = (key, val) => onChange({ ...filters, [key]: val });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>

      {/* ── Search ──────────────────────────────────────────────────────────── */}
      <div style={{ position: 'relative', maxWidth: 520 }}>
        <span style={{
          position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)',
          color: 'var(--text-muted)', fontSize: '1rem', pointerEvents: 'none',
        }}>◎</span>
        <input
          type="text"
          placeholder="Search by title, description, or location…"
          value={filters.search || ''}
          onChange={e => set('search', e.target.value)}
          style={{
            width:        '100%',
            paddingLeft:  44,
            fontSize:     'var(--text-sm)',
            borderRadius: 'var(--radius-pill)',
          }}
        />
      </div>

      {/* ── Filter rows ─────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', gap: 'var(--space-6)', flexWrap: 'wrap', alignItems: 'flex-start' }}>

        {/* Type */}
        <FilterGroup label="Type">
          {TYPES.map(t => {
            const colors = TYPE_COLORS[t.value];
            const isActive = filters.type === t.value;
            return (
              <TypePill
                key={t.value}
                active={isActive}
                onClick={() => set('type', t.value)}
                activeStyle={colors?.active}
              >
                {t.label}
              </TypePill>
            );
          })}
        </FilterGroup>

        {/* Status */}
        <FilterGroup label="Status">
          {STATUSES.map(s => (
            <Pill key={s.value} active={filters.status === s.value} onClick={() => set('status', s.value)}>
              {s.label}
            </Pill>
          ))}
        </FilterGroup>
      </div>

      {/* ── Category row (full width) ────────────────────────────────────────── */}
      <FilterGroup label="Category">
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
      </FilterGroup>
    </div>
  );
}

/* ── Sub-components ─────────────────────────────────────────────────────────── */
const FilterGroup = ({ label, children }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
    <p style={{
      fontSize:      'var(--text-xs)',
      fontWeight:    700,
      color:         'var(--text-muted)',
      margin:        0,
      textTransform: 'uppercase',
      letterSpacing: '0.07em',
    }}>
      {label}
    </p>
    <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
      {children}
    </div>
  </div>
);

/* Standard pill — orange when active */
const Pill = ({ active, onClick, children }) => (
  <button
    onClick={onClick}
    style={{
      padding:       '6px 16px',
      borderRadius:  'var(--radius-pill)',
      fontSize:      'var(--text-xs)',
      fontWeight:    active ? 700 : 500,
      border:        'none',
      background:    active ? 'var(--color-primary)' : 'var(--bg-elevated)',
      color:         active ? '#fff' : 'var(--text-secondary)',
      cursor:        'pointer',
      transition:    'all var(--transition-fast)',
      textTransform: 'capitalize',
      whiteSpace:    'nowrap',
    }}
    onMouseEnter={e => { if (!active) { e.currentTarget.style.background = 'var(--bg-hover)'; e.currentTarget.style.color = 'var(--text-primary)'; }}}
    onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'var(--bg-elevated)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}}
  >
    {children}
  </button>
);

/* Type pill — uses its own semantic colour when active (orange for Lost, green for Found) */
const TypePill = ({ active, onClick, children, activeStyle }) => (
  <button
    onClick={onClick}
    style={{
      padding:    '6px 16px',
      borderRadius: 'var(--radius-pill)',
      fontSize:   'var(--text-xs)',
      fontWeight: active ? 800 : 500,
      border:     'none',
      background: active ? (activeStyle?.bg ?? 'var(--color-primary)') : 'var(--bg-elevated)',
      color:      active ? (activeStyle?.color ?? '#fff') : 'var(--text-secondary)',
      cursor:     'pointer',
      transition: 'all var(--transition-fast)',
      whiteSpace: 'nowrap',
      letterSpacing: active ? '0.04em' : 0,
    }}
    onMouseEnter={e => { if (!active) { e.currentTarget.style.background = 'var(--bg-hover)'; e.currentTarget.style.color = 'var(--text-primary)'; }}}
    onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'var(--bg-elevated)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}}
  >
    {children}
  </button>
);
