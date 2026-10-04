// Appends a B2B lead to the management Google Sheet through a Google Apps
// Script web app (see docs/google-sheet-setup.md). No Google credentials live
// in this app: the script runs as the sheet owner and checks a shared secret.

export async function appendLeadToSheet(lead) {
  const url = process.env.GOOGLE_SHEETS_WEBHOOK_URL;
  if (!url) {
    console.warn('GOOGLE_SHEETS_WEBHOOK_URL not set; lead not copied to Google Sheet');
    return false;
  }

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      secret: process.env.GOOGLE_SHEETS_WEBHOOK_SECRET || '',
      submittedAt: new Date(lead.createdAt || Date.now()).toISOString(),
      businessName: lead.businessName,
      contactPerson: lead.contactPerson,
      mobileNumber: lead.mobileNumber,
      location: lead.location,
      businessType: lead.businessType,
      partnershipNeed: lead.partnershipNeed.join(', '),
      footfallAndBrands: lead.dailyFootfall,
      leadId: String(lead._id),
    }),
    signal: AbortSignal.timeout(8000),
  });

  if (!res.ok) throw new Error(`Sheet webhook responded ${res.status}`);
  const body = await res.json().catch(() => ({}));
  if (body.ok === false) throw new Error(`Sheet webhook rejected lead: ${body.error || 'unknown'}`);
  return true;
}
