'use client';

import { useState } from 'react';
import s from './admin.module.css';
import { adminApi } from './adminApi';
import MediaUpload from './MediaUpload';
import { cldTransform } from '../../lib/media';

const EMPTY = { quote: '', name: '', place: '', rating: '', photo: '', photoPublicId: '', consent: false, isPublished: false, sortOrder: 0 };
const QUOTE_MAX = 400;

const Stars = ({ value }) =>
  value ? (
    <span aria-label={`${value} out of 5 stars`} style={{ color: '#F2C23E', letterSpacing: 1 }}>
      {'★'.repeat(value)}
      <span style={{ color: '#D5DCE5' }}>{'★'.repeat(5 - value)}</span>
    </span>
  ) : null;

// Customer reviews for the homepage's "Loved across Nepal" section. The
// section only appears once at least one review is published.
export default function ReviewsManager({ initialReviews, canDelete }) {
  const [reviews, setReviews] = useState(initialReviews);
  const [editing, setEditing] = useState(null);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');

  const flash = (msg) => {
    setNotice(msg);
    setError('');
    setTimeout(() => setNotice(''), 3500);
  };

  const sorted = [...reviews].sort((a, b) => a.sortOrder - b.sortOrder);
  const replace = (row) =>
    setReviews((prev) => (prev.some((r) => r._id === row._id) ? prev.map((r) => (r._id === row._id ? row : r)) : [...prev, row]));

  const patch = async (review, body, message) => {
    try {
      replace(await adminApi(`/api/reviews/${review._id}`, { method: 'PATCH', body: JSON.stringify(body) }));
      if (message) flash(message);
    } catch (err) {
      setError(err.message);
    }
  };

  // Swap positions with the neighbour; sort orders are renumbered 0..n.
  const move = async (index, dir) => {
    const list = [...sorted];
    const j = index + dir;
    if (j < 0 || j >= list.length) return;
    [list[index], list[j]] = [list[j], list[index]];
    const changed = list.map((r, i) => ({ ...r, sortOrder: i })).filter((r, i) => sorted[i]?._id !== r._id || sorted[i].sortOrder !== i);
    setReviews((prev) => prev.map((r) => ({ ...r, sortOrder: list.findIndex((x) => x._id === r._id) })));
    try {
      await Promise.all(changed.map((r) => adminApi(`/api/reviews/${r._id}`, { method: 'PATCH', body: JSON.stringify({ sortOrder: r.sortOrder }) })));
    } catch (err) {
      setError(err.message);
    }
  };

  const remove = async (review) => {
    if (!window.confirm(`Delete the review from ${review.name}? This cannot be undone. Unpublish it instead to hide it.`)) return;
    try {
      await adminApi(`/api/reviews/${review._id}`, { method: 'DELETE' });
      setReviews((prev) => prev.filter((r) => r._id !== review._id));
      flash('Review deleted.');
    } catch (err) {
      setError(err.message);
    }
  };

  const published = reviews.filter((r) => r.isPublished).length;

  return (
    <>
      <div className={s.pageHead}>
        <div>
          <h1 className={s.pageTitle}>Reviews</h1>
          <p className={s.pageSub}>
            {published} published · {reviews.length - published} draft. Shown on the homepage under &ldquo;Loved across Nepal&rdquo;;
            the section is hidden until at least one review is published. Only add real reviews, with the customer&apos;s permission.
          </p>
        </div>
        <button type="button" className={s.btnPrimary} onClick={() => setEditing({ ...EMPTY, sortOrder: reviews.length })}>
          + Add review
        </button>
      </div>

      {notice && <div className={s.alertOk} role="status">{notice}</div>}
      {error && <div className={s.alertError} role="alert">{error}</div>}

      {sorted.length === 0 ? (
        <div className={s.card}>
          <p className={s.empty}>
            No reviews yet. Ask happy shopkeepers or customers if you can quote them, then add their words here.
          </p>
        </div>
      ) : (
        <div className={s.reviewList}>
          {sorted.map((r, i) => (
            <article key={r._id} className={`${s.reviewItem} ${r.isPublished ? '' : s.rowMuted}`}>
              <div className={s.reviewQuote}>
                <span className={s.reviewMarkAdmin} aria-hidden="true">“</span>
                <p>{r.quote}</p>
                <div className={s.cellSub}>
                  {r.photo && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={cldTransform(r.photo, 'f_auto,q_auto,w_64,h_64,c_fill,g_face')} alt="" className={s.reviewAvatar} />
                  )}
                  <strong className={s.cellStrong}>{r.name}</strong>
                  {r.place && <> · {r.place}</>} <Stars value={r.rating} />
                </div>
              </div>
              <div className={s.reviewSide}>
                <span className={r.isPublished ? s.badge_live : s.badge_hidden}>{r.isPublished ? 'Published' : 'Draft'}</span>
                {!r.consent && <span className={s.badge_new}>No permission yet</span>}
                <div className={s.actions}>
                  <button type="button" className={`${s.btnGhost} ${s.btnSmall}`} onClick={() => move(i, -1)} disabled={i === 0} aria-label="Move up">↑</button>
                  <button type="button" className={`${s.btnGhost} ${s.btnSmall}`} onClick={() => move(i, 1)} disabled={i === sorted.length - 1} aria-label="Move down">↓</button>
                  <button type="button" className={`${s.btnGhost} ${s.btnSmall}`} onClick={() => setEditing(r)}>Edit</button>
                  <button
                    type="button"
                    className={`${s.btnGhost} ${s.btnSmall}`}
                    onClick={() => patch(r, { isPublished: !r.isPublished }, r.isPublished ? 'Review hidden from the website.' : 'Review published.')}
                  >
                    {r.isPublished ? 'Unpublish' : 'Publish'}
                  </button>
                  {canDelete && (
                    <button type="button" className={`${s.btnDanger} ${s.btnSmall}`} onClick={() => remove(r)}>Delete</button>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {editing && (
        <ReviewEditor
          review={editing}
          onClose={() => setEditing(null)}
          onSaved={(row, isNew) => {
            replace(row);
            setEditing(null);
            flash(isNew ? 'Review added.' : 'Review saved.');
          }}
        />
      )}
    </>
  );
}

function ReviewEditor({ review, onClose, onSaved }) {
  const isNew = !review._id;
  const [form, setForm] = useState({ ...EMPTY, ...review, rating: review.rating ?? '' });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const set = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  const save = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const row = await adminApi(isNew ? '/api/reviews' : `/api/reviews/${review._id}`, {
        method: isNew ? 'POST' : 'PUT',
        body: JSON.stringify({ ...form, rating: form.rating === '' ? null : Number(form.rating) }),
      });
      onSaved(row, isNew);
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };

  return (
    <div className={s.backdrop} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <form className={s.drawer} onSubmit={save} role="dialog" aria-modal="true" aria-labelledby="review-title">
        <div className={s.drawerHead}>
          <h2 id="review-title" className={s.drawerTitle}>{isNew ? 'Add a review' : `Edit review from ${review.name}`}</h2>
          <button type="button" className={s.closeBtn} onClick={onClose} aria-label="Close">✕</button>
        </div>
        <div className={s.drawerBody}>
          {error && <div className={s.alertError} role="alert">{error}</div>}
          <div className={s.formGrid}>
            <div className={`${s.field} ${s.span2}`}>
              <label className={s.label} htmlFor="r-quote">What they said *</label>
              <textarea id="r-quote" className={s.textarea} required maxLength={QUOTE_MAX} rows={4} value={form.quote} onChange={set('quote')}
                placeholder="e.g. My customers ask for Top Kulfi by name. Best value in the freezer." />
              <span className={s.hint}>{form.quote.length}/{QUOTE_MAX}. Their words, lightly tidied. Short quotes read best.</span>
            </div>
            <div className={s.field}>
              <label className={s.label} htmlFor="r-name">Name *</label>
              <input id="r-name" className={s.input} required maxLength={60} value={form.name} onChange={set('name')} placeholder="e.g. Sita M." />
              <span className={s.hint}>First name and initial is fine.</span>
            </div>
            <div className={s.field}>
              <label className={s.label} htmlFor="r-place">Town or shop</label>
              <input id="r-place" className={s.input} maxLength={60} value={form.place} onChange={set('place')} placeholder="e.g. Sharma Kirana, Patan" />
            </div>
            <div className={s.field}>
              <label className={s.label} htmlFor="r-rating">Stars</label>
              <select id="r-rating" className={s.select} value={form.rating} onChange={set('rating')}>
                <option value="">No stars</option>
                {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{'★'.repeat(n)} ({n})</option>)}
              </select>
            </div>
            <div className={s.field}>
              <span className={s.label}>Photo (optional)</span>
              <div className={s.imagePicker}>
                {form.photo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={cldTransform(form.photo, 'f_auto,q_auto,w_120,h_120,c_fill,g_face')} alt="" className={s.imagePreview} style={{ borderRadius: '50%', width: 64, height: 64 }} />
                ) : null}
                <div className={s.imageActions}>
                  <MediaUpload
                    purpose="review"
                    label={form.photo ? 'Replace' : 'Upload photo'}
                    onUploaded={(file) => setForm((p) => ({ ...p, photo: file.url, photoPublicId: file.publicId }))}
                    onError={setError}
                  />
                  {form.photo && (
                    <button type="button" className={`${s.btnLink} ${s.hint}`} onClick={() => setForm((p) => ({ ...p, photo: '', photoPublicId: '' }))}>
                      Remove photo
                    </button>
                  )}
                </div>
              </div>
            </div>
            <label className={`${s.checkRow} ${s.span2}`}>
              <input type="checkbox" checked={form.consent} onChange={set('consent')} />
              The customer agreed to be quoted on the website
            </label>
            <label className={`${s.checkRow} ${s.span2}`}>
              <input type="checkbox" checked={form.isPublished} disabled={!form.consent} onChange={set('isPublished')} />
              Publish on the homepage{!form.consent && ' (needs their permission first)'}
            </label>
          </div>
        </div>
        <div className={s.drawerFoot}>
          <button type="button" className={s.btnGhost} onClick={onClose}>Cancel</button>
          <button type="submit" className={s.btnPrimary} disabled={busy}>{busy ? 'Saving…' : isNew ? 'Add review' : 'Save changes'}</button>
        </div>
      </form>
    </div>
  );
}
