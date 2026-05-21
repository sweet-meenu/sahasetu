import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Resource from '@/lib/db/models/Resource';
import { getSession, requireRole, createAuditLog } from '@/lib/auth/session';
import { unlink } from 'fs/promises';

// GET /api/resources/[id] - Get single resource details (increments view count)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectDB();

    const resource = await Resource.findById(id).lean();
    if (!resource) {
      return NextResponse.json({ error: 'Resource not found' }, { status: 404 });
    }

    const session = await getSession(request);

    // If not published+public, only the owning Partner or admin can see it
    if (resource.status !== 'published' || resource.visibility !== 'public') {
      if (!session || (session.role !== 'admin' && session.userId !== resource.partnerId.toString())) {
        return NextResponse.json({ error: 'Resource not found' }, { status: 404 });
      }
    }

    // Increment view count
    await Resource.findByIdAndUpdate(id, { $inc: { viewCount: 1 } });

    return NextResponse.json({ resource });
  } catch (error) {
    console.error('GET /api/resources/[id] error:', error);
    return NextResponse.json({ error: 'Failed to fetch resource' }, { status: 500 });
  }
}

// PATCH /api/resources/[id] - Update resource (Partner can update own, admin can update any)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const auth = await requireRole(request, ['partner', 'admin']);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    await connectDB();

    const resource = await Resource.findById(id);
    if (!resource) {
      return NextResponse.json({ error: 'Resource not found' }, { status: 404 });
    }

    // Partners can only update their own resources
    if (auth.session!.role === 'partner' && resource.partnerId.toString() !== auth.session!.userId) {
      return NextResponse.json({ error: 'You can only edit your own resources' }, { status: 403 });
    }

    const body = await request.json();
    const allowedFields = ['title', 'description', 'category', 'tags', 'visibility', 'status'];
    const updates: Record<string, unknown> = {};

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updates[field] = body[field];
      }
    }

    const updated = await Resource.findByIdAndUpdate(id, { $set: updates }, { new: true });

    await createAuditLog(
      auth.session!.userId,
      'resource_update',
      'resource',
      `Updated resource: ${resource.title}`,
      { resourceId: id, updates: Object.keys(updates) },
      request
    );

    return NextResponse.json({ resource: updated });
  } catch (error) {
    console.error('PATCH /api/resources/[id] error:', error);
    return NextResponse.json({ error: 'Failed to update resource' }, { status: 500 });
  }
}

// DELETE /api/resources/[id] - Delete resource
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const auth = await requireRole(request, ['partner', 'admin']);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    await connectDB();

    const resource = await Resource.findById(id);
    if (!resource) {
      return NextResponse.json({ error: 'Resource not found' }, { status: 404 });
    }

    // Partners can only delete their own
    if (auth.session!.role === 'partner' && resource.partnerId.toString() !== auth.session!.userId) {
      return NextResponse.json({ error: 'You can only delete your own resources' }, { status: 403 });
    }

    // Delete the file from disk
    try {
      await unlink(resource.filePath);
    } catch {
      console.warn('Could not delete resource file:', resource.filePath);
    }

    await Resource.findByIdAndDelete(id);

    await createAuditLog(
      auth.session!.userId,
      'resource_delete',
      'resource',
      `Deleted resource: ${resource.title}`,
      { resourceId: id },
      request
    );

    return NextResponse.json({ message: 'Resource deleted' });
  } catch (error) {
    console.error('DELETE /api/resources/[id] error:', error);
    return NextResponse.json({ error: 'Failed to delete resource' }, { status: 500 });
  }
}
