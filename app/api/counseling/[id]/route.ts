import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import { CounselingSession } from '@/lib/db/models';
import { requireAuth, createAuditLog } from '@/lib/auth/session';

// PATCH /api/counseling/[id] - Confirm, complete, or cancel a session
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth(request);
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const { id } = await params;
    const { status, notes, rating, feedback } = await request.json();
    await connectDB();

    const session = await CounselingSession.findById(id);
    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    // Authorization check: either counselor or user
    const isCounselor = session.counselorId.toString() === auth.session!.userId;
    const isUser = session.userId.toString() === auth.session!.userId;
    const isAdmin = ['admin'].includes(auth.session!.role);

    if (!isCounselor && !isUser && !isAdmin) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const s = session as any;
    if (status !== undefined) s.status = status;
    if (notes !== undefined) s.notes = notes;
    if (rating !== undefined) s.rating = rating;
    if (feedback !== undefined) s.feedback = feedback;

    await s.save();

    await createAuditLog(
      auth.session!.userId,
      'counseling.update_status',
      'counseling',
      `Counseling session ${id} updated to status "${status || session.status}"`,
      { sessionId: id, status },
      request
    );

    return NextResponse.json({ success: true, session });
  } catch (error) {
    console.error('Error updating session:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
