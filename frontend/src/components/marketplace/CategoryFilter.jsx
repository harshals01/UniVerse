/**
 * components/marketplace/CategoryFilter.jsx
 * Reuses the same Pill + FilterGroup pattern from ItemFilter,
 * extended with price range inputs and condition filter.
 */

const CATEGORIES  = ['all', 'electronics', 'clothing', 'accessories', 'books', 'documents', 'keys', 'bags', 'sports', 'other'];
const CONDITIONS  = [{ value: '', label: 'All Conditions' }, { value: 'new', label: '✨ New' }, { value: 'like-new', label: '👌 Like-new' }, { value: 'good', label: '👍 Good' }, { value: 'fair', label: '🔄 Fair' }];
const SORT_OPTIONS = [
  { value: 'newest',     label: 'Newest' },
  { value: 'price_asc',  label: 'Price ↑' },
  { value: 'price_desc', label: 'Price ↓' },
  { value: 'oldest',     label: 'Oldest' },
];

export default function CategoryFilter({ filters, onChange }) {
  const set = (key, val) => onChange({ ...filters, [key]: val });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>

      {/* Top row: Search + Sort + Available toggle */}
      <div style={{ display: 'flex', gap: 'var(--space-4)', alignItems: 'center', flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="🔍  Search listings…"
          value={filters.search || ''}
          onChange={e => set('search', e.target.value)}
          style={{ flex: 1, minWidth: 220, fontSize: 'var(--text-sm)' }}
        />

        {/* Sort select */}
        <select
          value={filters.sortBy || 'newest'}
          onChange={e => set('sortBy', e.target.value)}
          style={{ width: 'auto', padding: '10px 14px', fontSize: 'var(--text-sm)' }}
        >
          {SORT_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>

        {/* Show sold toggle */}
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
          <input
            type="checkbox"
            checked={filters.isSold === 'true'}
            onChange={e => set('isSold', e.target.checked ? 'true' : 'false')}
            style={{ width: 'auto', accentColor: 'var(--color-primary)' }}
          />
          Show sold
        </label>
      </div>

      {/* Price range */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Price</span>
        <input type="number" placeholder="Min ₹" value={filters.minPrice || ''} onChange={e => set('minPrice', e.target.value)}
          style={{ width: 100, fontSize: 'var(--text-sm)' }} min={0} />
        <span style={{ color: 'var(--text-muted)' }}>—</span>
        <input type="number" placeholder="Max ₹" value={filters.maxPrice || ''} onChange={e => set('maxPrice', e.target.value)}
          style={{ width: 100, fontSize: 'var(--text-sm)' }} min={0} />
      </div>

      {/* Category pills */}
      <div>
        <p style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 'var(--space-2)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Category</p>
        <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
          {CATEGORIES.map(c => <Pill key={c} active={(filters.category || 'all') === c} onClick={() => set('category', c === 'all' ? '' : c)}>{c}</Pill>)}
        </div>
      </div>

      {/* Condition pills */}
      <div>
        <p style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 'var(--space-2)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Condition</p>
        <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
          {CONDITIONS.map(c => <Pill key={c.value} active={(filters.condition || '') === c.value} onClick={() => set('condition', c.value)}>{c.label}</Pill>)}
        </div>
      </div>
    </div>
  );
}

const Pill = ({ active, onClick, children }) => (
  <button onClick={onClick} style={{
    padding: '5px 14px', borderRadius: 'var(--radius-full)',
    fontSize: 'var(--text-xs)', fontWeight: active ? 600 : 400,
    border: `1px solid ${active ? 'var(--color-primary)' : 'var(--border-default)'}`,
    background: active ? 'var(--color-primary-glow)' : 'transparent',
    color: active ? 'var(--color-primary-light)' : 'var(--text-secondary)',
    cursor: 'pointer', transition: 'all var(--transition-fast)', textTransform: 'capitalize',
  }}>{children}</button>
);
