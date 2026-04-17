/**
 * components/lostfound/ItemFilter.jsx
 * Horizontal filter bar for Lost & Found list page.
 * Reusable: accepts filters state + onChange handler from parent.
 */

const TYPES       = [{ value: '', label: 'All' }, { value: 'lost', label: '🔴 Lost' }, { value: 'found', label: '🟢 Found' }];
const STATUSES    = [{ value: '', label: 'All' }, { value: 'open', label: 'Open' }, { value: 'claimed', label: 'Claimed' }];
const CATEGORIES  = ['all', 'electronics', 'clothing', 'accessories', 'books', 'documents', 'keys', 'bags', 'sports', 'other'];

export default function ItemFilter({ filters, onChange }) {
  const set = (key, val) => onChange({ ...filters, [key]: val });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
      {/* Search */}
      <input
        type="text"
        placeholder="🔍  Search by title, description, or location…"
        value={filters.search || ''}
        onChange={e => set('search', e.target.value)}
        style={{ maxWidth: 480, fontSize: 'var(--text-sm)' }}
      />

      {/* Filter rows */}
      <div style={{ display: 'flex', gap: 'var(--space-6)', flexWrap: 'wrap' }}>
        {/* Type pills */}
        <FilterGroup label="Type">
          {TYPES.map(t => (
            <Pill key={t.value} active={filters.type === t.value} onClick={() => set('type', t.value)}>
              {t.label}
            </Pill>
          ))}
        </FilterGroup>

        {/* Status pills */}
        <FilterGroup label="Status">
          {STATUSES.map(s => (
            <Pill key={s.value} active={filters.status === s.value} onClick={() => set('status', s.value)}>
              {s.label}
            </Pill>
          ))}
        </FilterGroup>

        {/* Category pills */}
        <FilterGroup label="Category">
          <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
            {CATEGORIES.map(c => (
              <Pill key={c} active={(filters.category || 'all') === c} onClick={() => set('category', c === 'all' ? '' : c)}>
                {c}
              </Pill>
            ))}
          </div>
        </FilterGroup>
      </div>
    </div>
  );
}

const FilterGroup = ({ label, children }) => (
  <div>
    <p style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 'var(--space-2)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
      {label}
    </p>
    <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
      {children}
    </div>
  </div>
);

const Pill = ({ active, onClick, children }) => (
  <button
    onClick={onClick}
    style={{
      padding: '5px 14px',
      borderRadius: 'var(--radius-full)',
      fontSize: 'var(--text-xs)',
      fontWeight: active ? 600 : 400,
      border: `1px solid ${active ? 'var(--color-primary)' : 'var(--border-default)'}`,
      background: active ? 'var(--color-primary-glow)' : 'transparent',
      color: active ? 'var(--color-primary-light)' : 'var(--text-secondary)',
      cursor: 'pointer',
      transition: 'all var(--transition-fast)',
      textTransform: 'capitalize',
    }}
  >
    {children}
  </button>
);
