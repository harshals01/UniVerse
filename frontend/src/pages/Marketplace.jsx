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
    <div style={{ padding: 'var(--space-8) 0 var(--space-16)', minHeight: '100vh' }}>
      <div className="container">

        {/* ── Page header ─────────────────────────────────────────────────────── */}
        <div style={{
          display:        'flex',
          alignItems:     'flex-start',
          justifyContent: 'space-between',
          marginBottom:   'var(--space-8)',
          flexWrap:       'wrap',
          gap:            'var(--space-4)',
        }}>
          <div>
            <h1 style={{ fontSize: 'var(--text-3xl)', fontWeight: 800, letterSpacing: '-0.02em' }}>
              Marketplace
            </h1>
            <p style={{ color: 'var(--text-secondary)', marginTop: 'var(--space-1)', fontSize: 'var(--text-sm)' }}>
              Buy and sell items with students on your campus.
            </p>
          </div>

          <button
            id="create-listing-btn"
            onClick={() => navigate('/marketplace/create')}
            style={{
              padding:      'var(--space-3) var(--space-6)',
              borderRadius: 'var(--radius-pill)',
              background:   'var(--color-primary)',
              color:        '#fff',
              fontWeight:   700,
              fontSize:     'var(--text-sm)',
              border:       'none',
              cursor:       'pointer',
              transition:   'background var(--transition-fast), box-shadow var(--transition-fast)',
              whiteSpace:   'nowrap',
              display:      'flex',
              alignItems:   'center',
              gap:          'var(--space-2)',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--color-primary-dark)'; e.currentTarget.style.boxShadow = '0 0 20px var(--color-primary-glow)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'var(--color-primary)'; e.currentTarget.style.boxShadow = 'none'; }}
          >
            + Sell an Item
          </button>
        </div>

        {/* ── Filter bar ──────────────────────────────────────────────────────── */}
        <CategoryFilter filters={filters} onChange={handleFilterChange} />

        {/* ── Results count ───────────────────────────────────────────────────── */}
        {pagination && !loading && (
          <p style={{
            color:         'var(--text-muted)',
            fontSize:      'var(--text-xs)',
            marginBottom:  'var(--space-5)',
            fontWeight:    600,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}>
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

        {/* ── Pagination ──────────────────────────────────────────────────────── */}
        {pagination && pagination.totalPages > 1 && (
          <div style={{
            display:        'flex',
            justifyContent: 'center',
            alignItems:     'center',
            gap:            'var(--space-3)',
            marginTop:      'var(--space-12)',
          }}>
            <PaginationBtn
              disabled={!pagination.hasPrev}
              onClick={() => { const p = page - 1; setPage(p); fetchListings(filters, p); }}
            >
              ← Prev
            </PaginationBtn>

            <span style={{
              padding:      '8px 20px',
              background:   'var(--bg-surface)',
              borderRadius: 'var(--radius-pill)',
              color:        'var(--text-secondary)',
              fontSize:     'var(--text-sm)',
              fontWeight:   600,
            }}>
              {pagination.page} / {pagination.totalPages}
            </span>

            <PaginationBtn
              disabled={!pagination.hasNext}
              onClick={() => { const p = page + 1; setPage(p); fetchListings(filters, p); }}
            >
              Next →
            </PaginationBtn>
          </div>
        )}
      </div>

      {/* ── Responsive grid styles ───────────────────────────────────────────── */}
      <style>{`
        .mkt-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: var(--space-5);
        }
        @media (max-width: 1100px) {
          .mkt-grid { grid-template-columns: repeat(3, 1fr); }
        }
        @media (max-width: 768px) {
          .mkt-grid { grid-template-columns: repeat(2, 1fr); gap: var(--space-4); }
        }
        @media (max-width: 480px) {
          .mkt-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}

// ── Pagination button ─────────────────────────────────────────────────────────
const PaginationBtn = ({ children, disabled, onClick }) => (
  <button
    disabled={disabled}
    onClick={onClick}
    style={{
      padding:      '8px 20px',
      borderRadius: 'var(--radius-pill)',
      background:   'var(--bg-surface)',
      color:        disabled ? 'var(--text-muted)' : 'var(--text-primary)',
      border:       'none',
      fontWeight:   600,
      fontSize:     'var(--text-sm)',
      cursor:       disabled ? 'not-allowed' : 'pointer',
      opacity:      disabled ? 0.4 : 1,
      transition:   'background var(--transition-fast)',
    }}
    onMouseEnter={e => { if (!disabled) e.currentTarget.style.background = 'var(--bg-elevated)'; }}
    onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg-surface)'; }}
  >
    {children}
  </button>
);
