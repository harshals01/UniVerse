/**
 * pages/LostFound.jsx
 * List page — grid of items + filter bar + pagination.
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
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

  // Debounce search, immediate on filter change
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

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 'var(--space-8)', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
          <div>
            <h1 style={{ fontSize: 'var(--text-3xl)', fontWeight: 800 }}>🔍 Lost & Found</h1>
            <p style={{ color: 'var(--text-secondary)', marginTop: 'var(--space-2)' }}>
              Report lost items or help others recover what they've found.
            </p>
          </div>
          <button id="create-lostfound-btn" className="btn btn-primary btn-lg"
            onClick={() => navigate('/lostfound/create')}>
            + Report Item
          </button>
        </div>

        {/* Filters */}
        <ItemFilter filters={filters} onChange={handleFilterChange} />

        {/* Results count */}
        {pagination && !loading && (
          <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-5)' }}>
            Showing {items.length} of {pagination.total} items
          </p>
        )}

        {/* Grid */}
        {loading ? (
          <SkeletonGrid count={6} />
        ) : fetchError ? (
          <PageError message={fetchError} onRetry={() => fetchItems(filters, page)} />
        ) : items.length === 0 ? (
          <EmptyState
            icon="🔍"
            title="No items found"
            description="Try adjusting your filters, or be the first to report an item."
            action={{ label: '+ Report an item', onClick: () => navigate('/lostfound/create') }}
          />
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 'var(--space-5)' }}>
            {items.map(item => <ItemCard key={item._id} item={item} />)}
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 'var(--space-3)', marginTop: 'var(--space-10)' }}>
            <button className="btn btn-outline btn-sm" disabled={!pagination.hasPrev}
              onClick={() => { const p = page - 1; setPage(p); fetchItems(filters, p); }}>
              ← Prev
            </button>
            <span style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <button className="btn btn-outline btn-sm" disabled={!pagination.hasNext}
              onClick={() => { const p = page + 1; setPage(p); fetchItems(filters, p); }}>
              Next →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
