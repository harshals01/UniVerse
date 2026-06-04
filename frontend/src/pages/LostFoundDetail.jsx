/**
 * pages/LostFoundDetail.jsx
 * Single item view — full details, image, owner info, claim button.
 */
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { lostFoundApi } from '../api/lostFoundApi.js';
import { useAuth } from '../context/AuthContext.jsx';
import Badge from '../components/common/Badge.jsx';
import { SkeletonDetailPage } from '../components/common/Skeleton.jsx';
import { Folder, MapPin, Calendar, Clock, CheckCircle, Trash2 } from 'lucide-react';

const FALLBACK = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="800" height="400" viewBox="0 0 800 400"%3E%3Crect width="800" height="400" fill="%231a1a2e"/%3E%3Ctext x="50%25" y="50%25" fill="%236b6b85" font-size="64" text-anchor="middle" dominant-baseline="middle"%3E📦%3C/text%3E%3C/svg%3E';

export default function LostFoundDetail() {
  const { id }          = useParams();
  const navigate        = useNavigate();
  const { user }        = useAuth();
  const [item, setItem] = useState(null);
  const [loading, setLoading]   = useState(true);
  const [claiming, setClaiming] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await lostFoundApi.getById(id);
        setItem(res.data.item);
      } catch (err) {
        toast.error(err.message);
        navigate('/lostfound');
      } finally {
        setLoading(false);
      }
    })();
  }, [id, navigate]);

  const handleClaim = async () => {
    if (!confirm('Mark this item as claimed?')) return;
    setClaiming(true);
    try {
      const res = await lostFoundApi.claim(id);
      setItem(res.data.item);
      toast.success('Item marked as claimed!');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setClaiming(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this item permanently?')) return;
    setDeleting(true);
    try {
      await lostFoundApi.delete(id);
      toast.success('Item deleted');
      navigate('/lostfound');
    } catch (err) {
      toast.error(err.message);
      setDeleting(false);
    }
  };

  if (loading) return (
    <div className="page"><div className="container"><SkeletonDetailPage /></div></div>
  );
  if (!item)   return null;

  const isOwner = user?._id === item.postedBy?._id;

  return (
    <div className="page">
      <div className="container">

        {/* Back button */}
        <button className="btn btn-ghost btn-sm" onClick={() => navigate('/lostfound')}
          style={{ marginBottom: 'var(--space-6)' }}>
          ← Back to Lost & Found
        </button>

        <div className="lfd-grid">

          {/* ── LEFT: Image + Description ──────────────────────────────────── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>

            {/* Image */}
            <div style={{
              borderRadius: 'var(--radius-xl)', overflow: 'hidden',
              border: '1px solid var(--border-subtle)', background: 'var(--bg-elevated)',
              width: '100%',
            }}>
              <img
                src={item.image || FALLBACK}
                alt={item.title}
                onError={e => { e.target.src = FALLBACK; }}
                style={{ width: '100%', maxHeight: 460, objectFit: 'cover', display: 'block' }}
              />
            </div>

            {/* Description card */}
            <div className="card">
              <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, marginBottom: 'var(--space-4)' }}>
                Description
              </h2>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, overflowWrap: 'break-word', wordBreak: 'break-word' }}>
                {item.description}
              </p>

              {/* Tags */}
              {item.tags?.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)', marginTop: 'var(--space-4)' }}>
                  {item.tags.map(t => (
                    <span key={t} style={{
                      padding: '3px 12px', borderRadius: 'var(--radius-full)',
                      background: 'var(--bg-elevated)', border: '1px solid var(--border-default)',
                      fontSize: 'var(--text-xs)', color: 'var(--text-muted)',
                    }}>#{t}</span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ── RIGHT: Info + Actions ──────────────────────────────────────── */}
          <div className="lfd-sidebar">

            {/* Title + badges */}
            <div className="card">
              <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-3)' }}>
                <Badge value={item.type} label={item.type.toUpperCase()} />
                <Badge value={item.status} />
              </div>

              <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, marginBottom: 'var(--space-4)', overflowWrap: 'break-word', wordBreak: 'break-word' }}>
                {item.title}
              </h1>

              {/* Meta rows */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                <MetaRow icon={<Folder size={14} aria-hidden="true" />}   label="Category" value={item.category} />
                <MetaRow icon={<MapPin size={14} aria-hidden="true" />}    label="Location"  value={item.location} />
                <MetaRow icon={<Calendar size={14} aria-hidden="true" />}  label="Reported"  value={new Date(item.createdAt).toLocaleDateString('en-IN', { day:'numeric', month:'long', year:'numeric' })} />
                {item.dateLostOrFound && (
                  <MetaRow icon={<Clock size={14} aria-hidden="true" />} label="Date lost/found" value={new Date(item.dateLostOrFound).toLocaleDateString('en-IN', { day:'numeric', month:'long', year:'numeric' })} />
                )}
              </div>
            </div>

            {/* Posted by */}
            <div className="card">
              <h3 style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--text-muted)', marginBottom: 'var(--space-4)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Posted by
              </h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                <div style={{
                  width: 42, height: 42, borderRadius: '50%',
                  background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 700, color: '#fff', flexShrink: 0,
                }}>
                  {item.postedBy?.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p style={{ fontWeight: 600, margin: 0 }}>{item.postedBy?.name}</p>
                  <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', margin: 0 }}>
                    {item.postedBy?.college || 'Student'}
                  </p>
                </div>
              </div>

              {item.contactInfo && (
                <div style={{ marginTop: 'var(--space-4)', padding: 'var(--space-3)', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)' }}>
                  <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginBottom: 4 }}>Contact</p>
                  <p style={{ fontSize: 'var(--text-sm)', fontWeight: 600, overflowWrap: 'break-word', wordBreak: 'break-word' }}>{item.contactInfo}</p>
                </div>
              )}
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              {/* Claim button — shown only if item is open and user is NOT the owner */}
              {!isOwner && item.status === 'open' && (
                <button id="claim-btn" className="btn btn-primary btn-lg" onClick={handleClaim} disabled={claiming} style={{ width: '100%' }}>
                  {claiming ? 'Claiming…' : <><CheckCircle size={15} aria-hidden="true" /> I Found / Claim This Item</>}
                </button>
              )}

              {/* Status banner if already claimed */}
              {item.status !== 'open' && (
                <div style={{
                  padding: 'var(--space-4)', borderRadius: 'var(--radius-md)', textAlign: 'center',
                  background: item.status === 'claimed' ? 'rgba(245,158,11,0.1)' : 'rgba(34,197,94,0.1)',
                  border: `1px solid ${item.status === 'claimed' ? 'rgba(245,158,11,0.3)' : 'rgba(34,197,94,0.3)'}`,
                  color: item.status === 'claimed' ? '#fbbf24' : '#4ade80',
                  fontWeight: 600,
                }}>
                  {item.status === 'claimed' ? 'This item has been claimed' : <><CheckCircle size={14} aria-hidden="true" style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} />Resolved</>}
                </div>
              )}

              {/* Owner actions */}
              {isOwner && (
                <button id="delete-item-btn" className="btn btn-ghost" onClick={handleDelete} disabled={deleting}
                  style={{ color: 'var(--color-danger)', border: '1px solid rgba(239,68,68,0.3)', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                  {deleting ? 'Deleting…' : <><Trash2 size={14} aria-hidden="true" /> Delete this item</>}
                </button>
              )}
            </div>

          </div>
        </div>

        <style>{`
          /* Two-column layout */
          .lfd-grid {
            display: grid;
            grid-template-columns: 1fr 380px;
            gap: var(--space-8);
            align-items: start;
          }
          /* Right sidebar */
          .lfd-sidebar {
            display: flex;
            flex-direction: column;
            gap: var(--space-4);
            position: sticky;
            top: 88px;
          }
          /* Tablet — narrow sidebar */
          @media (max-width: 900px) {
            .lfd-grid { grid-template-columns: 1fr 300px; gap: var(--space-5); }
          }
          /* Mobile — single column */
          @media (max-width: 700px) {
            .lfd-grid   { grid-template-columns: 1fr; gap: var(--space-4); }
            .lfd-sidebar { position: static; top: auto; }
          }
          /* Text overflow guard for all user-generated content */
          .lfd-grid .card p,
          .lfd-grid .card h1,
          .lfd-grid .card h2,
          .lfd-grid .card h3 {
            overflow-wrap: break-word;
            word-break:    break-word;
          }
          /* Width guard */
          .lfd-grid, .lfd-grid * {
            min-width: 0;
            box-sizing: border-box;
          }
        `}</style>
      </div>
    </div>
  );
}

const MetaRow = ({ icon, label, value }) => (
  <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'flex-start' }}>
    <div style={{ width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: 'var(--text-muted)' }}>
      {icon}
    </div>
    <div style={{ minWidth: 0 }}>
      <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', margin: 0 }}>{label}</p>
      <p style={{ fontSize: 'var(--text-sm)', fontWeight: 500, margin: 0, textTransform: 'capitalize', overflowWrap: 'break-word', wordBreak: 'break-word' }}>{value}</p>
    </div>
  </div>
);
