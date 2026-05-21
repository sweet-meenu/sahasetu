import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import User from '@/lib/db/models/User';
import { requireAuth } from '@/lib/auth/session';

// GET /api/counseling/counselors - List available counselors
export async function GET(request: NextRequest) {
  const auth = await requireAuth(request);
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    await connectDB();

    const counselors = await User.find({
      role: { $in: ['counselor', 'partner'] },
      isActive: true,
    })
      .select('_id name email organization role specialization languages rating experience avatar')
      .lean();

    return NextResponse.json({ counselors });
  } catch (error) {
    console.error('Error fetching counselors:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
