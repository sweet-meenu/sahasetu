import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import User from '@/lib/db/models/User';
import { getSession } from '@/lib/auth/session';

export async function GET(request: NextRequest) {
  try {
    const session = await getSession(request);
    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    await connectDB();
    const user = await User.findById(session.userId).select('-passwordHash');
    if (!user) {
      const response = NextResponse.json({ error: 'User not found' }, { status: 401 });
      response.cookies.set('sahasetu-token', '', { maxAge: 0, path: '/' });
      return response;
    }



    return NextResponse.json({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        organization: user.organization,
        isVerified: user.isVerified,
        anonymousId: user.anonymousId,
        avatar: user.avatar,
        languages: user.languages || ['en'],
        createdAt: user.createdAt,
      },
    });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getSession(request);
    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    await connectDB();
    const user = await User.findById(session.userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { name, phone, language } = await request.json();

    if (name !== undefined) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (language !== undefined) {
      user.languages = [language];
    }

    await user.save();

    return NextResponse.json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        languages: user.languages,
      }
    });
  } catch (error) {
    console.error('PATCH /api/auth/me error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
