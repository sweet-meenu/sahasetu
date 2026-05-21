import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import { Complaint } from '@/lib/db/models';
import { requireAuth, createAuditLog } from '@/lib/auth/session';

// GET /api/complaints/[id] - Get complaint details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth(request);
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const { id } = await params;
    await connectDB();

    const complaint = await Complaint.findOne({
      $or: [{ _id: id }, { caseId: id }],
    })
      .populate('assignedCommittee', 'name type members email')
      .populate('assignedPartner', 'name city phone email')
      .populate('assignedMembers', 'name email role')
      .populate('timeline.updatedBy', 'name role');

    if (!complaint) {
      return NextResponse.json({ error: 'Complaint not found' }, { status: 404 });
    }

    // Users can only view their own complaints, admins can view all
    const isOwner = complaint.userId.toString() === auth.session!.userId;
    const isAdmin = ['admin', 'committee_member'].includes(auth.session!.role);
    const isAssigned = complaint.assignedMembers.some(
      (m: { _id: { toString: () => string } }) => m._id.toString() === auth.session!.userId
    );

    if (!isOwner && !isAdmin && !isAssigned) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    return NextResponse.json({ complaint });
  } catch (error) {
    console.error('Error fetching complaint:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH /api/complaints/[id] - Update complaint
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth(request);
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const { id } = await params;
    const body = await request.json();
    await connectDB();

    const complaint = await Complaint.findOne({
      $or: [{ _id: id }, { caseId: id }],
    });

    if (!complaint) {
      return NextResponse.json({ error: 'Complaint not found' }, { status: 404 });
    }

    const isOwner = complaint.userId.toString() === auth.session!.userId;
    const isAdmin = ['admin', 'committee_member'].includes(auth.session!.role);

    // Users can only update drafts, admins can update any
    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    if (isOwner && !isAdmin && complaint.status !== 'draft') {
      return NextResponse.json(
        { error: 'Can only edit draft complaints' },
        { status: 400 }
      );
    }

    // Update fields
    const allowedUserFields = [
      'incidentDate', 'incidentTime', 'location', 'incidentType',
      'description', 'perpetratorInfo', 'witnesses', 'previousIncidents',
      'isAnonymous', 'isEncrypted',
    ];

    const allowedAdminFields = [
      ...allowedUserFields,
      'status', 'priority', 'assignedCommittee', 'assignedPartner',
      'assignedMembers', 'nextHearingDate', 'resolution', 'resolutionDate',
    ];

    const allowedFields = isAdmin ? allowedAdminFields : allowedUserFields;

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        (complaint as unknown as Record<string, unknown>)[field] = body[field];
      }
    }

    // Handle status change with timeline entry
    if (body.status && body.status !== complaint.status) {
      complaint.timeline.push({
        status: body.status,
        description: body.statusNote || `Status changed to ${body.status.replace(/_/g, ' ')}`,
        updatedBy: auth.session!.userId,
        updatedByRole: auth.session!.role,
        createdAt: new Date(),
      });
    }

    // Handle submit from draft
    if (body.status === 'submitted' && complaint.status === 'draft') {
      complaint.submittedAt = new Date();
      const deadline = new Date();
      deadline.setDate(deadline.getDate() + 90);
      complaint.resolutionDeadline = deadline;
    }

    await complaint.save();

    await createAuditLog(
      auth.session!.userId,
      'complaint.update',
      'complaint',
      `Complaint ${complaint.caseId} updated`,
      { caseId: complaint.caseId, changes: Object.keys(body) },
      request
    );

    return NextResponse.json({ success: true, complaint });
  } catch (error) {
    console.error('Error updating complaint:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
