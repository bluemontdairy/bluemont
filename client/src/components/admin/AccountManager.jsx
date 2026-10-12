'use client';

import { useCallback, useEffect, useState } from 'react';
import s from './admin.module.css';
import { adminApi } from './adminApi';
import { NewPasswordFields } from './PasswordForms';

const dateFmt = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  timeZone: 'Asia/Kathmandu',
});

// "Chrome on Windows" from a user-agent string; good enough to recognise a device.
const describeDevice = (ua = '') => {
  const browser = /Edg\//.test(ua) ? 'Edge' : /Chrome\//.test(ua) ? 'Chrome' : /Firefox\//.test(ua) ? 'Firefox' : /Safari\//.test(ua) ? 'Safari' : 'Browser';
  const os = /Android/.test(ua) ? 'Android' : /iPhone|iPad/.test(ua) ? 'iPhone / iPad' : /Windows/.test(ua) ? 'Windows' : /Mac OS/.test(ua) ? 'Mac' : /Linux/.test(ua) ? 'Linux' : 'unknown device';
  return `${browser} on ${os}`;
};

export default function AccountManager({ admin }) {
  return (
    <>
      <div className={s.pageHead}>
        <div>
          <h1 className={s.pageTitle}>Account &amp; security</h1>
          <p className={s.pageSub}>
            Signed in as {admin.username} ({admin.email}).
            {admin.lastLoginAt && <> Last sign-in {dateFmt.format(new Date(admin.lastLoginAt))}.</>}
          </p>
        </div>
      </div>
      <div className={s.stack} style={{ gap: 'var(--spacing-6)', maxWidth: 720 }}>
        <ChangePassword changedAt={admin.passwordChangedAt} />
        <TwoStep enabled={admin.totpEnabled} />
        <Sessions />
      </div>
    </>
  );
}

function ChangePassword({ changedAt }) {
  const [current, setCurrent] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    if (password !== confirm) return setError('The two passwords don’t match.');
    setBusy(true);
    setError('');
    setNotice('');
    try {
      await adminApi('/api/auth/password', { method: 'POST', body: JSON.stringify({ currentPassword: current, newPassword: password }) });
      setCurrent('');
      setPassword('');
      setConfirm('');
      setNotice('Password changed. Every other browser has been signed out.');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <form className={s.card} onSubmit={submit}>
      <h2 className={s.sectionTitle}>Password</h2>
      {changedAt && <p className={s.hint}>Last changed {dateFmt.format(new Date(changedAt))}.</p>}
      {notice && <div className={s.alertOk} role="status">{notice}</div>}
      {error && <div className={s.alertError} role="alert">{error}</div>}
      <div className={s.stack}>
        <div className={s.field}>
          <label className={s.label} htmlFor="current-password">Current password</label>
          <input id="current-password" className={s.input} type="password" autoComplete="current-password" required value={current} onChange={(e) => setCurrent(e.target.value)} />
        </div>
        <NewPasswordFields password={password} confirm={confirm} onPassword={setPassword} onConfirm={setConfirm} idPrefix="change" />
        <button className={s.btnPrimary} type="submit" disabled={busy || !current || password !== confirm} style={{ alignSelf: 'flex-start' }}>
          {busy ? 'Saving…' : 'Change password'}
        </button>
      </div>
    </form>
  );
}

function TwoStep({ enabled: initiallyEnabled }) {
  const [enabled, setEnabled] = useState(initiallyEnabled);
  const [stage, setStage] = useState('idle'); // idle | password | scan | disable
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [setup, setSetup] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const reset = (next = 'idle') => {
    setStage(next);
    setPassword('');
    setCode('');
    setError('');
    setSetup(null);
  };

  const run = async (fn) => {
    setBusy(true);
    setError('');
    try {
      await fn();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const start = (e) => {
    e.preventDefault();
    run(async () => {
      const data = await adminApi('/api/auth/2fa', { method: 'POST', body: JSON.stringify({ password }) });
      setSetup(data);
      setPassword('');
      setStage('scan');
    });
  };

  const confirmCode = (e) => {
    e.preventDefault();
    run(async () => {
      await adminApi('/api/auth/2fa', { method: 'PUT', body: JSON.stringify({ code }) });
      setEnabled(true);
      reset();
      setNotice('Two-step sign-in is on. You’ll need a code from your phone each time you sign in.');
    });
  };

  const disable = (e) => {
    e.preventDefault();
    run(async () => {
      await adminApi('/api/auth/2fa', { method: 'DELETE', body: JSON.stringify({ password, code }) });
      setEnabled(false);
      reset();
      setNotice('Two-step sign-in is off.');
    });
  };

  return (
    <section className={s.card}>
      <h2 className={s.sectionTitle}>Two-step sign-in {enabled ? <span className={s.badge_live}>On</span> : <span className={s.badge_hidden}>Off</span>}</h2>
      <p className={s.hint}>
        Asks for a 6-digit code from an authenticator app (Google Authenticator, Microsoft Authenticator, 1Password…)
        after your password, so a stolen password alone can&apos;t get in.
      </p>
      {notice && <div className={s.alertOk} role="status">{notice}</div>}
      {error && <div className={s.alertError} role="alert">{error}</div>}

      {stage === 'idle' && (
        <button type="button" className={enabled ? s.btnGhost : s.btnPrimary} onClick={() => { setNotice(''); reset(enabled ? 'disable' : 'password'); }}>
          {enabled ? 'Turn off' : 'Set up two-step sign-in'}
        </button>
      )}

      {stage === 'password' && (
        <form className={s.stack} onSubmit={start}>
          <div className={s.field}>
            <label className={s.label} htmlFor="tfa-password">Confirm your password</label>
            <input id="tfa-password" className={s.input} type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <div className={s.toolbar}>
            <button className={s.btnPrimary} type="submit" disabled={busy}>{busy ? 'Checking…' : 'Continue'}</button>
            <button className={s.btnGhost} type="button" onClick={() => reset()}>Cancel</button>
          </div>
        </form>
      )}

      {stage === 'scan' && setup && (
        <form className={s.stack} onSubmit={confirmCode}>
          <p>1. Scan this code with your authenticator app.</p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={setup.qr} alt="QR code for the authenticator app" width={220} height={220} style={{ borderRadius: 8, background: '#fff' }} />
          <p className={s.hint}>
            Can&apos;t scan? Enter this key instead: <code style={{ userSelect: 'all', wordBreak: 'break-all' }}>{setup.secret}</code>
          </p>
          <div className={s.field}>
            <label className={s.label} htmlFor="tfa-code">2. Enter the 6-digit code it shows</label>
            <input id="tfa-code" className={s.input} inputMode="numeric" autoComplete="one-time-code" maxLength={7} required value={code} onChange={(e) => setCode(e.target.value)} />
          </div>
          <div className={s.toolbar}>
            <button className={s.btnPrimary} type="submit" disabled={busy}>{busy ? 'Checking…' : 'Turn on'}</button>
            <button className={s.btnGhost} type="button" onClick={() => reset()}>Cancel</button>
          </div>
        </form>
      )}

      {stage === 'disable' && (
        <form className={s.stack} onSubmit={disable}>
          <div className={s.field}>
            <label className={s.label} htmlFor="tfa-off-password">Your password</label>
            <input id="tfa-off-password" className={s.input} type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <div className={s.field}>
            <label className={s.label} htmlFor="tfa-off-code">A current code from the app</label>
            <input id="tfa-off-code" className={s.input} inputMode="numeric" autoComplete="one-time-code" maxLength={7} required value={code} onChange={(e) => setCode(e.target.value)} />
          </div>
          <div className={s.toolbar}>
            <button className={s.btnDanger} type="submit" disabled={busy}>{busy ? 'Turning off…' : 'Turn off two-step sign-in'}</button>
            <button className={s.btnGhost} type="button" onClick={() => reset()}>Cancel</button>
          </div>
        </form>
      )}
    </section>
  );
}

function Sessions() {
  const [sessions, setSessions] = useState(null);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      setSessions(await adminApi('/api/auth/sessions'));
    } catch (err) {
      setError(err.message);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial fetch of the session list
    load();
  }, [load]);

  const revoke = async (id) => {
    try {
      await adminApi(`/api/auth/sessions${id ? `?id=${id}` : ''}`, { method: 'DELETE' });
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const others = sessions?.filter((x) => !x.current) || [];

  return (
    <section className={s.card}>
      <h2 className={s.sectionTitle}>Signed-in devices</h2>
      <p className={s.hint}>Sessions end after 12 hours without use, and after 7 days in any case.</p>
      {error && <div className={s.alertError} role="alert">{error}</div>}
      {!sessions ? (
        <p className={s.hint}>Loading…</p>
      ) : (
        <div className={s.tableWrap}>
          <table className={s.table}>
            <thead>
              <tr>
                <th>Device</th>
                <th>IP</th>
                <th>Last active</th>
                <th aria-label="Actions" />
              </tr>
            </thead>
            <tbody>
              {sessions.map((x) => (
                <tr key={x._id}>
                  <td>
                    <div className={s.cellStrong}>{describeDevice(x.userAgent)}</div>
                    {x.current && <div className={s.cellSub}>This browser</div>}
                  </td>
                  <td className={s.cellSub}>{x.ip}</td>
                  <td className={s.cellSub}>{dateFmt.format(new Date(x.lastSeenAt))}</td>
                  <td>
                    {!x.current && (
                      <button type="button" className={`${s.btnGhost} ${s.btnSmall}`} onClick={() => revoke(x._id)}>
                        Sign out
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {others.length > 0 && (
        <button type="button" className={s.btnDanger} style={{ alignSelf: 'flex-start', marginTop: 'var(--spacing-3)' }} onClick={() => revoke()}>
          Sign out all other devices ({others.length})
        </button>
      )}
    </section>
  );
}
