/**
 * components/marketplace/ProductCard.jsx
 * Premium glassmorphism product card. Navigation + isSold logic unchanged.
 */
import { useNavigate } from 'react-router-dom';
import Badge from '../common/Badge.jsx';

const FALLBACK = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="220" viewBox="0 0 400 220"%3E%3Crect width="400" height="220" fill="%230B0F17"/%3E%3Ctext x="50%25" y="50%25" fill="%23333" font-size="52" text-anchor="middle" dominant-baseline="middle"%3E🛍%3C/text%3E%3C/svg%3E';

export default function ProductCard({ listing }) {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/marketplace/${listing._id}`)}
      style={{
        background:      'rgba(18,22,34,0.72)',
        border:          '1px solid rgba(255,255,255,0.08)',
        borderRadius:    'var(--radius-xl)',
        overflow:        'hidden',
        cursor:          listing.isSold ? 'default' : 'pointer',
        opacity:         listing.isSold ? 0.55 : 1,
        transition:      'transform var(--transition-base), box-shadow var(--transition-base), border-color var(--transition-base)',
        display:         'flex',
        flexDirection:   'column',
        backdropFilter:  'blur(18px)',
        boxShadow:       'var(--shadow-card)',
        position:        'relative',
      }}
      onMouseEnter={e => {
        if (!listing.isSold) {
          e.currentTarget.style.transform   = 'translateY(-5px)';
          e.currentTarget.style.boxShadow   = '0 16px 48px rgba(0,0,0,0.55), 0 0 0 1px rgba(139,92,246,0.20)';
          e.currentTarget.style.borderColor = 'rgba(139,92,246,0.25)';
        }
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform   = 'translateY(0)';
        e.currentTarget.style.boxShadow   = 'var(--shadow-card)';
        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
      }}
    >
      {/* Inner shine */}
      <div style={{ position:'absolute',inset:0,borderRadius:'inherit',background:'linear-gradient(135deg,rgba(255,255,255,0.04) 0%,transparent 50%)',pointerEvents:'none',zIndex:1 }} />

      {/* ── Image ── */}
      <div style={{ position:'relative', height:190, overflow:'hidden', background:'rgba(11,15,23,0.90)', flexShrink:0 }}>
        <img
          src={listing.image || FALLBACK}
          alt={listing.title}
          style={{ width:'100%', height:'100%', objectFit:'cover', transition:'transform var(--transition-slow)', display:'block' }}
          onError={e => { e.target.src = FALLBACK; }}
          onMouseEnter={e => { if (!listing.isSold) e.target.style.transform = 'scale(1.06)'; }}
          onMouseLeave={e => { e.target.style.transform = 'scale(1)'; }}
        />

        {/* SOLD overlay */}
        {listing.isSold && (
          <div style={{ position:'absolute',inset:0,background:'rgba(0,0,0,0.70)',display:'flex',alignItems:'center',justifyContent:'center' }}>
            <span style={{ fontSize:'var(--text-xl)',fontWeight:900,color:'#F43F5E',letterSpacing:4,padding:'4px 20px',background:'rgba(244,63,94,0.15)',border:'1px solid rgba(244,63,94,0.30)',borderRadius:'var(--radius-pill)' }}>
              SOLD
            </span>
          </div>
        )}

        {/* Condition badge — top-left */}
        <div style={{ position:'absolute',top:10,left:10,zIndex:2 }}>
          <Badge value={listing.condition} />
        </div>

        {/* Category pill — bottom-right */}
        <div style={{ position:'absolute',bottom:10,right:10,background:'rgba(7,9,15,0.80)',backdropFilter:'blur(8px)',padding:'3px 12px',borderRadius:'var(--radius-pill)',fontSize:'var(--text-xs)',color:'var(--text-secondary)',textTransform:'capitalize',letterSpacing:'0.03em',border:'1px solid rgba(255,255,255,0.08)',zIndex:2 }}>
          {listing.category}
        </div>
      </div>

      {/* ── Body ── */}
      <div style={{ padding:'16px 18px',display:'flex',flexDirection:'column',gap:8,flex:1,position:'relative',zIndex:2 }}>

        {/* Price — violet glow chip */}
        <div style={{ display:'flex',alignItems:'baseline',gap:4 }}>
          <span style={{ fontSize:'var(--text-xl)',fontWeight:800,background:'linear-gradient(135deg,#A78BFA,#818CF8)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',letterSpacing:'-0.02em' }}>
            ₹{listing.price.toLocaleString()}
          </span>
        </div>

        {/* Title */}
        <h3 style={{ fontSize:'var(--text-base)',fontWeight:700,color:'var(--text-primary)',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis',margin:0 }}>
          {listing.title}
        </h3>

        {/* Description */}
        <p style={{ color:'var(--text-muted)',fontSize:'var(--text-sm)',display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical',overflow:'hidden',margin:0,lineHeight:1.5,flex:1 }}>
          {listing.description}
        </p>

        {/* Footer */}
        <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',paddingTop:10,marginTop:'auto',borderTop:'1px solid rgba(255,255,255,0.05)' }}>
          <span style={{ fontSize:'var(--text-xs)',color:'var(--text-muted)',display:'flex',alignItems:'center',gap:6 }}>
            <span style={{ width:20,height:20,borderRadius:'50%',background:'linear-gradient(135deg,#8B5CF6,#6366F1)',display:'inline-flex',alignItems:'center',justifyContent:'center',fontSize:'0.6rem',fontWeight:700,color:'#fff' }}>
              {(listing.postedBy?.name||'S').charAt(0).toUpperCase()}
            </span>
            {listing.postedBy?.name || 'Student'}
          </span>
          <span style={{ fontSize:'var(--text-xs)',color:'var(--text-muted)' }}>
            {new Date(listing.createdAt).toLocaleDateString()}
          </span>
        </div>
      </div>
    </div>
  );
}
