import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import { User } from '@/lib/db/models';
import { requireRole, createAuditLog } from '@/lib/auth/session';

// DELETE /api/admin/users/[id] - Delete a user
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireRole(request, ['admin']);
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const { id } = await params;
    await connectDB();

    const user = await User.findById(id);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Do not allow deleting self
    if (user._id.toString() === auth.session!.userId) {
      return NextResponse.json({ error: 'Cannot delete your own admin account' }, { status: 400 });
    }

    await User.deleteOne({ _id: id });

    await createAuditLog(
      auth.session!.userId,
      'admin.user_deleted',
      'user',
      `Admin deleted user: ${user.name} (${user.email})`,
      { deletedUserId: id },
      request
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH /api/admin/users/[id] - Update user status, verification, role, name, phone
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

    const user = await User.findById(id);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Update allowable fields
    if (body.name !== undefined) user.name = body.name;
    if (body.phone !== undefined) user.phone = body.phone;
    if (body.role !== undefined) user.role = body.role;
    if (body.isActive !== undefined) user.isActive = body.isActive;
    if (body.isVerified !== undefined) user.isVerified = body.isVerified;

    await user.save();

    await createAuditLog(
      auth.session!.userId,
      'admin.user_updated',
      'user',
      `Admin updated user: ${user.name} (${user.email})`,
      { updatedUserId: id, updates: body },
      request
    );

    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
