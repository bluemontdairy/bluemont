import 'server-only';
import { cookies } from 'next/headers';
import Admin from '../models/Admin';
import AdminSession from '../models/AdminSession';
import connectDB from './db';
import { clientIp } from './rateLimit';
import { randomToken, sha256 } from './secretBox';
import { can } from './roles';

// Admin sign-in sessions.
//
// - The cookie holds a random 256-bit token; the database stores its SHA-256
//   hash (AdminSession), so sessions can be listed and revoked one by one,
//   and every session ends when the password changes.
// - Sessions end after IDLE_HOURS without activity, and after MAX_DAYS in
//   any case.
// - In production the cookie uses the __Host- prefix: Secure, path=/, no
//   Domain, so no subdomain can set or read it. httpOnly keeps it from page
//   scripts and sameSite=strict stops cross-site requests from carrying it.
// - State-changing API calls also need a same-origin Origin header (CSRF).

const PROD = process.env.NODE_ENV === 'production';
export const SESSION_COOKIE = PROD ? '__Host-bm_admin' : 'bm_admin';

const MAX_DAYS = 7;
const IDLE_HOURS = 12;
const PENDING_MFA_MINUTES = 5;
const TOUCH_EVERY_MS = 5 * 60 * 1000;

const cookieOptions = (maxAgeSeconds) => ({
  name: SESSION_COOKIE,
  httpOnly: true,
  secure: PROD,
  sameSite: 'strict',
  path: '/',
  maxAge: maxAgeSeconds,
});

export const sessionCookie = (token, { pendingMfa = false } = {}) => ({
  ...cookieOptions(pendingMfa ? PENDING_MFA_MINUTES * 60 : MAX_DAYS * 24 * 60 * 60),
  value: token,
});

export const clearedSessionCookie = () => ({ ...cookieOptions(0), value: '' });

const userAgentOf = (request) => (request.headers.get('user-agent') || '').slice(0, 300);

/** Starts a session and returns the cookie token. */
export async function createSession(admin, request, { pendingMfa = false } = {}) {
  const token = randomToken();
  const ms = pendingMfa ? PENDING_MFA_MINUTES * 60 * 1000 : MAX_DAYS * 24 * 60 * 60 * 1000;
  await AdminSession.create({
    admin: admin._id,
    tokenHash: sha256(token),
    pendingMfa,
    expiresAt: new Date(Date.now() + ms),
    ip: clientIp(request),
    userAgent: userAgentOf(request),
  });
  return token;
}

/** Ends every session of an admin, optionally keeping one (the current). */
export async function revokeSessions(adminId, { exceptSessionId } = {}) {
  const filter = { admin: adminId };
  if (exceptSessionId) filter._id = { $ne: exceptSessionId };
  await AdminSession.deleteMany(filter);
}

/** Resolves a cookie token to { admin, session }, or null. */
async function resolve(token, { allowPendingMfa = false } = {}) {
  if (!token || typeof token !== 'string' || token.length > 100) return null;
  await connectDB();
  const session = await AdminSession.findOne({ tokenHash: sha256(token) });
  if (!session) return null;

  const now = Date.now();
  const idle = now - new Date(session.lastSeenAt).getTime() > IDLE_HOURS * 60 * 60 * 1000;
  if (session.expiresAt.getTime() <= now || (!session.pendingMfa && idle)) {
    await session.deleteOne();
    return null;
  }
  if (session.pendingMfa && !allowPendingMfa) return null;

  const admin = await Admin.findById(session.admin).lean();
  if (!admin || admin.isActive === false) {
    await session.deleteOne();
    return null;
  }

  if (!session.pendingMfa && now - new Date(session.lastSeenAt).getTime() > TOUCH_EVERY_MS) {
    await AdminSession.updateOne({ _id: session._id }, { lastSeenAt: new Date(now) });
  }
  return { admin: publicAdmin(admin), session };
}

const publicAdmin = (a) => ({
  _id: String(a._id),
  username: a.username,
  email: a.email,
  role: a.role,
  totpEnabled: !!a.totpEnabled,
  lastLoginAt: a.lastLoginAt || null,
  passwordChangedAt: a.passwordChangedAt || null,
});

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

/**
 * CSRF guard: a state-changing request must come from this site. Browsers
 * always send Origin on cross-site POST/PUT/PATCH/DELETE.
 */
export function isSameOrigin(request) {
  if (SAFE_METHODS.has(request.method)) return true;
  const origin = request.headers.get('origin');
  if (!origin) return false;
  const allowed = new Set([new URL(request.url).origin]);
  const host = request.headers.get('x-forwarded-host') || request.headers.get('host');
  if (host) allowed.add(`${request.headers.get('x-forwarded-proto') || (PROD ? 'https' : 'http')}://${host}`);
  return allowed.has(origin);
}

const tokenFrom = (request) => request.cookies.get(SESSION_COOKIE)?.value;

/** For route handlers: the signed-in admin, or null. */
export async function protect(request) {
  if (!isSameOrigin(request)) return null;
  const result = await resolve(tokenFrom(request));
  return result?.admin || null;
}

/** Like protect, but also returns the session (for account pages). */
export async function currentSession(request, options) {
  if (!isSameOrigin(request)) return null;
  return resolve(tokenFrom(request), options);
}

/** For server components and layouts. */
export async function getCurrentAdmin() {
  const store = await cookies();
  const result = await resolve(store.get(SESSION_COOKIE)?.value);
  return result?.admin || null;
}

export const isSuperadmin = (admin) => admin?.role === 'superadmin';

/**
 * For route handlers that need a permission (lib/roles.js). Returns
 * { admin } when allowed, or { status: 401 | 403 } for the caller to answer.
 */
export async function authorize(request, permission) {
  const admin = await protect(request);
  if (!admin) return { status: 401 };
  if (permission && !can(admin, permission)) return { status: 403 };
  return { admin };
}
