import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import { Complaint, User, Partner, Committee, CounselingSession } from '@/lib/db/models';
import { requireRole } from '@/lib/auth/session';

// GET /api/admin/reports - Generate reports & analytics (admin only)
export async function GET(request: NextRequest) {
  const auth = await requireRole(request, ['admin']);
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '6months';

    let startDate: Date;
    const now = new Date();
    switch (period) {
      case '1month': startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1); break;
      case '3months': startDate = new Date(now.getFullYear(), now.getMonth() - 3, 1); break;
      case '1year': startDate = new Date(now.getFullYear() - 1, now.getMonth(), 1); break;
      case 'all': startDate = new Date(0); break;
      default: startDate = new Date(now.getFullYear(), now.getMonth() - 6, 1);
    }

    const [
      complaintsByType,
      complaintsByStatus,
      complaintsByPriority,
      resolutionStats,
      monthlyTrend,
      topPartners,
      counselingStats,
      userStats,
      avgResolutionTime,
      complianceStats,
    ] = await Promise.all([
      // Complaints by harassment type
      Complaint.aggregate([
        { $match: { createdAt: { $gte: startDate }, status: { $ne: 'draft' } } },
        { $group: { _id: '$incidentType', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      // Complaints by status
      Complaint.aggregate([
        { $match: { createdAt: { $gte: startDate }, status: { $ne: 'draft' } } },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      // Complaints by priority
      Complaint.aggregate([
        { $match: { createdAt: { $gte: startDate }, status: { $ne: 'draft' } } },
        { $group: { _id: '$priority', count: { $sum: 1 } } },
      ]),
      // Resolution outcomes
      Complaint.aggregate([
        { $match: { status: { $in: ['resolved', 'closed'] }, 'resolution.outcome': { $exists: true } } },
        { $group: { _id: '$resolution.outcome', count: { $sum: 1 } } },
      ]),
      // Monthly complaint trend
      Complaint.aggregate([
        { $match: { createdAt: { $gte: startDate }, status: { $ne: 'draft' } } },
        {
          $group: {
            _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
            submitted: { $sum: 1 },
            resolved: { $sum: { $cond: [{ $in: ['$status', ['resolved', 'closed']] }, 1, 0] } },
          },
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } },
      ]),
      // Top performing Partners
      Partner.find({ verified: true })
        .sort({ rating: -1 })
        .limit(5)
        .select('name services rating casesHandled city')
        .lean(),
      // Counseling session stats
      CounselingSession.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            avgRating: { $avg: '$feedback.rating' },
          },
        },
      ]),
      // User registration trend
      User.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        {
          $group: {
            _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' }, role: '$role' },
            count: { $sum: 1 },
          },
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } },
      ]),
      // Average resolution time (in days)
      Complaint.aggregate([
        {
          $match: {
            status: { $in: ['resolved', 'closed'] },
            'resolution.resolvedAt': { $exists: true },
          },
        },
        {
          $project: {
            resolutionDays: {
              $divide: [
                { $subtract: ['$resolution.resolvedAt', '$createdAt'] },
                1000 * 60 * 60 * 24,
              ],
            },
          },
        },
        {
          $group: {
            _id: null,
            avgDays: { $avg: '$resolutionDays' },
            minDays: { $min: '$resolutionDays' },
            maxDays: { $max: '$resolutionDays' },
          },
        },
      ]),
      // PoSH compliance stats (committees with proper constitution)
      Committee.aggregate([
        {
          $group: {
            _id: '$type',
            total: { $sum: 1 },
            compliant: {
              $sum: {
                $cond: [
                  { $and: ['$ppioshCompliance.hasExternalMember', '$ppioshCompliance.hasWomenMajority'] },
                  1, 0,
                ],
              },
            },
            expired: {
              $sum: {
                $cond: [{ $lt: ['$ppioshCompliance.validUntil', now] }, 1, 0],
              },
            },
          },
        },
      ]),
    ]);

    return NextResponse.json({
      period,
      startDate: startDate.toISOString(),
      endDate: now.toISOString(),
      reports: {
        complaintsByType,
        complaintsByStatus,
        complaintsByPriority,
        resolutionStats,
        monthlyTrend,
        topPartners,
        counselingStats,
        userStats,
        avgResolutionTime: avgResolutionTime[0] || { avgDays: 0, minDays: 0, maxDays: 0 },
        complianceStats,
      },
    });
  } catch (error) {
    console.error('Error generating reports:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
