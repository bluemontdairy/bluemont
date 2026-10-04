'use client';

import { useMemo, useState } from 'react';
import s from './admin.module.css';
import { adminApi } from './adminApi';
import { brandLabel, formatMrp, sortBrands, sortFormats, FORMAT_ORDER, BRAND_LABELS } from '../../lib/brands';

const EMPTY = {
  name: '',
  brand: 'baeleys',
  category: '',
  format: 'Cups',
  volume: '',
  mrp: '',
  image: '',
  description: '',
  isActive: true,
  sortOrder: 0,
};

export default function ProductsManager({ initialProducts }) {
  const [products, setProducts] = useState(initialProducts);
  const [query, setQuery] = useState('');
  const [brand, setBrand] = useState('');
  const [editing, setEditing] = useState(null); // product object or EMPTY for new
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');

  const brands = useMemo(
    () => sortBrands([...new Set([...Object.keys(BRAND_LABELS), ...products.map((p) => p.brand)])]),
    [products]
  );
  const formats = useMemo(() => sortFormats([...new Set([...FORMAT_ORDER, ...products.map((p) => p.format)])]), [products]);
  const lines = useMemo(() => [...new Set(products.map((p) => p.category))].sort(), [products]);

  const q = query.trim().toLowerCase();
  const visible = products.filter(
    (p) =>
      (!brand || p.brand === brand) &&
      (!q || `${p.name} ${p.category} ${p.format} ${p.volume}`.toLowerCase().includes(q))
  );

  const flash = (msg) => {
    setNotice(msg);
    setError('');
    setTimeout(() => setNotice(''), 3000);
  };

  const upsertLocal = (saved) => {
    const plain = { ...saved, _id: String(saved._id) };
    setProducts((prev) => {
      const exists = prev.some((p) => p._id === plain._id);
      return exists ? prev.map((p) => (p._id === plain._id ? plain : p)) : [...prev, plain];
    });
  };

  const toggleActive = async (product) => {
    try {
      const saved = await adminApi(`/api/products/${product._id}`, {
        method: 'PATCH',
        body: JSON.stringify({ isActive: !product.isActive }),
      });
      upsertLocal(saved);
      flash(`${product.name} is now ${saved.isActive ? 'visible' : 'hidden'} on the website.`);
    } catch (err) {
      setError(err.message);
    }
  };

  const remove = async (product) => {
    if (!window.confirm(`Delete "${product.name}"? This cannot be undone. Use Hide instead to take it off the website temporarily.`)) return;
    try {
      await adminApi(`/api/products/${product._id}`, { method: 'DELETE' });
      setProducts((prev) => prev.filter((p) => p._id !== product._id));
      flash(`${product.name} deleted.`);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <>
      <div className={s.pageHead}>
        <div>
          <h1 className={s.pageTitle}>Products</h1>
          <p className={s.pageSub}>
            {products.filter((p) => p.isActive).length} live · {products.filter((p) => !p.isActive).length} hidden. Changes show on
            the website immediately.
          </p>
        </div>
        <button type="button" className={s.btnPrimary} onClick={() => setEditing(EMPTY)}>
          + Add product
        </button>
      </div>

      {notice && <div className={s.alertOk} role="status">{notice}</div>}
      {error && <div className={s.alertError} role="alert">{error}</div>}

      <div className={s.toolbar}>
        <label className={s.srOnly} htmlFor="product-search">Search products</label>
        <input
          id="product-search"
          className={`${s.input} ${s.toolbarGrow}`}
          type="search"
          placeholder="Search name, line, format…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <label className={s.srOnly} htmlFor="product-brand">Brand</label>
        <select id="product-brand" className={s.select} value={brand} onChange={(e) => setBrand(e.target.value)}>
          <option value="">All brands</option>
          {brands.map((b) => (
            <option key={b} value={b}>{brandLabel(b)}</option>
          ))}
        </select>
      </div>

      <div className={s.tableWrap}>
        {visible.length === 0 ? (
          <p className={s.empty}>
            {products.length === 0 ? 'No products yet. Run the seed script or add one.' : 'No products match your search.'}
          </p>
        ) : (
          <table className={s.table}>
            <thead>
              <tr>
                <th aria-label="Image" />
                <th>Product</th>
                <th>Brand</th>
                <th>Format</th>
                <th>MRP</th>
                <th>Status</th>
                <th aria-label="Actions" />
              </tr>
            </thead>
            <tbody>
              {visible.map((p) => (
                <tr key={p._id} className={p.isActive ? '' : s.rowMuted}>
                  <td>
                    {p.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.image} alt="" className={s.thumb} />
                    ) : (
                      <span className={s.thumbEmpty}>No img</span>
                    )}
                  </td>
                  <td>
                    <button type="button" className={`${s.btnLink} ${s.cellStrong}`} onClick={() => setEditing(p)}>
                      {p.name}
                    </button>
                    <div className={s.cellSub}>{[p.category, p.volume].filter(Boolean).join(' · ')}</div>
                  </td>
                  <td>{brandLabel(p.brand)}</td>
                  <td>{p.format}</td>
                  <td style={{ whiteSpace: 'nowrap' }}>{formatMrp(p.mrp)}</td>
                  <td>
                    <span className={p.isActive ? s.badge_live : s.badge_hidden}>{p.isActive ? 'Live' : 'Hidden'}</span>
                  </td>
                  <td>
                    <div className={s.actions}>
                      <button type="button" className={`${s.btnGhost} ${s.btnSmall}`} onClick={() => setEditing(p)}>Edit</button>
                      <button type="button" className={`${s.btnGhost} ${s.btnSmall}`} onClick={() => toggleActive(p)}>
                        {p.isActive ? 'Hide' : 'Show'}
                      </button>
                      <button type="button" className={`${s.btnDanger} ${s.btnSmall}`} onClick={() => remove(p)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {editing && (
        <ProductEditor
          product={editing}
          brands={brands}
          formats={formats}
          lines={lines}
          onClose={() => setEditing(null)}
          onSaved={(saved, isNew) => {
            upsertLocal(saved);
            setEditing(null);
            flash(`${saved.name} ${isNew ? 'added' : 'saved'}.`);
          }}
        />
      )}
    </>
  );
}

function ProductEditor({ product, brands, formats, lines, onClose, onSaved }) {
  const isNew = !product._id;
  const [form, setForm] = useState({ ...EMPTY, ...product, mrp: product.mrp ?? '' });
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const set = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  const upload = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setUploading(true);
    setError('');
    try {
      const data = new FormData();
      data.append('file', file);
      const { url } = await adminApi('/api/upload', { method: 'POST', body: data });
      setForm((prev) => ({ ...prev, image: url }));
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const save = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const saved = await adminApi(isNew ? '/api/products' : `/api/products/${product._id}`, {
        method: isNew ? 'POST' : 'PUT',
        body: JSON.stringify({ ...form, sortOrder: Number(form.sortOrder) || 0 }),
      });
      onSaved(saved, isNew);
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };

  return (
    <div className={s.backdrop} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <form className={s.drawer} onSubmit={save} role="dialog" aria-modal="true" aria-labelledby="editor-title">
        <div className={s.drawerHead}>
          <h2 id="editor-title" className={s.drawerTitle}>{isNew ? 'Add product' : `Edit ${product.name}`}</h2>
          <button type="button" className={s.closeBtn} onClick={onClose} aria-label="Close">✕</button>
        </div>

        <div className={s.drawerBody}>
          {error && <div className={s.alertError} role="alert">{error}</div>}

          <div className={s.formGrid}>
            <div className={`${s.field} ${s.span2}`}>
              <span className={s.label}>Packshot</span>
              <div className={s.imagePicker}>
                {form.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={form.image} alt="" className={s.imagePreview} />
                ) : (
                  <span className={s.imagePreviewEmpty}>No image</span>
                )}
                <div className={s.imageActions}>
                  <label className={s.btnGhost} style={{ alignSelf: 'flex-start' }}>
                    {uploading ? 'Uploading…' : form.image ? 'Replace image' : 'Upload image'}
                    <input type="file" accept="image/png,image/jpeg,image/webp,image/avif" onChange={upload} disabled={uploading} hidden />
                  </label>
                  <span className={s.hint}>PNG with a transparent background works best. It is converted to .webp automatically.</span>
                  {form.image && (
                    <button type="button" className={`${s.btnLink} ${s.hint}`} onClick={() => setForm((p) => ({ ...p, image: '' }))}>
                      Remove image
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className={`${s.field} ${s.span2}`}>
              <label className={s.label} htmlFor="p-name">Product name *</label>
              <input id="p-name" className={s.input} required maxLength={120} value={form.name} onChange={set('name')} placeholder="e.g. Chocolate Big Cup" />
            </div>

            <div className={s.field}>
              <label className={s.label} htmlFor="p-brand">Brand *</label>
              <input id="p-brand" className={s.input} required list="brand-options" value={form.brand} onChange={set('brand')} />
              <datalist id="brand-options">
                {brands.map((b) => <option key={b} value={b}>{brandLabel(b)}</option>)}
              </datalist>
              <span className={s.hint}>Type a new name to start a new line, e.g. &ldquo;Fresh Dairy&rdquo;.</span>
            </div>

            <div className={s.field}>
              <label className={s.label} htmlFor="p-format">Format *</label>
              <input id="p-format" className={s.input} required list="format-options" value={form.format} onChange={set('format')} />
              <datalist id="format-options">
                {formats.map((f) => <option key={f} value={f} />)}
              </datalist>
              <span className={s.hint}>Used for the website filter.</span>
            </div>

            <div className={s.field}>
              <label className={s.label} htmlFor="p-line">Product line *</label>
              <input id="p-line" className={s.input} required list="line-options" value={form.category} onChange={set('category')} placeholder="e.g. Big Cup" />
              <datalist id="line-options">
                {lines.map((l) => <option key={l} value={l} />)}
              </datalist>
            </div>

            <div className={s.field}>
              <label className={s.label} htmlFor="p-volume">Pack size</label>
              <input id="p-volume" className={s.input} value={form.volume} onChange={set('volume')} placeholder="e.g. 100 ml" />
            </div>

            <div className={s.field}>
              <label className={s.label} htmlFor="p-mrp">MRP (NPR)</label>
              <input id="p-mrp" className={s.input} type="number" min="0" step="1" inputMode="numeric" value={form.mrp} onChange={set('mrp')} />
              <span className={s.hint}>Leave empty to show &ldquo;MRP on request&rdquo;.</span>
            </div>

            <div className={s.field}>
              <label className={s.label} htmlFor="p-sort">Sort order</label>
              <input id="p-sort" className={s.input} type="number" step="1" value={form.sortOrder} onChange={set('sortOrder')} />
              <span className={s.hint}>Lower numbers show first.</span>
            </div>

            <div className={`${s.field} ${s.span2}`}>
              <label className={s.label} htmlFor="p-desc">Description</label>
              <textarea id="p-desc" className={s.textarea} maxLength={1000} value={form.description} onChange={set('description')} />
            </div>

            <label className={`${s.checkRow} ${s.span2}`}>
              <input type="checkbox" checked={form.isActive} onChange={set('isActive')} />
              Show on the website
            </label>
          </div>
        </div>

        <div className={s.drawerFoot}>
          <button type="button" className={s.btnGhost} onClick={onClose}>Cancel</button>
          <button type="submit" className={s.btnPrimary} disabled={busy || uploading}>
            {busy ? 'Saving…' : isNew ? 'Add product' : 'Save changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
