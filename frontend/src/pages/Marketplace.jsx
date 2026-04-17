/**
 * pages/Marketplace.jsx
 * Marketplace listings grid with full filter bar + pagination.
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

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 'var(--space-8)', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
          <div>
            <h1 style={{ fontSize: 'var(--text-3xl)', fontWeight: 800 }}>🛒 Marketplace</h1>
            <p style={{ color: 'var(--text-secondary)', marginTop: 'var(--space-2)' }}>
              Buy and sell items with students on your campus.
            </p>
          </div>
          <button id="create-listing-btn" className="btn btn-primary btn-lg"
            onClick={() => navigate('/marketplace/create')}>
            + Sell an Item
          </button>
        </div>

        {/* Filters */}
        <CategoryFilter filters={filters} onChange={handleFilterChange} />

        {/* Results count */}
        {pagination && !loading && (
          <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-5)' }}>
            {pagination.total} listing{pagination.total !== 1 ? 's' : ''} found
          </p>
        )}

        {/* Grid */}
        {loading ? (
          <SkeletonGrid count={6} />
        ) : fetchError ? (
          <PageError message={fetchError} onRetry={() => fetchListings(filters, page)} />
        ) : listings.length === 0 ? (
          <EmptyState
            icon="🛍️"
            title="No listings found"
            description="Try adjusting your filters, or list your first item."
            action={{ label: '+ Sell an item', onClick: () => navigate('/marketplace/create') }}
          />
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 'var(--space-5)' }}>
            {listings.map(l => <ProductCard key={l._id} listing={l} />)}
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 'var(--space-3)', marginTop: 'var(--space-10)' }}>
            <button className="btn btn-outline btn-sm" disabled={!pagination.hasPrev}
              onClick={() => { const p = page - 1; setPage(p); fetchListings(filters, p); }}>
              ← Prev
            </button>
            <span style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <button className="btn btn-outline btn-sm" disabled={!pagination.hasNext}
              onClick={() => { const p = page + 1; setPage(p); fetchListings(filters, p); }}>
              Next →
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
