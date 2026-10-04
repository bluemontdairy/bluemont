'use client';

import { useState } from 'react';
import styles from './page.module.css';
import { BUSINESS_TYPES, PARTNERSHIP_NEEDS } from '../../lib/leadOptions';

const EMPTY = {
  businessName: '',
  contactPerson: '',
  mobileNumber: '',
  location: '',
  businessType: '',
  partnershipNeed: [],
  dailyFootfall: '',
  website: '', // honeypot
};

export default function PartnerForm() {
  const [form, setForm] = useState(EMPTY);
  const [status, setStatus] = useState('idle'); // idle | sending | sent
  const [error, setError] = useState('');

  const set = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const toggleNeed = (e) => {
    const { value, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      partnershipNeed: checked ? [...prev.partnershipNeed, value] : prev.partnershipNeed.filter((n) => n !== value),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.partnershipNeed.length === 0) {
      setError('Choose at least one partnership or equipment need.');
      return;
    }
    setError('');
    setStatus('sending');

    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.message || 'Could not send your application. Please try again.');
      setForm(EMPTY);
      setStatus('sent');
    } catch (err) {
      setError(err.message);
      setStatus('idle');
    }
  };

  return (
    <div className={styles.formCard}>
      <h2 id="partner-form-title" className={styles.formTitle}>Retail partner application</h2>
      <p className={styles.formSubtitle}>Our sales desk replies on WhatsApp within one working day.</p>

      {status === 'sent' ? (
        <div className={styles.successMessage} role="status">
          <h3>Thank you, we&apos;ve got your application.</h3>
          <p>A Blue Mont sales representative will contact you shortly on the mobile number you gave.</p>
          <button type="button" className="btn btn-primary" onClick={() => setStatus('idle')}>
            Submit another store
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className={styles.form} noValidate={false}>
          {error && (
            <div className={styles.error} role="alert">
              {error}
            </div>
          )}

          <div className={styles.formGroup}>
            <label htmlFor="businessName">Business / store legal name *</label>
            <input id="businessName" type="text" required maxLength={120} autoComplete="organization" value={form.businessName} onChange={set('businessName')} />
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="contactPerson">Contact person *</label>
              <input id="contactPerson" type="text" required maxLength={80} autoComplete="name" value={form.contactPerson} onChange={set('contactPerson')} />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="mobileNumber">Direct mobile (WhatsApp) *</label>
              <input
                id="mobileNumber"
                type="tel"
                required
                inputMode="tel"
                autoComplete="tel"
                pattern="(\+?977[\s-]?)?9[78][0-9\s-]{8,10}"
                title="10-digit Nepali mobile number, e.g. 98XXXXXXXX"
                placeholder="98XXXXXXXX"
                value={form.mobileNumber}
                onChange={set('mobileNumber')}
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="location">Store location &amp; neighbourhood *</label>
            <input
              id="location"
              type="text"
              required
              maxLength={160}
              placeholder="e.g. Lalitpur - Jhamsikhel / Kathmandu - Baneshwor"
              value={form.location}
              onChange={set('location')}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="businessType">Type of business *</label>
            <select id="businessType" required value={form.businessType} onChange={set('businessType')}>
              <option value="" disabled>
                Select one
              </option>
              {BUSINESS_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <fieldset className={styles.formGroup}>
            <legend>Partnership / equipment need *</legend>
            <div className={styles.checkboxGroup}>
              {PARTNERSHIP_NEEDS.map((need) => (
                <label key={need} className={styles.checkboxLabel}>
                  <input type="checkbox" value={need} checked={form.partnershipNeed.includes(need)} onChange={toggleNeed} />
                  {need}
                </label>
              ))}
            </div>
          </fieldset>

          <div className={styles.formGroup}>
            <label htmlFor="dailyFootfall">Estimated daily footfall / dairy brands you already stock (optional)</label>
            <input
              id="dailyFootfall"
              type="text"
              maxLength={300}
              placeholder="e.g. 200+ customers a day; we stock Brand A, Brand B"
              value={form.dailyFootfall}
              onChange={set('dailyFootfall')}
            />
          </div>

          {/* Honeypot for bots; hidden from people and screen readers. */}
          <div className={styles.honeypot} aria-hidden="true">
            <label htmlFor="website">Website</label>
            <input id="website" type="text" tabIndex={-1} autoComplete="off" value={form.website} onChange={set('website')} />
          </div>

          <button type="submit" className={`btn btn-primary ${styles.submitBtn}`} disabled={status === 'sending'}>
            {status === 'sending' ? 'Sending…' : 'Apply to stock Blue Mont'}
          </button>
        </form>
      )}
    </div>
  );
}
