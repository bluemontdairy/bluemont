'use client';

import { useState } from 'react';
import s from './admin.module.css';
import { adminApi } from './adminApi';

const LIMITS = {
  image: { types: ['image/png', 'image/jpeg', 'image/webp', 'image/avif'], bytes: 10 * 1024 * 1024, label: 'a PNG, JPG, WebP or AVIF image up to 10 MB' },
  video: { types: ['video/mp4', 'video/webm', 'video/quicktime'], bytes: 100 * 1024 * 1024, label: 'an MP4, WebM or MOV video up to 100 MB' },
};

/**
 * Upload button. The server signs the upload (/api/upload), then the file
 * goes straight from the browser to Cloudinary. The result
 * ({ url, publicId, width, height, resourceType }) goes to onUploaded.
 * `purpose` picks the Cloudinary folder: product, category, review or site.
 */
export default function MediaUpload({ purpose, kind = 'image', label, onUploaded, onError, disabled }) {
  const [progress, setProgress] = useState(null);
  const limit = LIMITS[kind];

  const upload = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    onError?.('');
    if (!limit.types.includes(file.type) || file.size > limit.bytes) {
      onError?.(`Choose ${limit.label}.`);
      return;
    }

    setProgress(0);
    try {
      const { uploadUrl, fields } = await adminApi('/api/upload', { method: 'POST', body: JSON.stringify({ purpose, kind }) });
      const data = new FormData();
      Object.entries(fields).forEach(([k, v]) => data.append(k, v));
      data.append('file', file);

      // XMLHttpRequest (not fetch) so big videos can show progress.
      const result = await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', uploadUrl);
        xhr.upload.onprogress = (ev) => ev.lengthComputable && setProgress(Math.round((ev.loaded / ev.total) * 100));
        xhr.onload = () => {
          let body = {};
          try {
            body = JSON.parse(xhr.responseText);
          } catch {}
          if (xhr.status >= 200 && xhr.status < 300) resolve(body);
          else reject(new Error(body.error?.message ? `Upload failed: ${body.error.message}` : 'Upload failed. Try again.'));
        };
        xhr.onerror = () => reject(new Error('Upload failed: check your connection and try again.'));
        xhr.send(data);
      });

      onUploaded({
        url: result.secure_url,
        publicId: result.public_id,
        resourceType: result.resource_type,
        width: result.width,
        height: result.height,
        bytes: result.bytes,
      });
    } catch (err) {
      onError?.(err.message);
    } finally {
      setProgress(null);
    }
  };

  const busy = progress !== null;
  return (
    <label className={`${s.btnGhost} ${disabled || busy ? s.disabled : ''}`} style={{ alignSelf: 'flex-start' }} aria-busy={busy}>
      {busy ? `Uploading… ${progress}%` : label}
      <input type="file" accept={limit.types.join(',')} onChange={upload} disabled={disabled || busy} hidden />
    </label>
  );
}
