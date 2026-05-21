import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import { Committee } from '@/lib/db/models';
import { requireRole, createAuditLog } from '@/lib/auth/session';

// DELETE /api/committees/[id] - Delete a committee
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireRole(request, ['admin']);
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const { id } = await params;
    await connectDB();

    const committee = await Committee.findById(id);
    if (!committee) {
      return NextResponse.json({ error: 'Committee not found' }, { status: 404 });
    }

    await Committee.deleteOne({ _id: id });

    await createAuditLog(
      auth.session!.userId,
      'admin.committee_deleted',
      'committee',
      `Admin deleted committee: ${committee.name}`,
      { deletedCommitteeId: id },
      request
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting committee:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH /api/committees/[id] - Update committee details
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireRole(request, ['admin']);
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const { id } = await params;
    const body = await request.json();
    await connectDB();

    const committee = await Committee.findById(id);
    if (!committee) {
      return NextResponse.json({ error: 'Committee not found' }, { status: 404 });
    }

    // Merge changes
    if (body.name !== undefined) committee.name = body.name;
    if (body.type !== undefined) committee.type = body.type;
    if (body.organizationName !== undefined) committee.organizationName = body.organizationName;
    if (body.email !== undefined) committee.email = body.email;
    if (body.phone !== undefined) committee.phone = body.phone;
    if (body.isActive !== undefined) committee.isActive = body.isActive;

    await (committee as any).save();

    await createAuditLog(
      auth.session!.userId,
      'admin.committee_updated',
      'committee',
      `Admin updated committee: ${committee.name}`,
      { updatedCommitteeId: id, updates: body },
      request
    );

    return NextResponse.json({ success: true, committee });
  } catch (error) {
    console.error('Error updating committee:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
