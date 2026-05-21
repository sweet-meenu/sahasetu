import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import { CounselingSession, User, Complaint } from '@/lib/db/models';
import { requireRole } from '@/lib/auth/session';

// GET /api/partner/sessions - List sessions assigned to Partner (partner role)
export async function GET(request: NextRequest) {
  const auth = await requireRole(request, ['partner', 'counselor', 'admin']);
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const filter: Record<string, unknown> = {};
    if (auth.session!.role === 'counselor') {
      filter.counselorId = auth.session!.userId;
    }
    if (status && status !== 'all') filter.status = status;

    const [sessions, total] = await Promise.all([
      CounselingSession.find(filter)
        .populate('userId', 'name anonymousId')
        .populate('counselorId', 'name email')
        .sort({ scheduledAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      CounselingSession.countDocuments(filter),
    ]);

    // Mask user identity for anonymous sessions
    const maskedSessions = sessions.map((s: any) => {
      const session = { ...s } as Record<string, unknown>;
      if (session.isAnonymous && session.userId) {
        const u = session.userId as Record<string, unknown>;
        session.userId = { _id: (u as any)._id, name: 'Anonymous', anonymousId: (u as any).anonymousId };
      }
      return session;
    });

    return NextResponse.json({
      sessions: maskedSessions,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error('Error fetching Partner sessions:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH /api/partner/sessions - Update session status/notes
export async function PATCH(request: NextRequest) {
  const auth = await requireRole(request, ['partner', 'counselor', 'admin']);
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    await connectDB();
    const body = await request.json();
    const { sessionId, status, notes, duration } = body;

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID required' }, { status: 400 });
    }

    const session = await CounselingSession.findById(sessionId);
    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    if (status) session.status = status;
    if (notes) session.notes = notes;
    if (duration) session.duration = duration;
    if (status === 'completed') {
      session.endedAt = new Date();
    }

    await session.save();

    return NextResponse.json({ session });
  } catch (error) {
    console.error('Error updating session:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
