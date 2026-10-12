'use client';

import { useState } from 'react';
import s from './admin.module.css';
import { adminApi } from './adminApi';
import MediaUpload from './MediaUpload';
import { ATTRIBUTE_TYPES, ATTRIBUTE_TYPE_LABELS, attributeKey } from '../../lib/categorySchema';
import { cldTransform } from '../../lib/media';

const EMPTY = {
  name: '',
  slug: '',
  description: '',
  image: '',
  imagePublicId: '',
  attributes: [],
  seoTitle: '',
  seoDescription: '',
  isActive: true,
  sortOrder: 0,
};

const NEW_FIELD = { key: '', label: '', type: 'text', options: [], unit: '', required: false, showOnCard: false };

// Categories (Ice Cream, Kulfi, Kulfusion, later Yoghurt, Cheese...) and the
// extra fields each one's products have. Each category gets its own page at
// /products/<url name>.
export default function CategoriesManager({ initialCategories, productCounts }) {
  const [categories, setCategories] = useState(initialCategories);
  const [editing, setEditing] = useState(null);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');

  const flash = (msg) => {
    setNotice(msg);
    setError('');
    setTimeout(() => setNotice(''), 3000);
  };

  const remove = async (category) => {
    if (!window.confirm(`Delete the "${category.name}" category? This cannot be undone.`)) return;
    try {
      await adminApi(`/api/categories/${category._id}`, { method: 'DELETE' });
      setCategories((prev) => prev.filter((c) => c._id !== category._id));
      flash(`${category.name} deleted.`);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <>
      <div className={s.pageHead}>
        <div>
          <h1 className={s.pageTitle}>Categories</h1>
          <p className={s.pageSub}>
            Each category has its own product fields and its own page on the website. Add Yoghurt, Cheese and so on here.
          </p>
        </div>
        <button type="button" className={s.btnPrimary} onClick={() => setEditing(EMPTY)}>
          + Add category
        </button>
      </div>

      {notice && <div className={s.alertOk} role="status">{notice}</div>}
      {error && <div className={s.alertError} role="alert">{error}</div>}

      <div className={s.tableWrap}>
        {categories.length === 0 ? (
          <p className={s.empty}>No categories yet. Run <code>npm run migrate</code> or add one.</p>
        ) : (
          <table className={s.table}>
            <thead>
              <tr>
                <th aria-label="Image" />
                <th>Category</th>
                <th>Fields</th>
                <th>Products</th>
                <th>Status</th>
                <th aria-label="Actions" />
              </tr>
            </thead>
            <tbody>
              {categories.map((c) => (
                <tr key={c._id} className={c.isActive ? '' : s.rowMuted}>
                  <td>
                    {c.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={cldTransform(c.image, 'f_auto,q_auto,w_96')} alt="" className={s.thumb} />
                    ) : (
                      <span className={s.thumbEmpty}>No img</span>
                    )}
                  </td>
                  <td>
                    <button type="button" className={`${s.btnLink} ${s.cellStrong}`} onClick={() => setEditing(c)}>
                      {c.name}
                    </button>
                    <div className={s.cellSub}>/products/{c.slug}</div>
                  </td>
                  <td className={s.cellSub}>{c.attributes.map((a) => a.label).join(', ') || '—'}</td>
                  <td>{productCounts[c._id] || 0}</td>
                  <td>
                    <span className={c.isActive ? s.badge_live : s.badge_hidden}>{c.isActive ? 'Live' : 'Hidden'}</span>
                  </td>
                  <td>
                    <div className={s.actions}>
                      <button type="button" className={`${s.btnGhost} ${s.btnSmall}`} onClick={() => setEditing(c)}>Edit</button>
                      <button type="button" className={`${s.btnDanger} ${s.btnSmall}`} onClick={() => remove(c)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {editing && (
        <CategoryEditor
          category={editing}
          onClose={() => setEditing(null)}
          onSaved={(saved, isNew) => {
            const plain = { ...saved, _id: String(saved._id) };
            setCategories((prev) => (isNew ? [...prev, plain] : prev.map((c) => (c._id === plain._id ? plain : c))));
            setEditing(null);
            flash(`${saved.name} ${isNew ? 'added' : 'saved'}.`);
          }}
        />
      )}
    </>
  );
}

function CategoryEditor({ category, onClose, onSaved }) {
  const isNew = !category._id;
  const [form, setForm] = useState({ ...EMPTY, ...category });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const set = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  const setField = (i, patch) =>
    setForm((prev) => ({ ...prev, attributes: prev.attributes.map((a, j) => (j === i ? { ...a, ...patch } : a)) }));
  const moveField = (i, dir) =>
    setForm((prev) => {
      const list = [...prev.attributes];
      const j = i + dir;
      if (j < 0 || j >= list.length) return prev;
      [list[i], list[j]] = [list[j], list[i]];
      return { ...prev, attributes: list };
    });
  const removeField = (i) => setForm((prev) => ({ ...prev, attributes: prev.attributes.filter((_, j) => j !== i) }));

  const save = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const body = {
        ...form,
        sortOrder: Number(form.sortOrder) || 0,
        // New fields get a key from their name; existing keys never change,
        // so products keep their saved values when a field is renamed.
        attributes: form.attributes.map((a) => ({ ...a, key: a.key || attributeKey(a.label) })),
      };
      const saved = await adminApi(isNew ? '/api/categories' : `/api/categories/${category._id}`, {
        method: isNew ? 'POST' : 'PUT',
        body: JSON.stringify(body),
      });
      onSaved(saved, isNew);
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };

  return (
    <div className={s.backdrop} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <form className={s.drawer} onSubmit={save} role="dialog" aria-modal="true" aria-labelledby="cat-editor-title">
        <div className={s.drawerHead}>
          <h2 id="cat-editor-title" className={s.drawerTitle}>{isNew ? 'Add category' : `Edit ${category.name}`}</h2>
          <button type="button" className={s.closeBtn} onClick={onClose} aria-label="Close">✕</button>
        </div>

        <div className={s.drawerBody}>
          {error && <div className={s.alertError} role="alert">{error}</div>}

          <div className={s.formGrid}>
            <div className={s.field}>
              <label className={s.label} htmlFor="c-name">Name *</label>
              <input id="c-name" className={s.input} required maxLength={60} value={form.name} onChange={set('name')} placeholder="e.g. Yoghurt" />
            </div>
            <div className={s.field}>
              <label className={s.label} htmlFor="c-slug">URL name</label>
              <input id="c-slug" className={s.input} maxLength={60} value={form.slug} onChange={set('slug')} placeholder="made from the name" />
              <span className={s.hint}>/products/{form.slug || 'yoghurt'}</span>
            </div>

            <div className={`${s.field} ${s.span2}`}>
              <label className={s.label} htmlFor="c-desc">Description</label>
              <textarea id="c-desc" className={s.textarea} maxLength={1000} value={form.description} onChange={set('description')} />
              <span className={s.hint}>Shown at the top of the category page. Say plainly what it is, e.g. &ldquo;Set curd and yoghurt made in Lalitpur&rdquo;.</span>
            </div>

            <div className={`${s.field} ${s.span2}`}>
              <span className={s.label}>Image</span>
              <div className={s.imagePicker}>
                {form.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={cldTransform(form.image, 'f_auto,q_auto,w_240')} alt="" className={s.imagePreview} />
                ) : (
                  <span className={s.imagePreviewEmpty}>No image</span>
                )}
                <div className={s.imageActions}>
                  <MediaUpload
                    purpose="category"
                    label={form.image ? 'Replace image' : 'Upload image'}
                    onUploaded={(file) => setForm((p) => ({ ...p, image: file.url, imagePublicId: file.publicId }))}
                    onError={setError}
                  />
                  {form.image && (
                    <button type="button" className={`${s.btnLink} ${s.hint}`} onClick={() => setForm((p) => ({ ...p, image: '', imagePublicId: '' }))}>
                      Remove image
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className={`${s.field} ${s.span2}`}>
              <span className={s.label}>Product fields</span>
              <span className={s.hint}>
                Extra details every product in this category has, e.g. Flavour, Fat %, Net weight. They appear in the product form
                and in the data search engines read.
              </span>
              <div className={s.stack} style={{ marginTop: 'var(--spacing-3)' }}>
                {form.attributes.map((a, i) => (
                  <fieldset key={i} className={s.fieldRow}>
                    <legend className={s.srOnly}>Field {i + 1}</legend>
                    <div className={s.formGrid}>
                      <div className={s.field}>
                        <label className={s.label} htmlFor={`f-label-${i}`}>Field name *</label>
                        <input id={`f-label-${i}`} className={s.input} required maxLength={60} value={a.label} onChange={(e) => setField(i, { label: e.target.value })} placeholder="e.g. Flavour" />
                      </div>
                      <div className={s.field}>
                        <label className={s.label} htmlFor={`f-type-${i}`}>Type</label>
                        <select id={`f-type-${i}`} className={s.select} value={a.type} onChange={(e) => setField(i, { type: e.target.value })}>
                          {ATTRIBUTE_TYPES.map((t) => <option key={t} value={t}>{ATTRIBUTE_TYPE_LABELS[t]}</option>)}
                        </select>
                      </div>
                      {(a.type === 'select' || a.type === 'multiselect') && (
                        <div className={`${s.field} ${s.span2}`}>
                          <label className={s.label} htmlFor={`f-opts-${i}`}>Choices (comma separated) *</label>
                          <input
                            id={`f-opts-${i}`}
                            className={s.input}
                            value={Array.isArray(a.options) ? a.options.join(', ') : a.options}
                            onChange={(e) => setField(i, { options: e.target.value.split(',').map((o) => o.trimStart()) })}
                            placeholder="e.g. Set, Stirred, Greek"
                          />
                        </div>
                      )}
                      {a.type === 'number' && (
                        <div className={s.field}>
                          <label className={s.label} htmlFor={`f-unit-${i}`}>Unit</label>
                          <input id={`f-unit-${i}`} className={s.input} maxLength={20} value={a.unit} onChange={(e) => setField(i, { unit: e.target.value })} placeholder="e.g. %, g, kcal" />
                        </div>
                      )}
                      <div className={`${s.span2} ${s.actions}`}>
                        <label className={s.checkRow}>
                          <input type="checkbox" checked={a.required} onChange={(e) => setField(i, { required: e.target.checked })} /> Required
                        </label>
                        <label className={s.checkRow}>
                          <input type="checkbox" checked={a.showOnCard} onChange={(e) => setField(i, { showOnCard: e.target.checked })} /> Show on product card
                        </label>
                        <span style={{ marginLeft: 'auto' }} />
                        <button type="button" className={`${s.btnGhost} ${s.btnSmall}`} onClick={() => moveField(i, -1)} disabled={i === 0} aria-label="Move up">↑</button>
                        <button type="button" className={`${s.btnGhost} ${s.btnSmall}`} onClick={() => moveField(i, 1)} disabled={i === form.attributes.length - 1} aria-label="Move down">↓</button>
                        <button type="button" className={`${s.btnDanger} ${s.btnSmall}`} onClick={() => removeField(i)}>Remove</button>
                      </div>
                    </div>
                  </fieldset>
                ))}
                <button
                  type="button"
                  className={s.btnGhost}
                  style={{ alignSelf: 'flex-start' }}
                  onClick={() => setForm((p) => ({ ...p, attributes: [...p.attributes, { ...NEW_FIELD }] }))}
                >
                  + Add field
                </button>
              </div>
            </div>

            <div className={s.field}>
              <label className={s.label} htmlFor="c-seo-title">Search title</label>
              <input id="c-seo-title" className={s.input} maxLength={70} value={form.seoTitle} onChange={set('seoTitle')} />
              <span className={s.hint}>{form.seoTitle.length}/70. Shown in Google results.</span>
            </div>
            <div className={s.field}>
              <label className={s.label} htmlFor="c-sort">Sort order</label>
              <input id="c-sort" className={s.input} type="number" step="1" value={form.sortOrder} onChange={set('sortOrder')} />
              <span className={s.hint}>Lower numbers show first.</span>
            </div>
            <div className={`${s.field} ${s.span2}`}>
              <label className={s.label} htmlFor="c-seo-desc">Search description</label>
              <textarea id="c-seo-desc" className={s.textarea} maxLength={170} value={form.seoDescription} onChange={set('seoDescription')} />
              <span className={s.hint}>{form.seoDescription.length}/170.</span>
            </div>

            <label className={`${s.checkRow} ${s.span2}`}>
              <input type="checkbox" checked={form.isActive} onChange={set('isActive')} />
              Show on the website (hiding a category hides its products too)
            </label>
          </div>
        </div>

        <div className={s.drawerFoot}>
          <button type="button" className={s.btnGhost} onClick={onClose}>Cancel</button>
          <button type="submit" className={s.btnPrimary} disabled={busy}>
            {busy ? 'Saving…' : isNew ? 'Add category' : 'Save changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
