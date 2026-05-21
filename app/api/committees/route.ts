import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import { Committee } from '@/lib/db/models';

// GET /api/committees - List committees
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const state = searchParams.get('state');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const filter: Record<string, unknown> = { isActive: true };
    if (type) filter.type = type;
    if (state) filter.state = { $regex: state, $options: 'i' };
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { organizationName: { $regex: search, $options: 'i' } },
      ];
    }

    const [committees, total] = await Promise.all([
      Committee.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate('partnerOrganizations', 'name city')
        .lean(),
      Committee.countDocuments(filter),
    ]);

    return NextResponse.json({
      committees,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error('Error fetching committees:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/committees - Create committee
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    await connectDB();

    const committee = await Committee.create(body);
    return NextResponse.json({ success: true, committee }, { status: 201 });
  } catch (error) {
    console.error('Error creating committee:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
