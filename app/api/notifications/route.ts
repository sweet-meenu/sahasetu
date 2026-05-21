import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import { Notification } from '@/lib/db/models';
import { requireAuth } from '@/lib/auth/session';

// GET /api/notifications - Get all user notifications
export async function GET(request: NextRequest) {
  const auth = await requireAuth(request);
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    await connectDB();
    const notifications = await Notification.find({ userId: auth.session!.userId })
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    return NextResponse.json({ notifications });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH /api/notifications - Mark as read
export async function PATCH(request: NextRequest) {
  const auth = await requireAuth(request);
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    await connectDB();
    const { notificationId } = await request.json();

    if (notificationId === 'all') {
      await Notification.updateMany(
        { userId: auth.session!.userId, isRead: false },
        { $set: { isRead: true } }
      );
    } else {
      await Notification.findOneAndUpdate(
        { _id: notificationId, userId: auth.session!.userId },
        { $set: { isRead: true } }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error marking notifications read:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
