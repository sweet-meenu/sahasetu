import { NextRequest, NextResponse } from 'next/server';
import { unlink } from 'fs/promises';
import connectDB from '@/lib/db/mongodb';
import { Evidence } from '@/lib/db/models';
import { requireAuth, createAuditLog } from '@/lib/auth/session';

// DELETE /api/evidence/[id] - Soft delete file and remove from disk
export async function DELETE(
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

    const evidence = await Evidence.findOne({ _id: id, isDeleted: false });

    if (!evidence) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    // Only owner can delete
    if (evidence.userId.toString() !== auth.session!.userId) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Delete file from disk
    try {
      await unlink(evidence.encryptedPath);
    } catch (e) {
      console.warn("Failed to delete encrypted file on disk:", e);
    }

    evidence.isDeleted = true;
    evidence.deletedAt = new Date();
    await evidence.save();

    await createAuditLog(
      auth.session!.userId,
      'evidence.delete',
      'evidence',
      `Evidence file deleted: ${evidence.originalName}`,
      { fileId: evidence._id.toString() },
      request
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting evidence:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH /api/evidence/[id] - Handle sharing and revoking access
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
    const { action, recipient } = await request.json();
    await connectDB();

    const evidence = await Evidence.findOne({ _id: id, isDeleted: false });

    if (!evidence) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    // Only owner can share/revoke
    if (evidence.userId.toString() !== auth.session!.userId) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    if (action === 'share') {
      if (!evidence.sharedWith.includes(recipient)) {
        evidence.sharedWith.push(recipient);
        evidence.accessLog.push({
          userId: auth.session!.userId,
          action: 'share',
          timestamp: new Date(),
          ipAddress: request.headers.get('x-forwarded-for') || undefined,
        });
      }
    } else if (action === 'revoke') {
      evidence.sharedWith = evidence.sharedWith.filter((r: string) => r !== recipient);
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    await evidence.save();

    await createAuditLog(
      auth.session!.userId,
      `evidence.${action}`,
      'evidence',
      `Evidence file ${action}d: ${evidence.originalName} with/from ${recipient}`,
      { fileId: evidence._id.toString(), recipient },
      request
    );

    return NextResponse.json({ success: true, sharedWith: evidence.sharedWith });
  } catch (error) {
    console.error('Error sharing evidence:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
