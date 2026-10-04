import { NextResponse } from 'next/server';
import { protect } from '../../../../lib/auth';

export async function GET(request) {
  try {
    const admin = await protect(request);
    if (!admin) return NextResponse.json({ message: 'Not authorized' }, { status: 401 });
    
    return NextResponse.json(admin);
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
