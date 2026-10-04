'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import s from './admin.module.css';
import { adminApi } from './adminApi';

const dateFmt = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  timeZone: 'Asia/Kathmandu',
});

export default function MessagesManager({ initialMessages }) {
  const router = useRouter();
  const [messages, setMessages] = useState(initialMessages);
  const [filter, setFilter] = useState('unread');
  const [error, setError] = useState('');

  const visible = messages.filter((m) => filter === 'all' || !m.isRead);

  const setRead = async (msg, isRead) => {
    try {
      await adminApi(`/api/contact/${msg._id}`, { method: 'PATCH', body: JSON.stringify({ isRead }) });
      setMessages((prev) => prev.map((m) => (m._id === msg._id ? { ...m, isRead } : m)));
      router.refresh();
    } catch (err) {
      setError(err.message);
    }
  };

  const remove = async (msg) => {
    if (!window.confirm(`Delete the message from ${msg.name}?`)) return;
    try {
      await adminApi(`/api/contact/${msg._id}`, { method: 'DELETE' });
      setMessages((prev) => prev.filter((m) => m._id !== msg._id));
      router.refresh();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <>
      <div className={s.pageHead}>
        <div>
          <h1 className={s.pageTitle}>Messages</h1>
          <p className={s.pageSub}>General inquiries from the website contact form.</p>
        </div>
        <select className={s.select} style={{ width: 'auto' }} aria-label="Show" value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="unread">Unread ({messages.filter((m) => !m.isRead).length})</option>
          <option value="all">All ({messages.length})</option>
        </select>
      </div>

      {error && <div className={s.alertError} role="alert">{error}</div>}

      {visible.length === 0 ? (
        <div className={s.card}>
          <p className={s.empty}>{filter === 'unread' ? 'No unread messages.' : 'No messages yet.'}</p>
        </div>
      ) : (
        <div className={s.messageList}>
          {visible.map((m) => (
            <article key={m._id} className={`${s.message} ${m.isRead ? '' : s.messageUnread}`}>
              <div className={s.messageHead}>
                <div>
                  <div className={s.cellStrong}>{m.name}</div>
                  <div className={s.cellSub}>
                    <a href={`tel:+977${m.phone}`}>{m.phone}</a>
                    {m.email && <> · <a href={`mailto:${m.email}`}>{m.email}</a></>}
                  </div>
                </div>
                <span className={s.cellSub}>{dateFmt.format(new Date(m.createdAt))}</span>
              </div>
              <p className={s.messageBody}>{m.message}</p>
              <div className={s.toolbar} style={{ marginBottom: 0 }}>
                <a
                  className={`${s.btnGhost} ${s.btnSmall}`}
                  href={`https://wa.me/977${m.phone}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  WhatsApp
                </a>
                <button type="button" className={`${s.btnGhost} ${s.btnSmall}`} onClick={() => setRead(m, !m.isRead)}>
                  Mark as {m.isRead ? 'unread' : 'read'}
                </button>
                <button type="button" className={`${s.btnDanger} ${s.btnSmall}`} onClick={() => remove(m)}>
                  Delete
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </>
  );
}
