import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import Admin from '../models/Admin';
import connectDB from './db';

export const SESSION_COOKIE = 'bm_admin';
const SESSION_DAYS = 7;

const secret = () => {
  const value = process.env.JWT_SECRET;
  if (!value || value.length < 32) throw new Error('JWT_SECRET must be set to at least 32 characters');
  return value;
};

export const signSession = (admin) =>
  jwt.sign({ id: String(admin._id) }, secret(), { expiresIn: `${SESSION_DAYS}d` });

// httpOnly keeps the token away from page scripts; sameSite=strict means the
// browser won't send it on cross-site requests, which covers CSRF for the
// cookie-authenticated admin API.
export const sessionCookie = (token) => ({
  name: SESSION_COOKIE,
  value: token,
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  path: '/',
  maxAge: SESSION_DAYS * 24 * 60 * 60,
});

const adminFromToken = async (token) => {
  if (!token) return null;
  try {
    const { id } = jwt.verify(token, secret());
    await connectDB();
    return await Admin.findById(id).select('-password').lean();
  } catch {
    return null;
  }
};

/** For route handlers: the signed-in admin, or null. */
export const protect = async (request) => {
  const header = request.headers.get('authorization');
  const bearer = header?.startsWith('Bearer ') ? header.slice(7) : null;
  return adminFromToken(bearer || request.cookies.get(SESSION_COOKIE)?.value);
};

/** For server components and layouts. */
export const getCurrentAdmin = async () => {
  const store = await cookies();
  return adminFromToken(store.get(SESSION_COOKIE)?.value);
};
