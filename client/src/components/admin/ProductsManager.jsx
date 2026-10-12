'use client';

import { useMemo, useState } from 'react';
import s from './admin.module.css';
import { adminApi } from './adminApi';
import MediaUpload from './MediaUpload';
import { brandLabel, formatMrp, sortBrands, sortFormats, FORMAT_ORDER, BRAND_LABELS } from '../../lib/brands';
import { cldTransform } from '../../lib/media';

const EMPTY = {
  name: '',
  brand: 'baeleys',
  categoryId: '',
  line: '',
  format: 'Cups',
  volume: '',
  mrp: '',
  image: '',
  imagePublicId: '',
  imageWidth: null,
  imageHeight: null,
  description: '',
  attributes: {},
  featured: false,
  isActive: true,
  sortOrder: 0,
};

const thumb = (url, w) => cldTransform(url, `f_auto,q_auto,w_${w},c_limit`);

export default function ProductsManager({ initialProducts, categories, canDelete = false }) {
  const [products, setProducts] = useState(initialProducts);
  const [query, setQuery] = useState('');
  const [brand, setBrand] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [editing, setEditing] = useState(null); // product object or EMPTY for new
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');

  const brands = useMemo(
    () => sortBrands([...new Set([...Object.keys(BRAND_LABELS), ...products.map((p) => p.brand)])]),
    [products]
  );
  const formats = useMemo(() => sortFormats([...new Set([...FORMAT_ORDER, ...products.map((p) => p.format)])]), [products]);
  const lines = useMemo(() => [...new Set(products.map((p) => p.line).filter(Boolean))].sort(), [products]);
  const categoryById = useMemo(() => new Map(categories.map((c) => [c._id, c])), [categories]);

  const q = query.trim().toLowerCase();
  const visible = products.filter(
    (p) =>
      (!brand || p.brand === brand) &&
      (!categoryFilter || p.categoryId === categoryFilter) &&
      (!q || `${p.name} ${p.line} ${p.format} ${p.volume}`.toLowerCase().includes(q))
  );

  const flash = (msg) => {
    setNotice(msg);
    setError('');
    setTimeout(() => setNotice(''), 3000);
  };

  // API responses are raw documents; shape them like the server-rendered list.
  const upsertLocal = (saved) => {
    const cat = categoryById.get(String(saved.category));
    const plain = {
      ...saved,
      _id: String(saved._id),
      categoryId: String(saved.category),
      category: cat ? { _id: cat._id, name: cat.name, slug: cat.slug } : null,
      attributes: saved.attributes || {},
    };
    setProducts((prev) => {
      const exists = prev.some((p) => p._id === plain._id);
      return exists ? prev.map((p) => (p._id === plain._id ? plain : p)) : [...prev, plain];
    });
  };

  const toggleFeatured = async (product) => {
    try {
      const saved = await adminApi(`/api/products/${product._id}`, {
        method: 'PATCH',
        body: JSON.stringify({ featured: !product.featured }),
      });
      upsertLocal(saved);
      flash(`${product.name} ${saved.featured ? 'added to' : 'removed from'} the homepage favourites.`);
    } catch (err) {
      setError(err.message);
    }
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
            {products.filter((p) => p.isActive).length} live · {products.filter((p) => !p.isActive).length} hidden ·{' '}
            {products.filter((p) => p.featured).length} featured on the homepage. Changes show on the website immediately.
          </p>
        </div>
        <button
          type="button"
          className={s.btnPrimary}
          onClick={() => setEditing({ ...EMPTY, categoryId: categoryFilter || categories[0]?._id || '' })}
          disabled={categories.length === 0}
          title={categories.length === 0 ? 'Add a category first' : undefined}
        >
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
        <label className={s.srOnly} htmlFor="product-category">Category</label>
        <select id="product-category" className={s.select} value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c._id} value={c._id}>{c.name}</option>
          ))}
        </select>
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
                <th>Category</th>
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
                      <img src={thumb(p.image, 96)} alt="" className={s.thumb} />
                    ) : (
                      <span className={s.thumbEmpty}>No img</span>
                    )}
                  </td>
                  <td style={{ minWidth: 180 }}>
                    <button type="button" className={`${s.btnLink} ${s.cellStrong}`} onClick={() => setEditing(p)}>
                      {p.name}
                    </button>
                    <div className={s.cellSub}>{[p.line, p.volume].filter(Boolean).join(' · ')}</div>
                  </td>
                  <td>{p.category?.name || <span className={s.badge_hidden}>None</span>}</td>
                  <td>{brandLabel(p.brand)}</td>
                  <td>{p.format}</td>
                  <td style={{ whiteSpace: 'nowrap' }}>{formatMrp(p.mrp)}</td>
                  <td>
                    <span className={p.isActive ? s.badge_live : s.badge_hidden}>{p.isActive ? 'Live' : 'Hidden'}</span>
                    {p.featured && <span className={s.badge_new} style={{ marginLeft: 4 }}>Featured</span>}
                  </td>
                  <td>
                    <div className={s.actions}>
                      <button type="button" className={`${s.btnGhost} ${s.btnSmall}`} onClick={() => setEditing(p)}>Edit</button>
                      <button
                        type="button"
                        className={`${s.btnGhost} ${s.btnSmall}`}
                        onClick={() => toggleFeatured(p)}
                        aria-pressed={p.featured}
                        title="Show in “Our latest favourites” on the homepage"
                      >
                        {p.featured ? '★ Unfeature' : '☆ Feature'}
                      </button>
                      <button type="button" className={`${s.btnGhost} ${s.btnSmall}`} onClick={() => toggleActive(p)}>
                        {p.isActive ? 'Hide' : 'Show'}
                      </button>
                      {canDelete && (
                        <button type="button" className={`${s.btnDanger} ${s.btnSmall}`} onClick={() => remove(p)}>Delete</button>
                      )}
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
          categories={categories}
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

function ProductEditor({ product, categories, brands, formats, lines, onClose, onSaved }) {
  const isNew = !product._id;
  const [form, setForm] = useState({ ...EMPTY, ...product, mrp: product.mrp ?? '' });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const category = categories.find((c) => c._id === form.categoryId);

  const set = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));
  const setAttr = (key, value) => setForm((prev) => ({ ...prev, attributes: { ...prev.attributes, [key]: value } }));

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
                  <img src={thumb(form.image, 240)} alt="" className={s.imagePreview} />
                ) : (
                  <span className={s.imagePreviewEmpty}>No image</span>
                )}
                <div className={s.imageActions}>
                  <MediaUpload
                    purpose="product"
                    label={form.image ? 'Replace image' : 'Upload image'}
                    onUploaded={(file) =>
                      setForm((p) => ({ ...p, image: file.url, imagePublicId: file.publicId, imageWidth: file.width, imageHeight: file.height }))
                    }
                    onError={setError}
                  />
                  <span className={s.hint}>
                    PNG with a transparent background works best. Stored on Cloudinary, which serves the right size and format to
                    each visitor.
                  </span>
                  {form.image && (
                    <button
                      type="button"
                      className={`${s.btnLink} ${s.hint}`}
                      onClick={() => setForm((p) => ({ ...p, image: '', imagePublicId: '', imageWidth: null, imageHeight: null }))}
                    >
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

            <div className={`${s.field} ${s.span2}`}>
              <label className={s.label} htmlFor="p-category">Category *</label>
              <select id="p-category" className={s.select} required value={form.categoryId} onChange={set('categoryId')}>
                <option value="" disabled>Choose…</option>
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>{c.name}{c.isActive ? '' : ' (hidden)'}</option>
                ))}
              </select>
              <span className={s.hint}>Decides the extra fields below and which category page the product is on.</span>
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
              <input id="p-line" className={s.input} required list="line-options" value={form.line} onChange={set('line')} placeholder="e.g. Big Cup" />
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

            {category?.attributes.length > 0 && (
              <fieldset className={`${s.fieldRow} ${s.span2}`}>
                <legend className={s.label}>{category.name} details</legend>
                <div className={s.formGrid}>
                  {category.attributes.map((a) => (
                    <AttributeInput key={a.key} def={a} value={form.attributes?.[a.key]} onChange={(v) => setAttr(a.key, v)} />
                  ))}
                </div>
              </fieldset>
            )}

            <div className={`${s.field} ${s.span2}`}>
              <label className={s.label} htmlFor="p-desc">Description</label>
              <textarea id="p-desc" className={s.textarea} maxLength={1000} value={form.description} onChange={set('description')} />
            </div>

            <label className={`${s.checkRow} ${s.span2}`}>
              <input type="checkbox" checked={form.isActive} onChange={set('isActive')} />
              Show on the website
            </label>
            <label className={`${s.checkRow} ${s.span2}`}>
              <input type="checkbox" checked={form.featured} onChange={set('featured')} />
              Feature in &ldquo;Our latest favourites&rdquo; on the homepage
            </label>
          </div>
        </div>

        <div className={s.drawerFoot}>
          <button type="button" className={s.btnGhost} onClick={onClose}>Cancel</button>
          <button type="submit" className={s.btnPrimary} disabled={busy}>
            {busy ? 'Saving…' : isNew ? 'Add product' : 'Save changes'}
          </button>
        </div>
      </form>
    </div>
  );
}

// One input for a category field, by its type.
function AttributeInput({ def, value, onChange }) {
  const id = `attr-${def.key}`;
  const label = `${def.label}${def.unit ? ` (${def.unit})` : ''}${def.required ? ' *' : ''}`;

  if (def.type === 'boolean') {
    return (
      <label className={s.checkRow}>
        <input type="checkbox" checked={value === true} onChange={(e) => onChange(e.target.checked)} />
        {label}
      </label>
    );
  }
  if (def.type === 'multiselect') {
    const list = Array.isArray(value) ? value : [];
    return (
      <fieldset className={`${s.field} ${s.span2}`}>
        <legend className={s.label}>{label}</legend>
        <div className={s.actions}>
          {def.options.map((o) => (
            <label key={o} className={s.checkRow}>
              <input
                type="checkbox"
                checked={list.includes(o)}
                onChange={(e) => onChange(e.target.checked ? [...list, o] : list.filter((x) => x !== o))}
              />
              {o}
            </label>
          ))}
        </div>
      </fieldset>
    );
  }
  return (
    <div className={s.field}>
      <label className={s.label} htmlFor={id}>{label}</label>
      {def.type === 'select' ? (
        <select id={id} className={s.select} required={def.required} value={value ?? ''} onChange={(e) => onChange(e.target.value)}>
          <option value="">—</option>
          {def.options.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
      ) : (
        <input
          id={id}
          className={s.input}
          type={def.type === 'number' ? 'number' : 'text'}
          step="any"
          required={def.required}
          maxLength={200}
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
    </div>
  );
}
