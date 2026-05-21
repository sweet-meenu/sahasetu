import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Resource from '@/lib/db/models/Resource';
import { getSession } from '@/lib/auth/session';
import { readFile } from 'fs/promises';

// GET /api/resources/[id]/download - Download resource file
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectDB();

    const resource = await Resource.findById(id);
    if (!resource) {
      return NextResponse.json({ error: 'Resource not found' }, { status: 404 });
    }

    const session = await getSession(request);

    // If not published+public, only owning Partner or admin can download
    if (resource.status !== 'published' || resource.visibility !== 'public') {
      if (!session || (session.role !== 'admin' && session.userId !== resource.partnerId.toString())) {
        return NextResponse.json({ error: 'Resource not found' }, { status: 404 });
      }
    }

    // Increment download count
    await Resource.findByIdAndUpdate(id, { $inc: { downloadCount: 1 } });

    // Read file and return
    const fileBuffer = await readFile(resource.filePath);

    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': resource.mimeType || 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${encodeURIComponent(resource.fileName)}"`,
        'Content-Length': resource.fileSize.toString(),
      },
    });
  } catch (error) {
    console.error('GET /api/resources/[id]/download error:', error);
    return NextResponse.json({ error: 'Failed to download resource' }, { status: 500 });
  }
}
