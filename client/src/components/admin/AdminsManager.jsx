'use client';

import { useState } from 'react';
import s from './admin.module.css';
import { adminApi } from './adminApi';
import { ROLES, ROLE_DESCRIPTIONS, ROLE_LABELS } from '../../lib/roles';

const dateFmt = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  timeZone: 'Asia/Kathmandu',
});

// Super admins only: who can use the admin panel, and with which role.
export default function AdminsManager({ initialAdmins, meId }) {
  const [admins, setAdmins] = useState(initialAdmins);
  const [inviting, setInviting] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');

  const flash = (msg) => {
    setNotice(msg);
    setError('');
    setTimeout(() => setNotice(''), 4000);
  };

  const replace = (row) => setAdmins((prev) => prev.map((a) => (a._id === row._id ? row : a)));

  const patch = async (admin, body, message) => {
    setError('');
    try {
      replace(await adminApi(`/api/admins/${admin._id}`, { method: 'PATCH', body: JSON.stringify(body) }));
      flash(message);
    } catch (err) {
      setError(err.message);
    }
  };

  const remove = async (admin) => {
    if (!window.confirm(`Remove ${admin.username} (${admin.email})? They will be signed out and can't get back in. This cannot be undone.`)) return;
    try {
      await adminApi(`/api/admins/${admin._id}`, { method: 'DELETE' });
      setAdmins((prev) => prev.filter((a) => a._id !== admin._id));
      flash(`${admin.username} removed.`);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <>
      <div className={s.pageHead}>
        <div>
          <h1 className={s.pageTitle}>Admins</h1>
          <p className={s.pageSub}>Who can use this admin panel. New people get an email to set their own password.</p>
        </div>
        <button type="button" className={s.btnPrimary} onClick={() => setInviting(true)}>
          + Invite admin
        </button>
      </div>

      {notice && <div className={s.alertOk} role="status">{notice}</div>}
      {error && <div className={s.alertError} role="alert">{error}</div>}

      <div className={s.roleGrid}>
        {ROLES.map((r) => (
          <div key={r} className={s.roleCard}>
            <span className={r === 'superadmin' ? s.badge_converted : s.badge_contacted}>{ROLE_LABELS[r]}</span>
            <p className={s.hint}>{ROLE_DESCRIPTIONS[r]}</p>
          </div>
        ))}
      </div>

      <div className={s.tableWrap}>
        <table className={s.table}>
          <thead>
            <tr>
              <th>Admin</th>
              <th>Role</th>
              <th>Status</th>
              <th>Last sign-in</th>
              <th aria-label="Actions" />
            </tr>
          </thead>
          <tbody>
            {admins.map((a) => {
              const isMe = a._id === meId;
              return (
                <tr key={a._id} className={a.isActive ? '' : s.rowMuted}>
                  <td style={{ minWidth: 200 }}>
                    <div className={s.cellStrong}>
                      {a.username} {isMe && <span className={s.cellSub}>(you)</span>}
                    </div>
                    <div className={s.cellSub}>{a.email}</div>
                    {a.invitedBy && <div className={s.cellSub}>Invited by {a.invitedBy}</div>}
                  </td>
                  <td>
                    <select
                      className={s.select}
                      style={{ minWidth: 130 }}
                      aria-label={`Role for ${a.username}`}
                      value={a.role}
                      disabled={isMe}
                      title={isMe ? 'Another super admin can change your role' : undefined}
                      onChange={(e) => patch(a, { role: e.target.value }, `${a.username} is now ${ROLE_LABELS[e.target.value]}.`)}
                    >
                      {ROLES.map((r) => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
                    </select>
                  </td>
                  <td>
                    <div className={s.actions}>
                      {!a.isActive ? (
                        <span className={s.badge_rejected}>Deactivated</span>
                      ) : a.pending ? (
                        <span className={s.badge_new}>Invite pending</span>
                      ) : (
                        <span className={s.badge_live}>Active</span>
                      )}
                      {a.locked && <span className={s.badge_rejected}>Locked</span>}
                      {a.totpEnabled && <span className={s.badge_contacted}>2-step on</span>}
                    </div>
                  </td>
                  <td className={s.cellSub} style={{ whiteSpace: 'nowrap' }}>
                    {a.lastLoginAt ? dateFmt.format(new Date(a.lastLoginAt)) : 'Never'}
                  </td>
                  <td>
                    {!isMe && (
                      <div className={s.actions}>
                        {a.pending ? (
                          <button type="button" className={`${s.btnGhost} ${s.btnSmall}`} disabled={!a.isActive}
                            onClick={() => patch(a, { action: 'resend-invite' }, `Invite re-sent to ${a.email}.`)}>
                            Resend invite
                          </button>
                        ) : (
                          <button type="button" className={`${s.btnGhost} ${s.btnSmall}`} disabled={!a.isActive}
                            onClick={() => patch(a, { action: 'send-reset' }, `Password reset link sent to ${a.email}.`)}>
                            Send reset link
                          </button>
                        )}
                        {a.locked && (
                          <button type="button" className={`${s.btnGhost} ${s.btnSmall}`}
                            onClick={() => patch(a, { action: 'unlock' }, `${a.username} can sign in again.`)}>
                            Unlock
                          </button>
                        )}
                        {a.totpEnabled && (
                          <button
                            type="button"
                            className={`${s.btnGhost} ${s.btnSmall}`}
                            onClick={() =>
                              window.confirm(`Turn off two-step sign-in for ${a.username}? Use this when they've lost their phone.`) &&
                              patch(a, { action: 'reset-2fa' }, `Two-step sign-in turned off for ${a.username}.`)
                            }
                          >
                            Reset 2-step
                          </button>
                        )}
                        <button
                          type="button"
                          className={`${s.btnGhost} ${s.btnSmall}`}
                          onClick={() =>
                            patch(a, { isActive: !a.isActive }, `${a.username} ${a.isActive ? 'deactivated and signed out' : 'reactivated'}.`)
                          }
                        >
                          {a.isActive ? 'Deactivate' : 'Reactivate'}
                        </button>
                        <button type="button" className={`${s.btnDanger} ${s.btnSmall}`} onClick={() => remove(a)}>
                          Remove
                        </button>
                      </div>
                    )}
                    {isMe && <span className={s.cellSub}>Manage in Account &amp; security</span>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {inviting && (
        <InviteForm
          onClose={() => setInviting(false)}
          onInvited={(row) => {
            setAdmins((prev) => [...prev, row]);
            setInviting(false);
            if (row.emailFailed) setError(`${row.username} was added, but the invite email failed. Use “Resend invite”.`);
            else flash(`Invite sent to ${row.email}. The link works for 72 hours.`);
          }}
        />
      )}
    </>
  );
}

function InviteForm({ onClose, onInvited }) {
  const [form, setForm] = useState({ email: '', username: '', role: 'staff' });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const set = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      onInvited(await adminApi('/api/admins', { method: 'POST', body: JSON.stringify(form) }));
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };

  return (
    <div className={s.backdrop} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <form className={s.drawer} onSubmit={submit} role="dialog" aria-modal="true" aria-labelledby="invite-title">
        <div className={s.drawerHead}>
          <h2 id="invite-title" className={s.drawerTitle}>Invite an admin</h2>
          <button type="button" className={s.closeBtn} onClick={onClose} aria-label="Close">✕</button>
        </div>
        <div className={s.drawerBody}>
          {error && <div className={s.alertError} role="alert">{error}</div>}
          <div className={s.stack}>
            <div className={s.field}>
              <label className={s.label} htmlFor="inv-email">Email *</label>
              <input id="inv-email" className={s.input} type="email" required maxLength={120} value={form.email} onChange={set('email')} />
            </div>
            <div className={s.field}>
              <label className={s.label} htmlFor="inv-name">Name *</label>
              <input id="inv-name" className={s.input} required minLength={2} maxLength={40} value={form.username} onChange={set('username')} placeholder="e.g. Sita" />
              <span className={s.hint}>Shown in the panel and in emails.</span>
            </div>
            <fieldset className={s.field} style={{ border: 0, padding: 0, margin: 0 }}>
              <legend className={s.label}>Role</legend>
              {ROLES.map((r) => (
                <label key={r} className={s.roleOption}>
                  <input type="radio" name="role" value={r} checked={form.role === r} onChange={set('role')} />
                  <span>
                    <strong>{ROLE_LABELS[r]}</strong>
                    <span className={s.hint} style={{ display: 'block' }}>{ROLE_DESCRIPTIONS[r]}</span>
                  </span>
                </label>
              ))}
            </fieldset>
            <p className={s.hint}>They&apos;ll get an email with a link to choose their own password. You never see or set it.</p>
          </div>
        </div>
        <div className={s.drawerFoot}>
          <button type="button" className={s.btnGhost} onClick={onClose}>Cancel</button>
          <button type="submit" className={s.btnPrimary} disabled={busy}>{busy ? 'Sending…' : 'Send invite'}</button>
        </div>
      </form>
    </div>
  );
}
