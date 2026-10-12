import { NextResponse } from 'next/server';
import { revalidatePath, revalidateTag } from 'next/cache';
import connectDB from '../../../lib/db';
import SiteSettings from '../../../models/SiteSettings';
import { authorize } from '../../../lib/auth';
import { SETTINGS_TAG } from '../../../lib/siteSettings';
import { seal } from '../../../lib/sealing';
import { checkSetting, SECRET_KEYS, SETTINGS_FIELDS, SETTINGS_KEYS } from '../../../lib/settingsSchema';
import { denied, handleError } from '../../../lib/apiResponse';

// Secrets never leave the server: the form only learns whether one is saved.
const publicView = (values = {}) => ({
  values: Object.fromEntries(Object.entries(values).filter(([k]) => SETTINGS_KEYS.has(k) && !SECRET_KEYS.has(k))),
  secretsSet: Object.fromEntries([...SECRET_KEYS].map((k) => [k, Boolean(values[k])])),
});

export async function GET(request) {
  try {
    const auth = await authorize(request, 'settings.manage');
    if (!auth.admin) return denied(auth);
    await connectDB();
    const doc = await SiteSettings.findById('site').lean();
    return NextResponse.json(publicView(doc?.values));
  } catch (error) {
    return handleError(error);
  }
}

// Saves the whole form. Every field is validated; an empty field falls back
// to its default. Secret fields: empty keeps the saved value, a new value
// replaces it (encrypted), and keys listed in `clearSecrets` are removed.
export async function PUT(request) {
  try {
    const auth = await authorize(request, 'settings.manage');
    if (!auth.admin) return denied(auth);

    const body = await request.json().catch(() => ({}));
    const clear = new Set(Array.isArray(body.clearSecrets) ? body.clearSecrets : []);

    await connectDB();
    const previous = (await SiteSettings.findById('site').lean())?.values || {};
    const values = {};
    const errors = {};
    for (const field of SETTINGS_FIELDS) {
      if (field.secret) {
        const typed = typeof body[field.key] === 'string' ? body[field.key].trim() : '';
        if (typed) values[field.key] = seal(typed);
        else if (!clear.has(field.key) && previous[field.key]) values[field.key] = previous[field.key];
        continue;
      }
      const { value, error } = checkSetting(field, body[field.key]);
      if (error) errors[field.key] = error;
      else values[field.key] = value;
    }
    if (Object.keys(errors).length) {
      return NextResponse.json({ message: 'Some fields need fixing.', errors }, { status: 400 });
    }

    await SiteSettings.findByIdAndUpdate('site', { values, updatedBy: auth.admin.username }, { upsert: true });
    revalidateTag(SETTINGS_TAG, { expire: 0 });
    revalidatePath('/', 'layout');
    return NextResponse.json(publicView(values));
  } catch (error) {
    return handleError(error);
  }
}
