/**
 * pages/MarketplaceDetail.jsx
 * Single listing view — image, price, condition, seller info, mark-sold/delete.
 */
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { marketplaceApi } from '../api/marketplaceApi.js';
import { useAuth } from '../context/AuthContext.jsx';
import Badge from '../components/common/Badge.jsx';
import { SkeletonDetailPage } from '../components/common/Skeleton.jsx';

const FALLBACK = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="800" height="400" viewBox="0 0 800 400"%3E%3Crect width="800" height="400" fill="%231a1a2e"/%3E%3Ctext x="50%25" y="50%25" fill="%236b6b85" font-size="64" text-anchor="middle" dominant-baseline="middle"%3E🛒%3C/text%3E%3C/svg%3E';

export default function MarketplaceDetail() {
  const { id }               = useParams();
  const navigate             = useNavigate();
  const { user }             = useAuth();
  const [listing, setListing] = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [marking,  setMarking]  = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await marketplaceApi.getById(id);
        setListing(res.data.listing);
      } catch (err) {
        toast.error(err.message);
        navigate('/marketplace');
      } finally {
        setLoading(false);
      }
    })();
  }, [id, navigate]);

  const handleMarkSold = async () => {
    if (!confirm('Mark this listing as sold?')) return;
    setMarking(true);
    try {
      const res = await marketplaceApi.markAsSold(id);
      setListing(res.data.listing);
      toast.success('Listing marked as sold!');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setMarking(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this listing permanently?')) return;
    setDeleting(true);
    try {
      await marketplaceApi.delete(id);
      toast.success('Listing deleted');
      navigate('/marketplace');
    } catch (err) {
      toast.error(err.message);
      setDeleting(false);
    }
  };

  if (loading) return (
    <div className="page"><div className="container"><SkeletonDetailPage /></div></div>
  );
  if (!listing) return null;

  const isOwner = user?._id === listing.postedBy?._id;

  return (
    <div className="page">
      <div className="container">

        <button className="btn btn-ghost btn-sm" onClick={() => navigate('/marketplace')}
          style={{ marginBottom: 'var(--space-6)' }}>
          ← Back to Marketplace
        </button>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 'var(--space-8)', alignItems: 'start' }}>

          {/* ── LEFT: Image + Description ──────────────────────────────────── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
            <div style={{ borderRadius: 'var(--radius-xl)', overflow: 'hidden', border: '1px solid var(--border-subtle)', background: 'var(--bg-elevated)', position: 'relative' }}>
              <img src={listing.image || FALLBACK} alt={listing.title}
                onError={e => { e.target.src = FALLBACK; }}
                style={{ width: '100%', maxHeight: 480, objectFit: 'cover', display: 'block' }} />
              {listing.isSold && (
                <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: 'var(--text-4xl)', fontWeight: 900, color: '#ef4444', letterSpacing: 4 }}>SOLD</span>
                </div>
              )}
            </div>

            {/* Description */}
            <div className="card">
              <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, marginBottom: 'var(--space-4)' }}>About this item</h2>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8 }}>{listing.description}</p>
              {listing.tags?.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)', marginTop: 'var(--space-4)' }}>
                  {listing.tags.map(t => (
                    <span key={t} style={{ padding: '3px 12px', borderRadius: 'var(--radius-full)', background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                      #{t}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ── RIGHT: Price + Info + Actions ─────────────────────────────── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', position: 'sticky', top: 88 }}>

            {/* Price card */}
            <div className="card">
              <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-3)' }}>
                <Badge value={listing.condition} />
                {listing.isSold && <Badge value="sold" label="SOLD" />}
              </div>

              <div style={{ marginBottom: 'var(--space-2)' }}>
                <span style={{ fontSize: 'var(--text-4xl)', fontWeight: 900, color: 'var(--color-primary-light)' }}>
                  ₹{listing.price.toLocaleString()}
                </span>
              </div>

              <h1 style={{ fontSize: 'var(--text-xl)', fontWeight: 700, marginBottom: 'var(--space-5)' }}>
                {listing.title}
              </h1>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                <MetaRow icon="📁" label="Category"  value={listing.category} />
                {listing.location && <MetaRow icon="📍" label="Pickup"    value={listing.location} />}
                <MetaRow icon="📅" label="Listed"    value={new Date(listing.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })} />
              </div>
            </div>

            {/* Seller info */}
            <div className="card">
              <h3 style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--text-muted)', marginBottom: 'var(--space-4)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Seller
              </h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-3)' }}>
                <div style={{
                  width: 42, height: 42, borderRadius: '50%',
                  background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 700, color: '#fff', flexShrink: 0,
                }}>
                  {listing.postedBy?.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p style={{ fontWeight: 600, margin: 0 }}>{listing.postedBy?.name}</p>
                  <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', margin: 0 }}>
                    {listing.postedBy?.college || 'Student'}
                  </p>
                </div>
              </div>

              {/* Contact info */}
              {listing.contactInfo ? (
                <div style={{ padding: 'var(--space-3)', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)' }}>
                  <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', margin: '0 0 4px' }}>Contact</p>
                  <p style={{ fontSize: 'var(--text-sm)', fontWeight: 600, margin: 0 }}>{listing.contactInfo}</p>
                </div>
              ) : (
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                  Contact via their profile email: <strong>{listing.postedBy?.email}</strong>
                </p>
              )}
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              {/* Interested button (non-owner, not sold) */}
              {!isOwner && !listing.isSold && (
                <button className="btn btn-primary btn-lg"
                  onClick={() => { window.location.href = `mailto:${listing.postedBy?.email}?subject=Interested in: ${listing.title}`; }}>
                  📩 Contact Seller
                </button>
              )}

              {/* Sold overlay */}
              {listing.isSold && (
                <div style={{ padding: 'var(--space-4)', borderRadius: 'var(--radius-md)', textAlign: 'center', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171', fontWeight: 600 }}>
                  🔴 This item has been sold
                </div>
              )}

              {/* Owner: Mark as sold */}
              {isOwner && !listing.isSold && (
                <button id="mark-sold-btn" className="btn btn-outline" onClick={handleMarkSold} disabled={marking}
                  style={{ borderColor: 'var(--color-success)', color: 'var(--color-success)' }}>
                  {marking ? 'Updating…' : '✅ Mark as Sold'}
                </button>
              )}

              {/* Owner: Delete */}
              {isOwner && (
                <button id="delete-listing-btn" className="btn btn-ghost" onClick={handleDelete} disabled={deleting}
                  style={{ color: 'var(--color-danger)', border: '1px solid rgba(239,68,68,0.3)' }}>
                  {deleting ? 'Deleting…' : '🗑 Delete Listing'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const MetaRow = ({ icon, label, value }) => (
  <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center' }}>
    <span style={{ fontSize: '1rem', width: 24, textAlign: 'center' }}>{icon}</span>
    <div>
      <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', margin: 0 }}>{label}</p>
      <p style={{ fontSize: 'var(--text-sm)', fontWeight: 500, margin: 0, textTransform: 'capitalize' }}>{value}</p>
    </div>
  </div>
);
