# Copy B2B leads into a Google Sheet

The scope requires every "Want us in your place?" submission to land in a central Google Sheet. The website posts each lead to a small Google Apps Script attached to the sheet. The script runs as the sheet owner, so the website needs no Google credentials. A shared secret stops anyone else from writing to the sheet.

## 1. Create the sheet and script

1. Create a Google Sheet, e.g. **Blue Mont – Partner Leads**, signed in as the Blue Mont account that should own it.
2. Open **Extensions → Apps Script**, delete the sample code, and paste the code below.
3. Replace `CHANGE_ME` with a long random string. Use the same value for `GOOGLE_SHEETS_WEBHOOK_SECRET` in step 3.

```js
const SECRET = 'CHANGE_ME';
const HEADERS = [
  'Submitted at', 'Business / store', 'Contact person', 'Mobile (WhatsApp)', 'Location',
  'Type of business', 'Partnership need', 'Footfall / brands handled', 'Lead ID',
];

function doPost(e) {
  const data = JSON.parse(e.postData.contents);
  if (data.secret !== SECRET) return json({ ok: false, error: 'unauthorized' });

  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
  if (sheet.getLastRow() === 0) sheet.appendRow(HEADERS);

  // Prefix values that start with = + - @ so Sheets never runs them as formulas.
  const safe = (v) => (/^[=+\-@]/.test(String(v || '')) ? "'" + v : v || '');

  sheet.appendRow([
    new Date(data.submittedAt),
    safe(data.businessName), safe(data.contactPerson), "'" + data.mobileNumber, safe(data.location),
    safe(data.businessType), safe(data.partnershipNeed), safe(data.footfallAndBrands), data.leadId,
  ]);
  return json({ ok: true });
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
```

## 2. Deploy it as a web app

1. Click **Deploy → New deployment**, and choose the type **Web app**.
2. Set **Execute as** to *Me* and **Who has access** to *Anyone*. The secret is what protects it.
3. Click **Deploy**, authorise when asked, and copy the **Web app URL** (it ends in `/exec`).

## 3. Configure the website

Add to `.env.local` (or the hosting provider's environment settings):

```
GOOGLE_SHEETS_WEBHOOK_URL=https://script.google.com/macros/s/XXXX/exec
GOOGLE_SHEETS_WEBHOOK_SECRET=the same random string as in the script
```

Restart the site and submit a test lead from `/partner`. A new row should appear in the sheet.

## If a lead doesn't reach the sheet

The lead is always saved in the database first. If the sheet call fails (wrong URL, Google outage), the admin overview shows a warning. Open the lead in **Admin → Partner leads** and click **Retry** next to "Google Sheet".

If you edit the script later, deploy it again with **Deploy → Manage deployments → Edit → New version**. The URL stays the same.
