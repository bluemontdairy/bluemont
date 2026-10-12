'use client';

import { useState } from 'react';
import s from './admin.module.css';
import { adminApi } from './adminApi';
import MediaUpload from './MediaUpload';
import { SITE_MEDIA_SLOTS, SLOT_GROUPS } from '../../lib/siteMediaSlots';
import { cldTransform, videoPoster } from '../../lib/media';

const dateFmt = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Asia/Kathmandu' });

// Every non-product picture on the website, grouped by where it appears.
// Uploading replaces it on the live site straight away; "Use built-in"
// removes the upload and goes back to the original file (if there is one).
export default function SiteMediaManager({ initialUploads }) {
  const [uploads, setUploads] = useState(() => Object.fromEntries(initialUploads.map((u) => [u.key, u])));
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');

  const flash = (msg) => {
    setNotice(msg);
    setError('');
    setTimeout(() => setNotice(''), 3500);
  };

  const save = async (slot, file) => {
    try {
      const saved = await adminApi('/api/site-media', { method: 'PUT', body: JSON.stringify({ key: slot.key, ...file }) });
      setUploads((prev) => ({ ...prev, [slot.key]: saved }));
      flash(`${slot.label} updated on the website.`);
    } catch (err) {
      setError(err.message);
    }
  };

  const clear = async (slot) => {
    const back = slot.fallback ? 'go back to the built-in image' : 'be removed from the website';
    if (!window.confirm(`Remove the uploaded ${slot.kind === 'video' ? 'video' : 'image'}? "${slot.label}" will ${back}.`)) return;
    try {
      await adminApi(`/api/site-media?key=${encodeURIComponent(slot.key)}`, { method: 'DELETE' });
      setUploads((prev) => {
        const next = { ...prev };
        delete next[slot.key];
        return next;
      });
      flash(`${slot.label} reset.`);
    } catch (err) {
      setError(err.message);
    }
  };

  const uploadedCount = Object.keys(uploads).length;

  return (
    <>
      <div className={s.pageHead}>
        <div>
          <h1 className={s.pageTitle}>Site images</h1>
          <p className={s.pageSub}>
            Logos, mascots, the hero video and other pictures around the website. {uploadedCount} of {SITE_MEDIA_SLOTS.length} uploaded
            to Cloudinary. Product photos are changed on each product.
          </p>
        </div>
      </div>

      {notice && <div className={s.alertOk} role="status">{notice}</div>}
      {error && <div className={s.alertError} role="alert">{error}</div>}

      {SLOT_GROUPS.map((group) => (
        <section key={group} style={{ marginBottom: 'var(--spacing-8)' }}>
          <h2 className={s.sectionTitle}>{group}</h2>
          <div className={s.mediaGrid}>
            {SITE_MEDIA_SLOTS.filter((slot) => slot.group === group).map((slot) => {
              const up = uploads[slot.key];
              const isVideo = slot.kind === 'video';
              const preview = up ? (isVideo ? videoPoster(up.url) : cldTransform(up.url, 'f_auto,q_auto,w_480,c_limit')) : slot.fallback;
              return (
                <article key={slot.key} className={s.mediaCard}>
                  <div className={s.mediaPreview}>
                    {isVideo && up ? (
                      <video src={up.url} poster={preview} muted loop playsInline controls preload="none" />
                    ) : preview ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={preview} alt="" loading="lazy" />
                    ) : (
                      <span className={s.imagePreviewEmpty}>{isVideo ? 'No video' : 'No image'}</span>
                    )}
                  </div>
                  <div className={s.mediaBody}>
                    <h3 className={s.cellStrong}>{slot.label}</h3>
                    {slot.hint && <p className={s.hint}>{slot.hint}</p>}
                    <p className={s.cellSub}>
                      {up ? (
                        <>
                          <span className={s.badge_live}>Cloudinary</span> {up.width && up.height ? `${up.width}×${up.height} · ` : ''}
                          {up.updatedAt && dateFmt.format(new Date(up.updatedAt))}
                          {up.updatedBy && ` by ${up.updatedBy}`}
                        </>
                      ) : slot.fallback ? (
                        <span className={s.badge_hidden}>Built-in</span>
                      ) : (
                        <span className={s.badge_hidden}>Empty</span>
                      )}
                    </p>
                    <div className={s.actions}>
                      <MediaUpload
                        purpose="site"
                        kind={isVideo ? 'video' : 'image'}
                        label={up ? 'Replace' : 'Upload'}
                        onUploaded={(file) => save(slot, file)}
                        onError={setError}
                      />
                      {up && (
                        <button type="button" className={`${s.btnGhost} ${s.btnSmall}`} onClick={() => clear(slot)}>
                          {slot.fallback ? 'Use built-in' : 'Remove'}
                        </button>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      ))}
    </>
  );
}
