'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import s from './admin.module.css';

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.message || 'Sign-in failed.');
      router.replace('/admin');
      router.refresh();
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };

  return (
    <div className={s.loginPage}>
      <form className={s.loginCard} onSubmit={submit}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/brand/logo/badge.webp" alt="" className={s.loginLogo} />
        <h1 className={s.loginTitle}>Blue Mont admin</h1>
        <p className={s.loginSub}>Manage products, partner leads and messages.</p>

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
        </div>
      </form>
    </div>
  );
}
