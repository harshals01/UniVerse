/**
 * pages/MarketplaceCreate.jsx
 * Create a new marketplace listing with image upload + price.
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { marketplaceApi } from '../api/marketplaceApi.js';
import Spinner from '../components/common/Spinner.jsx';

const CATEGORIES  = ['electronics', 'clothing', 'accessories', 'books', 'documents', 'keys', 'bags', 'sports', 'other'];
const CONDITIONS  = [
  { value: 'new',      label: '✨ New',        desc: 'Unused, in original packaging' },
  { value: 'like-new', label: '👌 Like-new',   desc: 'Used once or twice, no damage' },
  { value: 'good',     label: '👍 Good',        desc: 'Gently used, minor wear' },
  { value: 'fair',     label: '🔄 Fair',        desc: 'Visible wear, fully functional' },
];

export default function MarketplaceCreate() {
  const navigate = useNavigate();
  const [loading,    setLoading]   = useState(false);
  const [preview,    setPreview]   = useState(null);
  const [imageFile,  setImageFile] = useState(null);
  const [errors,     setErrors]    = useState({});
  const [form, setForm] = useState({
    title: '', description: '', price: '', condition: 'good',
    category: 'electronics', location: '', contactInfo: '', tags: '',
  });

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
    <div className="page">
      <div className="container-sm">

        {/* Header */}
        <div style={{ marginBottom: 'var(--space-8)' }}>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/marketplace')}
            style={{ marginBottom: 'var(--space-4)' }}>
            ← Back to Marketplace
          </button>
          <h1 style={{ fontSize: 'var(--text-3xl)', fontWeight: 800 }}>Create a Listing</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: 'var(--space-2)' }}>
            Fill out the details below to list your item for sale.
          </p>
        </div>

        <form id="marketplace-create-form" onSubmit={handleSubmit}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>

            {/* Image upload */}
            <div className="form-group">
              <label className="form-label">Product photo <span style={{ color: 'var(--text-muted)' }}>(max 5 MB)</span></label>
              <div style={{
                border: `2px dashed ${preview ? 'var(--color-primary)' : 'var(--border-default)'}`,
                borderRadius: 'var(--radius-lg)',
                overflow: 'hidden', cursor: 'pointer', position: 'relative',
                background: 'var(--bg-input)', transition: 'border-color var(--transition-fast)',
              }}>
                {preview ? (
                  <img src={preview} alt="Preview"
                    style={{ width: '100%', maxHeight: 280, objectFit: 'cover', display: 'block' }} />
                ) : (
                  <div style={{ padding: 'var(--space-10)', textAlign: 'center' }}>
                    <p style={{ fontSize: '2rem', marginBottom: 8 }}>📸</p>
                    <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>
                      Click to upload a photo of your item
                    </p>
                  </div>
                )}
                <input id="mp-image" type="file" accept="image/jpeg,image/png,image/webp" onChange={handleImage}
                  style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', width: '100%', height: '100%' }} />
                {preview && (
                  <div style={{ position: 'absolute', bottom: 12, right: 12 }}>
                    <span style={{ background: 'rgba(0,0,0,0.7)', color: '#fff', padding: '4px 12px', borderRadius: 'var(--radius-full)', fontSize: 'var(--text-xs)' }}>
                      📸 Click to change
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Title */}
            <div className="form-group">
              <label htmlFor="mp-title" className="form-label">Item title *</label>
              <input id="mp-title" name="title" placeholder="e.g. MacBook Air M1 2020" value={form.title} onChange={change}
                style={errors.title ? { borderColor: 'var(--color-danger)' } : {}} />
              {errors.title && <Err msg={errors.title} />}
            </div>

            {/* Description */}
            <div className="form-group">
              <label htmlFor="mp-desc" className="form-label">Description *</label>
              <textarea id="mp-desc" name="description" placeholder="Describe condition, specs, reason for selling, what's included…"
                value={form.description} onChange={change}
                style={errors.description ? { borderColor: 'var(--color-danger)' } : {}} />
              {errors.description && <Err msg={errors.description} />}
            </div>

            {/* Price + Category row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
              <div className="form-group">
                <label htmlFor="mp-price" className="form-label">Price (₹) *</label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontWeight: 700 }}>₹</span>
                  <input id="mp-price" name="price" type="number" min={0} step={1}
                    placeholder="0 for free" value={form.price} onChange={change}
                    style={{ paddingLeft: 32, ...(errors.price ? { borderColor: 'var(--color-danger)' } : {}) }} />
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
                      padding: 'var(--space-3) var(--space-4)',
                      borderRadius: 'var(--radius-md)',
                      border: `1px solid ${form.condition === c.value ? 'var(--color-primary)' : 'var(--border-default)'}`,
                      background: form.condition === c.value ? 'var(--color-primary-glow)' : 'var(--bg-input)',
                      color: form.condition === c.value ? 'var(--color-primary-light)' : 'var(--text-secondary)',
                      textAlign: 'left', cursor: 'pointer', transition: 'all var(--transition-fast)',
                    }}>
                    <p style={{ fontWeight: 600, fontSize: 'var(--text-sm)', margin: 0 }}>{c.label}</p>
                    <p style={{ fontSize: 'var(--text-xs)', margin: '2px 0 0', color: 'var(--text-muted)' }}>{c.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Location + Contact row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
              <div className="form-group">
                <label htmlFor="mp-loc" className="form-label">Pickup location</label>
                <input id="mp-loc" name="location" placeholder="e.g. Hostel Block A" value={form.location} onChange={change} />
              </div>
              <div className="form-group">
                <label htmlFor="mp-contact" className="form-label">Contact info</label>
                <input id="mp-contact" name="contactInfo" placeholder="Phone or email" value={form.contactInfo} onChange={change} />
              </div>
            </div>

            {/* Tags */}
            <div className="form-group">
              <label htmlFor="mp-tags" className="form-label">Tags <span style={{ color: 'var(--text-muted)' }}>(comma-separated)</span></label>
              <input id="mp-tags" name="tags" placeholder="e.g. apple, laptop, m1" value={form.tags} onChange={change} />
            </div>

            {/* Submit */}
            <button id="mp-submit" type="submit" className="btn btn-primary btn-lg"
              disabled={loading} style={{ width: '100%' }}>
              {loading ? <Spinner size="sm" /> : '🛒 Create Listing'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const Err = ({ msg }) => (
  <span style={{ color: 'var(--color-danger)', fontSize: 'var(--text-xs)' }}>⚠ {msg}</span>
);
