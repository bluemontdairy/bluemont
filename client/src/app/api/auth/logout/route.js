import { NextResponse } from 'next/server';
import { clearedSessionCookie, currentSession } from '../../../../lib/auth';

export async function POST(request) {
  const result = await currentSession(request, { allowPendingMfa: true });
  if (result?.session) await result.session.deleteOne();
  const response = NextResponse.json({ ok: true });
  response.cookies.set(clearedSessionCookie());
  return response;
}
