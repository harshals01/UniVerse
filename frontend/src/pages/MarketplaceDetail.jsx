/**
 * pages/MarketplaceDetail.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Single listing view — Dark Modular theme.
 * Two-column: large image + description on the left, sticky info + actions on
 * the right. Tags as pills, seller avatar as circle, meta rows with icon chips.
 *
 * All useEffect, API calls, handleMarkSold, handleDelete, and auth logic
 * are unchanged.
 * ─────────────────────────────────────────────────────────────────────────────
 */
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { marketplaceApi } from '../api/marketplaceApi.js';
import { useAuth } from '../context/AuthContext.jsx';
import Badge from '../components/common/Badge.jsx';
import { SkeletonDetailPage } from '../components/common/Skeleton.jsx';

const FALLBACK = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="800" height="400" viewBox="0 0 800 400"%3E%3Crect width="800" height="400" fill="%23202020"/%3E%3Ctext x="50%25" y="50%25" fill="%23444" font-size="80" text-anchor="middle" dominant-baseline="middle"%3E◈%3C/text%3E%3C/svg%3E';

export default function MarketplaceDetail() {
  const { id }               = useParams();
  const navigate             = useNavigate();
  const { user }             = useAuth();
  const [listing, setListing] = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [marking,  setMarking]  = useState(false);
  const [deleting, setDeleting] = useState(false);

  /* ── Unchanged data fetching ──────────────────────────────────────────────── */
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

  /* ── Unchanged action handlers ────────────────────────────────────────────── */
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
    <div style={{ padding: 'var(--space-8) 0' }}><div className="container"><SkeletonDetailPage /></div></div>
  );
  if (!listing) return null;

  const isOwner = user?._id === listing.postedBy?._id;

  return (
    <div style={{ padding: 'var(--space-8) 0 var(--space-16)', minHeight: '100vh' }}>
      <div className="container">

        {/* Back button */}
        <button onClick={() => navigate('/marketplace')} style={ghostBackBtn}>
          ← Back to Marketplace
        </button>

        <div className="mpd-layout">

          {/* ── LEFT: Image + About ──────────────────────────────────────────── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>

            {/* Hero image */}
            <div style={{
              borderRadius: 'var(--radius-xl)',
              overflow:     'hidden',
              background:   'var(--bg-elevated)',
              position:     'relative',
            }}>
              <img
                src={listing.image || FALLBACK}
                alt={listing.title}
                onError={e => { e.target.src = FALLBACK; }}
                style={{ width: '100%', maxHeight: 480, objectFit: 'cover', display: 'block' }}
              />
              {listing.isSold && (
                <div style={{
                  position: 'absolute', inset: 0,
                  background: 'rgba(0,0,0,0.65)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <span style={{
                    fontSize:     'var(--text-4xl)',
                    fontWeight:   900,
                    color:        '#ef4444',
                    letterSpacing: 6,
                    padding:      '8px 28px',
                    background:   'rgba(0,0,0,0.5)',
                    borderRadius: 'var(--radius-pill)',
                  }}>
                    SOLD
                  </span>
                </div>
              )}
            </div>

            {/* Description card */}
            <div style={{
              background:   'var(--bg-surface)',
              borderRadius: 'var(--radius-lg)',
              padding:      'var(--space-6)',
            }}>
              <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, marginBottom: 'var(--space-4)' }}>
                About this item
              </h2>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, margin: 0 }}>
                {listing.description}
              </p>

              {/* Tags */}
              {listing.tags?.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)', marginTop: 'var(--space-5)' }}>
                  {listing.tags.map(t => (
                    <span key={t} style={{
                      padding:      '4px 14px',
                      borderRadius: 'var(--radius-pill)',
                      background:   'var(--bg-elevated)',
                      fontSize:     'var(--text-xs)',
                      color:        'var(--text-muted)',
                      fontWeight:   600,
                    }}>
                      #{t}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ── RIGHT: Sticky info + actions panel ──────────────────────────── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', position: 'sticky', top: 24 }}>

            {/* Price + title card */}
            <div style={{ background: 'var(--bg-surface)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-6)' }}>
              {/* Badges row */}
              <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-4)', flexWrap: 'wrap' }}>
                <Badge value={listing.condition} />
                {listing.isSold && <Badge value="sold" label="SOLD" />}
                <span style={{
                  padding:      '3px 12px',
                  borderRadius: 'var(--radius-pill)',
                  background:   'var(--bg-elevated)',
                  fontSize:     'var(--text-xs)',
                  color:        'var(--text-muted)',
                  fontWeight:   600,
                  textTransform: 'capitalize',
                }}>
                  {listing.category}
                </span>
              </div>

              {/* Price */}
              <div style={{ marginBottom: 'var(--space-3)' }}>
                <span style={{
                  fontSize:      'var(--text-4xl)',
                  fontWeight:    900,
                  color:         'var(--color-primary)',
                  letterSpacing: '-0.03em',
                }}>
                  ₹{listing.price.toLocaleString()}
                </span>
              </div>

              {/* Title */}
              <h1 style={{
                fontSize:      'var(--text-xl)',
                fontWeight:    700,
                marginBottom:  'var(--space-6)',
                lineHeight:    1.3,
              }}>
                {listing.title}
              </h1>

              {/* Meta rows */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                <MetaRow icon="📁" label="Category" value={listing.category} />
                {listing.location && <MetaRow icon="📍" label="Pickup"   value={listing.location} />}
                <MetaRow icon="📅" label="Listed" value={new Date(listing.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })} />
              </div>
            </div>

            {/* Seller card */}
            <div style={{ background: 'var(--bg-surface)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-6)' }}>
              <p style={{
                fontSize: 'var(--text-xs)', fontWeight: 700,
                color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em',
                marginBottom: 'var(--space-4)',
              }}>
                Seller
              </p>

              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
                {/* Avatar */}
                <div style={{
                  width: 44, height: 44, borderRadius: '50%',
                  background: 'var(--color-primary)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 700, color: '#fff', fontSize: '1.1rem', flexShrink: 0,
                }}>
                  {listing.postedBy?.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p style={{ fontWeight: 700, margin: 0, fontSize: 'var(--text-sm)' }}>
                    {listing.postedBy?.name}
                  </p>
                  <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', margin: 0 }}>
                    {listing.postedBy?.college || 'Student'}
                  </p>
                </div>
              </div>

              {/* Contact info */}
              {listing.contactInfo ? (
                <div style={{
                  padding:      'var(--space-3) var(--space-4)',
                  background:   'var(--bg-elevated)',
                  borderRadius: 'var(--radius-md)',
                }}>
                  <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Contact
                  </p>
                  <p style={{ fontSize: 'var(--text-sm)', fontWeight: 700, margin: 0 }}>
                    {listing.contactInfo}
                  </p>
                </div>
              ) : (
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                  Reach out via email: <strong style={{ color: 'var(--text-secondary)' }}>{listing.postedBy?.email}</strong>
                </p>
              )}
            </div>

            {/* ── CTA actions ─────────────────────────────────────────────── */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>

              {/* Contact seller (non-owner, not sold) */}
              {!isOwner && !listing.isSold && (
                <button
                  style={primaryBtn}
                  onClick={() => { window.location.href = `mailto:${listing.postedBy?.email}?subject=Interested in: ${listing.title}`; }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'var(--color-primary-dark)'; e.currentTarget.style.boxShadow = '0 0 24px var(--color-primary-glow)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'var(--color-primary)'; e.currentTarget.style.boxShadow = 'none'; }}
                >
                  ✉ Contact Seller
                </button>
              )}

              {/* Sold notice */}
              {listing.isSold && (
                <div style={{
                  padding:      'var(--space-4)',
                  borderRadius: 'var(--radius-md)',
                  textAlign:    'center',
                  background:   'rgba(239,68,68,0.08)',
                  color:        '#f87171',
                  fontWeight:   700,
                  fontSize:     'var(--text-sm)',
                }}>
                  ● This item has been sold
                </div>
              )}

              {/* Owner: Mark as sold */}
              {isOwner && !listing.isSold && (
                <button
                  id="mark-sold-btn"
                  onClick={handleMarkSold}
                  disabled={marking}
                  style={{
                    ...secondaryBtn,
                    color:   'var(--color-success)',
                    border:  '1px solid rgba(34,197,94,0.3)',
                  }}
                >
                  {marking ? 'Updating…' : '✓ Mark as Sold'}
                </button>
              )}

              {/* Owner: Delete */}
              {isOwner && (
                <button
                  id="delete-listing-btn"
                  onClick={handleDelete}
                  disabled={deleting}
                  style={{
                    ...secondaryBtn,
                    color:  'var(--color-danger)',
                    border: '1px solid rgba(239,68,68,0.2)',
                  }}
                >
                  {deleting ? 'Deleting…' : '⊗ Delete Listing'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .mpd-layout {
          display: grid;
          grid-template-columns: 1fr 360px;
          gap: var(--space-8);
          align-items: start;
          margin-top: var(--space-6);
        }
        @media (max-width: 900px) {
          .mpd-layout { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}

/* ── Sub-components ─────────────────────────────────────────────────────────── */
const MetaRow = ({ icon, label, value }) => (
  <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center' }}>
    <div style={{
      width: 32, height: 32, borderRadius: 'var(--radius-sm)',
      background: 'var(--bg-elevated)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: '0.9rem', flexShrink: 0,
    }}>
      {icon}
    </div>
    <div>
      <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>{label}</p>
      <p style={{ fontSize: 'var(--text-sm)', fontWeight: 600, margin: 0, textTransform: 'capitalize' }}>{value}</p>
    </div>
  </div>
);

/* ── Shared button styles ────────────────────────────────────────────────────── */
const primaryBtn = {
  width:        '100%',
  padding:      'var(--space-4)',
  borderRadius: 'var(--radius-pill)',
  background:   'var(--color-primary)',
  color:        '#fff',
  fontWeight:   700,
  fontSize:     'var(--text-base)',
  border:       'none',
  cursor:       'pointer',
  transition:   'background var(--transition-fast), box-shadow var(--transition-fast)',
};

const secondaryBtn = {
  width:        '100%',
  padding:      'var(--space-3) var(--space-4)',
  borderRadius: 'var(--radius-pill)',
  background:   'transparent',
  fontWeight:   600,
  fontSize:     'var(--text-sm)',
  cursor:       'pointer',
  transition:   'background var(--transition-fast)',
};

const ghostBackBtn = {
  background: 'none', border: 'none', cursor: 'pointer',
  color: 'var(--text-muted)', fontSize: 'var(--text-sm)', fontWeight: 600,
  padding: '6px 0', display: 'flex', alignItems: 'center', gap: 6,
  marginBottom: 'var(--space-2)',
};
