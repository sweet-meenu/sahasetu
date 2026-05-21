import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { createAuditLog } from '@/lib/auth/session';

export async function POST(request: NextRequest) {
  try {
    const session = await getSession(request);

    if (session) {
      await createAuditLog(
        session.userId,
        'user.logout',
        'user',
        `User logged out: ${session.email}`,
        {},
        request
      );
    }

    const response = NextResponse.json({ success: true });
    response.cookies.set('sahasetu-token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/',
    });

    return response;
  } catch {
    const response = NextResponse.json({ success: true });
    response.cookies.set('sahasetu-token', '', { maxAge: 0, path: '/' });
    return response;
  }
}
