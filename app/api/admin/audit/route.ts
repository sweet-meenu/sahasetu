import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import { AuditLog } from '@/lib/db/models';
import { requireRole } from '@/lib/auth/session';

// GET /api/admin/audit - List audit logs (admin only)
export async function GET(request: NextRequest) {
  const auth = await requireRole(request, ['admin', 'committee_member']);
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const severity = searchParams.get('severity');
    const entityType = searchParams.get('entityType');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');

    const filter: Record<string, unknown> = {};
    if (action) filter.action = action;
    if (severity) filter.severity = severity;
    if (entityType) filter.entityType = entityType;
    if (startDate || endDate) {
      filter.createdAt = {} as Record<string, Date>;
      if (startDate) (filter.createdAt as Record<string, Date>).$gte = new Date(startDate);
      if (endDate) (filter.createdAt as Record<string, Date>).$lte = new Date(endDate);
    }

    const [logs, total] = await Promise.all([
      AuditLog.find(filter)
        .populate('userId', 'name email role')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      AuditLog.countDocuments(filter),
    ]);

    return NextResponse.json({
      logs,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
