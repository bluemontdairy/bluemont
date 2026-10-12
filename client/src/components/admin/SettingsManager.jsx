'use client';

import { useEffect, useMemo, useState } from 'react';
import s from './admin.module.css';
import { adminApi } from './adminApi';
import { SETTINGS_FIELDS, SETTINGS_GROUPS, telHref, whatsappHref } from '../../lib/settingsSchema';

const INPUT_TYPES = {
  email: 'email',
  tel: 'tel',
  url: 'url',
  siteurl: 'url',
  year: 'number',
  port: 'number',
  latitude: 'number',
  longitude: 'number',
  whatsapp: 'tel',
  password: 'password',
};

// Server connections configured in .env (values never reach the browser).
const CONNECTIONS = [
  { kind: 'email', title: 'Email sending', env: 'SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM', test: 'Send test email to me' },
  { kind: 'cloudinary', title: 'Cloudinary (images & video)', env: 'CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET', test: 'Test connection' },
];

// Business settings: address, contact details, social links and business
// info. `stored` is what admins have saved; `defaults` is what
// an empty field falls back to; `secretsSet` says which secret fields hold a
// value; `connections` says whether email and Cloudinary are configured in
// the server's .env (the values themselves never reach the browser).
export default function SettingsManager({ stored, secretsSet: initialSecrets, defaults, connections, updatedBy, updatedAt }) {
  const initial = useMemo(() => Object.fromEntries(SETTINGS_FIELDS.map((f) => [f.key, f.secret ? '' : stored[f.key] || ''])), [stored]);
  const [saved, setSaved] = useState(initial);
  const [form, setForm] = useState(initial);
  const [secretsSet, setSecretsSet] = useState(initialSecrets);
  const [clearSecrets, setClearSecrets] = useState([]);
  const [testing, setTesting] = useState('');
  const [testResult, setTestResult] = useState({});
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');

  const dirty = clearSecrets.length > 0 || SETTINGS_FIELDS.some((f) => (form[f.key] || '') !== (saved[f.key] || ''));

  // Warn before leaving with unsaved changes.
  useEffect(() => {
    if (!dirty) return undefined;
    const warn = (e) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  const set = (key) => (e) => {
    setForm((prev) => ({ ...prev, [key]: e.target.value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: '' }));
  };

  // What the website shows for a field right now (typed value or default).
  const effective = (key) => form[key] || defaults[key] || '';

  const save = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    setNotice('');
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, clearSecrets }),
      });
      const body = await res.json().catch(() => ({}));
      if (res.status === 401) return adminApi('/api/settings'); // redirects to sign-in
      if (!res.ok) {
        setErrors(body.errors || {});
        throw new Error(body.message || 'Could not save.');
      }
      const clean = Object.fromEntries(SETTINGS_FIELDS.map((f) => [f.key, f.secret ? '' : body.values[f.key] || '']));
      setSaved(clean);
      setForm(clean);
      setSecretsSet(body.secretsSet);
      setClearSecrets([]);
      setErrors({});
      setNotice('Saved. The website is updated.');
    } catch (err) {
      setError(err.message);
      const first = document.querySelector('[aria-invalid="true"]');
      first?.focus();
    } finally {
      setBusy(false);
    }
  };

  const runTest = async (kind) => {
    setTesting(kind);
    setTestResult((p) => ({ ...p, [kind]: null }));
    try {
      const { message } = await adminApi('/api/settings/test', { method: 'POST', body: JSON.stringify({ kind }) });
      setTestResult((p) => ({ ...p, [kind]: { ok: true, message } }));
    } catch (err) {
      setTestResult((p) => ({ ...p, [kind]: { ok: false, message: err.message } }));
    } finally {
      setTesting('');
    }
  };

  return (
    <form onSubmit={save} noValidate>
      <div className={s.pageHead}>
        <div>
          <h1 className={s.pageTitle}>Site settings</h1>
          <p className={s.pageSub}>
            The website&apos;s address, contact details, social links and business details used across the site and emails. Leave
            a field empty to use the default shown in grey. Secrets are stored encrypted and never shown again.
            {updatedBy && updatedAt && (
              <> Last saved by {updatedBy} on {new Date(updatedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}.</>
            )}
          </p>
        </div>
      </div>

      {notice && <div className={s.alertOk} role="status">{notice}</div>}
      {error && <div className={s.alertError} role="alert">{error}</div>}

      <div className={s.stack} style={{ gap: 'var(--spacing-5)', maxWidth: 860 }}>
        {SETTINGS_GROUPS.map((group) => (
          <section key={group.id} className={s.card} aria-labelledby={`grp-${group.id}`}>
            <h2 id={`grp-${group.id}`} className={s.sectionTitle} style={{ marginTop: 0 }}>{group.title}</h2>
            <p className={s.hint} style={{ marginBottom: 'var(--spacing-4)' }}>{group.note}</p>
            <div className={s.formGrid}>
              {SETTINGS_FIELDS.filter((f) => f.group === group.id).map((f) => {
                const id = `set-${f.key}`;
                const wide = ['whatsappMessage', 'addressLine', 'notifyEmails', 'areaServed', 'mapUrl'].includes(f.key) || f.type === 'url';
                const value = effective(f.key);
                if (f.secret) {
                  const isSet = secretsSet[f.key] && !clearSecrets.includes(f.key);
                  return (
                    <div key={f.key} className={s.field}>
                      <label className={s.label} htmlFor={id}>{f.label}</label>
                      <input
                        id={id}
                        className={s.input}
                        type="password"
                        autoComplete="new-password"
                        value={form[f.key]}
                        onChange={set(f.key)}
                        placeholder={isSet ? '•••••••• saved (type to replace)' : 'Not set'}
                        aria-describedby={`${id}-hint`}
                      />
                      <span id={`${id}-hint`} className={s.hint}>
                        {f.hint}
                        {isSet && (
                          <>
                            {' '}
                            <button type="button" className={s.btnLink} onClick={() => { setClearSecrets((p) => [...p, f.key]); setForm((p) => ({ ...p, [f.key]: '' })); }}>
                              Remove saved value
                            </button>
                          </>
                        )}
                        {clearSecrets.includes(f.key) && ' Will be removed when you save.'}
                      </span>
                    </div>
                  );
                }
                return (
                  <div key={f.key} className={`${s.field} ${wide ? s.span2 : ''}`}>
                    <label className={s.label} htmlFor={id}>{f.label}</label>
                    <input
                      id={id}
                      className={s.input}
                      type={INPUT_TYPES[f.type] || 'text'}
                      inputMode={f.type === 'whatsapp' ? 'numeric' : undefined}
                      step={f.type === 'latitude' || f.type === 'longitude' ? 'any' : undefined}
                      maxLength={f.max || 300}
                      value={form[f.key]}
                      onChange={set(f.key)}
                      placeholder={defaults[f.key] || f.placeholder || ''}
                      aria-invalid={errors[f.key] ? 'true' : undefined}
                      aria-describedby={`${id}-hint`}
                    />
                    <span id={`${id}-hint`} className={s.hint} style={errors[f.key] ? { color: '#c0392b' } : undefined}>
                      {errors[f.key] || f.hint || (!form[f.key] && defaults[f.key] ? 'Using the default.' : '')}
                    </span>
                    {/* Quick checks so a typo is caught before customers find it. */}
                    {value && f.type === 'whatsapp' && (
                      <a className={`${s.btnLink} ${s.hint}`} href={whatsappHref(value, 'Test from the Blue Mont admin')} target="_blank" rel="noopener noreferrer">
                        Test this number on WhatsApp ↗
                      </a>
                    )}
                    {value && f.type === 'tel' && (
                      <a className={`${s.btnLink} ${s.hint}`} href={telHref(value)}>Call {value}</a>
                    )}
                    {value && f.type === 'url' && /^https?:\/\//.test(value) && (
                      <a className={`${s.btnLink} ${s.hint}`} href={value} target="_blank" rel="noopener noreferrer">Open link ↗</a>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        ))}

        <section className={s.card} aria-labelledby="grp-connections">
          <h2 id="grp-connections" className={s.sectionTitle} style={{ marginTop: 0 }}>Server connections</h2>
          <p className={s.hint} style={{ marginBottom: 'var(--spacing-4)' }}>
            Set by the developer in the server&apos;s environment (.env locally, Environment Variables on Vercel), not here.
          </p>
          <div className={s.stack}>
            {CONNECTIONS.map((c) => (
              <div key={c.kind} className={s.toolbar} style={{ marginBottom: 0, alignItems: 'center' }}>
                <strong style={{ minWidth: 210 }}>{c.title}</strong>
                <span className={connections[c.kind] ? s.badge_live : s.badge_rejected}>
                  {connections[c.kind] ? 'Configured' : 'Not configured'}
                </span>
                {connections[c.kind] ? (
                  <button type="button" className={`${s.btnGhost} ${s.btnSmall}`} disabled={testing === c.kind} onClick={() => runTest(c.kind)}>
                    {testing === c.kind ? 'Testing…' : c.test}
                  </button>
                ) : (
                  <span className={s.hint}>Needs {c.env}</span>
                )}
                {testResult[c.kind] && (
                  <span role="status" className={testResult[c.kind].ok ? s.badge_live : s.badge_rejected}>{testResult[c.kind].message}</span>
                )}
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className={s.saveBar}>
        <span className={s.hint}>{dirty ? 'You have unsaved changes.' : 'All changes saved.'}</span>
        <button type="button" className={s.btnGhost} disabled={!dirty || busy} onClick={() => { setForm(saved); setErrors({}); }}>
          Discard
        </button>
        <button type="submit" className={s.btnPrimary} disabled={!dirty || busy}>
          {busy ? 'Saving…' : 'Save settings'}
        </button>
      </div>
    </form>
  );
}
