'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import s from './admin.module.css';

const post = async (url, body) => {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || 'Sign-in failed.');
  return data;
};

// Two steps when the account has two-step sign-in: password, then the
// 6-digit code from the authenticator app.
export default function LoginForm({ logo, notice = '' }) {
  const router = useRouter();
  const [step, setStep] = useState('password');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const done = () => {
    router.replace('/admin');
    router.refresh();
  };

  const submitPassword = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const data = await post('/api/auth/login', { email, password });
      setPassword('');
      if (data.mfaRequired) {
        setStep('code');
        setBusy(false);
      } else done();
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };

  const submitCode = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await post('/api/auth/mfa', { code });
      done();
    } catch (err) {
      setError(err.message);
      setCode('');
      setBusy(false);
      if (/sign in again|expired/i.test(err.message)) setStep('password');
    }
  };

  return (
    <div className={s.loginPage}>
      {step === 'password' ? (
        <form className={s.loginCard} onSubmit={submitPassword}>
          {logo && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logo} alt="" className={s.loginLogo} />
          )}
          <h1 className={s.loginTitle}>Blue Mont admin</h1>
          <p className={s.loginSub}>Manage products, site images, partner leads and messages.</p>

          {notice && <div className={s.alertOk} role="status">{notice}</div>}
          {error && <div className={s.alertError} role="alert">{error}</div>}

          <div className={s.stack}>
            <div className={s.field}>
              <label className={s.label} htmlFor="email">Email</label>
              <input id="email" className={s.input} type="email" autoComplete="username" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className={s.field}>
              <label className={s.label} htmlFor="password">Password</label>
              <input id="password" className={s.input} type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <button className={s.btnPrimary} type="submit" disabled={busy}>
              {busy ? 'Signing in…' : 'Sign in'}
            </button>
            <Link href="/admin/forgot-password" className={`${s.btnLink} ${s.hint}`} style={{ textAlign: 'center' }}>
              Forgot your password?
            </Link>
          </div>
        </form>
      ) : (
        <form className={s.loginCard} onSubmit={submitCode}>
          <h1 className={s.loginTitle}>Two-step sign-in</h1>
          <p className={s.loginSub}>Open your authenticator app and enter the 6-digit code for Blue Mont Admin.</p>

          {error && <div className={s.alertError} role="alert">{error}</div>}

          <div className={s.stack}>
            <div className={s.field}>
              <label className={s.label} htmlFor="code">Code</label>
              <input
                id="code"
                className={s.input}
                inputMode="numeric"
                autoComplete="one-time-code"
                pattern="[0-9 ]{6,7}"
                maxLength={7}
                required
                autoFocus
                value={code}
                onChange={(e) => setCode(e.target.value)}
              />
            </div>
            <button className={s.btnPrimary} type="submit" disabled={busy}>
              {busy ? 'Checking…' : 'Verify'}
            </button>
            <button type="button" className={`${s.btnLink} ${s.hint}`} onClick={() => { setStep('password'); setError(''); }}>
              Use a different account
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
