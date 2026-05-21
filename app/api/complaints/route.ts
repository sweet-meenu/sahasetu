import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import { Complaint } from '@/lib/db/models';
import { requireAuth, createAuditLog } from '@/lib/auth/session';

// GET /api/complaints - List user's complaints
export async function GET(request: NextRequest) {
  const auth = await requireAuth(request);
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const filter: Record<string, unknown> = { userId: auth.session!.userId };
    if (status && status !== 'all') {
      filter.status = status;
    }

    const [complaints, total] = await Promise.all([
      Complaint.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate('assignedCommittee', 'name type')
        .populate('assignedPartner', 'name city')
        .lean(),
      Complaint.countDocuments(filter),
    ]);

    return NextResponse.json({
      complaints,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching complaints:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/complaints - Create new complaint
export async function POST(request: NextRequest) {
  const auth = await requireAuth(request);
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const body = await request.json();
    const {
      incidentDate,
      incidentTime,
      location,
      incidentType,
      description,
      perpetratorInfo,
      witnesses,
      previousIncidents,
      isAnonymous,
      isEncrypted,
      delayedSubmission,
      scheduledSubmitDate,
      status: requestedStatus,
    } = body;

    if (!incidentDate || !incidentType || !description) {
      return NextResponse.json(
        { error: 'Incident date, type, and description are required' },
        { status: 400 }
      );
    }

    await connectDB();

    const complaintStatus = requestedStatus === 'draft' ? 'draft' : 'submitted';

    const complaint = await Complaint.create({
      userId: auth.session!.userId,
      isAnonymous: isAnonymous || false,
      incidentDate: new Date(incidentDate),
      incidentTime,
      location,
      incidentType,
      description,
      perpetratorInfo,
      witnesses,
      previousIncidents,
      status: complaintStatus,
      isEncrypted: isEncrypted !== false,
      delayedSubmission: delayedSubmission || false,
      scheduledSubmitDate: scheduledSubmitDate ? new Date(scheduledSubmitDate) : undefined,
      timeline: [
        {
          status: complaintStatus,
          description:
            complaintStatus === 'draft'
              ? 'Complaint drafted'
              : 'Complaint submitted successfully',
          updatedBy: auth.session!.userId,
          updatedByRole: auth.session!.role,
        },
      ],
    });

    await createAuditLog(
      auth.session!.userId,
      'complaint.create',
      'complaint',
      `New complaint ${complaint.caseId} created (${complaintStatus})`,
      { caseId: complaint.caseId, incidentType, isAnonymous },
      request
    );

    return NextResponse.json({ success: true, complaint }, { status: 201 });
  } catch (error) {
    console.error('Error creating complaint:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
