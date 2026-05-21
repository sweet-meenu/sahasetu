import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import { getSession, createAuditLog } from '@/lib/auth/session';

export async function POST(request: NextRequest) {
  try {
    const { name, email, topic, message } = await request.json();

    if (!email || !topic || !message) {
      return NextResponse.json({ error: 'Missing email, topic, or message' }, { status: 400 });
    }

    const session = await getSession(request);
    await connectDB();

    // Log the support ticket creation in secure audit log
    await createAuditLog(
      session?.userId || undefined,
      'support.ticket_created',
      'support',
      `Support ticket created by ${name || 'anonymous'} (${email}) under topic "${topic}"`,
      { name, email, topic, message },
      request
    );

    return NextResponse.json({ success: true, message: 'Support ticket recorded successfully' });
  } catch (error) {
    console.error('Error creating support ticket:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
