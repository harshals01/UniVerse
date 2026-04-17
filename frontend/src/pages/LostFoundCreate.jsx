/**
 * pages/LostFoundCreate.jsx
 * Create a new lost/found item with image upload.
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { lostFoundApi } from '../api/lostFoundApi.js';
import Spinner from '../components/common/Spinner.jsx';

const CATEGORIES = ['electronics', 'clothing', 'accessories', 'books', 'documents', 'keys', 'bags', 'sports', 'other'];

export default function LostFoundCreate() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(null);
  const [form, setForm] = useState({
    title: '', description: '', type: 'lost', category: 'electronics',
    location: '', contactInfo: '', tags: '',
  });
  const [imageFile, setImageFile] = useState(null);
  const [errors, setErrors] = useState({});

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
    if (!form.location.trim())    e.location    = 'Location is required';
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
      await lostFoundApi.create(fd);
      toast.success('Item reported successfully!');
      navigate('/lostfound');
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
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/lostfound')} style={{ marginBottom: 'var(--space-4)' }}>
            ← Back to Lost & Found
          </button>
          <h1 style={{ fontSize: 'var(--text-3xl)', fontWeight: 800 }}>Report an Item</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: 'var(--space-2)' }}>
            Fill in the details so others can identify and return the item.
          </p>
        </div>

        <form id="lostfound-create-form" onSubmit={handleSubmit}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>

            {/* Type toggle */}
            <div className="form-group">
              <label className="form-label">Item type *</label>
              <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
                {['lost', 'found'].map(t => (
                  <button key={t} type="button"
                    className={`btn btn-lg ${form.type === t ? 'btn-primary' : 'btn-outline'}`}
                    style={{ flex: 1, textTransform: 'capitalize' }}
                    onClick={() => setForm(f => ({ ...f, type: t }))}>
                    {t === 'lost' ? '🔴 Lost' : '🟢 Found'}
                  </button>
                ))}
              </div>
            </div>

            {/* Title */}
            <div className="form-group">
              <label htmlFor="lf-title" className="form-label">Title *</label>
              <input id="lf-title" name="title" placeholder="e.g. Black iPhone 14 Pro" value={form.title} onChange={change}
                style={errors.title ? { borderColor: 'var(--color-danger)' } : {}} />
              {errors.title && <Err msg={errors.title} />}
            </div>

            {/* Description */}
            <div className="form-group">
              <label htmlFor="lf-desc" className="form-label">Description *</label>
              <textarea id="lf-desc" name="description" placeholder="Describe the item in detail — color, brand, markings, etc." value={form.description} onChange={change}
                style={errors.description ? { borderColor: 'var(--color-danger)' } : {}} />
              {errors.description && <Err msg={errors.description} />}
            </div>

            {/* Category + Location row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
              <div className="form-group">
                <label htmlFor="lf-cat" className="form-label">Category *</label>
                <select id="lf-cat" name="category" value={form.category} onChange={change}>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="lf-loc" className="form-label">Location *</label>
                <input id="lf-loc" name="location" placeholder="e.g. Main Library, 2nd Floor"
                  value={form.location} onChange={change}
                  style={errors.location ? { borderColor: 'var(--color-danger)' } : {}} />
                {errors.location && <Err msg={errors.location} />}
              </div>
            </div>

            {/* Contact info */}
            <div className="form-group">
              <label htmlFor="lf-contact" className="form-label">Contact info <span style={{ color: 'var(--text-muted)' }}>(optional — defaults to your profile email)</span></label>
              <input id="lf-contact" name="contactInfo" placeholder="Phone number or alternate email" value={form.contactInfo} onChange={change} />
            </div>

            {/* Tags */}
            <div className="form-group">
              <label htmlFor="lf-tags" className="form-label">Tags <span style={{ color: 'var(--text-muted)' }}>(comma-separated, optional)</span></label>
              <input id="lf-tags" name="tags" placeholder="e.g. apple, black, case" value={form.tags} onChange={change} />
            </div>

            {/* Image upload */}
            <div className="form-group">
              <label className="form-label">Photo <span style={{ color: 'var(--text-muted)' }}>(optional, max 5 MB)</span></label>
              <div style={{
                border: `2px dashed ${preview ? 'var(--color-primary)' : 'var(--border-default)'}`,
                borderRadius: 'var(--radius-lg)', padding: 'var(--space-6)',
                textAlign: 'center', cursor: 'pointer', transition: 'border-color var(--transition-fast)',
                background: preview ? 'var(--color-primary-glow)' : 'var(--bg-input)',
                position: 'relative', overflow: 'hidden',
              }}>
                {preview && (
                  <img src={preview} alt="Preview" style={{ width: '100%', maxHeight: 200, objectFit: 'cover', borderRadius: 'var(--radius-md)', marginBottom: 'var(--space-3)' }} />
                )}
                <input id="lf-image" type="file" accept="image/jpeg,image/png,image/webp" onChange={handleImage}
                  style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', width: '100%', height: '100%' }} />
                <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>
                  {preview ? '✅ Image selected — click to change' : '📸 Click to upload a photo'}
                </p>
              </div>
            </div>

            {/* Submit */}
            <button id="lf-submit" type="submit" className="btn btn-primary btn-lg" disabled={loading} style={{ width: '100%' }}>
              {loading ? <Spinner size="sm" /> : `📢 Report ${form.type === 'lost' ? 'Lost' : 'Found'} Item`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const Err = ({ msg }) => <span style={{ color: 'var(--color-danger)', fontSize: 'var(--text-xs)' }}>⚠ {msg}</span>;
