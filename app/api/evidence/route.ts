import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import { Evidence } from '@/lib/db/models';
import { requireAuth } from '@/lib/auth/session';

// GET /api/evidence - List user's evidence files
export async function GET(request: NextRequest) {
  const auth = await requireAuth(request);
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const complaintId = searchParams.get('complaintId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const filter: Record<string, unknown> = {
      userId: auth.session!.userId,
      isDeleted: false,
    };

    if (category && category !== 'all') {
      filter.category = category;
    }
    if (complaintId) {
      filter.complaintId = complaintId;
    }

    const [files, total] = await Promise.all([
      Evidence.find(filter)
        .select('-encryptedPath -encryptionIV -encryptionTag -encryptedFileKey')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Evidence.countDocuments(filter),
    ]);

    return NextResponse.json({
      files,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error('Error fetching evidence:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
