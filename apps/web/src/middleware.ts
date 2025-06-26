import { NextRequest, NextResponse } from 'next/server';

/**
 * Middleware for protected routes
 * Note: Since we use localStorage for tokens (not cookies),
 * we'll handle authentication on the client side instead
 */
export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // For now, allow access to exercises page
  // Authentication will be handled by the page component itself
  // This avoids issues with localStorage not being available in middleware

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Currently not blocking any routes in middleware
    // Authentication is handled client-side in page components
  ],
};
