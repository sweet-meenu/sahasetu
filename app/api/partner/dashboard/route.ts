import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import { Complaint, Partner, Committee, CounselingSession, User } from '@/lib/db/models';
import { requireRole } from '@/lib/auth/session';
import mongoose from 'mongoose';

// GET /api/partner/dashboard - Partner dashboard stats
export async function GET(request: NextRequest) {
  const auth = await requireRole(request, ['partner', 'counselor', 'admin']);
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    await connectDB();

    const user = await User.findById(auth.session!.userId).select('organization role').lean();
    const userOrg = user?.organization;

    const [
      activeSessions,
      pendingUpdates,
      resourcesShared,
      committeeMembers,
      upcomingSessions,
      recentUpdates,
      resources
    ] = await Promise.all([
      CounselingSession.countDocuments({
        status: { $in: ['scheduled', 'in_progress'] },
        ...(user?.role === 'counselor' ? { counselorId: auth.session!.userId } : {}),
      }),
      mongoose.models.Notification ? mongoose.models.Notification.countDocuments({ userId: auth.session!.userId, read: false }) : 0,
      mongoose.models.Resource ? mongoose.models.Resource.countDocuments({ partnerId: auth.session!.userId }) : 0,
      User.countDocuments({ role: 'committee_member', organization: userOrg }),
      
      CounselingSession.find({
        status: 'scheduled',
        ...(user?.role === 'counselor' ? { counselorId: auth.session!.userId } : {}),
      }).sort({ scheduledAt: 1 }).limit(4).populate('userId', 'anonymousId').lean(),
      
      mongoose.models.Notification ? mongoose.models.Notification.find({ userId: auth.session!.userId }).sort({ createdAt: -1 }).limit(4).lean() : [],
      
      mongoose.models.Resource ? mongoose.models.Resource.find({ partnerId: auth.session!.userId }).sort({ createdAt: -1 }).limit(3).lean() : []
    ]);

    return NextResponse.json({
      stats: {
        activeSessions,
        pendingUpdates,
        resourcesShared,
        committeeMembers,
      },
      upcomingSessions,
      recentUpdates,
      resources,
      partnerInfo: userOrg ? await Partner.findById(userOrg).lean() : null,
    });
  } catch (error) {
    console.error('Error fetching Partner dashboard:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
