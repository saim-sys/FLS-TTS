import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Get the pathname of the request
  const path = request.nextUrl.pathname

  // Define public paths that don't require authentication
  const isPublicPath = path === '/' || 
                      path === '/api/auth/login' || 
                      path === '/api/auth/register' ||
                      path === '/api/test' ||
                      path === '/api/test-db' ||
                      path === '/api/test-users' ||
                      path === '/api/test-login' ||
                      path === '/api/setup' ||
                      path === '/api/setup-db'

  // If the path is public, allow access
  if (isPublicPath) {
    return NextResponse.next()
  }

  // For API routes, let them handle authentication internally
  if (path.startsWith('/api/')) {
    return NextResponse.next()
  }

  // For all other routes (including dashboard), allow access
  // Client-side code will handle authentication checks
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
