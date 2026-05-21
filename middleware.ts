import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { routing } from './i18n/routing';

const intlMiddleware = createMiddleware(routing);

// Routes that require authentication
const protectedPatterns = ['/dashboard', '/admin', '/partner'];
// Routes that require specific roles
const rolePatterns: Record<string, string[]> = {
  '/admin': ['admin'],
  '/partner': ['partner', 'counselor'],
  '/dashboard': ['user', 'admin', 'partner', 'counselor', 'committee_member'],
};

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Strip locale prefix for pattern matching
  const localePattern = /^\/(en|hi|mr|ta|te|bn)(\/|$)/;
  const strippedPath = pathname.replace(localePattern, '/');

  // Check if route is protected
  const isProtected = protectedPatterns.some((p) => strippedPath.startsWith(p));

  if (isProtected) {
    const token = request.cookies.get('sahasetu-token')?.value;

    if (!token) {
      // Redirect to login
      const locale = pathname.match(localePattern)?.[1] || 'en';
      const loginUrl = new URL(`/${locale}/login`, request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Verify token - lightweight check (full verification happens in API routes)
    try {
      // Decode JWT payload without full verification (middleware runs on edge)
      const payload = JSON.parse(
        Buffer.from(token.split('.')[1], 'base64url').toString()
      );

      // Check role-based access
      const requiredRoles = Object.entries(rolePatterns).find(([pattern]) =>
        strippedPath.startsWith(pattern)
      );

      if (requiredRoles && !requiredRoles[1].includes(payload.role)) {
        // Redirect to appropriate dashboard based on role
        const locale = pathname.match(localePattern)?.[1] || 'en';
        let redirectPath = '/dashboard';
        if (payload.role === 'admin') redirectPath = '/admin';
        else if (payload.role === 'partner' || payload.role === 'counselor') redirectPath = '/partner';
        return NextResponse.redirect(new URL(`/${locale}${redirectPath}`, request.url));
      }

      // Check token expiration
      if (payload.exp && payload.exp * 1000 < Date.now()) {
        const locale = pathname.match(localePattern)?.[1] || 'en';
        const loginUrl = new URL(`/${locale}/login`, request.url);
        loginUrl.searchParams.set('callbackUrl', pathname);
        const response = NextResponse.redirect(loginUrl);
        response.cookies.delete('sahasetu-token');
        return response;
      }
    } catch {
      // Invalid token - redirect to login
      const locale = pathname.match(localePattern)?.[1] || 'en';
      const loginUrl = new URL(`/${locale}/login`, request.url);
      const response = NextResponse.redirect(loginUrl);
      response.cookies.delete('sahasetu-token');
      return response;
    }
  }

  // Run the i18n middleware for locale handling
  return intlMiddleware(request);
}

export const config = {
  // Match all pathnames except for
  // - … if they start with `/api`, `/_next` or `/_vercel`
  // - … the ones containing a dot (e.g. `favicon.ico`)
  matcher: ['/', '/(hi|en|mr|ta|te|bn)/:path*', '/((?!api|_next|_vercel|.*\\..*).*)']
};
