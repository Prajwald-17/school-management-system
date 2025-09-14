import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyJWTTokenEdge } from '@/lib/jwt';

// Protected routes that require authentication
const protectedRoutes = ['/add-school'];

// Public routes that don't require authentication  
const publicRoutes = ['/', '/show-schools', '/auth/login'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Check if current path is protected
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route)
  );
  
  // If it's not a protected route, allow access
  if (!isProtectedRoute) {
    return NextResponse.next();
  }
  
  // Get session token from cookies
  const sessionToken = request.cookies.get('session')?.value;
  
  // If no session token, redirect to login
  if (!sessionToken) {
    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }
  
  // Verify the session token
  const payload = verifyJWTTokenEdge(sessionToken);
  if (!payload) {
    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    const response = NextResponse.redirect(loginUrl);
    response.cookies.delete('session');
    return response;
  }
  
  // Allow access to protected route
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match all request paths except static files and APIs
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
