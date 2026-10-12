'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import s from './admin.module.css';
import { adminApi } from './adminApi';
import { BUSINESS_TYPES, LEAD_STATUSES, PARTNERSHIP_NEEDS } from '../../lib/leadOptions';

const dateFmt = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  timeZone: 'Asia/Kathmandu',
});

const STATUS_LABELS = { new: 'New', contacted: 'Contacted', converted: 'Converted', rejected: 'Not a fit' };

const csvCell = (value) => {
  let text = Array.isArray(value) ? value.join('; ') : String(value ?? '');
  // Stop spreadsheet apps treating a cell as a formula.
  if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`;
  return `"${text.replace(/"/g, '""')}"`;
};

function exportCsv(leads) {
  const header = ['Received', 'Business', 'Contact person', 'Mobile', 'Location', 'Type', 'Needs', 'Footfall / brands', 'Status', 'Notes'];
  const rows = leads.map((l) => [
    dateFmt.format(new Date(l.createdAt)),
    l.businessName,
    l.contactPerson,
    l.mobileNumber,
    l.location,
    l.businessType,
    l.partnershipNeed,
    l.dailyFootfall,
    STATUS_LABELS[l.status],
    l.notes,
  ]);
  const csv = [header, ...rows].map((r) => r.map(csvCell).join(',')).join('\r\n');
  const url = URL.createObjectURL(new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = `blue-mont-leads-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function LeadsManager({ initialLeads, canDelete = false }) {
  const router = useRouter();
  const [leads, setLeads] = useState(initialLeads);
  const [status, setStatus] = useState('');
  const [type, setType] = useState('');
  const [need, setNeed] = useState('');
  const [query, setQuery] = useState('');
  const [openId, setOpenId] = useState(null);
  const [error, setError] = useState('');

  const q = query.trim().toLowerCase();
  const visible = leads.filter(
    (l) =>
      (!status || l.status === status) &&
      (!type || l.businessType === type) &&
      (!need || l.partnershipNeed.includes(need)) &&
      (!q || `${l.businessName} ${l.contactPerson} ${l.location} ${l.mobileNumber}`.toLowerCase().includes(q))
  );
  const open = leads.find((l) => l._id === openId);

  const replace = (saved) => {
    setLeads((prev) => prev.map((l) => (l._id === saved._id ? { ...l, ...saved } : l)));
    router.refresh(); // updates the "new" badge in the nav
  };

  const update = async (lead, changes) => {
    setError('');
    try {
      const saved = await adminApi(`/api/leads/${lead._id}`, { method: 'PATCH', body: JSON.stringify(changes) });
      replace({ ...saved, _id: String(saved._id) });
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    }
  };

  const remove = async (lead) => {
    if (!window.confirm(`Delete the lead from ${lead.businessName}? This cannot be undone.`)) return;
    try {
      await adminApi(`/api/leads/${lead._id}`, { method: 'DELETE' });
      setLeads((prev) => prev.filter((l) => l._id !== lead._id));
      setOpenId(null);
      router.refresh();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <>
      <div className={s.pageHead}>
        <div>
          <h1 className={s.pageTitle}>Partner leads</h1>
          <p className={s.pageSub}>Applications from the &ldquo;Want us in your place?&rdquo; form.</p>
        </div>
        <button type="button" className={s.btnGhost} onClick={() => exportCsv(visible)} disabled={visible.length === 0}>
          Export CSV ({visible.length})
        </button>
      </div>

      {error && <div className={s.alertError} role="alert">{error}</div>}

      <div className={s.toolbar}>
        <label className={s.srOnly} htmlFor="lead-search">Search leads</label>
        <input
          id="lead-search"
          className={`${s.input} ${s.toolbarGrow}`}
          type="search"
          placeholder="Search business, person, area, mobile…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <select className={s.select} aria-label="Status" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All statuses</option>
          {LEAD_STATUSES.map((st) => <option key={st} value={st}>{STATUS_LABELS[st]}</option>)}
        </select>
        <select className={s.select} aria-label="Business type" value={type} onChange={(e) => setType(e.target.value)}>
          <option value="">All business types</option>
          {BUSINESS_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <select className={s.select} aria-label="Need" value={need} onChange={(e) => setNeed(e.target.value)}>
          <option value="">All needs</option>
          {PARTNERSHIP_NEEDS.map((n) => <option key={n} value={n}>{n}</option>)}
        </select>
      </div>

      <div className={s.tableWrap}>
        {visible.length === 0 ? (
          <p className={s.empty}>{leads.length === 0 ? 'No leads yet.' : 'No leads match these filters.'}</p>
        ) : (
          <table className={s.table}>
            <thead>
              <tr>
                <th>Business</th>
                <th>Contact</th>
                <th>Location</th>
                <th>Needs</th>
                <th>Received</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((lead) => (
                <tr key={lead._id}>
                  <td>
                    <button type="button" className={`${s.btnLink} ${s.cellStrong}`} onClick={() => setOpenId(lead._id)}>
                      {lead.businessName}
                    </button>
                    <div className={s.cellSub}>{lead.businessType}</div>
                  </td>
                  <td>
                    <div>{lead.contactPerson}</div>
                    <a className={s.cellSub} href={`tel:+977${lead.mobileNumber}`}>{lead.mobileNumber}</a>
                  </td>
                  <td>{lead.location}</td>
                  <td className={s.cellSub}>{lead.partnershipNeed.join(', ')}</td>
                  <td className={s.cellSub} style={{ whiteSpace: 'nowrap' }}>{dateFmt.format(new Date(lead.createdAt))}</td>
                  <td>
                    <select
                      className={s.select}
                      style={{ minWidth: 120 }}
                      aria-label={`Status for ${lead.businessName}`}
                      value={lead.status}
                      onChange={(e) => update(lead, { status: e.target.value })}
                    >
                      {LEAD_STATUSES.map((st) => <option key={st} value={st}>{STATUS_LABELS[st]}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {open && <LeadDrawer lead={open} onClose={() => setOpenId(null)} onUpdate={update} onDelete={canDelete ? remove : null} />}
    </>
  );
}

function LeadDrawer({ lead, onClose, onUpdate, onDelete }) {
  const [notes, setNotes] = useState(lead.notes || '');
  const [saving, setSaving] = useState(false);

  const wa = `https://wa.me/977${lead.mobileNumber}?text=${encodeURIComponent(
    `Namaste ${lead.contactPerson}, this is Blue Mont Dairy about stocking our ice cream at ${lead.businessName}.`
  )}`;

  return (
    <div className={s.backdrop} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={s.drawer} role="dialog" aria-modal="true" aria-labelledby="lead-title">
        <div className={s.drawerHead}>
          <h2 id="lead-title" className={s.drawerTitle}>{lead.businessName}</h2>
          <button type="button" className={s.closeBtn} onClick={onClose} aria-label="Close">✕</button>
        </div>

        <div className={s.drawerBody}>
          <div className={s.toolbar}>
            <a className={s.btnPrimary} href={wa} target="_blank" rel="noopener noreferrer">WhatsApp</a>
            <a className={s.btnGhost} href={`tel:+977${lead.mobileNumber}`}>Call</a>
            <select
              className={s.select}
              aria-label="Status"
              value={lead.status}
              onChange={(e) => onUpdate(lead, { status: e.target.value })}
            >
              {LEAD_STATUSES.map((st) => <option key={st} value={st}>{STATUS_LABELS[st]}</option>)}
            </select>
          </div>

          <dl className={s.detailList}>
            <dt>Contact person</dt><dd>{lead.contactPerson}</dd>
            <dt>Mobile</dt><dd>{lead.mobileNumber}</dd>
            <dt>Location</dt><dd>{lead.location}</dd>
            <dt>Business type</dt><dd>{lead.businessType}</dd>
            <dt>Needs</dt><dd>{lead.partnershipNeed.join(', ')}</dd>
            <dt>Footfall / brands</dt><dd>{lead.dailyFootfall || '—'}</dd>
            <dt>Received</dt><dd>{dateFmt.format(new Date(lead.createdAt))}</dd>
          </dl>

          <div className={s.field}>
            <label className={s.label} htmlFor="lead-notes">Internal notes</label>
            <textarea
              id="lead-notes"
              className={s.textarea}
              maxLength={2000}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Visited 12 Oct, freezer approved, first delivery Friday"
            />
          </div>
        </div>

        <div className={s.drawerFoot}>
          {onDelete ? (
            <button type="button" className={s.btnDanger} style={{ marginRight: 'auto' }} onClick={() => onDelete(lead)}>
              Delete
            </button>
          ) : (
            <span style={{ marginRight: 'auto' }} />
          )}
          <button type="button" className={s.btnGhost} onClick={onClose}>Close</button>
          <button
            type="button"
            className={s.btnPrimary}
            disabled={saving || notes === (lead.notes || '')}
            onClick={async () => {
              setSaving(true);
              await onUpdate(lead, { notes });
              setSaving(false);
            }}
          >
            {saving ? 'Saving…' : 'Save notes'}
          </button>
        </div>
      </div>
    </div>
  );
}
