import { NextResponse } from 'next/server';
import { protect } from '../../../../lib/auth';
import { handleError, unauthorized } from '../../../../lib/apiResponse';

export async function GET(request) {
  try {
    const admin = await protect(request);
    return admin ? NextResponse.json(admin) : unauthorized();
  } catch (error) {
    return handleError(error);
  }
}
