import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import { Complaint } from '@/lib/db/models';
import { requireRole } from '@/lib/auth/session';

export async function GET(request: NextRequest) {
  try {
    const auth = await requireRole(request, ['admin']);
    if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

    await connectDB();

    const complaints = await Complaint.find().sort({ createdAt: -1 }).lean();

    // Generate CSV string
    const headers = ['Case ID', 'Date Created', 'Incident Type', 'Status', 'Priority', 'Assigned Partner'];
    const rows = complaints.map((doc: any) => {
      const c = doc;
      return [
        c.caseId,
        new Date(c.createdAt || Date.now()).toLocaleDateString(),
        c.incident?.type || c.incidentType || 'Unknown',
        c.status,
        c.priority || 'medium',
        c.assignment?.partnerId || 'Unassigned'
      ];
    });

    const csvContent = [headers, ...rows]
      .map((row: any) => row.map((cell: any) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="sahasetu-cases-${new Date().toISOString().split('T')[0]}.csv"`
      }
    });
  } catch (error) {
    console.error('Error exporting cases:', error);
    return NextResponse.json({ error: 'Failed to generate export' }, { status: 500 });
  }
}
