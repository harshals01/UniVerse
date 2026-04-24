/**
 * components/lostfound/ItemCard.jsx
 * Premium horizontal glass card. Navigation + status logic unchanged.
 */
import { useNavigate } from 'react-router-dom';
import { MapPin, Clock, ArrowRight } from 'lucide-react';

const FALLBACK = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"%3E%3Crect width="200" height="200" fill="%230B0F17"/%3E%3Ctext x="50%25" y="50%25" fill="%23333" font-size="52" text-anchor="middle" dominant-baseline="middle"%3E🔍%3C/text%3E%3C/svg%3E';

const TYPE_STYLES = {
  lost:  { bg: 'rgba(244,63,94,0.15)',  color: '#FB7185', border: 'rgba(244,63,94,0.30)',  label: 'LOST'  },
  found: { bg: 'rgba(16,185,129,0.15)', color: '#34D399', border: 'rgba(16,185,129,0.30)', label: 'FOUND' },
};
const STATUS_STYLES = {
  open:    { bg: 'rgba(16,185,129,0.10)',  color: '#34D399' },
  claimed: { bg: 'rgba(245,158,11,0.12)',  color: '#FCD34D' },
};

export default function ItemCard({ item }) {
  const navigate = useNavigate();
  const type   = TYPE_STYLES[item.type]     || TYPE_STYLES.lost;
  const status = STATUS_STYLES[item.status] || STATUS_STYLES.open;

  return (
    <>
      <div
        className="lf-item-card"
        onClick={() => navigate(`/lostfound/${item._id}`)}
        onMouseEnter={e => {
          e.currentTarget.style.transform   = 'translateY(-3px)';
          e.currentTarget.style.boxShadow   = '0 12px 40px rgba(0,0,0,0.55), 0 0 0 1px rgba(139,92,246,0.18)';
          e.currentTarget.style.borderColor = 'rgba(139,92,246,0.22)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.transform   = 'translateY(0)';
          e.currentTarget.style.boxShadow   = 'var(--shadow-card)';
          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
        }}
      >
        {/* Inner shine */}
        <div style={{ position:'absolute',inset:0,borderRadius:'inherit',background:'linear-gradient(135deg,rgba(255,255,255,0.03) 0%,transparent 50%)',pointerEvents:'none' }} />

        {/* ── Thumbnail ── */}
        <div style={{ width:84,height:84,borderRadius:16,overflow:'hidden',flexShrink:0,background:'rgba(11,15,23,0.90)',position:'relative',border:'1px solid rgba(255,255,255,0.06)' }}>
          <img
            src={item.image || FALLBACK}
            alt={item.title}
            onError={e => { e.target.src = FALLBACK; }}
            style={{ width:'100%',height:'100%',objectFit:'cover',display:'block' }}
          />
        </div>

        {/* ── Content ── */}
        <div style={{ flex:1,minWidth:0,display:'flex',flexDirection:'column',gap:6,position:'relative',zIndex:1 }}>
          {/* Category pill */}
          <span style={{ display:'inline-flex',alignSelf:'flex-start',padding:'2px 10px',borderRadius:'var(--radius-pill)',background:'rgba(255,255,255,0.06)',border:'1px solid rgba(255,255,255,0.08)',fontSize:'var(--text-xs)',color:'var(--text-muted)',fontWeight:600,textTransform:'capitalize',letterSpacing:'0.03em' }}>
            {item.category}
          </span>

          {/* Title */}
          <h3 style={{ fontSize:'var(--text-base)',fontWeight:700,margin:0,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis',color:'var(--text-primary)' }}>
            {item.title}
          </h3>

          {/* Description */}
          <p style={{ color:'var(--text-muted)',fontSize:'var(--text-sm)',margin:0,display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical',overflow:'hidden',lineHeight:1.5 }}>
            {item.description}
          </p>

          {/* Location + date */}
          <div style={{ display:'flex',gap:16,marginTop:'auto',paddingTop:4,flexWrap:'wrap' }}>
            {item.location && (
              <span style={{ fontSize:'var(--text-xs)',color:'var(--text-muted)',display:'flex',alignItems:'center',gap:4 }}>
                <MapPin size={11} /> {item.location}
              </span>
            )}
            <span style={{ fontSize:'var(--text-xs)',color:'var(--text-muted)',display:'flex',alignItems:'center',gap:4 }}>
              <Clock size={11} />
              {new Date(item.createdAt).toLocaleDateString('en-IN',{day:'numeric',month:'short'})}
            </span>
          </div>
        </div>

        {/* ── Right: Status + CTA ── */}
        <div style={{ display:'flex',flexDirection:'column',alignItems:'flex-end',justifyContent:'space-between',gap:10,flexShrink:0,position:'relative',zIndex:1 }}>
          {/* Type glow badge */}
          <span style={{ padding:'4px 12px',borderRadius:'var(--radius-pill)',background:type.bg,color:type.color,border:`1px solid ${type.border}`,fontSize:'var(--text-xs)',fontWeight:800,letterSpacing:'0.08em',boxShadow:`0 0 12px ${type.color}25` }}>
            {type.label}
          </span>

          {/* Status badge */}
          <span style={{ padding:'3px 10px',borderRadius:'var(--radius-pill)',background:status.bg,color:status.color,fontSize:'var(--text-xs)',fontWeight:600,textTransform:'capitalize' }}>
            {item.status}
          </span>

          {/* View CTA */}
          <button
            className="btn btn-primary btn-sm"
            onClick={e => { e.stopPropagation(); navigate(`/lostfound/${item._id}`); }}
            style={{ display:'flex',alignItems:'center',gap:6 }}
          >
            View <ArrowRight size={12} />
          </button>
        </div>
      </div>

      <style>{`
        .lf-item-card {
          display:         flex;
          align-items:     center;
          gap:             16px;
          background:      rgba(18,22,34,0.72);
          border:          1px solid rgba(255,255,255,0.08);
          border-radius:   var(--radius-xl);
          padding:         16px 20px;
          cursor:          pointer;
          transition:      transform var(--transition-base), box-shadow var(--transition-base), border-color var(--transition-base);
          backdrop-filter: blur(18px);
          box-shadow:      var(--shadow-card);
          position:        relative;
          overflow:        hidden;
        }
        @media (max-width: 560px) {
          .lf-item-card { flex-direction: column; align-items: flex-start; }
          .lf-item-card > div:last-child { flex-direction: row; align-items: center; width: 100%; justify-content: space-between; }
        }
      `}</style>
    </>
  );
}
