/**
 * components/marketplace/ProductCard.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Bento-style product card — Dark Modular theme.
 * Navigation, Badge usage, and isSold logic are all unchanged.
 * ─────────────────────────────────────────────────────────────────────────────
 */
import { useNavigate } from 'react-router-dom';
import Badge from '../common/Badge.jsx';

const FALLBACK = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="220" viewBox="0 0 400 220"%3E%3Crect width="400" height="220" fill="%23202020"/%3E%3Ctext x="50%25" y="50%25" fill="%23444" font-size="52" text-anchor="middle" dominant-baseline="middle"%3E◈%3C/text%3E%3C/svg%3E';

export default function ProductCard({ listing }) {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/marketplace/${listing._id}`)}
      style={{
        background:   'var(--bg-surface)',
        borderRadius: 'var(--radius-lg)',   /* 24px */
        overflow:     'hidden',
        cursor:       listing.isSold ? 'default' : 'pointer',
        opacity:      listing.isSold ? 0.6 : 1,
        transition:   'transform var(--transition-base), box-shadow var(--transition-base)',
        display:      'flex',
        flexDirection: 'column',
      }}
      onMouseEnter={e => {
        if (!listing.isSold) {
          e.currentTarget.style.transform  = 'translateY(-4px)';
          e.currentTarget.style.boxShadow  = 'var(--shadow-lg)';
        }
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      {/* ── Image ─────────────────────────────────────────────────────────────── */}
      <div style={{ position: 'relative', height: 190, overflow: 'hidden', background: 'var(--bg-elevated)', flexShrink: 0 }}>
        <img
          src={listing.image || FALLBACK}
          alt={listing.title}
          style={{
            width: '100%', height: '100%', objectFit: 'cover',
            transition: 'transform var(--transition-slow)',
            display: 'block',
          }}
          onError={e => { e.target.src = FALLBACK; }}
          onMouseEnter={e => { if (!listing.isSold) e.target.style.transform = 'scale(1.06)'; }}
          onMouseLeave={e => { e.target.style.transform = 'scale(1)'; }}
        />

        {/* SOLD overlay */}
        {listing.isSold && (
          <div style={{
            position: 'absolute', inset: 0,
            background: 'rgba(0,0,0,0.6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{
              fontSize: 'var(--text-2xl)', fontWeight: 900,
              color: '#ef4444', letterSpacing: 4,
              padding: '4px 16px',
              background: 'rgba(0,0,0,0.5)',
              borderRadius: 'var(--radius-pill)',
            }}>
              SOLD
            </span>
          </div>
        )}

        {/* Condition badge — top-left */}
        <div style={{ position: 'absolute', top: 10, left: 10 }}>
          <Badge value={listing.condition} />
        </div>

        {/* Category pill — bottom-right */}
        <div style={{
          position: 'absolute', bottom: 10, right: 10,
          background: 'rgba(13,13,13,0.80)',
          backdropFilter: 'blur(8px)',
          padding: '3px 12px',
          borderRadius: 'var(--radius-pill)',
          fontSize: 'var(--text-xs)',
          color: 'var(--text-secondary)',
          textTransform: 'capitalize',
          letterSpacing: '0.03em',
        }}>
          {listing.category}
        </div>
      </div>

      {/* ── Body ──────────────────────────────────────────────────────────────── */}
      <div style={{ padding: 'var(--space-4) var(--space-5)', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', flex: 1 }}>

        {/* Price — orange accent, most prominent */}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
          <span style={{
            fontSize:   'var(--text-2xl)',
            fontWeight: 800,
            color:      'var(--color-primary)',   /* #E54503 orange */
            letterSpacing: '-0.02em',
          }}>
            ₹{listing.price.toLocaleString()}
          </span>
        </div>

        {/* Title */}
        <h3 style={{
          fontSize:     'var(--text-base)',
          fontWeight:   600,
          color:        'var(--text-primary)',
          whiteSpace:   'nowrap',
          overflow:     'hidden',
          textOverflow: 'ellipsis',
          margin:       0,
        }}>
          {listing.title}
        </h3>

        {/* Description */}
        <p style={{
          color:              'var(--text-secondary)',
          fontSize:           'var(--text-sm)',
          display:            '-webkit-box',
          WebkitLineClamp:    2,
          WebkitBoxOrient:    'vertical',
          overflow:           'hidden',
          margin:             0,
          lineHeight:         1.5,
          flex:               1,
        }}>
          {listing.description}
        </p>

        {/* Footer */}
        <div style={{
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'space-between',
          paddingTop:     'var(--space-3)',
          marginTop:      'auto',
        }}>
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{
              width: 20, height: 20, borderRadius: '50%',
              background: 'var(--bg-elevated)',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.6rem', fontWeight: 700,
            }}>
              {(listing.postedBy?.name || 'S').charAt(0).toUpperCase()}
            </span>
            {listing.postedBy?.name || 'Student'}
          </span>
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
            {new Date(listing.createdAt).toLocaleDateString()}
          </span>
        </div>
      </div>
    </div>
  );
}
