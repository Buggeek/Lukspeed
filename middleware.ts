import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Simplified middleware compatible with Vercel Edge Runtime
// Removed Supabase middleware to fix deployment issues
export function middleware(request: NextRequest) {
  // Basic middleware that just passes requests through
  // Authentication will be handled at the component level
  const response = NextResponse.next()
  
  // Add basic security headers
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  
  return response
}

// Minimal matcher to avoid Edge Runtime conflicts
export const config = {
  matcher: [
    // Only apply to API routes that specifically need middleware
    '/api/:path*'
  ],
}