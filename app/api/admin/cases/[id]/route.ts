import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import { Complaint, Notification, Evidence } from '@/lib/db/models';
import { requireRole, createAuditLog } from '@/lib/auth/session';

const STATUS_LABELS: Record<string, string> = {
  submitted: 'Submitted',
  under_review: 'Under Review',
  investigation: 'Under Investigation',
  hearing_scheduled: 'Hearing Scheduled',
  hearing_in_progress: 'Hearing In Progress',
  resolution_pending: 'Resolution Pending',
  resolved: 'Resolved',
  closed: 'Closed',
  appealed: 'Appealed',
  escalated: 'Escalated',
};

// GET /api/admin/cases/[id] - Get single case details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireRole(request, ['admin', 'committee_member']);
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    await connectDB();
    const { id } = await params;
    const complaint = await Complaint.findById(id)
      .populate('userId', 'name email anonymousId')
      .populate('assignedCommittee', 'name type')
      .populate('assignedPartner', 'name city')
      .lean();

    if (!complaint) {
      return NextResponse.json({ error: 'Case not found' }, { status: 404 });
    }

    const evidenceFiles = await Evidence.find({ complaintId: id })
      .select('-encryptedPath -encryptionIV -encryptionTag -encryptedFileKey')
      .lean();

    return NextResponse.json({ case: complaint, evidenceFiles });
  } catch (error) {
    console.error('Error fetching case:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH /api/admin/cases/[id] - Update case status / priority / notes
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireRole(request, ['admin', 'committee_member']);
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    await connectDB();
    const { id } = await params;

    const body = await request.json();
    const { status, priority, note, nextHearingDate } = body;

    const complaint = await Complaint.findById(id);
    if (!complaint) {
      return NextResponse.json({ error: 'Case not found' }, { status: 404 });
    }

    const previousStatus = complaint.status;
    const updates: Record<string, unknown> = {};

    if (status && status !== previousStatus) {
      updates.status = status;

      // Add a timeline entry
      complaint.timeline.push({
        status,
        description: note || `Status updated to ${STATUS_LABELS[status] || status}`,
        updatedBy: auth.session!.userId,
        updatedByRole: auth.session!.role,
        createdAt: new Date(),
      });

      // Set submission timestamps when moving to submitted
      if (status === 'submitted' && !complaint.submittedAt) {
        complaint.submittedAt = new Date();
        const deadline = new Date();
        deadline.setDate(deadline.getDate() + 90);
        complaint.resolutionDeadline = deadline;
      }
    }

    if (priority) complaint.priority = priority;
    if (nextHearingDate) complaint.nextHearingDate = new Date(nextHearingDate);

    // Apply status last so pre('save') deadline logic can run
    if (updates.status) complaint.status = updates.status as typeof complaint.status;

    await complaint.save();

    // --- Notify the user who submitted the complaint ---
    if (status && status !== previousStatus) {
      await Notification.create({
        userId: complaint.userId,
        type: 'status_update',
        title: `Case ${complaint.caseId} Updated`,
        message: `Your case status has been updated to "${STATUS_LABELS[status] || status}".${note ? ` Note from reviewer: ${note}` : ''}`,
        relatedCaseId: complaint.caseId,
        relatedComplaintId: complaint._id,
      });
    }

    // Audit log
    await createAuditLog(
      auth.session!.userId,
      'UPDATE_CASE_STATUS',
      'complaint',
      complaint._id.toString(),
      {
        previousStatus,
        newStatus: status,
        priority,
        note,
      }
    );

    return NextResponse.json({ success: true, case: complaint });
  } catch (error) {
    console.error('Error updating case:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
