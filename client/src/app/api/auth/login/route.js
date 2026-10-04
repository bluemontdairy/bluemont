import { NextResponse } from 'next/server';
import connectDB from '../../../../lib/db';
import Admin from '../../../../models/Admin';
import { signSession, sessionCookie } from '../../../../lib/auth';
import { clientIp, isRateLimited } from '../../../../lib/rateLimit';
import { handleError } from '../../../../lib/apiResponse';

export async function POST(request) {
  try {
    if (isRateLimited(`login:${clientIp(request)}`, { limit: 10, windowMs: 15 * 60 * 1000 })) {
      return NextResponse.json({ message: 'Too many attempts. Try again in 15 minutes.' }, { status: 429 });
    }

    await connectDB();
    const { email, password } = await request.json();
    if (typeof email !== 'string' || typeof password !== 'string') {
      return NextResponse.json({ message: 'Invalid email or password' }, { status: 401 });
    }

    const admin = await Admin.findOne({ email: email.trim().toLowerCase() });
    if (!admin || !(await admin.matchPassword(password))) {
      return NextResponse.json({ message: 'Invalid email or password' }, { status: 401 });
    }

    const response = NextResponse.json({
      _id: admin._id,
      username: admin.username,
      email: admin.email,
      role: admin.role,
    });
    response.cookies.set(sessionCookie(signSession(admin)));
    return response;
  } catch (error) {
    return handleError(error);
  }
}
