import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Get the pathname of the request
  const path = request.nextUrl.pathname

  // Define public paths that don't require authentication
  const isPublicPath = path === '/' || path === '/api/auth/login' || path === '/api/auth/register'

  // Get the token from the request headers or cookies
  const token = request.headers.get('authorization')?.replace('Bearer ', '') || 
                request.cookies.get('token')?.value

  // If the path is public, allow access
  if (isPublicPath) {
    return NextResponse.next()
  }

  // If accessing dashboard without token, redirect to login
  if (path.startsWith('/dashboard') && !token) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  // For API routes, let them handle authentication internally
  if (path.startsWith('/api/')) {
    return NextResponse.next()
  }

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
