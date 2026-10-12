import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import AdminSession from '../../../../models/AdminSession';
import { currentSession, revokeSessions } from '../../../../lib/auth';
import { handleError, unauthorized } from '../../../../lib/apiResponse';

// The signed-in admin's own sessions (browsers), for Account → Signed-in devices.
export async function GET(request) {
  try {
    const result = await currentSession(request);
    if (!result) return unauthorized();
    const sessions = await AdminSession.find({ admin: result.admin._id, pendingMfa: false }).sort({ lastSeenAt: -1 }).lean();
    return NextResponse.json(
      sessions.map((s) => ({
        _id: String(s._id),
        ip: s.ip,
        userAgent: s.userAgent,
        createdAt: s.createdAt,
        lastSeenAt: s.lastSeenAt,
        current: String(s._id) === String(result.session._id),
      }))
    );
  } catch (error) {
    return handleError(error);
  }
}

// ?id=<session> signs out one browser; no id signs out all the others.
export async function DELETE(request) {
  try {
    const result = await currentSession(request);
    if (!result) return unauthorized();
    const id = new URL(request.url).searchParams.get('id');

    if (id) {
      if (!mongoose.isValidObjectId(id) || id === String(result.session._id)) {
        return NextResponse.json({ message: 'Use Sign out for this browser.' }, { status: 400 });
      }
      await AdminSession.deleteOne({ _id: id, admin: result.admin._id });
    } else {
      await revokeSessions(result.admin._id, { exceptSessionId: result.session._id });
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleError(error);
  }
}
