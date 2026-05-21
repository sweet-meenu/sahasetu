import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import { Complaint } from '@/lib/db/models';
import { requireRole } from '@/lib/auth/session';

// GET /api/admin/cases - List all cases (admin only)
export async function GET(request: NextRequest) {
  const auth = await requireRole(request, ['admin', 'committee_member']);
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const filter: Record<string, unknown> = { status: { $ne: 'draft' } };
    if (status && status !== 'all') filter.status = status;
    if (priority && priority !== 'all') filter.priority = priority;
    if (search) {
      filter.$or = [
        { caseId: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { incidentType: { $regex: search, $options: 'i' } },
      ];
    }

    const [cases, total] = await Promise.all([
      Complaint.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate('assignedCommittee', 'name type')
        .populate('assignedPartner', 'name city')
        .populate('userId', 'name anonymousId')
        .lean(),
      Complaint.countDocuments(filter),
    ]);

    return NextResponse.json({
      cases,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error('Error fetching admin cases:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
