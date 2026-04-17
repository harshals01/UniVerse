/**
 * components/lostfound/ItemCard.jsx
 * Grid card for a lost/found item. Used on the list page.
 */
import { useNavigate } from 'react-router-dom';
import Badge from '../common/Badge.jsx';

const FALLBACK = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="200" viewBox="0 0 400 200"%3E%3Crect width="400" height="200" fill="%231a1a2e"/%3E%3Ctext x="50%25" y="50%25" fill="%236b6b85" font-size="40" text-anchor="middle" dominant-baseline="middle"%3E📦%3C/text%3E%3C/svg%3E';

export default function ItemCard({ item }) {
  const navigate = useNavigate();

  return (
    <div
      className="card"
      style={{ padding: 0, overflow: 'hidden', cursor: 'pointer' }}
      onClick={() => navigate(`/lostfound/${item._id}`)}
    >
      {/* Image */}
      <div style={{ position: 'relative', height: 180, overflow: 'hidden', background: 'var(--bg-elevated)' }}>
        <img
          src={item.image ? item.image : FALLBACK}
          alt={item.title}
          style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform var(--transition-slow)' }}
          onError={e => { e.target.src = FALLBACK; }}
          onMouseEnter={e => e.target.style.transform = 'scale(1.05)'}
          onMouseLeave={e => e.target.style.transform = 'scale(1)'}
        />
        {/* Type + status badges overlay */}
        <div style={{ position: 'absolute', top: 10, left: 10, display: 'flex', gap: 6 }}>
          <Badge value={item.type} label={item.type.toUpperCase()} />
          <Badge value={item.status} />
        </div>
        {/* Category chip */}
        <div style={{
          position: 'absolute', bottom: 10, right: 10,
          background: 'rgba(13,13,20,0.85)', backdropFilter: 'blur(8px)',
          padding: '3px 10px', borderRadius: 'var(--radius-full)',
          fontSize: 'var(--text-xs)', color: 'var(--text-secondary)',
        }}>
          {item.category}
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: 'var(--space-4)' }}>
        <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 700, marginBottom: 'var(--space-1)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {item.title}
        </h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-3)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {item.description}
        </p>

        {/* Footer */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 'var(--space-3)', borderTop: '1px solid var(--border-subtle)' }}>
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
            📍 {item.location}
          </span>
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
            {new Date(item.createdAt).toLocaleDateString()}
          </span>
        </div>
      </div>
    </div>
  );
}
