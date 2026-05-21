import { NextRequest } from 'next/server';
import { verifyToken, TokenPayload } from './jwt';
import connectDB from '@/lib/db/mongodb';
import User from '@/lib/db/models/User';

export async function getSession(request: NextRequest): Promise<TokenPayload | null> {
  const token = request.cookies.get('sahasetu-token')?.value;
  if (!token) return null;
  return verifyToken(token);
}

export async function getAuthenticatedUser(request: NextRequest) {
  const session = await getSession(request);
  if (!session) return null;

  await connectDB();
  const user = await User.findById(session.userId).select('-passwordHash');
  if (!user) return null;

  return user;
}

export async function requireAuth(request: NextRequest) {
  const session = await getSession(request);
  if (!session) {
    return { error: 'Authentication required', status: 401 };
  }
  return { session, error: null, status: 200 };
}

export async function requireRole(request: NextRequest, roles: string[]) {
  const session = await getSession(request);
  if (!session) {
    return { error: 'Authentication required', status: 401 };
  }
  if (!roles.includes(session.role)) {
    return { error: 'Insufficient permissions', status: 403 };
  }
  return { session, error: null, status: 200 };
}

export async function createAuditLog(
  userId: string | undefined,
  action: string,
  entityType: string,
  description: string,
  metadata?: Record<string, unknown>,
  request?: NextRequest
) {
  try {
    await connectDB();
    const AuditLog = (await import('@/lib/db/models/AuditLog')).default;

    let userEmail: string | undefined;
    let userRole: string | undefined;

    if (userId) {
      const user = await User.findById(userId).select('email role');
      if (user) {
        userEmail = user.email;
        userRole = user.role;
      }
    }

    await AuditLog.create({
      userId,
      userEmail,
      userRole,
      action,
      entityType,
      description,
      metadata,
      ipAddress: (request?.headers.get('x-forwarded-for') ?? request?.headers.get('x-real-ip')) ?? undefined,
      userAgent: request?.headers.get('user-agent') ?? undefined,
    });
  } catch (error) {
    console.error('Failed to create audit log:', error);
  }
}
