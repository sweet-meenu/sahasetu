import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import { User } from '@/lib/db/models';
import { requireRole, createAuditLog } from '@/lib/auth/session';
import { hashPassword } from '@/lib/auth/password';
import { v4 as uuidv4 } from 'uuid';

// GET /api/admin/users - List all users (admin/committee only)
export async function GET(request: NextRequest) {
  const auth = await requireRole(request, ['admin', 'committee_member']);
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '100'); // Fetch enough for general list

    const filter: Record<string, unknown> = {};
    if (role && role !== 'all') filter.role = role;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { organization: { $regex: search, $options: 'i' } },
      ];
    }

    const [users, total] = await Promise.all([
      User.find(filter)
        .select('-passwordHash')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      User.countDocuments(filter),
    ]);

    return NextResponse.json({
      users,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/admin/users - Create new user (admin only)
export async function POST(request: NextRequest) {
  const auth = await requireRole(request, ['admin']);
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const { name, email, phone, role, password, organization } = await request.json();

    if (!name || !email || !role) {
      return NextResponse.json({ error: 'Missing name, email, or role' }, { status: 400 });
    }

    await connectDB();

    // Check if email already exists
    const existing = await User.findOne({ email });
    if (existing) {
      return NextResponse.json({ error: 'A user with this email already exists' }, { status: 400 });
    }

    const finalPassword = password || 'SaahasSetu@2026';
    const passwordHash = await hashPassword(finalPassword);

    const newUser = await User.create({
      name,
      email,
      phone: phone || undefined,
      passwordHash,
      role,
      organization: organization || undefined,
      isVerified: true,
      isActive: true,
      anonymousId: uuidv4(),
      twoFactorEnabled: false,
      loginAttempts: 0,
    });

    await createAuditLog(
      auth.session!.userId,
      'admin.user_created',
      'user',
      `Admin created user: ${name} (${email}) with role ${role}`,
      { createdUserId: newUser._id.toString(), role },
      request
    );

    return NextResponse.json({
      success: true,
      user: {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        role: newUser.role,
        isVerified: newUser.isVerified,
        isActive: newUser.isActive,
        createdAt: newUser.createdAt,
      }
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
