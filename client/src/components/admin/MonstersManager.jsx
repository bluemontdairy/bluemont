'use client';

import { useState } from 'react';
import s from './admin.module.css';
import { adminApi } from './adminApi';
import MediaUpload from './MediaUpload';
import Scoop from '../Scoop';
import { cldTransform } from '../../lib/media';

const EMPTY = {
  name: '',
  flavour: '',
  image: '',
  imagePublicId: '',
  imageWidth: null,
  imageHeight: null,
  tint: '#DCEBFA',
  scoopColor: '#FFF0C2',
  scoopImage: '',
  scoopImagePublicId: '',
  isActive: true,
  sortOrder: 0,
};

const thumb = (url, w) => cldTransform(url, `f_auto,q_auto,w_${w}`);

// A monster card as the homepage draws it, for the list and the editor.
function MonsterPreview({ monster, size = 96 }) {
  return (
    <div className={s.monsterPreview} style={{ width: size, height: Math.round(size * 1.14), background: monster.tint, '--scoop': `${Math.round(size * 0.33)}px` }}>
      {monster.image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={thumb(monster.image, size * 2)} alt="" />
      ) : (
        <span className={s.hint}>No picture</span>
      )}
      <Scoop color={monster.scoopColor} image={monster.scoopImage} className={s.monsterPreviewScoop} />
    </div>
  );
}

export default function MonstersManager({ initialMonsters, canDelete }) {
  const [monsters, setMonsters] = useState(initialMonsters);
  const [editing, setEditing] = useState(null);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [importing, setImporting] = useState(false);

  const flash = (msg) => {
    setNotice(msg);
    setError('');
    setTimeout(() => setNotice(''), 3500);
  };

  const sorted = [...monsters].sort((a, b) => a.sortOrder - b.sortOrder);
  const replace = (row) =>
    setMonsters((prev) => (prev.some((m) => m._id === row._id) ? prev.map((m) => (m._id === row._id ? row : m)) : [...prev, row]));

  const patch = async (monster, body, message) => {
    try {
      replace(await adminApi(`/api/monsters/${monster._id}`, { method: 'PATCH', body: JSON.stringify(body) }));
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
    const changed = list.map((m, i) => ({ ...m, sortOrder: i })).filter((m, i) => sorted[i]?._id !== m._id || sorted[i].sortOrder !== i);
    setMonsters((prev) => prev.map((m) => ({ ...m, sortOrder: list.findIndex((x) => x._id === m._id) })));
    try {
      await Promise.all(changed.map((m) => adminApi(`/api/monsters/${m._id}`, { method: 'PATCH', body: JSON.stringify({ sortOrder: m.sortOrder }) })));
    } catch (err) {
      setError(err.message);
    }
  };

  const remove = async (monster) => {
    if (!window.confirm(`Delete ${monster.name}? This cannot be undone. Hide it instead to take it off the website for now.`)) return;
    try {
      await adminApi(`/api/monsters/${monster._id}`, { method: 'DELETE' });
      setMonsters((prev) => prev.filter((m) => m._id !== monster._id));
      flash(`${monster.name} deleted.`);
    } catch (err) {
      setError(err.message);
    }
  };

  const importBuiltIn = async () => {
    setImporting(true);
    try {
      setMonsters(await adminApi('/api/monsters', { method: 'POST', body: JSON.stringify({ importBuiltIn: true }) }));
      flash('The current monsters are here now. Edit them, or add new ones.');
    } catch (err) {
      setError(err.message);
    } finally {
      setImporting(false);
    }
  };

  const visible = monsters.filter((m) => m.isActive).length;

  return (
    <>
      <div className={s.pageHead}>
        <div>
          <h1 className={s.pageTitle}>Monsters</h1>
          <p className={s.pageSub}>
            {monsters.length
              ? `${visible} shown · ${monsters.length - visible} hidden. `
              : 'The homepage is showing the built-in monsters. '}
            Each character in &ldquo;Meet the monsters&rdquo; on the homepage, with its flavour scoop.
          </p>
        </div>
        <button type="button" className={s.btnPrimary} onClick={() => setEditing({ ...EMPTY, sortOrder: monsters.length })}>
          + Add monster
        </button>
      </div>

      {notice && <div className={s.alertOk} role="status">{notice}</div>}
      {error && <div className={s.alertError} role="alert">{error}</div>}

      {sorted.length === 0 ? (
        <div className={s.card}>
          <p className={s.empty}>
            No monsters saved yet, so the homepage shows the 7 built-in ones. Bring those in to edit, reorder or hide them.
            Once any monster is saved here, only the monsters on this page are shown.
          </p>
          <div style={{ marginTop: 12, textAlign: 'center' }}>
            <button type="button" className={s.btnGhost} onClick={importBuiltIn} disabled={importing}>
              {importing ? 'Bringing them in…' : 'Start from the current monsters'}
            </button>
          </div>
        </div>
      ) : (
        <div className={s.reviewList}>
          {sorted.map((m, i) => (
            <article key={m._id} className={`${s.reviewItem} ${m.isActive ? '' : s.rowMuted}`}>
              <div className={s.reviewQuote} style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                <MonsterPreview monster={m} size={72} />
                <div>
                  <strong className={s.cellStrong}>{m.name}</strong>
                  {m.flavour && <div className={s.cellSub}>{m.flavour}</div>}
                  <div className={s.hint}>{m.scoopImage ? 'Scoop picture' : `Drawn scoop · ${m.scoopColor}`}</div>
                </div>
              </div>
              <div className={s.reviewSide}>
                <span className={m.isActive ? s.badge_live : s.badge_hidden}>{m.isActive ? 'Shown' : 'Hidden'}</span>
                <div className={s.actions}>
                  <button type="button" className={`${s.btnGhost} ${s.btnSmall}`} onClick={() => move(i, -1)} disabled={i === 0} aria-label="Move up">↑</button>
                  <button type="button" className={`${s.btnGhost} ${s.btnSmall}`} onClick={() => move(i, 1)} disabled={i === sorted.length - 1} aria-label="Move down">↓</button>
                  <button type="button" className={`${s.btnGhost} ${s.btnSmall}`} onClick={() => setEditing(m)}>Edit</button>
                  <button
                    type="button"
                    className={`${s.btnGhost} ${s.btnSmall}`}
                    onClick={() => patch(m, { isActive: !m.isActive }, m.isActive ? `${m.name} hidden from the website.` : `${m.name} is back on the website.`)}
                  >
                    {m.isActive ? 'Hide' : 'Show'}
                  </button>
                  {canDelete && (
                    <button type="button" className={`${s.btnDanger} ${s.btnSmall}`} onClick={() => remove(m)}>Delete</button>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {editing && (
        <MonsterEditor
          monster={editing}
          onClose={() => setEditing(null)}
          onSaved={(row, isNew) => {
            replace(row);
            setEditing(null);
            flash(isNew ? `${row.name} added.` : `${row.name} saved.`);
          }}
        />
      )}
    </>
  );
}

function ColourField({ id, label, value, onChange, hint }) {
  return (
    <div className={s.field}>
      <label className={s.label} htmlFor={id}>{label}</label>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <input type="color" value={value} onChange={(e) => onChange(e.target.value.toUpperCase())} aria-label={`${label} picker`}
          style={{ width: 44, height: 38, padding: 2, border: '1px solid #E3E8EF', borderRadius: 8, background: '#fff', cursor: 'pointer' }} />
        <input id={id} className={s.input} value={value} maxLength={7} pattern="#[0-9a-fA-F]{6}" onChange={(e) => onChange(e.target.value)} />
      </div>
      {hint && <span className={s.hint}>{hint}</span>}
    </div>
  );
}

function MonsterEditor({ monster, onClose, onSaved }) {
  const isNew = !monster._id;
  const [form, setForm] = useState({ ...EMPTY, ...monster });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const set = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));
  const setValue = (field) => (value) => setForm((prev) => ({ ...prev, [field]: value }));

  const save = async (e) => {
    e.preventDefault();
    if (!form.image) {
      setError('Upload a picture of the monster.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      const row = await adminApi(isNew ? '/api/monsters' : `/api/monsters/${monster._id}`, {
        method: isNew ? 'POST' : 'PUT',
        body: JSON.stringify(form),
      });
      onSaved(row, isNew);
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };

  return (
    <div className={s.backdrop} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <form className={s.drawer} onSubmit={save} role="dialog" aria-modal="true" aria-labelledby="monster-title">
        <div className={s.drawerHead}>
          <h2 id="monster-title" className={s.drawerTitle}>{isNew ? 'Add a monster' : `Edit ${monster.name}`}</h2>
          <button type="button" className={s.closeBtn} onClick={onClose} aria-label="Close">✕</button>
        </div>
        <div className={s.drawerBody}>
          {error && <div className={s.alertError} role="alert">{error}</div>}

          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
            <MonsterPreview monster={form} size={150} />
          </div>

          <div className={s.formGrid}>
            <div className={s.field}>
              <label className={s.label} htmlFor="m-name">Name *</label>
              <input id="m-name" className={s.input} required maxLength={40} value={form.name} onChange={set('name')} placeholder="e.g. Mango" />
              <span className={s.hint}>Usually the flavour.</span>
            </div>
            <div className={s.field}>
              <label className={s.label} htmlFor="m-flavour">Tagline</label>
              <input id="m-flavour" className={s.input} maxLength={60} value={form.flavour} onChange={set('flavour')} placeholder="e.g. Tall, sunny, tropical" />
              <span className={s.hint}>A few words under the name.</span>
            </div>

            <div className={`${s.field} ${s.span2}`}>
              <span className={s.label}>Monster picture *</span>
              <div className={s.imagePicker}>
                {form.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={thumb(form.image, 240)} alt="" className={s.imagePreview} />
                ) : (
                  <span className={s.imagePreviewEmpty}>No image</span>
                )}
                <div className={s.imageActions}>
                  <MediaUpload
                    purpose="monster"
                    label={form.image ? 'Replace picture' : 'Upload picture'}
                    onUploaded={(file) =>
                      setForm((p) => ({ ...p, image: file.url, imagePublicId: file.publicId, imageWidth: file.width, imageHeight: file.height }))
                    }
                    onError={setError}
                  />
                  <span className={s.hint}>PNG or WebP with a transparent background, the whole character in frame.</span>
                </div>
              </div>
            </div>

            <ColourField id="m-tint" label="Card colour" value={form.tint} onChange={setValue('tint')} hint="Background behind the monster. Light pastels work best." />
            <ColourField
              id="m-scoop"
              label="Scoop colour"
              value={form.scoopColor}
              onChange={setValue('scoopColor')}
              hint={form.scoopImage ? 'Not used while a scoop picture is set.' : 'Colour of the drawn scoop.'}
            />

            <div className={`${s.field} ${s.span2}`}>
              <span className={s.label}>Scoop picture (optional)</span>
              <div className={s.imagePicker}>
                {form.scoopImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={thumb(form.scoopImage, 200)} alt="" className={s.imagePreview} />
                ) : (
                  <span className={s.imagePreviewEmpty}>Drawn scoop</span>
                )}
                <div className={s.imageActions}>
                  <MediaUpload
                    purpose="monster"
                    label={form.scoopImage ? 'Replace scoop' : 'Upload scoop'}
                    onUploaded={(file) => setForm((p) => ({ ...p, scoopImage: file.url, scoopImagePublicId: file.publicId }))}
                    onError={setError}
                  />
                  {form.scoopImage && (
                    <button type="button" className={`${s.btnLink} ${s.hint}`} onClick={() => setForm((p) => ({ ...p, scoopImage: '', scoopImagePublicId: '' }))}>
                      Use the drawn scoop instead
                    </button>
                  )}
                  <span className={s.hint}>A photo or drawing of the real scoop, transparent background. Leave empty for a drawn scoop in the colour above.</span>
                </div>
              </div>
            </div>

            <label className={`${s.checkRow} ${s.span2}`}>
              <input type="checkbox" checked={form.isActive} onChange={set('isActive')} />
              Show on the homepage
            </label>
          </div>
        </div>
        <div className={s.drawerFoot}>
          <button type="button" className={s.btnGhost} onClick={onClose}>Cancel</button>
          <button type="submit" className={s.btnPrimary} disabled={busy}>{busy ? 'Saving…' : isNew ? 'Add monster' : 'Save changes'}</button>
        </div>
      </form>
    </div>
  );
}
