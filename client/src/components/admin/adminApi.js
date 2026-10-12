// fetch wrapper for the admin panel: JSON in/out, readable errors, and a
// full reload to the login page when the session has expired.
export async function adminApi(url, options = {}) {
  const res = await fetch(url, {
    ...options,
    headers: options.body instanceof FormData ? undefined : { 'Content-Type': 'application/json' },
  });
  const body = await res.json().catch(() => ({}));
  if (res.status === 401) {
    // A hard navigation clears all client state from the expired session.
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination
    window.location.href = '/admin/login?notice=expired';
    throw new Error('Your session expired. Please sign in again.');
  }
  if (!res.ok) throw new Error(body.message || 'Request failed.');
  return body;
}
