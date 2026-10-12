import { revalidatePath, revalidateTag } from 'next/cache';
import { CATALOG_TAG } from './catalog';

/** Call after any product or category change so the public pages update. */
export function refreshCatalog() {
  revalidateTag(CATALOG_TAG, { expire: 0 });
  revalidatePath('/', 'layout');
}
