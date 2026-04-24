/**
 * pages/LostFound.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Lost & Found list page — Dark Modular theme.
 * Items render as a vertical stack of horizontal Bento cards.
 * All API calls, filter logic, pagination, and state hooks are unchanged.
 * ─────────────────────────────────────────────────────────────────────────────
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Plus } from 'lucide-react';
import { lostFoundApi } from '../api/lostFoundApi.js';
import ItemCard from '../components/lostfound/ItemCard.jsx';
import ItemFilter from '../components/lostfound/ItemFilter.jsx';
import EmptyState from '../components/common/EmptyState.jsx';
import { SkeletonGrid } from '../components/common/Skeleton.jsx';
import PageError from '../components/common/PageError.jsx';

const DEFAULT_FILTERS = { type: '', status: '', category: '', search: '' };

export default function LostFound() {
  const navigate = useNavigate();
  const [items,      setItems]      = useState([]);
  const [filters,    setFilters]    = useState(DEFAULT_FILTERS);
  const [pagination, setPagination] = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [fetchError, setFetchError] = useState('');
  const [page,       setPage]       = useState(1);
  const debounceRef = useRef(null);

  /* ── API — unchanged ──────────────────────────────────────────────────────── */
  const fetchItems = useCallback(async (currentFilters, currentPage) => {
    setLoading(true);
    setFetchError('');
    try {
      const params = { page: currentPage, limit: 12, ...currentFilters };
      Object.keys(params).forEach(k => { if (!params[k]) delete params[k]; });
      const res = await lostFoundApi.getAll(params);
      setItems(res.data.items);
      setPagination(res.data.pagination);
    } catch (err) {
      setFetchError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setPage(1);
    clearTimeout(debounceRef.current);
    const delay = newFilters.search !== filters.search ? 400 : 0;
    debounceRef.current = setTimeout(() => fetchItems(newFilters, 1), delay);
  };

  useEffect(() => { fetchItems(DEFAULT_FILTERS, 1); }, [fetchItems]);

  return (
    <div className="page">
      <div className="container">

        {/* ── Page header ── */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1 style={{ fontSize: 'var(--text-3xl)', fontWeight: 800, letterSpacing: '-0.02em' }}>Lost & Found</h1>
            <p style={{ color: 'var(--text-muted)', marginTop: 6, fontSize: 'var(--text-sm)' }}>Report lost items or help others recover what they've found.</p>
          </div>
          <button
            id="create-lostfound-btn"
            onClick={() => navigate('/lostfound/create')}
            className="btn btn-primary"
          >
            <Plus size={15} /> Report Item
          </button>
        </div>

        {/* ── Filter bar ──────────────────────────────────────────────────────── */}
        <ItemFilter filters={filters} onChange={handleFilterChange} />

        {/* ── Results count ───────────────────────────────────────────────────── */}
        {pagination && !loading && (
          <p style={{
            color:         'var(--text-muted)',
            fontSize:      'var(--text-xs)',
            fontWeight:    700,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            marginBottom:  'var(--space-4)',
          }}>
            {items.length} of {pagination.total} items
          </p>
        )}

        {/* ── Feed ────────────────────────────────────────────────────────────── */}
        {loading ? (
          <SkeletonGrid count={6} />
        ) : fetchError ? (
          <PageError message={fetchError} onRetry={() => fetchItems(filters, page)} />
        ) : items.length === 0 ? (
          <EmptyState
            icon="◎"
            title="No items found"
            description="Try adjusting your filters, or be the first to report an item."
            action={{ label: '+ Report an item', onClick: () => navigate('/lostfound/create') }}
          />
        ) : (
          /* Vertical stack of horizontal cards */
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            {items.map(item => <ItemCard key={item._id} item={item} />)}
          </div>
        )}

        {/* ── Pagination ── */}
        {pagination && pagination.totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 10, marginTop: 48 }}>
            <PageBtn disabled={!pagination.hasPrev} onClick={() => { const p = page - 1; setPage(p); fetchItems(filters, p); }}>← Prev</PageBtn>
            <span style={{ padding: '8px 20px', background: 'var(--bg-surface)', border: '1px solid var(--border-glass)', borderRadius: 'var(--radius-pill)', color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', fontWeight: 600 }}>
              {pagination.page} / {pagination.totalPages}
            </span>
            <PageBtn disabled={!pagination.hasNext} onClick={() => { const p = page + 1; setPage(p); fetchItems(filters, p); }}>Next →</PageBtn>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Pagination button ────────────────────────────────────────────────────────  */
const PageBtn = ({ children, disabled, onClick }) => (
  <button
    disabled={disabled} onClick={onClick}
    className="btn btn-secondary btn-sm"
    style={{ opacity: disabled ? 0.4 : 1, cursor: disabled ? 'not-allowed' : 'pointer' }}
  >
    {children}
  </button>
);
