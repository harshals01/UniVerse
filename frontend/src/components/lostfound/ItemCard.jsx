/**
 * components/lostfound/ItemCard.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Horizontal Bento card — Dark Modular theme.
 * Layout: [Thumbnail left] [Content center] [Status + CTA right]
 * Stacks vertically on mobile.
 *
 * Navigation logic is unchanged.
 * ─────────────────────────────────────────────────────────────────────────────
 */
import { useNavigate } from 'react-router-dom';

const FALLBACK = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"%3E%3Crect width="200" height="200" fill="%232A2A2A"/%3E%3Ctext x="50%25" y="50%25" fill="%23555" font-size="52" text-anchor="middle" dominant-baseline="middle"%3E◎%3C/text%3E%3C/svg%3E';

/* ── Status colour map ─────────────────────────────────────────────────────── */
const TYPE_STYLES = {
  lost:  { bg: 'rgba(229,69,3,0.12)',    color: '#ff6b35', label: 'LOST'  },
  found: { bg: 'rgba(34,197,94,0.12)',   color: '#4ade80', label: 'FOUND' },
};
const STATUS_STYLES = {
  open:    { bg: 'rgba(34,197,94,0.10)',  color: '#4ade80' },
  claimed: { bg: 'rgba(245,158,11,0.12)', color: '#fbbf24' },
};

export default function ItemCard({ item }) {
  const navigate = useNavigate();
  const type   = TYPE_STYLES[item.type]   || TYPE_STYLES.lost;
  const status = STATUS_STYLES[item.status] || STATUS_STYLES.open;

  return (
    <>
      <div
        className="lf-item-card"
        onClick={() => navigate(`/lostfound/${item._id}`)}
        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}
        onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
      >
        {/* ── Thumbnail ─────────────────────────────────────────────────────── */}
        <div style={{
          width:        88,
          height:       88,
          borderRadius: 'var(--radius-md)',
          overflow:     'hidden',
          flexShrink:   0,
          background:   'var(--bg-elevated)',
          position:     'relative',
        }}>
          <img
            src={item.image || FALLBACK}
            alt={item.title}
            onError={e => { e.target.src = FALLBACK; }}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        </div>

        {/* ── Content ───────────────────────────────────────────────────────── */}
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>

          {/* Category pill */}
          <span style={{
            display:        'inline-flex',
            alignSelf:      'flex-start',
            padding:        '2px 10px',
            borderRadius:   'var(--radius-pill)',
            background:     'var(--bg-elevated)',
            fontSize:       'var(--text-xs)',
            color:          'var(--text-muted)',
            fontWeight:     600,
            textTransform:  'capitalize',
            letterSpacing:  '0.03em',
          }}>
            {item.category}
          </span>

          {/* Title */}
          <h3 style={{
            fontSize:     'var(--text-base)',
            fontWeight:   700,
            margin:       0,
            whiteSpace:   'nowrap',
            overflow:     'hidden',
            textOverflow: 'ellipsis',
            color:        'var(--text-primary)',
          }}>
            {item.title}
          </h3>

          {/* Description */}
          <p style={{
            color:           'var(--text-secondary)',
            fontSize:        'var(--text-sm)',
            margin:          0,
            display:         '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow:        'hidden',
            lineHeight:      1.5,
          }}>
            {item.description}
          </p>

          {/* Location + date */}
          <div style={{ display: 'flex', gap: 'var(--space-4)', marginTop: 'auto', paddingTop: 4 }}>
            {item.location && (
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 3 }}>
                <span>📍</span> {item.location}
              </span>
            )}
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
              {new Date(item.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
            </span>
          </div>
        </div>

        {/* ── Right: Status pills + CTA ─────────────────────────────────────── */}
        <div style={{
          display:        'flex',
          flexDirection:  'column',
          alignItems:     'flex-end',
          justifyContent: 'space-between',
          gap:            'var(--space-3)',
          flexShrink:     0,
        }}>
          {/* Type badge */}
          <span style={{
            padding:       '4px 12px',
            borderRadius:  'var(--radius-pill)',
            background:    type.bg,
            color:         type.color,
            fontSize:      'var(--text-xs)',
            fontWeight:    800,
            letterSpacing: '0.08em',
          }}>
            {type.label}
          </span>

          {/* Status badge */}
          <span style={{
            padding:       '3px 10px',
            borderRadius:  'var(--radius-pill)',
            background:    status.bg,
            color:         status.color,
            fontSize:      'var(--text-xs)',
            fontWeight:    600,
            textTransform: 'capitalize',
          }}>
            {item.status}
          </span>

          {/* View button */}
          <button
            style={{
              padding:      '7px 16px',
              borderRadius: 'var(--radius-pill)',
              background:   'var(--color-primary)',
              color:        '#fff',
              fontWeight:   700,
              fontSize:     'var(--text-xs)',
              border:       'none',
              cursor:       'pointer',
              transition:   'background var(--transition-fast)',
              whiteSpace:   'nowrap',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--color-primary-dark)'}
            onMouseLeave={e => e.currentTarget.style.background = 'var(--color-primary)'}
            onClick={e => { e.stopPropagation(); navigate(`/lostfound/${item._id}`); }}
          >
            View →
          </button>
        </div>
      </div>

      <style>{`
        .lf-item-card {
          display:        flex;
          align-items:    center;
          gap:            var(--space-4);
          background:     var(--bg-surface);
          border-radius:  var(--radius-lg);
          padding:        var(--space-4) var(--space-5);
          cursor:         pointer;
          transition:     transform var(--transition-base), box-shadow var(--transition-base);
        }
        @media (max-width: 560px) {
          .lf-item-card {
            flex-direction: column;
            align-items:    flex-start;
          }
          .lf-item-card > div:last-child {
            flex-direction: row;
            align-items:    center;
            width: 100%;
            justify-content: space-between;
          }
        }
      `}</style>
    </>
  );
}
