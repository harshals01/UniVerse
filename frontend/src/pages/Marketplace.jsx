/**
 * pages/Marketplace.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Marketplace listings — Dark Modular theme.
 * Bento card grid with responsive column breakpoints.
 * All API calls, filter logic, pagination, and state hooks are unchanged.
 * ─────────────────────────────────────────────────────────────────────────────
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Plus } from 'lucide-react';
import { marketplaceApi } from '../api/marketplaceApi.js';
import ProductCard from '../components/marketplace/ProductCard.jsx';
import CategoryFilter from '../components/marketplace/CategoryFilter.jsx';
import EmptyState from '../components/common/EmptyState.jsx';
import { SkeletonGrid } from '../components/common/Skeleton.jsx';
import PageError from '../components/common/PageError.jsx';

const DEFAULT_FILTERS = { category: '', condition: '', isSold: 'false', minPrice: '', maxPrice: '', search: '', sortBy: 'newest' };

export default function Marketplace() {
  const navigate = useNavigate();
  const [listings,   setListings]   = useState([]);
  const [filters,    setFilters]    = useState(DEFAULT_FILTERS);
  const [pagination, setPagination] = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [fetchError, setFetchError] = useState('');
  const [page,       setPage]       = useState(1);
  const debounceRef = useRef(null);

  /* ── API call — unchanged ─────────────────────────────────────────────────── */
  const fetchListings = useCallback(async (currentFilters, currentPage) => {
    setLoading(true);
    setFetchError('');
    try {
      const params = { page: currentPage, limit: 12, ...currentFilters };
      Object.keys(params).forEach(k => { if (params[k] === '' || params[k] === null) delete params[k]; });
      const res = await marketplaceApi.getAll(params);
      setListings(res.data.listings);
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
    debounceRef.current = setTimeout(() => fetchListings(newFilters, 1), delay);
  };

  useEffect(() => { fetchListings(DEFAULT_FILTERS, 1); }, [fetchListings]);

  return (
    <div className="page">
      <div className="container">

        {/* ── Page header ── */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1 style={{ fontSize: 'var(--text-3xl)', fontWeight: 800, letterSpacing: '-0.02em' }}>Marketplace</h1>
            <p style={{ color: 'var(--text-muted)', marginTop: 6, fontSize: 'var(--text-sm)' }}>Buy and sell items with students on campus.</p>
          </div>
          <button
            id="create-listing-btn"
            onClick={() => navigate('/marketplace/create')}
            className="btn btn-primary"
          >
            <Plus size={15} /> Sell an Item
          </button>
        </div>

        {/* ── Filter bar ──────────────────────────────────────────────────────── */}
        <CategoryFilter filters={filters} onChange={handleFilterChange} />

        {/* ── Results count ── */}
        {pagination && !loading && (
          <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-xs)', marginBottom: 20, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            {pagination.total} listing{pagination.total !== 1 ? 's' : ''} found
          </p>
        )}

        {/* ── Bento grid / states ─────────────────────────────────────────────── */}
        {loading ? (
          <SkeletonGrid count={8} />
        ) : fetchError ? (
          <PageError message={fetchError} onRetry={() => fetchListings(filters, page)} />
        ) : listings.length === 0 ? (
          <EmptyState
            icon="◈"
            title="No listings found"
            description="Try adjusting your filters, or be the first to list something."
            action={{ label: '+ Sell an item', onClick: () => navigate('/marketplace/create') }}
          />
        ) : (
          <div className="mkt-grid">
            {listings.map(l => <ProductCard key={l._id} listing={l} />)}
          </div>
        )}

        {/* ── Pagination ── */}
        {pagination && pagination.totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 10, marginTop: 48 }}>
            <PaginationBtn disabled={!pagination.hasPrev} onClick={() => { const p = page - 1; setPage(p); fetchListings(filters, p); }}>← Prev</PaginationBtn>
            <span style={{ padding: '8px 20px', background: 'var(--bg-surface)', border: '1px solid var(--border-glass)', borderRadius: 'var(--radius-pill)', color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', fontWeight: 600 }}>
              {pagination.page} / {pagination.totalPages}
            </span>
            <PaginationBtn disabled={!pagination.hasNext} onClick={() => { const p = page + 1; setPage(p); fetchListings(filters, p); }}>Next →</PaginationBtn>
          </div>
        )}
      </div>

      <style>{`
        .mkt-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
        @media (max-width: 1100px) { .mkt-grid { grid-template-columns: repeat(3, 1fr); } }
        @media (max-width: 768px)  { .mkt-grid { grid-template-columns: repeat(2, 1fr); gap: 12px; } }
        @media (max-width: 480px)  { .mkt-grid { grid-template-columns: 1fr; } }
      `}</style>
    </div>
  );
}

// ── Pagination button ─────────────────────────────────────────────────────────
const PaginationBtn = ({ children, disabled, onClick }) => (
  <button
    disabled={disabled}
    onClick={onClick}
    className={`btn btn-secondary btn-sm${disabled ? '' : ''}`}
    style={{ opacity: disabled ? 0.4 : 1, cursor: disabled ? 'not-allowed' : 'pointer' }}
  >
    {children}
  </button>
);
