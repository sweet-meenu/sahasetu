import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import { Complaint, User, Evidence, CounselingSession, Partner, Committee } from '@/lib/db/models';
import { requireRole } from '@/lib/auth/session';

// GET /api/admin/stats - Get dashboard statistics
export async function GET(request: NextRequest) {
  const auth = await requireRole(request, ['admin', 'committee_member']);
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    await connectDB();

    const [
      totalCases,
      activeCases,
      resolvedCases,
      urgentCases,
      totalUsers,
      totalPartners,
      totalCommittees,
      recentCases,
      statusBreakdown,
    ] = await Promise.all([
      Complaint.countDocuments({ status: { $ne: 'draft' } }),
      Complaint.countDocuments({
        status: { $in: ['submitted', 'under_review', 'investigation', 'hearing_scheduled', 'hearing_in_progress'] },
      }),
      Complaint.countDocuments({ status: { $in: ['resolved', 'closed'] } }),
      Complaint.countDocuments({ priority: 'urgent', status: { $nin: ['resolved', 'closed', 'draft'] } }),
      User.countDocuments({ isActive: true }),
      Partner.countDocuments({ isActive: true }),
      Committee.countDocuments({ isActive: true }),
      Complaint.find({ status: { $ne: 'draft' } })
        .sort({ createdAt: -1 })
        .limit(10)
        .select('caseId status priority incidentType isAnonymous createdAt')
        .lean(),
      Complaint.aggregate([
        { $match: { status: { $ne: 'draft' } } },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
    ]);

    // Monthly trend (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyTrend = await Complaint.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo }, status: { $ne: 'draft' } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    return NextResponse.json({
      stats: {
        totalCases,
        activeCases,
        resolvedCases,
        urgentCases,
        totalUsers,
        totalPartners,
        totalCommittees,
      },
      recentCases,
      statusBreakdown: statusBreakdown.reduce(
        (acc: Record<string, number>, item: { _id: string; count: number }) => {
          acc[item._id] = item.count;
          return acc;
        },
        {}
      ),
      monthlyTrend,
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
