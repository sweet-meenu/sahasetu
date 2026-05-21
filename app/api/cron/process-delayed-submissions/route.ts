import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import { Complaint, Notification } from '@/lib/db/models';

export async function GET(request: NextRequest) {
  try {
    // Optional secret key check to prevent unauthorized public execution
    const { searchParams } = new URL(request.url);
    const cronSecret = searchParams.get('secret');
    const expectedSecret = process.env.CRON_SECRET || 'sahasetu_cron_secret_2026';
    
    if (cronSecret && cronSecret !== expectedSecret) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const now = new Date();
    
    // Find all complaints with draft status, delayedSubmission true, and scheduledSubmitDate <= now
    const pendingComplaints = await Complaint.find({
      status: 'draft',
      delayedSubmission: true,
      scheduledSubmitDate: { $lte: now }
    });

    const processedIds: string[] = [];

    for (const complaint of pendingComplaints) {
      const c = complaint as any;
      c.status = 'submitted';
      c.submittedAt = now;
      
      const deadline = new Date();
      deadline.setDate(deadline.getDate() + 90);
      c.resolutionDeadline = deadline;

      // Add a timeline entry for this automated action
      c.timeline.push({
        status: 'submitted',
        description: 'Complaint automatically submitted from Secure Digital Locker via scheduled Delayed Submission.',
        updatedBy: 'system',
        updatedByRole: 'system',
        createdAt: now,
      });

      await c.save();

      // Send a notification to the victim
      await Notification.create({
        userId: c.userId,
        type: 'status_update',
        title: `Scheduled Complaint Submitted: ${c.caseId}`,
        message: `Your draft complaint ${c.caseId} has been successfully and securely submitted from your Digital Locker as scheduled.`,
        relatedCaseId: c.caseId,
        relatedComplaintId: c._id,
      });

      processedIds.push(c.caseId || c._id);
    }

    return NextResponse.json({
      success: true,
      timestamp: now.toISOString(),
      processedCount: pendingComplaints.length,
      processedCases: processedIds
    });
  } catch (error: any) {
    console.error('Error processing delayed submissions cron:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
