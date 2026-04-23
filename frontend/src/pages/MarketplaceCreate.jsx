/**
 * pages/MarketplaceCreate.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Create a new marketplace listing — Dark Modular theme.
 * Two-column layout: sticky image upload on the left, form fields on the right.
 * All state hooks, validation, and submit logic are unchanged.
 * ─────────────────────────────────────────────────────────────────────────────
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { marketplaceApi } from '../api/marketplaceApi.js';
import Spinner from '../components/common/Spinner.jsx';

const CATEGORIES = ['electronics', 'clothing', 'accessories', 'books', 'documents', 'keys', 'bags', 'sports', 'other'];
const CONDITIONS = [
  { value: 'new',      label: '✨ New',       desc: 'Unused, in original packaging' },
  { value: 'like-new', label: '👌 Like-new',  desc: 'Used once or twice, no damage' },
  { value: 'good',     label: '👍 Good',       desc: 'Gently used, minor wear' },
  { value: 'fair',     label: '🔄 Fair',       desc: 'Visible wear, fully functional' },
];

export default function MarketplaceCreate() {
  const navigate = useNavigate();
  const [loading,   setLoading]   = useState(false);
  const [preview,   setPreview]   = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [errors,    setErrors]    = useState({});
  const [form, setForm] = useState({
    title: '', description: '', price: '', condition: 'good',
    category: 'electronics', location: '', contactInfo: '', tags: '',
  });

  /* ── Unchanged handlers ──────────────────────────────────────────────────── */
  const change = (e) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
    setErrors(er => ({ ...er, [e.target.name]: '' }));
  };

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error('Image must be under 5 MB'); return; }
    setImageFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const validate = () => {
    const e = {};
    if (!form.title.trim())       e.title       = 'Title is required';
    if (!form.description.trim()) e.description = 'Description is required';
    if (!form.price || isNaN(Number(form.price)) || Number(form.price) < 0)
                                  e.price       = 'Enter a valid price (0 or more)';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (imageFile) fd.append('image', imageFile);
      await marketplaceApi.create(fd);
      toast.success('Listing created!');
      navigate('/marketplace');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 'var(--space-8) 0 var(--space-16)', minHeight: '100vh' }}>
      <div className="container">

        {/* ── Back + heading ───────────────────────────────────────────────── */}
        <div style={{ marginBottom: 'var(--space-8)' }}>
          <button
            onClick={() => navigate('/marketplace')}
            style={ghostBackBtn}
          >
            ← Back to Marketplace
          </button>
          <h1 style={{ fontSize: 'var(--text-3xl)', fontWeight: 800, letterSpacing: '-0.02em', marginTop: 'var(--space-3)' }}>
            Create a Listing
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: 'var(--space-1)', fontSize: 'var(--text-sm)' }}>
            Fill out the details below to list your item for sale.
          </p>
        </div>

        <form id="marketplace-create-form" onSubmit={handleSubmit}>
          <div className="mpc-layout">

            {/* ── LEFT: Image upload (sticky) ─────────────────────────────── */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              <div className="form-group">
                <label className="form-label">
                  Product photo <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(max 5 MB)</span>
                </label>

                {/* Upload zone */}
                <div
                  style={{
                    borderRadius:  'var(--radius-lg)',
                    overflow:      'hidden',
                    cursor:        'pointer',
                    position:      'relative',
                    background:    'var(--bg-surface)',
                    border:        `2px dashed ${preview ? 'var(--color-primary)' : 'var(--border-default)'}`,
                    transition:    'border-color var(--transition-fast)',
                    minHeight:     preview ? 'auto' : 220,
                    display:       'flex',
                    flexDirection: 'column',
                    alignItems:    'center',
                    justifyContent: preview ? 'flex-start' : 'center',
                  }}
                  onDragOver={e => { e.preventDefault(); e.currentTarget.style.borderColor = 'var(--color-primary)'; }}
                  onDragLeave={e => { e.currentTarget.style.borderColor = preview ? 'var(--color-primary)' : 'var(--border-default)'; }}
                  onDrop={e => { e.preventDefault(); const file = e.dataTransfer.files[0]; if (file) handleImage({ target: { files: [file] } }); }}
                >
                  {preview ? (
                    <img
                      src={preview} alt="Preview"
                      style={{ width: '100%', maxHeight: 320, objectFit: 'cover', display: 'block' }}
                    />
                  ) : (
                    <div style={{ padding: 'var(--space-8)', textAlign: 'center' }}>
                      <div style={{
                        width: 64, height: 64, borderRadius: '50%',
                        background: 'var(--bg-elevated)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '1.8rem', margin: '0 auto var(--space-4)',
                      }}>
                        📸
                      </div>
                      <p style={{ fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 4px' }}>
                        Drop photo here or click to upload
                      </p>
                      <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-xs)' }}>
                        JPEG, PNG, or WebP · Max 5 MB
                      </p>
                    </div>
                  )}

                  {/* Hidden file input */}
                  <input
                    id="mp-image" type="file" accept="image/jpeg,image/png,image/webp"
                    onChange={handleImage}
                    style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', width: '100%', height: '100%' }}
                  />

                  {/* Change photo hint */}
                  {preview && (
                    <div style={{ position: 'absolute', bottom: 12, right: 12 }}>
                      <span style={{
                        background: 'rgba(0,0,0,0.75)',
                        backdropFilter: 'blur(6px)',
                        color: '#fff', padding: '4px 12px',
                        borderRadius: 'var(--radius-pill)',
                        fontSize: 'var(--text-xs)', fontWeight: 600,
                      }}>
                        ✎ Change photo
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Tags */}
              <div className="form-group">
                <label htmlFor="mp-tags" className="form-label">
                  Tags <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(comma-separated)</span>
                </label>
                <input id="mp-tags" name="tags" placeholder="e.g. apple, laptop, m1"
                  value={form.tags} onChange={change} />
              </div>
            </div>

            {/* ── RIGHT: Form fields ──────────────────────────────────────── */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>

              {/* Title */}
              <div className="form-group">
                <label htmlFor="mp-title" className="form-label">Item title *</label>
                <input id="mp-title" name="title" placeholder="e.g. MacBook Air M1 2020"
                  value={form.title} onChange={change}
                  style={errors.title ? errRing : {}} />
                {errors.title && <Err msg={errors.title} />}
              </div>

              {/* Description */}
              <div className="form-group">
                <label htmlFor="mp-desc" className="form-label">Description *</label>
                <textarea id="mp-desc" name="description"
                  placeholder="Describe condition, specs, reason for selling, what's included…"
                  value={form.description} onChange={change}
                  style={{ minHeight: 120, ...(errors.description ? errRing : {}) }} />
                {errors.description && <Err msg={errors.description} />}
              </div>

              {/* Price + Category */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                <div className="form-group">
                  <label htmlFor="mp-price" className="form-label">Price (₹) *</label>
                  <div style={{ position: 'relative' }}>
                    <span style={{
                      position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)',
                      color: 'var(--color-primary)', fontWeight: 800, fontSize: 'var(--text-base)',
                    }}>₹</span>
                    <input id="mp-price" name="price" type="number" min={0} step={1}
                      placeholder="0 for free" value={form.price} onChange={change}
                      style={{ paddingLeft: 36, ...(errors.price ? errRing : {}) }} />
                  </div>
                  {errors.price && <Err msg={errors.price} />}
                </div>

                <div className="form-group">
                  <label htmlFor="mp-cat" className="form-label">Category *</label>
                  <select id="mp-cat" name="category" value={form.category} onChange={change}>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                  </select>
                </div>
              </div>

              {/* Condition picker */}
              <div className="form-group">
                <label className="form-label">Condition *</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--space-3)' }}>
                  {CONDITIONS.map(c => (
                    <button key={c.value} type="button"
                      onClick={() => setForm(f => ({ ...f, condition: c.value }))}
                      style={{
                        padding:      'var(--space-3) var(--space-4)',
                        borderRadius: 'var(--radius-md)',
                        border:       'none',
                        background:   form.condition === c.value ? 'var(--color-primary)' : 'var(--bg-elevated)',
                        color:        form.condition === c.value ? '#fff' : 'var(--text-secondary)',
                        textAlign:    'left',
                        cursor:       'pointer',
                        transition:   'all var(--transition-fast)',
                      }}
                      onMouseEnter={e => { if (form.condition !== c.value) e.currentTarget.style.background = 'var(--bg-hover)'; }}
                      onMouseLeave={e => { if (form.condition !== c.value) e.currentTarget.style.background = 'var(--bg-elevated)'; }}
                    >
                      <p style={{ fontWeight: 700, fontSize: 'var(--text-sm)', margin: 0 }}>{c.label}</p>
                      <p style={{ fontSize: 'var(--text-xs)', margin: '3px 0 0', opacity: 0.75 }}>{c.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Location + Contact */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                <div className="form-group">
                  <label htmlFor="mp-loc" className="form-label">Pickup location</label>
                  <input id="mp-loc" name="location" placeholder="e.g. Hostel Block A"
                    value={form.location} onChange={change} />
                </div>
                <div className="form-group">
                  <label htmlFor="mp-contact" className="form-label">Contact info</label>
                  <input id="mp-contact" name="contactInfo" placeholder="Phone or email"
                    value={form.contactInfo} onChange={change} />
                </div>
              </div>

              {/* ── Sticky CTA ────────────────────────────────────────────── */}
              <div style={{
                position:     'sticky',
                bottom:       'var(--space-6)',
                background:   'var(--bg-base)',
                paddingTop:   'var(--space-4)',
                zIndex:       10,
              }}>
                <button
                  id="mp-submit"
                  type="submit"
                  disabled={loading}
                  style={{
                    width:        '100%',
                    padding:      'var(--space-4)',
                    borderRadius: 'var(--radius-pill)',
                    background:   loading ? 'var(--color-primary-dark)' : 'var(--color-primary)',
                    color:        '#fff',
                    fontWeight:   700,
                    fontSize:     'var(--text-base)',
                    border:       'none',
                    cursor:       loading ? 'not-allowed' : 'pointer',
                    display:      'flex',
                    alignItems:   'center',
                    justifyContent: 'center',
                    gap:          'var(--space-2)',
                    transition:   'background var(--transition-fast), box-shadow var(--transition-fast)',
                    opacity:      loading ? 0.7 : 1,
                  }}
                  onMouseEnter={e => { if (!loading) { e.currentTarget.style.background = 'var(--color-primary-dark)'; e.currentTarget.style.boxShadow = '0 0 24px var(--color-primary-glow)'; }}}
                  onMouseLeave={e => { e.currentTarget.style.background = 'var(--color-primary)'; e.currentTarget.style.boxShadow = 'none'; }}
                >
                  {loading ? <Spinner size="sm" /> : '◈ Create Listing'}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>

      <style>{`
        .mpc-layout {
          display: grid;
          grid-template-columns: 360px 1fr;
          gap: var(--space-8);
          align-items: start;
        }
        @media (max-width: 860px) {
          .mpc-layout { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}

const Err = ({ msg }) => (
  <span style={{ color: 'var(--color-danger)', fontSize: 'var(--text-xs)', display: 'flex', alignItems: 'center', gap: 4 }}>
    ⚠ {msg}
  </span>
);

const errRing   = { boxShadow: '0 0 0 2px var(--color-danger)' };
const ghostBackBtn = {
  background: 'none', border: 'none', cursor: 'pointer',
  color: 'var(--text-muted)', fontSize: 'var(--text-sm)', fontWeight: 600,
  padding: '6px 0', display: 'flex', alignItems: 'center', gap: 6,
  transition: 'color var(--transition-fast)',
};
