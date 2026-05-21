import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import connectDB from '@/lib/db/mongodb';
import { Evidence } from '@/lib/db/models';
import { requireAuth, createAuditLog } from '@/lib/auth/session';
import { decryptFileFromStorage } from '@/lib/encryption';

// GET /api/evidence/[id]/download - Download and decrypt evidence file
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

    const evidence = await Evidence.findOne({
      _id: id,
      isDeleted: false,
    });

    if (!evidence) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    // Check access: owner or shared or admin
    const isOwner = evidence.userId.toString() === auth.session!.userId;
    const isShared = evidence.sharedWith.some(
      (uid) => uid.toString() === auth.session!.userId
    );
    const isAdmin = ['admin', 'committee_member'].includes(auth.session!.role);

    if (!isOwner && !isShared && !isAdmin) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Read encrypted file
    const encryptedData = await readFile(evidence.encryptedPath);

    // Decrypt the file
    const decryptedData = decryptFileFromStorage(
      encryptedData,
      evidence.encryptionIV,
      evidence.encryptionTag,
      evidence.encryptedFileKey
    );

    // Log access
    evidence.accessLog.push({
      userId: auth.session!.userId,
      action: 'download',
      timestamp: new Date(),
      ipAddress: request.headers.get('x-forwarded-for') || undefined,
    });
    await evidence.save();

    await createAuditLog(
      auth.session!.userId,
      'evidence.download',
      'evidence',
      `Evidence file downloaded: ${evidence.originalName}`,
      { fileId: evidence._id.toString() },
      request
    );

    // Return decrypted file
    return new NextResponse(new Uint8Array(decryptedData), {
      headers: {
        'Content-Type': evidence.mimeType,
        'Content-Disposition': `attachment; filename="${evidence.originalName}"`,
        'Content-Length': decryptedData.length.toString(),
      },
    });
  } catch (error) {
    console.error('Error downloading evidence:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
