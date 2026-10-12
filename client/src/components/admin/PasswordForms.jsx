'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import s from './admin.module.css';

const MIN_LENGTH = 12;

const post = async (url, body) => {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const error = new Error(data.message || 'Something went wrong.');
    error.expired = data.expired;
    throw error;
  }
  return data;
};

/** New password + confirmation, with the length rule shown as you type. */
export function NewPasswordFields({ password, confirm, onPassword, onConfirm, idPrefix = 'new' }) {
  const short = password.length > 0 && password.length < MIN_LENGTH;
  const mismatch = confirm.length > 0 && confirm !== password;
  return (
    <>
      <div className={s.field}>
        <label className={s.label} htmlFor={`${idPrefix}-password`}>New password</label>
        <input
          id={`${idPrefix}-password`}
          className={s.input}
          type="password"
          autoComplete="new-password"
          required
          minLength={MIN_LENGTH}
          maxLength={72}
          value={password}
          onChange={(e) => onPassword(e.target.value)}
          aria-describedby={`${idPrefix}-password-hint`}
        />
        <span id={`${idPrefix}-password-hint`} className={s.hint} style={short ? { color: '#c0392b' } : undefined}>
          At least {MIN_LENGTH} characters. A short sentence you&apos;ll remember works well.
        </span>
      </div>
      <div className={s.field}>
        <label className={s.label} htmlFor={`${idPrefix}-confirm`}>Type it again</label>
        <input
          id={`${idPrefix}-confirm`}
          className={s.input}
          type="password"
          autoComplete="new-password"
          required
          value={confirm}
          onChange={(e) => onConfirm(e.target.value)}
        />
        {mismatch && <span className={s.hint} style={{ color: '#c0392b' }}>The two passwords don&apos;t match.</span>}
      </div>
    </>
  );
}

export function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const data = await post('/api/auth/forgot-password', { email });
      setSent(data.message);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={s.loginPage}>
      <form className={s.loginCard} onSubmit={submit}>
        <h1 className={s.loginTitle}>Forgot your password?</h1>
        <p className={s.loginSub}>Enter your admin email and we&apos;ll send you a link to choose a new one.</p>

        {sent ? (
          <div className={s.stack}>
            <div className={s.alertOk} role="status">{sent}</div>
            <p className={s.hint}>Check your spam folder if it doesn&apos;t arrive in a few minutes.</p>
            <Link href="/admin/login" className={s.btnGhost} style={{ textAlign: 'center' }}>Back to sign in</Link>
          </div>
        ) : (
          <div className={s.stack}>
            {error && <div className={s.alertError} role="alert">{error}</div>}
            <div className={s.field}>
              <label className={s.label} htmlFor="email">Email</label>
              <input id="email" className={s.input} type="email" autoComplete="username" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <button className={s.btnPrimary} type="submit" disabled={busy}>
              {busy ? 'Sending…' : 'Send reset link'}
            </button>
            <Link href="/admin/login" className={`${s.btnLink} ${s.hint}`} style={{ textAlign: 'center' }}>
              Back to sign in
            </Link>
          </div>
        )}
      </form>
    </div>
  );
}

export function ResetPasswordForm() {
  const router = useRouter();
  const [token, setToken] = useState(null);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [expired, setExpired] = useState(false);
  const [busy, setBusy] = useState(false);

  // The token arrives in the #fragment. Read it once, then wipe it from the
  // address bar and history so it isn't left behind on a shared computer.
  useEffect(() => {
    const match = window.location.hash.match(/token=([A-Za-z0-9_-]+)/);
    if (match) window.history.replaceState(null, '', window.location.pathname);
    // Keep a token already read: effects can run twice (React strict mode),
    // and by the second run the fragment has been wiped.
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reading the URL fragment is only possible after mount
    setToken((prev) => (match ? match[1] : prev ?? ''));
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    if (password !== confirm) return setError('The two passwords don’t match.');
    setBusy(true);
    setError('');
    try {
      await post('/api/auth/reset-password', { token, password });
      router.replace('/admin/login?notice=reset');
    } catch (err) {
      setError(err.message);
      setExpired(Boolean(err.expired));
      setBusy(false);
    }
  };

  if (token === null) return <div className={s.loginPage} />;

  if (!token || expired) {
    return (
      <div className={s.loginPage}>
        <div className={s.loginCard}>
          <h1 className={s.loginTitle}>Link expired</h1>
          <p className={s.loginSub}>{error || 'This link is missing or no longer valid. Links work once and expire (reset links after 30 minutes).'}</p>
          <Link href="/admin/forgot-password" className={s.btnPrimary} style={{ textAlign: 'center' }}>Send a new link</Link>
        </div>
      </div>
    );
  }

  return (
    <div className={s.loginPage}>
      <form className={s.loginCard} onSubmit={submit}>
        <h1 className={s.loginTitle}>Choose a new password</h1>
        <p className={s.loginSub}>You&apos;ll be signed out everywhere and can then sign in with the new password.</p>
        {error && <div className={s.alertError} role="alert">{error}</div>}
        <div className={s.stack}>
          <NewPasswordFields password={password} confirm={confirm} onPassword={setPassword} onConfirm={setConfirm} />
          <button className={s.btnPrimary} type="submit" disabled={busy || password.length < MIN_LENGTH || password !== confirm}>
            {busy ? 'Saving…' : 'Set new password'}
          </button>
        </div>
      </form>
    </div>
  );
}
