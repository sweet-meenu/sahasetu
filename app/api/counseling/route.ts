import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import { CounselingSession, User } from '@/lib/db/models';
import { requireAuth, createAuditLog } from '@/lib/auth/session';

// GET /api/counseling - List sessions
export async function GET(request: NextRequest) {
  const auth = await requireAuth(request);
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const upcoming = searchParams.get('upcoming');

    const filter: Record<string, unknown> = {};

    if (['counselor', 'partner'].includes(auth.session!.role)) {
      filter.counselorId = auth.session!.userId;
    } else {
      filter.userId = auth.session!.userId;
    }

    if (status) filter.status = status;
    if (upcoming === 'true') {
      filter.scheduledAt = { $gte: new Date() };
      filter.status = { $in: ['scheduled', 'in_progress'] };
    }

    const sessions = await CounselingSession.find(filter)
      .sort({ scheduledAt: -1 })
      .populate('counselorId', 'name email organization')
      .populate('userId', 'name anonymousId')
      .lean();

    return NextResponse.json({ sessions });
  } catch (error) {
    console.error('Error fetching sessions:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/counseling - Book a session
export async function POST(request: NextRequest) {
  const auth = await requireAuth(request);
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const body = await request.json();
    const { counselorId, type, scheduledAt, voiceDistortion, isAnonymous, complaintId } = body;

    if (!counselorId || !type || !scheduledAt) {
      return NextResponse.json(
        { error: 'Counselor, type, and scheduled date are required' },
        { status: 400 }
      );
    }

    await connectDB();

    // Verify counselor exists and has the right role
    const counselor = await User.findOne({
      _id: counselorId,
      role: { $in: ['counselor', 'partner'] },
      isActive: true,
    });

    if (!counselor) {
      return NextResponse.json({ error: 'Counselor not found' }, { status: 404 });
    }

    const session = await CounselingSession.create({
      userId: auth.session!.userId,
      counselorId,
      complaintId: complaintId || undefined,
      type,
      scheduledAt: new Date(scheduledAt),
      voiceDistortion: voiceDistortion || false,
      isAnonymous: isAnonymous || false,
    });

    await createAuditLog(
      auth.session!.userId,
      'counseling.book',
      'counseling',
      `Counseling session booked with ${counselor.name}`,
      { sessionId: session._id.toString(), type },
      request
    );

    return NextResponse.json({ success: true, session }, { status: 201 });
  } catch (error) {
    console.error('Error booking session:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
